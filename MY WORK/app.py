from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
import os
import json

# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()

app = Flask(__name__)


# ============================================================
# LOAD GOVERNMENT SERVICES
# ============================================================

try:
    with open("services.json", "r", encoding="utf-8") as file:
        services = json.load(file)
except Exception as e:
    print("WARNING: Could not load services.json")
    print(e)
    services = {}


# ============================================================
# GEMINI CLIENT
# ============================================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("WARNING: GEMINI_API_KEY was not found in .env")

client = genai.Client(
    api_key=api_key
)


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return render_template("index.html")


# ============================================================
# AI ASSISTANT
# ============================================================

@app.route("/ask", methods=["POST"])
def ask():

    try:

        # ----------------------------------------------------
        # GET JSON DATA
        # ----------------------------------------------------

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "answer": "No question was received."
            }), 400


        question = str(
            data.get("question", "")
        ).strip()


        language = str(
            data.get("language", "English")
        ).strip()


        state = str(
            data.get("state", "All India")
        ).strip()


        # ----------------------------------------------------
        # VALIDATE QUESTION
        # ----------------------------------------------------

        if not question:

            return jsonify({
                "answer": "Please enter your question."
            }), 400


        # ----------------------------------------------------
        # SUPPORTED LANGUAGES
        # ----------------------------------------------------

        supported_languages = [
            "English",
            "Tamil",
            "Hindi",
            "Telugu",
            "Kannada",
            "Malayalam",
            "Bengali",
            "Marathi"
        ]


        if language not in supported_languages:

            language = "English"


        # ----------------------------------------------------
        # LANGUAGE NAMES IN THEIR NATIVE SCRIPT
        # ----------------------------------------------------

        language_instruction = {

            "English":
                "English",

            "Tamil":
                "Tamil (தமிழ்)",

            "Hindi":
                "Hindi (हिन्दी)",

            "Telugu":
                "Telugu (తెలుగు)",

            "Kannada":
                "Kannada (ಕನ್ನಡ)",

            "Malayalam":
                "Malayalam (മലയാളം)",

            "Bengali":
                "Bengali (বাংলা)",

            "Marathi":
                "Marathi (मराठी)"

        }


        selected_language = \
            language_instruction[language]


        # ----------------------------------------------------
        # PROMPT
        # ----------------------------------------------------

        prompt = f"""
You are a multilingual Indian Government Services Assistant.

The citizen selected the following language:

{selected_language}

The citizen's question is:

{question}

The citizen's state/region is:

{state}

============================================================
IMPORTANT LANGUAGE RULE
============================================================

You MUST answer the citizen entirely in:

{selected_language}

Do NOT answer in English unless the selected language
is English.

Do NOT translate the answer into another language.

For Hindi, answer in Hindi Devanagari script.

For Tamil, answer in Tamil script.

For Telugu, answer in Telugu script.

For Kannada, answer in Kannada script.

For Malayalam, answer in Malayalam script.

For Bengali, answer in Bengali script.

For Marathi, answer in Marathi Devanagari script.

============================================================
YOUR ROLE
============================================================

Help citizens understand Indian government services.

You may explain:

- Government schemes
- Eligibility
- Required documents
- Application procedures
- General steps
- Common mistakes
- Passport services
- PAN card
- Voter ID
- Driving licence
- Certificates
- Vehicle services
- Government loans
- Welfare schemes
- Other government services

============================================================
ANSWER RULES
============================================================

1. Answer ONLY in the selected language.

2. Use simple language that an ordinary citizen can
   understand.

3. Give clear step-by-step instructions when appropriate.

4. If the procedure depends on the state, mention that.

5. Do not invent government rules or requirements.

6. If information may have changed, tell the citizen
   to verify the latest information on the official
   government website.

7. Never ask for:
   Aadhaar number
   OTP
   Password
   Bank PIN
   Card number
   Other sensitive personal information.

8. Never claim that you submitted an application.

9. Never claim that you completed a government process.

10. Be concise but useful.

============================================================
ANSWER
============================================================
"""


        # ----------------------------------------------------
        # CALL GEMINI
        # ----------------------------------------------------

        print("\n======================================")
        print("NEW AI REQUEST")
        print("======================================")
        print("Language:", language)
        print("State:", state)
        print("Question:", question)
        print("======================================")


        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt

        )


        # ----------------------------------------------------
        # GET ANSWER
        # ----------------------------------------------------

        answer = getattr(
            response,
            "text",
            None
        )


        if not answer:

            print("Gemini returned no text.")

            return jsonify({
                "answer":
                "Sorry, I could not generate an answer. "
                "Please try again."
            }), 500


        answer = answer.strip()


        print("\nAI ANSWER:")
        print(answer)
        print("======================================\n")


        # ----------------------------------------------------
        # RETURN RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "answer": answer,

            "language": language,

            "state": state

        })


    # ========================================================
    # ERROR HANDLING
    # ========================================================

    except Exception as error:

        print("\n")
        print("================================================")
        print("              GEMINI / FLASK ERROR")
        print("================================================")
        print("ERROR TYPE:")
        print(type(error).__name__)
        print("")
        print("ERROR MESSAGE:")
        print(str(error))
        print("================================================")
        print("\n")


        return jsonify({

            "answer":
            "The AI assistant encountered an error. "
            "Please try again."

        }), 500


# ============================================================
# GOVERNMENT SERVICE DETAILS
# ============================================================

@app.route("/service/<service_id>")
def service(service_id):

    service_data = services.get(service_id)

    if not service_data:

        return "Service not found", 404


    return render_template(
        "service.html",
        service=service_data
    )


# ============================================================
# RUN FLASK
# ============================================================

if __name__ == "__main__":

    print("\n======================================")
    print("Government Service Navigator")
    print("Flask server starting...")
    print("======================================")
    print("Open: http://127.0.0.1:5000")
    print("======================================\n")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )