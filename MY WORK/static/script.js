// ============================================================
// GOVERNMENT SERVICE NAVIGATOR - COMPLETE SCRIPT
// ============================================================

// ============================================================
// GLOBAL VARIABLES
// ============================================================

let recognition = null;
let isListening = false;
let currentLanguage = "English";


// ============================================================
// LANGUAGE CODES
// ============================================================

const languageCodes = {

    "English": "en-IN",
    "Tamil": "ta-IN",
    "Hindi": "hi-IN",
    "Telugu": "te-IN",
    "Kannada": "kn-IN",
    "Malayalam": "ml-IN",
    "Bengali": "bn-IN",
    "Marathi": "mr-IN"

};


// ============================================================
// GET LANGUAGE
// ============================================================

function getLanguage() {

    const languageElement =
        document.getElementById("language");

    if (languageElement) {

        return languageElement.value;

    }

    return "English";
}


// ============================================================
// GET STATE
// ============================================================

function getState() {

    const stateElement =
        document.getElementById("state");

    if (stateElement) {

        return stateElement.value;

    }

    return "All India";
}


// ============================================================
// ASK AI
// ============================================================

async function askAI() {

    const questionElement =
        document.getElementById("question");

    const chatBox =
        document.getElementById("chatBox");


    // --------------------------------------------------------
    // CHECK QUESTION INPUT
    // --------------------------------------------------------

    if (!questionElement) {

        console.error(
            "ERROR: #question element was not found."
        );

        showError(
            "Question input box was not found. Please check index.html."
        );

        return;

    }


    const question =
        questionElement.value.trim();


    // --------------------------------------------------------
    // EMPTY QUESTION
    // --------------------------------------------------------

    if (!question) {

        alert(
            "Please enter what government service you need."
        );

        questionElement.focus();

        return;

    }


    // --------------------------------------------------------
    // GET LANGUAGE AND STATE
    // --------------------------------------------------------

    const language =
        getLanguage();

    const state =
        getState();


    currentLanguage =
        language;


    // --------------------------------------------------------
    // SHOW LOADING
    // --------------------------------------------------------

    showLoading();


    // --------------------------------------------------------
    // LOG REQUEST
    // --------------------------------------------------------

    console.log(
        "======================================"
    );

    console.log(
        "Sending AI request..."
    );

    console.log(
        "Question:",
        question
    );

    console.log(
        "Language:",
        language
    );

    console.log(
        "State:",
        state
    );

    console.log(
        "======================================"
    );


    try {

        // ====================================================
        // SEND REQUEST TO FLASK
        // ====================================================

        const response =
            await fetch("/ask", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"

                },

                body: JSON.stringify({

                    question:
                        question,

                    language:
                        language,

                    state:
                        state

                })

            });


        // ====================================================
        // READ SERVER RESPONSE
        // ====================================================

        let data = null;

        const contentType =
            response.headers.get(
                "content-type"
            );


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        }

        else {

            const text =
                await response.text();

            console.error(
                "Server returned non-JSON response:",
                text
            );


            throw new Error(
                "Server returned an unexpected response. "
                + "HTTP status: "
                + response.status
            );

        }


        // ====================================================
        // LOG SERVER RESPONSE
        // ====================================================

        console.log(
            "Server response:",
            data
        );


        // ====================================================
        // HTTP ERROR
        // ====================================================

        if (!response.ok) {

            let serverMessage =
                "The server returned an error.";

            if (
                data &&
                data.answer
            ) {

                serverMessage =
                    data.answer;

            }

            throw new Error(
                "HTTP "
                + response.status
                + ": "
                + serverMessage
            );

        }


        // ====================================================
        // CHECK ANSWER
        // ====================================================

        if (
            !data ||
            !data.answer
        ) {

            throw new Error(
                "The server responded successfully, "
                + "but no AI answer was returned."
            );

        }


        // ====================================================
        // DISPLAY RESPONSE
        // ====================================================

        displayAIResponse(
            data
        );


        // ====================================================
        // SPEAK RESPONSE
        // ====================================================

        speakAnswer(
            cleanAnswerForSpeech(
                data.answer
            )
        );


    }


    catch (error) {

        // ====================================================
        // CATCH ERROR
        // ====================================================

        console.error(
            "======================================"
        );

        console.error(
            "AI REQUEST FAILED"
        );

        console.error(
            "Error:",
            error
        );

        console.error(
            "======================================"
        );


        // ----------------------------------------------------
        // DISPLAY REAL ERROR
        // ----------------------------------------------------

        showError(
            getFriendlyErrorMessage(error)
        );

    }

}


