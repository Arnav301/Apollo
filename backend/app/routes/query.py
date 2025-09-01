from fastapi import APIRouter, Query, HTTPException
from app.services.embeddings import get_embedding, get_faiss_index, INDEX_PATH
from app.db.mongodb import documents_collection
import faiss
import numpy as np
import os

router = APIRouter(prefix="/query", tags=["Query"])

@router.get("")
@router.get("/")
async def search_documents(q: str = Query(..., min_length=2)):
    if not os.path.exists(INDEX_PATH):
        raise HTTPException(status_code=404, detail="No documents indexed yet")

    index = get_faiss_index()
    embedding = get_embedding(q)

    # Top 3 similar chunks
    D, I = index.search(np.array([embedding], dtype=np.float32), k=3)

    results = []
    for faiss_id, dist in zip(I[0], D[0]):
        if faiss_id == -1:
            continue

        # Lookup document by faiss_id instead of broken ObjectId conversion
        doc = await documents_collection.find_one({"metadata.vector_id": int(faiss_id)})
        if doc:
            results.append({
                "filename": doc["filename"],
                "content": doc["content"],
                "distance": float(dist)
            })

    if not results:
        raise HTTPException(status_code=404, detail="No matching documents found")

    return {"query": q, "results": results}
