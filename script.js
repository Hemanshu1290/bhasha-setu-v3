function setQuestion(text) {

    document.getElementById("question").value = text;

}


async function askAI() {

    const question =
        document.getElementById("question").value.trim();

    const language =
        document.getElementById("language").value;

    const chatBox =
        document.getElementById("chatBox");


    if (!question) {

        alert("Please enter a question.");

        return;
    }


    const userMessage =
        document.createElement("div");

    userMessage.className = "user-message";

    userMessage.innerText = question;

    chatBox.appendChild(userMessage);


    document.getElementById("question").value = "";


    const loading =
        document.createElement("div");

    loading.className = "bot-message";

    loading.innerText = "Thinking...";

    chatBox.appendChild(loading);


    try {

        const response = await fetch("/ask", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                question: question,

                language: language

            })

        });


        const data = await response.json();

        loading.innerText = data.answer;
        speakAnswer(data.answer);


    }

    catch (error) {

        loading.innerText =
            "Sorry. Something went wrong.";

    }


    chatBox.scrollTop =
        chatBox.scrollHeight;

}
let recognition;

function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Speech recognition is not supported. Please use Chrome."
        );

        return;
    }

    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    const language =
        document.getElementById("language").value;

    if (language === "Tamil") {

        recognition.lang = "ta-IN";

    } else if (language === "Hindi") {

        recognition.lang = "hi-IN";

    } else {

        recognition.lang = "en-IN";
    }

    const status =
        document.getElementById("voiceStatus");

    status.innerText =
        "🎤 Listening... Please speak now.";

    recognition.start();

    recognition.onresult = function(event) {

        const transcript =
            event.results[0][0].transcript;

        document.getElementById("question").value =
            transcript;

        status.innerText =
            "✅ Speech converted to text.";
    };

    recognition.onerror = function(event) {

        console.log(event.error);

        status.innerText =
            "❌ Could not understand. Please try again.";
    };

    recognition.onend = function() {

        console.log("Speech recognition ended.");

    };
}
function speakAnswer(text) {

    if (!("speechSynthesis" in window)) {

        alert("Text-to-speech is not supported in this browser.");

        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    const language =
        document.getElementById("language").value;

    if (language === "Tamil") {

        speech.lang = "ta-IN";

    } else if (language === "Hindi") {

        speech.lang = "hi-IN";

    } else {

        speech.lang = "en-IN";
    }

    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}
function stopSpeaking() {
    window.speechSynthesis.cancel();
}