// ============================================================
// LOADING DISPLAY
// ============================================================

function showLoading() {

    const chatBox =
        document.getElementById("chatBox");


    if (!chatBox) {
        return;
    }


    chatBox.innerHTML = `

        <div class="ai-loading">

            <div class="loading-spinner">
                ⏳
            </div>

            <p>
                Finding the right government service...
            </p>

        </div>

    `;

}


// ============================================================
// ERROR DISPLAY
// ============================================================

function showError(message) {

    const chatBox =
        document.getElementById("chatBox");


    if (!chatBox) {

        console.error(
            "Chat box not found."
        );

        return;

    }


    chatBox.innerHTML = `

        <div class="error-message">

            <div class="error-icon">
                ⚠️
            </div>

            <h4>
                Something went wrong
            </h4>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                onclick="askAI()"
                style="
                    margin-top:15px;
                    padding:10px 18px;
                    border:none;
                    border-radius:10px;
                    background:#12356b;
                    color:white;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                Try Again
            </button>

        </div>

    `;

}


// ============================================================
// FRIENDLY ERROR MESSAGE
// ============================================================

function getFriendlyErrorMessage(error) {

    const message =
        error && error.message
            ? error.message
            : "Unknown error occurred.";


    // --------------------------------------------------------
    // NETWORK ERROR
    // --------------------------------------------------------

    if (
        message.includes(
            "Failed to fetch"
        )
    ) {

        return (
            "The browser could not reach the Flask server. "
            + "Make sure Flask is running and that you opened "
            + "the website using http://127.0.0.1:5000."
        );

    }


    // --------------------------------------------------------
    // 400 ERROR
    // --------------------------------------------------------

    if (
        message.includes(
            "HTTP 400"
        )
    ) {

        return (
            "The request sent to the server was invalid. "
            + "Please check the question, language and state."
            + "\n\n"
            + message
        );

    }


    // --------------------------------------------------------
    // 401 ERROR
    // --------------------------------------------------------

    if (
        message.includes(
            "HTTP 401"
        )
    ) {

        return (
            "The AI API rejected the request. "
            + "Please check your Gemini API key."
            + "\n\n"
            + message
        );

    }


    // --------------------------------------------------------
    // 403 ERROR
    // --------------------------------------------------------

    if (
        message.includes(
            "HTTP 403"
        )
    ) {

        return (
            "The AI service denied access. "
            + "Please check your Gemini API key and API permissions."
            + "\n\n"
            + message
        );

    }


    // --------------------------------------------------------
    // 404 ERROR
    // --------------------------------------------------------

    if (
        message.includes(
            "HTTP 404"
        )
    ) {

        return (
            "The Flask /ask route or AI model could not be found."
            + "\n\n"
            + message
        );

    }


    // --------------------------------------------------------
    // 429 ERROR
    // --------------------------------------------------------

    if (
        message.includes(
            "HTTP 429"
        )
    ) {

        return (
            "The AI service has temporarily reached its usage limit. "
            + "Please wait a little and try again."
            + "\n\n"
            + message
        );

    }


    // --------------------------------------------------------
    // 500 ERROR
    // --------------------------------------------------------

    if (
        message.includes(
            "HTTP 500"
        )
    ) {

        return (
            "The Flask server encountered an error while "
            + "processing your request."
            + "\n\n"
            + message
        );

    }


    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    return (
        "The AI assistant could not process your request."
        + "\n\n"
        + message
    );

}


// ============================================================
// DISPLAY AI RESPONSE
// ============================================================

