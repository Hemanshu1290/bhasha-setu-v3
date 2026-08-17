from flask import Flask, render_template, request, jsonify

from openai import OpenAI

from dotenv import load_dotenv

import os


load_dotenv()


app = Flask(__name__)


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


SYSTEM_PROMPT = """

You are a multilingual AI assistant
for Indian government services.

Your purpose is to help citizens understand
government services in simple language.

You can explain:

1. Eligibility
2. Required documents
3. Application procedures
4. General steps
5. Common mistakes
6. Where to obtain official information

You support:

English
Tamil
Hindi

Always answer in the language selected
by the user.

IMPORTANT:

Never ask the user for:

Aadhaar number
OTP
Password
Bank PIN
Credit card information
Other sensitive personal information.

Never claim that you have submitted
a government application.

Never invent government rules.

If information may have changed,
tell the user to verify it on the
official government website.

Give answers in simple,
step-by-step language.

"""


@app.route("/")
def home():

    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():

    data = request.get_json()

    question = data.get("question", "")

    language = data.get(
        "language",
        "English"
    )


    if not question:

        return jsonify({
            "answer":
            "Please enter your question."
        })


    prompt = f"""

Language requested:
{language}

Citizen's question:
{question}

Provide a clear,
simple and useful answer.
"""


    try:

        response = client.responses.create(

            model="gpt-5-mini",

            instructions=SYSTEM_PROMPT,

            input=prompt

        )


        answer = response.output_text


        return jsonify({
            "answer": answer
        })


    except Exception as error:

        print(error)

        return jsonify({

            "answer":
            "Sorry, I could not process your request."

        })


if __name__ == "__main__":

    app.run(debug=True)