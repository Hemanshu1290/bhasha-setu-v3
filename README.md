# Bhasha Setu v2 🇮🇳

> **Multilingual Citizen Support & Government Scheme Assistance**

Bhasha Setu is a lightweight multilingual citizen-support application
designed to make government-service interactions easier through
**natural-language text and voice input**. Users can communicate in
**English, Hindi, Tamil, Telugu, or Romanized Hindi**, while the system
converts their requests into structured information, validates it,
matches existing citizens, and performs spreadsheet updates only after
explicit confirmation.

The project is designed for environments where reliable internet access
may not always be available. In its default mode, the core extraction
and citizen-data workflow can run locally without an external AI API.

------------------------------------------------------------------------

## ✨ Key Features

### 🗣️ Multilingual Interaction

Bhasha Setu supports citizen requests in:

-   🇬🇧 English
-   🇮🇳 Hindi
-   🇮🇳 Tamil
-   🇮🇳 Telugu
-   🔤 Romanized Hindi / Hinglish

Users can type naturally or use browser-based voice input.

Example:

``` text
Mera naam Priya Sharma hai, main Bangalore mein rehti hoon,
mobile 9123456780 hai aur mujhe PM Kisan ke liye apply karna hai.
```

The system can convert this into structured fields such as:

``` json
{
  "name": "Priya Sharma",
  "mobile": "9123456780",
  "city": "Bangalore",
  "scheme": "PM Kisan"
}
```

------------------------------------------------------------------------

### 👤 Citizen Management

The application supports:

-   Adding new citizens
-   Searching citizens by name or mobile number
-   Viewing all citizens
-   Matching incoming requests against existing citizens
-   Updating existing citizen information
-   Viewing citizen details such as ID, mobile, city, address, and
    ration-card status

The Citizens tab loads the current records from the Excel-backed
database and provides search/filter functionality.

------------------------------------------------------------------------

### 🏛️ Government Scheme Applications

Citizens can request assistance with schemes such as:

-   PM Kisan
-   Ayushman Bharat
-   PM Awas Yojana
-   PM Ujjwala Yojana

For an existing citizen, the application flow identifies the citizen and
prepares a structured scheme-application action.

Example:

``` text
I want to apply PM Kisan for Ravi Kumar.
```

The system prepares a scheme application for the matched citizen and
requires explicit confirmation before writing the application.

------------------------------------------------------------------------

### ✅ Confirmation Before Data Changes

Bhasha Setu follows a **review → confirm → write** workflow.

Nothing is directly written to the spreadsheet simply because a message
was received.

The pipeline is:

``` text
User Input
    ↓
Speech-to-Text / Typed Text
    ↓
Intent + Entity Extraction
    ↓
Validation + Citizen Matching
    ↓
Review / Preview
    ↓
User Confirmation
    ↓
Excel Update
    ↓
Activity / Audit Log
```

This helps prevent accidental citizen-data changes.

------------------------------------------------------------------------

### 📊 Excel-Based Local Data Storage

The backend uses an Excel workbook:

``` text
bhasha_setu_data.xlsx
```

The workbook contains separate sheets for:

``` text
Citizens
Scheme_Applications
Conversation_Log
Updates_Log
```

The backend automatically creates the workbook and required sheets if
the data file does not already exist.

------------------------------------------------------------------------

### 🤖 Optional AI Mode

Bhasha Setu has two extraction modes.

#### Offline / Default Mode

The default mode uses a deterministic regex-based extractor.

Advantages:

-   No API key required
-   No external AI service required
-   Works locally
-   Suitable for basic structured requests
-   Useful in low-connectivity environments

The limitation is that deterministic extraction may not understand every
possible natural-language phrasing and cannot provide open-ended scheme
answers.

#### Optional AI Mode

A Groq API key can be configured to enable AI-powered extraction and
general scheme Q&A.

AI mode can help with:

-   Messy natural-language requests
-   More flexible multilingual phrasing
-   Extracting name, mobile, city, intent, and scheme
-   Open-ended scheme questions

The frontend displays whether AI mode is active with an `AI: ON` /
`AI: OFF (regex mode)` indicator.

> **Privacy note:** When AI mode is enabled, user text sent to the
> external AI provider should be treated according to that provider's
> API terms and your project's privacy requirements. Do not commit API
> keys or private citizen data to GitHub.