function displayAIResponse(data) {

    const chatBox =
        document.getElementById("chatBox");


    if (!chatBox) {
        return;
    }


    const answer =
        data.answer || "";


    const service =
        data.service;


    const serviceId =
        data.service_id;


    // --------------------------------------------------------
    // FORMAT ANSWER
    // --------------------------------------------------------

    const formattedAnswer =
        formatAIText(answer);


    // --------------------------------------------------------
    // SERVICE BUTTON
    // --------------------------------------------------------

    let serviceButton = "";


    if (
        serviceId &&
        serviceId !== "none" &&
        service
    ) {

        const serviceName =
            escapeHTML(
                service.name ||
                "Government Service"
            );


        serviceButton = `

            <div class="service-match">

                <div class="service-match-icon">
                    🎯
                </div>

                <div class="service-match-content">

                    <span class="service-match-label">
                        SERVICE FOUND
                    </span>

                    <h4>
                        ${serviceName}
                    </h4>

                    <p>
                        We found a government service
                        that matches your request.
                    </p>

                    <button
                        class="service-details-button"
                        onclick="openService('${escapeHTML(serviceId)}')"
                    >

                        View Service Details

                        <span>
                            →
                        </span>

                    </button>

                </div>

            </div>

        `;

    }


    // --------------------------------------------------------
    // FINAL RESPONSE
    // --------------------------------------------------------

    chatBox.innerHTML = `

        <div class="ai-response">

            <div class="ai-response-header">

                <div class="ai-avatar">
                    ✨
                </div>

                <div>

                    <strong>
                        AI Government Assistant
                    </strong>

                    <span>
                        ${escapeHTML(currentLanguage)}
                    </span>

                </div>

            </div>


            <div class="ai-response-body">

                ${formattedAnswer}

            </div>


            ${serviceButton}

        </div>

    `;

}


// ============================================================
// FORMAT AI TEXT
// ============================================================

function formatAIText(text) {

    if (!text) {
        return "";
    }


    let safeText =
        escapeHTML(text);


    // --------------------------------------------------------
    // ENGLISH HEADINGS
    // --------------------------------------------------------

    safeText =
        safeText.replace(
            /SERVICE IDENTIFIED:/gi,
            "<strong>Service Identified:</strong>"
        );


    safeText =
        safeText.replace(
            /CATEGORY:/gi,
            "<strong>Category:</strong>"
        );


    safeText =
        safeText.replace(
            /WHY THIS SERVICE:/gi,
            "<strong>Why This Service:</strong>"
        );


    safeText =
        safeText.replace(
            /ELIGIBILITY:/gi,
            "<strong>Eligibility:</strong>"
        );


    safeText =
        safeText.replace(
            /DOCUMENTS REQUIRED:/gi,
            "<strong>Documents Required:</strong>"
        );


    safeText =
        safeText.replace(
            /HOW TO APPLY:/gi,
            "<strong>How to Apply:</strong>"
        );


    safeText =
        safeText.replace(
            /IMPORTANT:/gi,
            "<strong>Important:</strong>"
        );


    safeText =
        safeText.replace(
            /OFFICIAL WEBSITE:/gi,
            "<strong>Official Website:</strong>"
        );


    // --------------------------------------------------------
    // REMOVE SERVICE ID
    // --------------------------------------------------------

    safeText =
        safeText.replace(
            /SERVICE_ID:\s*[a-zA-Z0-9_-]+/gi,
            ""
        );


    // --------------------------------------------------------
    // NUMBERED LISTS
    // --------------------------------------------------------

    safeText =
        safeText.replace(
            /(\d+\.)\s/g,
            "<br>$1 "
        );


    // --------------------------------------------------------
    // BULLET POINTS
    // --------------------------------------------------------

    safeText =
        safeText.replace(
            /^[•●]\s?/gm,
            "<br>• "
        );


    // --------------------------------------------------------
    // LINE BREAKS
    // --------------------------------------------------------

    safeText =
        safeText.replace(
            /\n/g,
            "<br>"
        );


    return safeText;

}


// ============================================================
// OPEN SERVICE DETAILS
// ============================================================

function openService(serviceId) {

    if (!serviceId) {
        return;
    }


    window.location.href =
        "/service/" +
        encodeURIComponent(serviceId);

}


// ============================================================
// VOICE RECOGNITION
// ============================================================

