from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
import os
import json
# Load the API key from .env
load_dotenv()

app = Flask(__name__)
with open("services.json", "r", encoding="utf-8") as file:
    services = json.load(file)

# Connect to Gemini
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():

    data = request.get_json()

    question = data.get("question", "")
    language = data.get("language", "English")

    if not question:
        return jsonify({
            "answer": "Please enter your question."
        })


    prompt = f"""
You are a multilingual AI assistant for Indian government services.

The citizen selected this language:
{language}

The citizen asked:
{question}

Your job is to explain government services
in a simple and easy-to-understand way.

You can explain:
- Eligibility
- Required documents
- Application procedure
- General steps
- Common mistakes
- Where to find official information

IMPORTANT:
- Answer in the selected language.
- Use simple language.
- Never ask for Aadhaar numbers.
- Never ask for OTPs.
- Never ask for passwords.
- Never ask for bank PINs.
- Never ask for sensitive personal information.
- Never claim that you submitted an application.
- If information may have changed, tell the citizen
  to verify it on the official government website.

Give the answer step by step.
"""


    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        answer = response.text

        return jsonify({
            "answer": answer
        })


    except Exception as error:

        print("ERROR:", error)

        return jsonify({
            "answer":
            "Sorry, I could not connect to the AI. "
            "Please check your API key and try again."
        })

@app.route("/service/<service_id>")
def service(service_id):

    service = services.get(service_id)

    if not service:
        return "Service not found", 404

    return render_template(
        "service.html",
        service=service
    )
if __name__ == "__main__":
    app.run(debug=True)