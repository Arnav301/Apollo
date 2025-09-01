import pytest
from fastapi.testclient import TestClient
from app.main import app
from io import BytesIO
from reportlab.pdfgen import canvas
from pypdf import PdfReader

client = TestClient(app)

def create_test_pdf(text: str) -> BytesIO:
    """Helper function to create an in-memory PDF with given text."""
    pdf_buffer = BytesIO()
    c = canvas.Canvas(pdf_buffer)
    c.drawString(100, 750, text)
    c.save()
    pdf_buffer.seek(0)
    return pdf_buffer

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend is working!"}

def test_upload_pdf():
    pdf_text = "Hello, this is a test PDF created for pytest."
    pdf_buffer = create_test_pdf(pdf_text)

    files = {"file": ("test.pdf", pdf_buffer, "application/pdf")}
    response = client.post("/upload/", files=files)

    assert response.status_code == 200
    data = response.json()

    # Check backend response structure
    assert "filename" in data
    assert "content" in data

    # Ensure extracted content matches the test PDF
    assert pdf_text in data["content"]

    # Double-check with local pypdf reader (ground truth)
    pdf_buffer.seek(0)
    reader = PdfReader(pdf_buffer)
    extracted_text = "".join([page.extract_text() or "" for page in reader.pages])
    assert pdf_text in extracted_text
