let recognition;
let isRecording = false;

// Initialize the browser's speech recognition
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        document.getElementById("micButton").classList.add("recording");
        document.getElementById("micButton").innerHTML = "🛑 Stop & Process";
        document.getElementById("recordingStatus").textContent = "Listening to field notes...";
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("recordingStatus").textContent = `Heard: "${transcript}"`;
        
        // Put the spoken words into our hidden input and trigger the AI
        document.getElementById("question").value = transcript;
        askAI();
    };

    recognition.onerror = function(event) {
        document.getElementById("recordingStatus").textContent = "Error listening. Please try again.";
        resetMicButton();
    };

    recognition.onend = function() {
        resetMicButton();
    };
} else {
    alert("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
}

function toggleRecording() {
    if (!recognition) return;

    // Grab the selected language (e.g., 'hi-IN' for Hindi, 'en-IN' for English)
    const langSelect = document.getElementById("language").value;
    if (langSelect === "Hindi") recognition.lang = "hi-IN";
    else if (langSelect === "Tamil") recognition.lang = "ta-IN";
    else recognition.lang = "en-IN";

    if (isRecording) {
        recognition.stop();
        isRecording = false;
    } else {
        recognition.start();
        isRecording = true;
    }
}

function resetMicButton() {
    isRecording = false;
    document.getElementById("micButton").classList.remove("recording");
    document.getElementById("micButton").innerHTML = "🎤 Tap to Speak Field Notes";
}

// ... (KEEP YOUR EXISTING askAI() FUNCTION DOWN HERE) ...
function setQuestion(text) {
    document.getElementById("question").value = text;
    askAI();
}

function handleKey(event) {
    if (event.key === "Enter") {
        askAI();
    }
}

async function askAI() {
    const questionInput = document.getElementById("question");
    const question = questionInput.value.trim();
    const language = document.getElementById("language").value;
    const chatBox = document.getElementById("chatBox");

    if (!question) {
        return;
    }

    // Show the user's message in the chat
    const userDiv = document.createElement("div");
    userDiv.className = "user-message";
    userDiv.textContent = question;
    chatBox.appendChild(userDiv);

    questionInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Show a temporary "thinking" message
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "bot-message";
    loadingDiv.textContent = "Extracting data...";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // 1. Point to the NEW FastAPI endpoint
        const response = await fetch("/api/extract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // 2. Match the exact payload shape your backend expects
            body: JSON.stringify({ transcript: question, language: language })
        });

        const result = await response.json();

        // 3. Format the extracted JSON data so it looks nice in the chat box
        if (result.status === "success") {
            const extracted = result.data;
            loadingDiv.innerHTML = `
                <strong>✅ Data Extracted:</strong><br><br>
                👤 <b>Name:</b> ${extracted.citizen_name}<br>
                📜 <b>Scheme:</b> ${extracted.scheme_intent}<br>
                📍 <b>Location:</b> ${extracted.location}<br>
                📄 <b>Documents:</b> ${extracted.document_status}
            `;
        } else {
            loadingDiv.textContent = "Extraction failed. Please try again.";
        }

    } catch (error) {
        loadingDiv.textContent = "Server error. Is the backend running?";
        console.error(error);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}