------------------------------------------------------------------------

## 🏗️ Architecture

``` text
┌───────────────────────────────────────────┐
│              Bhasha Setu UI               │
│              frontend.html                │
│                                           │
│  Chat │ Citizens │ How it works │ Logs   │
└─────────────────────┬─────────────────────┘
                      │
                      │ HTTP / REST API
                      ▼
┌───────────────────────────────────────────┐
│              FastAPI Backend              │
│                 server.py                 │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Speech/Text Input Processing        │  │
│  ├─────────────────────────────────────┤  │
│  │ Intent + Entity Extraction          │  │
│  ├─────────────────────────────────────┤  │
│  │ Citizen Matching                    │  │
│  ├─────────────────────────────────────┤  │
│  │ Validation                           │  │
│  ├─────────────────────────────────────┤  │
│  │ Confirmation Actions                │  │
│  └─────────────────────────────────────┘  │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│             Excel Data Store              │
│          bhasha_setu_data.xlsx            │
│                                           │
│ Citizens                                   │
│ Scheme_Applications                        │
│ Conversation_Log                           │
│ Updates_Log                                │
└───────────────────────────────────────────┘
```

### Core Components

  -----------------------------------------------------------------------
  Component                           Purpose
  ----------------------------------- -----------------------------------
  `frontend.html`                     User interface, chat, voice input,
                                      citizen search, confirmation UI,
                                      logs

  `server.py`                         FastAPI backend, extraction,
                                      validation, matching, Excel
                                      operations

  `requirements.txt`                  Python dependencies

  `bhasha_setu_data.xlsx`             Local citizen/application data

  `TEST_QUERIES.txt`                  Sample multilingual test requests

  `UPGRADE_GUIDE.md`                  Setup and troubleshooting
                                      documentation
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 📁 Project Structure

``` text
bhasha-setu-v2/
│
├── server.py
├── frontend.html
├── requirements.txt
├── TEST_QUERIES.txt
├── UPGRADE_GUIDE.md
├── README.md
│
├── .gitignore
│
└── bhasha_setu_data.xlsx   # Local/private data — do not commit
```

> If you publish the repository publicly, use a **sample Excel file
> containing fake data** instead of real citizen records.

------------------------------------------------------------------------

# 🚀 Installation & Setup

## Prerequisites

Install:

-   Python 3.x
-   Git
-   A modern web browser

Verify Python:

``` bash
python --version
```

Verify Git:

``` bash
git --version
```

------------------------------------------------------------------------

## 1. Clone the Repository

``` bash
git clone https://github.com/YOUR-USERNAME/bhasha-setu-v2.git
cd bhasha-setu-v2
```

If you are running the project from an existing local folder, you can
skip the clone step.

------------------------------------------------------------------------

## 2. Install Python Dependencies

``` bash
python -m pip install -r requirements.txt
```

------------------------------------------------------------------------

## 3. Start the Backend

Open **Terminal / Command Prompt 1**:

### Windows

``` cmd
cd C:\path\to\bhasha-setu-v2
python -m uvicorn server:app --reload --port 8000
```

The backend should be available at:

``` text
http://127.0.0.1:8000
```

------------------------------------------------------------------------

## 4. Start the Frontend

Open **Terminal / Command Prompt 2**:

``` cmd
cd C:\path\to\bhasha-setu-v2
python -m http.server 5500
```

Then open:

``` text
http://localhost:5500/frontend.html
```

------------------------------------------------------------------------

## 5. Optional: Enable AI Mode

AI mode is optional.

For Windows Command Prompt:

``` cmd
set GROQ_API_KEY=gsk_your_key_here
python -m uvicorn server:app --reload --port 8000
```

For PowerShell:

``` powershell
$env:GROQ_API_KEY="gsk_your_key_here"
python -m uvicorn server:app --reload --port 8000
```

Without the key, the application remains in its default regex extraction
mode.

**Never commit your API key to GitHub.**

------------------------------------------------------------------------

# 🧪 Example Queries

### Add a New Citizen

``` text
My name is Priya Sharma, I live in Bangalore, mobile is 9123456780, and I want to apply for PM Kisan.
```

Expected workflow:

``` text
New citizen detected
        ↓
Review information
        ↓
Confirm
        ↓
Citizen added
```

------------------------------------------------------------------------

### Hindi

``` text
मेरा नाम रमेश कुमार है, मैं लखनऊ में रहता हूं,
मेरा मोबाइल नंबर 9876543211 है और मुझे पीएम किसान के लिए आवेदन करना है।
```

------------------------------------------------------------------------

### Existing Citizen

``` text
I want to apply PM Kisan for Ravi Kumar.
```

The system matches the existing citizen and prepares a scheme
application for confirmation.

------------------------------------------------------------------------

### Search

``` text
Find Priya Sharma.
```

or:

``` text
Search for citizen with mobile number 9123456780.
```

------------------------------------------------------------------------

### Update

``` text
Mera mobile number 9876543210 hai, aur mera address ab Tambaram ho gaya hai.
```

------------------------------------------------------------------------

### Scheme Information

``` text
What documents do I need for Ayushman Bharat?
```

Open-ended scheme questions are supported more effectively when optional
AI mode is enabled.

------------------------------------------------------------------------

# 🌐 Multilingual Support

The interface is designed around the idea that citizens should not need
to understand a technical form or English-only interface.

Supported interaction languages include:

  Language                       Text                            Voice
  ---------------------------- ------ --------------------------------
  English                          ✅                             ✅\*
  Hindi                            ✅                             ✅\*
  Tamil                            ✅                             ✅\*
  Telugu                           ✅                             ✅\*
  Romanized Hindi / Hinglish       ✅   Depends on browser recognition

\* Voice recognition availability depends on browser/device support and
configuration.

The backend can also use optional AI extraction to better understand
natural and irregular phrasing.

------------------------------------------------------------------------

# 📡 Offline & Low-Connectivity Design

A major design goal of Bhasha Setu is supporting environments where
internet connectivity may be unreliable.

### What works locally

With the default regex mode:

-   Frontend runs locally
-   FastAPI backend runs locally
-   Citizen records are stored locally in Excel
-   Basic extraction does not require an external AI API
-   Data changes are written to the local workbook after confirmation

This makes the core application suitable for local/offline
demonstrations and low-connectivity workflows.

### Important limitation

The optional AI mode requires an internet connection to communicate with
the external AI provider.

Browser-based speech recognition may also have browser-specific network
or platform requirements.

Therefore:

``` text
Offline Core
    ↓
Local frontend
    +
Local FastAPI backend
    +
Local Excel data
    +
Regex extraction

Optional Online AI
    ↓
External AI API
```

------------------------------------------------------------------------

# 🔐 Data & Privacy

Bhasha Setu can handle personally identifiable citizen information such
as:

-   Names
-   Mobile numbers
-   Cities
-   Addresses
-   Government-scheme application information

For that reason:

### Do not commit real citizen data

Add the Excel file to `.gitignore`:

``` gitignore
bhasha_setu_data.xlsx
```

For a public repository, create a separate sample workbook containing
**fictional/test records only**.

Also keep API keys out of source code:

``` gitignore
.env
.env.*
```

------------------------------------------------------------------------

# 🖼️ Screenshots

Add project screenshots here to demonstrate the main workflows.

### Chat Interface

``` text
docs/screenshots/chat.png
```

![Bhasha Setu Chat Interface](docs/screenshots/chat.png)

### New Citizen Confirmation

``` text
docs/screenshots/new-citizen.png
```

![New Citizen Confirmation](docs/screenshots/new-citizen.png)

### Citizens Database

``` text
docs/screenshots/citizens.png
```

![Citizens Database](docs/screenshots/citizens.png)

### How It Works

``` text
docs/screenshots/how-it-works.png
```

![Bhasha Setu Architecture](docs/screenshots/how-it-works.png)

### Activity Log

``` text
docs/screenshots/activity-log.png
```

![Activity Log](docs/screenshots/activity-log.png)

> Create the `docs/screenshots/` folder and add your actual screenshots
> before publishing the README. The paths above are placeholders.

------------------------------------------------------------------------

# 🧭 How the Data Flow Works

### 1. User speaks or types

``` text
"My name is Priya Sharma..."
```

### 2. Input is converted into structured information

