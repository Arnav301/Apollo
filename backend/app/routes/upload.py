from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_loader import extract_text_from_pdf, chunk_text
from app.services.embeddings import add_chunks_to_index
import os

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        contents = await file.read()   # read PDF as bytes
        text = extract_text_from_pdf(contents)
        chunks = chunk_text(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

    # Add chunks to FAISS + Mongo (centralized logic in embeddings.py)
    await add_chunks_to_index(file.filename, chunks)

    return {
        "message": f"Uploaded {file.filename} successfully",
        "chunks_stored": len(chunks)
    }
