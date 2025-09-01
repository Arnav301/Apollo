from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import google.generativeai as genai
from app.routes import upload, query, chat

# load variables from .env
load_dotenv()

# ✅ Configure Gemini with API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(
    title="Apollo Backend",
    version="1.0.0",
    description="AI-powered document assistant backend with MongoDB"
)

# CORS (for when you add frontend later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(upload.router)
app.include_router(query.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "✅ Apollo Backend is running with MongoDB!"}