``` json
{
  "name": "Priya Sharma",
  "mobile": "9123456780",
  "city": "Bangalore",
  "intent": "apply",
  "scheme": "PM Kisan"
}
```

### 3. Backend validates the request

The backend checks whether the citizen already exists before preparing
an insert or update.

### 4. User reviews the proposed change

The UI displays a confirmation preview.

### 5. User confirms

Only after confirmation does the backend write the change.

### 6. Action is logged

Updates, inserts, and scheme applications are recorded in the workbook's
logging sheets.

------------------------------------------------------------------------

# 📋 Data Model

## Citizens

``` text
Citizen_ID
Name
Mobile
State
District
City
Address
Has_Ration_Card
```

## Scheme Applications

``` text
Application_ID
Citizen_ID
Scheme
Date
Status
```

## Conversation Log

``` text
Timestamp
Citizen_ID
Language
Query
Intent
```

## Updates Log

``` text
Timestamp
Citizen_ID
Field
Old Value
New Value
```

------------------------------------------------------------------------

# 🛠️ Troubleshooting

### `No module named uvicorn`

Run:

``` bash
python -m pip install -r requirements.txt
```

Then:

``` bash
python -m uvicorn server:app --reload --port 8000
```

### Backend not running

Make sure Terminal 1 shows:

``` text
Uvicorn running on http://127.0.0.1:8000
```

### Frontend cannot connect

Make sure both servers are running:

``` text
Backend  → http://127.0.0.1:8000
Frontend → http://localhost:5500
```

Then open:

``` text
http://localhost:5500/frontend.html
```

### AI badge says `AI: OFF`

This is expected when `GROQ_API_KEY` is not configured. The application
will use its default deterministic extraction mode.

------------------------------------------------------------------------

# 🚧 Future Improvements

Planned or possible improvements include:

### 🗣️ Better Voice & Language Support

-   More Indian languages
-   Better regional-language speech recognition
-   Improved handling of accents and dialects
-   Better noisy-environment voice processing

### 📱 Mobile / Rural Deployment

-   Progressive Web App (PWA)
-   Android application
-   Local-first synchronization
-   Background synchronization when connectivity returns
-   Device-level encrypted local storage

### 🤖 AI Improvements

-   Better multilingual intent detection
-   More robust entity extraction
-   Conversational context and follow-up understanding
-   Local LLM support through Ollama
-   More government-scheme knowledge

### 🗄️ Database Improvements

Replace Excel with a production database such as:

-   SQLite for local deployments
-   PostgreSQL for centralized deployments

### 🔐 Security

-   Authentication and authorization
-   Encryption at rest
-   Encrypted synchronization
-   Role-based access control
-   Secure API configuration
-   Privacy-preserving AI processing

### 📊 Administration

-   Citizen analytics dashboard
-   Scheme application statistics
-   Application-status tracking
-   Export/report generation
-   Advanced search and filtering

### 🔄 Synchronization

A future local-first architecture could follow:

``` text
             ┌───────────────┐
             │ Local Device  │
             │ Citizen Data  │
             └───────┬───────┘
                     │
              No Internet
                     │
               Local Queue
                     │
            Internet Available
                     │
                     ▼
             ┌───────────────┐
             │ Central Server│
             │ Synchronizer  │
             └───────────────┘
```

This would allow field workers to continue collecting information even
when temporarily offline.

------------------------------------------------------------------------

# 🎯 Project Goal

**Bhasha Setu** aims to reduce the language, literacy, and connectivity
barriers that can make government services difficult to access.

Instead of forcing citizens to navigate complicated forms, the system
allows them to communicate naturally:

> **Speak → Understand → Verify → Confirm → Record**

The long-term vision is a **local-first, multilingual, voice-enabled
citizen-service assistant** that can work effectively in both connected
and low-connectivity environments.

------------------------------------------------------------------------

# 📄 License

Add your preferred license here.

For example:

``` text
MIT License
```

If this is an academic project, you may instead include your
institution, course, team members, and project supervisor information.

------------------------------------------------------------------------

# 👥 Contributors

Add your project team here:

``` text
- Your Name — Developer
- Team Member — Developer
- Team Member — Research / Design
```

------------------------------------------------------------------------

## ⭐ Acknowledgements

Built as a prototype for improving multilingual access to citizen and
government-service workflows.