function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    // --------------------------------------------------------
    // BROWSER SUPPORT
    // --------------------------------------------------------

    if (!SpeechRecognition) {

        alert(
            "Voice recognition is not supported in this browser. "
            + "Please use Google Chrome."
        );

        return;

    }


    // --------------------------------------------------------
    // STOP IF ALREADY LISTENING
    // --------------------------------------------------------

    if (
        isListening &&
        recognition
    ) {

        recognition.stop();

        return;

    }


    // --------------------------------------------------------
    // CREATE RECOGNITION
    // --------------------------------------------------------

    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    // --------------------------------------------------------
    // GET LANGUAGE
    // --------------------------------------------------------

    const language =
        getLanguage();


    recognition.lang =
        languageCodes[language] ||
        "en-IN";


    // --------------------------------------------------------
    // START
    // --------------------------------------------------------

    recognition.onstart =
        function() {

            isListening =
                true;


            showVoiceStatus(
                "🎤 Listening..."
            );

        };


    // --------------------------------------------------------
    // RESULT
    // --------------------------------------------------------

    recognition.onresult =
        function(event) {

            if (
                !event.results ||
                !event.results[0]
            ) {

                return;

            }


            const transcript =
                event.results[0][0].transcript;


            const questionElement =
                document.getElementById(
                    "question"
                );


            if (questionElement) {

                questionElement.value =
                    transcript;

            }


            showVoiceStatus(
                "✓ Got it! Finding your service..."
            );


            // Automatically send to AI
            askAI();

        };


    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    recognition.onerror =
        function(event) {

            console.error(
                "Voice recognition error:",
                event.error
            );


            isListening =
                false;


            let message =
                "Voice recognition failed.";


            if (
                event.error ===
                "not-allowed"
            ) {

                message =
                    "Microphone permission was denied.";

            }


            if (
                event.error ===
                "no-speech"
            ) {

                message =
                    "No speech was detected. Please try again.";

            }


            showVoiceStatus(
                "⚠️ " + message
            );

        };


    // --------------------------------------------------------
    // END
    // --------------------------------------------------------

    recognition.onend =
        function() {

            isListening =
                false;

        };


    // --------------------------------------------------------
    // START RECOGNITION
    // --------------------------------------------------------

    try {

        recognition.start();

    }

    catch (error) {

        console.error(
            "Could not start voice recognition:",
            error
        );

    }

}


// ============================================================
// VOICE STATUS
// ============================================================

function showVoiceStatus(message) {

    const status =
        document.getElementById(
            "voiceStatus"
        );


    if (!status) {
        return;
    }


    status.textContent =
        message;


    setTimeout(
        function() {

            status.textContent =
                "";

        },
        4000
    );

}


// ============================================================
// TEXT TO SPEECH
// ============================================================

function speakAnswer(text) {

    if (!text) {
        return;
    }


    if (
        !("speechSynthesis" in window)
    ) {

        console.warn(
            "Speech synthesis is not supported."
        );

        return;

    }


    // --------------------------------------------------------
    // STOP PREVIOUS SPEECH
    // --------------------------------------------------------

    window.speechSynthesis.cancel();


    // --------------------------------------------------------
    // CREATE SPEECH
    // --------------------------------------------------------

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        languageCodes[currentLanguage] ||
        "en-IN";


    utterance.rate =
        0.9;


    utterance.pitch =
        1;


    // --------------------------------------------------------
    // SPEAK
    // --------------------------------------------------------

    window.speechSynthesis.speak(
        utterance
    );

}


// ============================================================
// CLEAN ANSWER FOR SPEECH
// ============================================================

function cleanAnswerForSpeech(text) {

    if (!text) {
        return "";
    }


    return text

        .replace(
            /SERVICE_ID:\s*[a-zA-Z0-9_-]+/gi,
            ""
        )

        .replace(
            /SERVICE IDENTIFIED:/gi,
            ""
        )

        .replace(
            /CATEGORY:/gi,
            ""
        )

        .replace(
            /WHY THIS SERVICE:/gi,
            ""
        )

        .replace(
            /ELIGIBILITY:/gi,
            ""
        )

        .replace(
            /DOCUMENTS REQUIRED:/gi,
            ""
        )

        .replace(
            /HOW TO APPLY:/gi,
            ""
        )

        .replace(
            /IMPORTANT:/gi,
            ""
        )

        .replace(
            /OFFICIAL WEBSITE:/gi,
            ""
        );

}


// ============================================================
// STOP SPEAKING
// ============================================================

function stopSpeaking() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }


    showVoiceStatus(
        "🔇 Voice stopped."
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


// ============================================================
// LANGUAGE CHANGE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const languageElement =
            document.getElementById(
                "language"
            );


        if (languageElement) {

            currentLanguage =
                languageElement.value ||
                "English";


            languageElement.addEventListener(
                "change",
                function() {

                    currentLanguage =
                        this.value;


                    showVoiceStatus(
                        "Language changed to "
                        + this.value
                    );

                }
            );

        }

    }
);


// ============================================================
// ENTER KEY SUPPORT
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const questionElement =
            document.getElementById(
                "question"
            );


        if (!questionElement) {
            return;
        }


        questionElement.addEventListener(
            "keydown",
            function(event) {

                // Enter without Shift = ask AI
                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    askAI();

                }

            }
        );

    }
);


// ============================================================
// PAGE LOAD DEBUG INFORMATION
// ============================================================

console.log(
    "Government Service Navigator script loaded successfully."
);

console.log(
    "Supported languages:",
    Object.keys(languageCodes)
);
