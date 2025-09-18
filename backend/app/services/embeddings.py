# embeddings.py
# use faiss-cpu on Windows if faiss doesn't install
import faiss  # pip install faiss-cpu
import numpy as np
from sentence_transformers import SentenceTransformer
from app.db.mongodb import documents_collection
import os

# Path to FAISS index file
INDEX_PATH = "vector.index"

# Load HuggingFace embedding model (cached locally after first run)
# all-MiniLM-L6-v2 → 384 dimensions
HF_MODEL = SentenceTransformer("all-MiniLM-L6-v2")


# Load or create FAISS index
def get_faiss_index(dim=384):  # HF MiniLM = 384 dims
    if os.path.exists(INDEX_PATH):
        index = faiss.read_index(INDEX_PATH)
    else:
        # Wrap FlatL2 inside IndexIDMap so we can use add_with_ids
        base_index = faiss.IndexFlatL2(dim)
        index = faiss.IndexIDMap(base_index)

    return index


# Embed text using HuggingFace
def get_embedding(text: str) -> np.ndarray:
    embedding = HF_MODEL.encode(text, convert_to_numpy=True)
    return embedding.astype("float32")


# Add new chunks to FAISS + Mongo
async def add_chunks_to_index(filename: str, chunks: list[str]):
    index = get_faiss_index()

    for i, chunk in enumerate(chunks):
        print(f"Embedding chunk {i} for {filename}") 
        # Generate embedding
        embedding = get_embedding(chunk)
        embedding = np.array([embedding]).astype("float32")

        # Assign a vector_id (simple increment = index.ntotal + 1)
        vector_id = index.ntotal + 1
        print(f"Adding vector_id={vector_id}")

        # Insert into FAISS
        index.add_with_ids(embedding, np.array([vector_id], dtype=np.int64))

        # Insert into Mongo with vector_id
        await documents_collection.insert_one({
            "filename": filename,
            "content": chunk,
            "metadata": {"chunk_index": i, "vector_id": vector_id}
        })

    # Save FAISS index
    faiss.write_index(index, INDEX_PATH)


# Search chunks for query
async def search_chunks(query: str, k: int = 5):
    if not os.path.exists(INDEX_PATH):
        raise ValueError("No FAISS index found. Upload a PDF first.")

    index = get_faiss_index()
    if index.ntotal == 0:
        raise ValueError("FAISS index is empty. Upload a PDF first.")

    query_vec = np.array([get_embedding(query)]).astype("float32")
    distances, ids = index.search(query_vec, k)

    results = []
    for vid, dist in zip(ids[0], distances[0]):
        if vid == -1:
            continue

        # Lookup document by vector_id
        doc = await documents_collection.find_one({"metadata.vector_id": int(vid)})
        if doc:
            results.append({
                "filename": doc["filename"],
                "content": doc["content"],
                "distance": float(dist)
            })

    return results


# Ask Gemini with retrieved chunks (optional: you can swap this later to Llama/other LLM)
async def answer_with_context(query: str):
    retrieved_docs = await search_chunks(query)

    context = "\n\n".join([doc["content"] for doc in retrieved_docs])
    prompt = f"""
    Use the following context from the document(s) to answer the question:

    Context:
    {context}

    Question: {query}
    """

    # Right now this still uses Gemini for answering,
    # you can swap to HuggingFace LLM / OpenAI if you want
    import google.generativeai as genai
    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content(prompt)
    return response.text
