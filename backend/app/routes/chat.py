from fastapi import APIRouter, HTTPException
import numpy as np, os
from app.services.embeddings import get_embedding, get_faiss_index, INDEX_PATH
from app.db.mongodb import documents_collection
from app.services.gemini_client import ask_gemini

router = APIRouter(prefix="/chat", tags=["Chat"])

# Temporary in-memory history
chat_history = []

@router.post("/")
async def chat(user_message: str):
    if not os.path.exists(INDEX_PATH):
        raise HTTPException(status_code=404, detail="No documents indexed yet")

    # Step 1: Retrieve relevant chunks
    index = get_faiss_index()
    embedding = get_embedding(user_message)
    D, I = index.search(np.array([embedding], dtype=np.float32), k=3)

    docs_text = []
    for faiss_id in I[0]:
        if faiss_id == -1:
            continue
        doc = await documents_collection.find_one({"metadata.vector_id": int(faiss_id)})
        if doc:
            docs_text.append(doc["content"])

    context = "\n\n".join(docs_text)

    # Step 2: Add user message
    chat_history.append({"role": "user", "content": user_message})

    # Step 3: Build prompt
    system_message = {
        "role": "system",
        "content": "You are a helpful assistant answering based on uploaded PDFs."
    }

    messages = [system_message] + chat_history + [
        {"role": "system", "content": f"Relevant PDF context:\n{context}"}
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
