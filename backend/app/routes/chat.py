from fastapi import APIRouter, HTTPException
import numpy as np, os
from app.services.embeddings import get_embedding, get_faiss_index, INDEX_PATH
from app.db.mongodb import documents_collection
from app.services.gemini_client import ask_gemini

router = APIRouter(prefix="/chat", tags=["Chat"])

# Temporary in-memory history
chat_history = []

@router.post("/")
async def chat(user_message: str, filename: str | None = None):
    if not os.path.exists(INDEX_PATH):
        raise HTTPException(status_code=404, detail="No documents indexed yet")

    # Decide which filename to use: explicit, or latest uploaded
    effective_filename = filename
    if not effective_filename:
        latest_doc = await documents_collection.find_one({}, sort=[("_id", -1)])
        if latest_doc:
            effective_filename = latest_doc.get("filename")
        else:
            raise HTTPException(status_code=404, detail="No documents available. Upload a PDF first.")

    # Step 1: Retrieve relevant chunks (restricted to selected file)
    index = get_faiss_index()
    embedding = get_embedding(user_message)
    # Search broader, then filter to the chosen file
    k = min(get_faiss_index().ntotal or 0, 50) or 50
    D, I = index.search(np.array([embedding], dtype=np.float32), k=k)

    docs_text = []
    for faiss_id in I[0]:
        if faiss_id == -1:
            continue
        query = {"metadata.vector_id": int(faiss_id), "filename": effective_filename}
        doc = await documents_collection.find_one(query)
        if doc:
            docs_text.append(doc["content"])
        if len(docs_text) >= 5:
            break

    # If similarity search didn't return any chunks for the selected file,
    # fall back to taking the first few chunks of that file so the model has context.
    if not docs_text:
        async for d in documents_collection.find({"filename": effective_filename}).sort("metadata.chunk_index", 1).limit(5):
            docs_text.append(d["content"])
    context = "\n\n".join(docs_text)
    if not context:
        raise HTTPException(status_code=404, detail=f"No relevant context found for file: {effective_filename}")

    # Step 2: Add user message
    chat_history.append({"role": "user", "content": user_message})

    # Step 3: Build prompt
    system_message = {
        "role": "system",
        "content": "You are a helpful assistant answering based on uploaded PDFs."
    }

    messages = [system_message] + chat_history + [
        {"role": "system", "content": f"Relevant PDF context (source: {effective_filename}):\n{context}"}
    ]

    # Step 4: Gemini response
    answer = ask_gemini(messages)

    # Step 5: Save AI response
    chat_history.append({"role": "assistant", "content": answer})

    return {
        "user_message": user_message,
        "answer": answer,
        "history": chat_history
    }
