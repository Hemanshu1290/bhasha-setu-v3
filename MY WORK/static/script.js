// ============================================================
// GOVERNMENT SERVICE NAVIGATOR - SCRIPT
// ============================================================


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let recognition = null;

let isListening = false;

let currentLanguage = "English";


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


    if (!questionElement) {

        console.error(
            "Question input not found."
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

    if (chatBox) {

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


    try {

        // ====================================================
        // SEND QUESTION TO FLASK
        // ====================================================

        const response =
            await fetch("/ask", {

                method: "POST",

                headers: {

                    "Content-Type":
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
        // CHECK SERVER RESPONSE
        // ====================================================

        if (!response.ok) {

            throw new Error(
                "Server returned an error."
            );

        }


        const data =
            await response.json();


        console.log(
            "AI Response:",
            data
        );


        // ====================================================
        // DISPLAY AI RESPONSE
        // ====================================================

        displayAIResponse(
            data
        );


        // ====================================================
        // SPEAK RESPONSE
        // ====================================================

        if (data.answer) {

            speakAnswer(
                cleanAnswerForSpeech(
                    data.answer
                )
            );

        }

    }


    catch (error) {

        console.error(
            "Error:",
            error
        );


        if (chatBox) {

            chatBox.innerHTML = `

                <div class="error-message">

                    <div class="error-icon">
                        ⚠️
                    </div>

                    <h4>
                        Something went wrong
                    </h4>

                    <p>
                        I couldn't connect to the
                        government service assistant.
                    </p>

                    <p>
                        Please check that Flask is
                        running and try again.
                    </p>

                </div>

            `;

        }

    }

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
    // FORMAT AI ANSWER
    // --------------------------------------------------------

    let formattedAnswer =
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
                service.name || "Government Service"
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
                        onclick="openService('${serviceId}')">

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
    // FINAL DISPLAY
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
                        ${escapeHTML(
                            currentLanguage
                        )}
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


    // SERVICE IDENTIFIED
    safeText =
        safeText.replace(

            /SERVICE IDENTIFIED:/gi,

            "<strong>Service Identified:</strong>"

        );


    // CATEGORY
    safeText =
        safeText.replace(

            /CATEGORY:/gi,

            "<strong>Category:</strong>"

        );


    // WHY THIS SERVICE
    safeText =
        safeText.replace(

            /WHY THIS SERVICE:/gi,

            "<strong>Why This Service:</strong>"

        );


    // ELIGIBILITY
    safeText =
        safeText.replace(

            /ELIGIBILITY:/gi,

            "<strong>Eligibility:</strong>"

        );


    // DOCUMENTS
    safeText =
        safeText.replace(

            /DOCUMENTS REQUIRED:/gi,

            "<strong>Documents Required:</strong>"

        );


    // HOW TO APPLY
    safeText =
        safeText.replace(

            /HOW TO APPLY:/gi,

            "<strong>How to Apply:</strong>"

        );


    // IMPORTANT
    safeText =
        safeText.replace(

            /IMPORTANT:/gi,

            "<strong>Important:</strong>"

        );


    // OFFICIAL WEBSITE
    safeText =
        safeText.replace(

            /OFFICIAL WEBSITE:/gi,

            "<strong>Official Website:</strong>"

        );


    // SERVICE ID
    safeText =
        safeText.replace(

            /SERVICE_ID:\s*[a-zA-Z0-9_]+/gi,

            ""

        );


    // Convert numbered steps
    safeText =
        safeText.replace(

            /(\d+\.)/g,

            "<br>$1"

        );


    // Convert line breaks
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
        `/service/${serviceId}`;

}


// ============================================================
// VOICE RECOGNITION
// ============================================================

function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice recognition is not supported in this browser. Please use Google Chrome."
        );

        return;

    }


    // --------------------------------------------------------
    // STOP IF ALREADY LISTENING
    // --------------------------------------------------------

    if (isListening && recognition) {

        recognition.stop();

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    // --------------------------------------------------------
    // LANGUAGE MAPPING
    // --------------------------------------------------------

    const language =
        getLanguage();


    const languageCodes = {

        "English":
            "en-IN",

        "Tamil":
            "ta-IN",

        "Hindi":
            "hi-IN",

        "Telugu":
            "te-IN",

        "Kannada":
            "kn-IN",

        "Malayalam":
            "ml-IN",

        "Bengali":
            "bn-IN",

        "Marathi":
            "mr-IN"

    };


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


            // Automatically search
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


            showVoiceStatus(
                "⚠️ Voice recognition failed. Please try again."
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


    recognition.start();

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


    if (!("speechSynthesis" in window)) {

        return;

    }


    // Stop previous speech
    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    const language =
        currentLanguage;


    const speechLanguages = {

        "English":
            "en-IN",

        "Tamil":
            "ta-IN",

        "Hindi":
            "hi-IN",

        "Telugu":
            "te-IN",

        "Kannada":
            "kn-IN",

        "Malayalam":
            "ml-IN",

        "Bengali":
            "bn-IN",

        "Marathi":
            "mr-IN"

    };


    utterance.lang =
        speechLanguages[language] ||
        "en-IN";


    utterance.rate =
        0.9;


    utterance.pitch =
        1;


    window.speechSynthesis.speak(
        utterance
    );

}


// ============================================================
// CLEAN ANSWER BEFORE SPEECH
// ============================================================

function cleanAnswerForSpeech(text) {

    if (!text) {

        return "";

    }


    return text

        .replace(
            /SERVICE_ID:\s*[a-zA-Z0-9_]+/gi,
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

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


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

            languageElement.addEventListener(
                "change",
                function() {

                    currentLanguage =
                        this.value;

                    showVoiceStatus(
                        `Language changed to ${this.value}`
                    );

                }
            );

        }

    }
);
