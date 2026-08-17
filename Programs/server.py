import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NagrikAI Dual-Entry Eliminator")

# Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Serve Static files and HTML
app.mount("/static", StaticFiles(directory="Static"), name="static")

@app.get("/")
async def serve_frontend():
    return FileResponse("Templates/index.html")

# Schema definitions
class VoiceRequest(BaseModel):
    transcript: str = ""
    question: str = ""
    language: str = "hi"

extraction_schema = {
    "type": "OBJECT",
    "properties": {
        "citizen_name": {"type": "STRING", "description": "Name of the citizen"},
        "scheme_intent": {"type": "STRING", "description": "Government scheme mentioned"},
        "location": {"type": "STRING", "description": "Village, city, or district mentioned"},
        "document_status": {"type": "STRING", "description": "Put '[Aadhaar Redacted]' if Aadhaar is mentioned, otherwise list other documents."}
    },
    "required": ["citizen_name", "scheme_intent", "location", "document_status"]
}

@app.post("/ask")
@app.post("/api/extract")
async def extract_data(req: VoiceRequest):
    input_text = req.transcript or req.question
    
    if not input_text:
        return {"answer": "Please provide input text.", "status": "error"}

    system_instruction = """
    You are an automated data extraction engine for Indian government services.
    Extract the citizen's details from the provided text into the structured schema.
    If a field is missing, set it to 'Not Provided'.
    """

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=input_text,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=extraction_schema,
                temperature=0.1
            ),
        )
        
        # Clean up the response just in case Gemini wrapped it in markdown
        raw_response = response.text.strip()
        if raw_response.startswith("```"):
            raw_response = raw_response.replace("```json", "").replace("```", "").strip()
            
        extracted = json.loads(raw_response)
        
        formatted_answer = f"""
        <b>✅ Citizen Data Extracted:</b><br><br>
        👤 <b>Name:</b> {extracted.get('citizen_name')}<br>
        📜 <b>Scheme:</b> {extracted.get('scheme_intent')}<br>
        📍 <b>Location:</b> {extracted.get('location')}<br>
        📄 <b>Documents:</b> {extracted.get('document_status')}
        """
        
        return {
            "status": "success",
            "answer": formatted_answer,
            "data": extracted
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"answer": "Error extracting data from model.", "status": "error"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)