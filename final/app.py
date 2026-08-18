from flask import Flask, render_template, request, jsonify
from groq import Groq
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

    print("Government services loaded successfully.")

except Exception as e:
    print("WARNING: Could not load services.json")
    print("ERROR:", e)
    services = {}


# ============================================================
# GROQ CLIENT
# ============================================================

groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    print("WARNING: GROQ_API_KEY was not found in .env")
    client = None
else:
    client = Groq(api_key=groq_api_key)
    print("Groq API key loaded successfully.")


# ============================================================
# HOME PAGE
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
        # CHECK API KEY
        # ----------------------------------------------------

        if client is None:
            return jsonify({
                "answer": "GROQ API key is missing. Please check your .env file."
            }), 500


        # ----------------------------------------------------
        # GET DATA FROM WEBSITE
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
        # CHECK QUESTION
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
        # LANGUAGE NAMES
        # ----------------------------------------------------

        language_names = {

            "English": "English",

            "Tamil": "Tamil (தமிழ்)",

            "Hindi": "Hindi (हिन्दी)",

            "Telugu": "Telugu (తెలుగు)",

            "Kannada": "Kannada (ಕನ್ನಡ)",

            "Malayalam": "Malayalam (മലയാളം)",

            "Bengali": "Bengali (বাংলা)",

            "Marathi": "Marathi (मराठी)"
        }


        selected_language = language_names[language]


        # ====================================================
        # SEARCH GOVERNMENT SERVICE DATABASE
        # ====================================================

        service_information = ""

        question_lower = question.lower()

        question_words = [
            word
            for word in question_lower.split()
            if len(word) >= 4
        ]


        for service_id, service_data in services.items():

            service_text = json.dumps(
                service_data,
                ensure_ascii=False
            ).lower()


            service_id_text = str(
                service_id
            ).lower()


            # Direct service ID match
            if service_id_text in question_lower:

                service_information = json.dumps(
                    service_data,
                    ensure_ascii=False,
                    indent=2
                )

                break


            # Keyword matching
            matches = 0

            for word in question_words:

                if word in service_text:
                    matches += 1


            if matches >= 2:

                service_information = json.dumps(
                    service_data,
                    ensure_ascii=False,
                    indent=2
                )

                break


        # ====================================================
        # DATABASE RESULT
        # ====================================================

        if service_information:

            database_information = service_information

        else:

            database_information = (
                "No specific service was found "
                "in the local government database."
            )


        # ====================================================
        # AI PROMPT
        # ====================================================

        prompt = f"""

You are a multilingual Indian Government Services Assistant.

============================================================
CITIZEN INFORMATION
============================================================

Selected language:
{selected_language}

Selected state or region:
{state}

Citizen's question:
{question}


============================================================
LOCAL GOVERNMENT SERVICE DATABASE
============================================================

{database_information}


============================================================
LANGUAGE RULE
============================================================

Answer completely in {selected_language}.

Do not switch to English unless English was selected.

For Tamil, use Tamil script.

For Hindi, use Devanagari script.

For Telugu, use Telugu script.

For Kannada, use Kannada script.

For Malayalam, use Malayalam script.

For Bengali, use Bengali script.

For Marathi, use Devanagari script.


============================================================
YOUR ROLE
============================================================

Help Indian citizens understand government services.

You can explain:

- Eligibility
- Required documents
- Application procedure
- Where to apply
- General steps
- Government schemes
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
ACCURACY RULES
============================================================

1. Use the government database information when relevant.

2. Do not invent government rules.

3. Do not invent eligibility requirements.

4. Do not invent documents.

5. Do not invent fees.

6. Do not invent deadlines.

7. If information is uncertain or may have changed,
   tell the citizen to verify the latest information
   on the relevant official government website.

8. If the procedure depends on the state,
   clearly mention that.

9. Give numbered steps when appropriate.

10. Use simple language that ordinary citizens can understand.


============================================================
PRIVACY
============================================================

Never ask the citizen for:

- Aadhaar number
- OTP
- Password
- Bank PIN
- Debit card number
- Credit card number
- Internet banking password
- Other sensitive personal information


Never claim that you submitted an application.

Never claim that you completed a government process.


============================================================
ANSWER FORMAT
============================================================

Give a direct and useful answer.

If the citizen asks how to apply,
give the procedure as numbered steps.

If documents are known from the database,
list them clearly.

If the information is not available,
say so honestly and advise the citizen
to verify the latest information on the
official government website.

Answer only in the selected language.

============================================================
END OF INSTRUCTIONS
============================================================

Answer the citizen's question now.

"""


        # ====================================================
        # PRINT REQUEST
        # ====================================================

        print()
        print("======================================")
        print("NEW AI REQUEST")
        print("======================================")
        print("Language:", language)
        print("State:", state)
        print("Question:", question)

        if service_information:
            print("Service database: FOUND")
        else:
            print("Service database: NOT FOUND")

        print("======================================")


        # ====================================================
        # CALL GROQ
        # ====================================================

        response = client.chat.completions.create(

            model="openai/gpt-oss-20b",

            messages=[

                {
                    "role": "system",
                    "content":
                    "You are an accurate, helpful and "
                    "multilingual Indian Government "
                    "Services Assistant."
                },

                {
                    "role": "user",
                    "content": prompt
                }

            ],

            temperature=0.2,

            max_completion_tokens=2048,

            stream=False
        )


        # ====================================================
        # GET AI ANSWER
        # ====================================================

        if not response.choices:

            return jsonify({
                "answer":
                "The AI service returned no answer."
            }), 500


        answer = response.choices[0].message.content


        if not answer:

            return jsonify({
                "answer":
                "The AI service returned an empty answer."
            }), 500


        answer = str(answer).strip()


        # ====================================================
        # PRINT ANSWER
        # ====================================================

        print()
        print("======================================")
        print("AI ANSWER")
        print("======================================")
        print(answer)
        print("======================================")
        print()


        # ====================================================
        # SEND ANSWER TO WEBSITE
        # ====================================================

        return jsonify({

            "answer": answer,

            "language": language,

            "state": state

        })


    # ========================================================
    # ERROR HANDLING
    # ========================================================

    except Exception as error:

        print()
        print("======================================")
        print("GROQ / FLASK ERROR")
        print("======================================")

        print("ERROR TYPE:")
        print(type(error).__name__)

        print()
        print("ERROR MESSAGE:")
        print(str(error))

        if hasattr(error, "status_code"):
            print()
            print("STATUS CODE:")
            print(error.status_code)

        if hasattr(error, "body"):
            print()
            print("ERROR BODY:")
            print(error.body)

        print("======================================")
        print()


        return jsonify({

            "answer":
            "AI service error: " + str(error)

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

    print()
    print("======================================")
    print("Government Service Navigator")
    print("Flask server starting...")
    print("======================================")
    print("Open: http://127.0.0.1:5000")
    print("======================================")
    print()


    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )