from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
import os
import json
import re


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# CREATE FLASK APPLICATION
# ============================================================

app = Flask(__name__)


# ============================================================
# LOAD GOVERNMENT SERVICES
# ============================================================

with open("services.json", "r", encoding="utf-8") as file:
    services = json.load(file)


# ============================================================
# GEMINI AI CLIENT
# ============================================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ============================================================
# HOME PAGE
# ============================================================

@app.route("/")
def home():

    return render_template(
        "index.html",
        services=services
    )


# ============================================================
# AI GOVERNMENT SERVICE ASSISTANT
# ============================================================

@app.route("/ask", methods=["POST"])
def ask():

    # --------------------------------------------------------
    # GET DATA FROM FRONTEND
    # --------------------------------------------------------

    data = request.get_json()

    question = data.get("question", "").strip()

    language = data.get(
        "language",
        "English"
    )

    state = data.get(
        "state",
        "All India"
    )


    # --------------------------------------------------------
    # CHECK EMPTY QUESTION
    # --------------------------------------------------------

    if not question:

        return jsonify({
            "answer": "Please enter your question."
        })


    # ========================================================
    # CREATE SERVICE LIST FOR AI
    # ========================================================

    service_list = []


    for service_id, service in services.items():

        service_list.append({

            "id": service_id,

            "name": service.get(
                "name",
                ""
            ),

            "category": service.get(
                "category",
                ""
            ),

            "keywords": service.get(
                "keywords",
                []
            )
        })


    # Convert service list into JSON text
    service_data = json.dumps(
        service_list,
        ensure_ascii=False,
        indent=2
    )


    # ========================================================
    # AI PROMPT
    # ========================================================

    prompt = f"""

You are a multilingual AI assistant that helps citizens
understand Indian government services.

The citizen selected language:

{language}


The citizen selected state:

{state}


The citizen's question is:

{question}


============================================================
AVAILABLE GOVERNMENT SERVICES
============================================================

{service_data}


============================================================
YOUR TASK
============================================================

1. Understand what the citizen is trying to do.

2. Identify the most relevant government service from the
   available services.

3. Match the citizen's question with the service name,
   category and keywords.

4. Explain the service in simple language.

5. Answer completely in the language selected by the citizen.

6. If the question is unclear, ask a short clarification
   question instead of guessing.

7. If the service depends on the state, mention that the
   exact process may vary depending on the selected state.

8. Do not invent services that are not present in the
   available service list.

9. Do not invent government rules, fees, deadlines or
   eligibility requirements.

10. If information can change, tell the citizen to verify
    the latest information on the official government portal.


============================================================
RESPONSE FORMAT
============================================================

Use the following structure:

SERVICE IDENTIFIED:
[Name of the relevant service]


CATEGORY:
[Category]


WHY THIS SERVICE:
[Explain briefly why this service matches the question]


ELIGIBILITY:
[Explain eligibility in simple language]


DOCUMENTS REQUIRED:
[List important documents]


HOW TO APPLY:

1. Step one
2. Step two
3. Step three
4. Step four


IMPORTANT:
[Important information or warning]


OFFICIAL WEBSITE:
[Tell the user to use the official government website]


SERVICE_ID:
[exact service ID from the available service list]


============================================================
SAFETY RULES
============================================================

Never ask the citizen for:

- Aadhaar number
- OTP
- Password
- Bank PIN
- ATM PIN
- Card PIN
- CVV
- Full banking credentials
- Other unnecessary sensitive information


Never claim that you:

- Submitted an application
- Paid a government fee
- Completed verification
- Booked an appointment
- Received a government certificate


The assistant only provides guidance.

Always encourage citizens to use the official government
website for actual applications.

"""


    # ========================================================
    # SEND REQUEST TO GEMINI
    # ========================================================

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt
        )


        # Get AI response
        answer = response.text


        # ====================================================
        # FIND SERVICE ID FROM AI RESPONSE
        # ====================================================

        service_id = None


        match = re.search(

            r"SERVICE_ID:\s*([a-zA-Z0-9_]+)",

            answer,

            re.IGNORECASE
        )


        if match:

            service_id = match.group(1)


        # ====================================================
        # GET MATCHED SERVICE
        # ====================================================

        matched_service = None


        if service_id:

            matched_service = services.get(
                service_id
            )


        # ====================================================
        # RETURN RESPONSE TO FRONTEND
        # ====================================================

        return jsonify({

            "answer": answer,

            "service_id": service_id,

            "service": matched_service

        })


    # ========================================================
    # HANDLE AI ERRORS
    # ========================================================

    except Exception as error:

        print(
            "Gemini Error:",
            error
        )


        return jsonify({

            "answer":
            "Sorry, I could not connect to the AI right now. "
            "Please check your internet connection and API key.",

            "service_id": None,

            "service": None

        })


# ============================================================
# GOVERNMENT SERVICE DETAILS PAGE
# ============================================================

@app.route("/service/<service_id>")
def service(service_id):

    # Find requested service
    service_data = services.get(
        service_id
    )


    # If service doesn't exist
    if not service_data:

        return (
            "Government service not found",
            404
        )


    # Display service.html
    return render_template(

        "service.html",

        service=service_data
    )


# ============================================================
# RUN FLASK APPLICATION
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )