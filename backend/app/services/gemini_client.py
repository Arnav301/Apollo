import google.generativeai as genai
import os

# Load API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def ask_gemini(messages: list[dict], model="gemini-1.5-flash"):
    """
    messages: list of {"role": "user"/"model"/"system", "content": str}
    """
    # Convert to Gemini format
    prompt = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])

    response = genai.GenerativeModel(model).generate_content(prompt)
    return response.text
