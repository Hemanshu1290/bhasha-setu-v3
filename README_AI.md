# Enabling Real AI Understanding (Optional)

By default, Bhasha Setu v3 uses a **deterministic regex extractor** — no API key needed, works offline, but it's limited (it can miss phrasing it hasn't seen before, and can't answer open-ended scheme questions).

If you set a **free Groq API key**, the backend automatically switches to real AI for:
- Extracting name/mobile/city/intent from messy, natural sentences in any language
- Answering open-ended questions like *"What schemes are available for farmers?"* or *"Do I need documents for Ayushman Bharat?"*

No code changes needed — just set one environment variable before starting the server.

---

## Option 1: Groq (recommended — fast, generous free tier, no credit card)

1. Go to **https://console.groq.com/keys**
2. Sign up (free, just email/Google login)
3. Click **Create API Key**, copy it
4. Before starting the server, set the key:

**Windows Command Prompt:**
```
set GROQ_API_KEY=gsk_your_key_here
python -m uvicorn server:app --reload --port 8000
```

**Windows PowerShell:**
```
$env:GROQ_API_KEY="gsk_your_key_here"
python -m uvicorn server:app --reload --port 8000
```

**Mac/Linux:**
```
export GROQ_API_KEY=gsk_your_key_here
python -m uvicorn server:app --reload --port 8000
```

That's it. Open `frontend.html` — the badge in the header should now say **"AI: ON"** instead of **"AI: OFF (regex mode)"**.

Groq's free tier as of early 2026 covers Llama 3.1 models with a generous daily request limit — more than enough for testing and demos. Check their current limits at https://console.groq.com/settings/limits since these change over time.

---

## Option 2: Other free-tier options (if you want to swap providers)

The code calls a single function `call_groq()` using an OpenAI-compatible `/chat/completions` endpoint. Any of these are drop-in compatible if you change `GROQ_URL` and the auth header in `server.py`:

- **Google AI Studio (Gemini)** — https://aistudio.google.com/apikey — free tier, generous limits, but uses a different request format (would need a small adapter function).
- **OpenRouter** — https://openrouter.ai/keys — free tier includes several open-source models (e.g. `meta-llama/llama-3.1-8b-instruct:free`), and uses the same OpenAI-compatible format as Groq — just change `GROQ_URL` to `https://openrouter.ai/api/v1/chat/completions` and set `OPENROUTER_API_KEY` instead.
- **Ollama (fully local, no key at all)** — https://ollama.com — run a small model like `llama3.2` on your own machine, completely free and private. Requires more RAM but zero API limits and no internet dependency for AI features.

If you want, I can wire up any of these as an alternative — just tell me which one.

---

## What Changes When AI Is On

| Feature | Regex mode (default) | AI mode (Groq key set) |
|---|---|---|
| Name/mobile/city extraction | Pattern matching, misses unusual phrasing | Understands varied, natural phrasing |
| Multilingual support | Hindi/Tamil/Telugu keyword lists only | Any phrasing, any of the 4 languages |
| "Tell me about PM Kisan" | Canned one-line description | Real generated answer |
| "What documents do I need for Ayushman Bharat?" | Generic fallback reply | Actual answer from the model |
| Cost | Free, no internet needed | Free tier, needs internet + API key |

---

## Security Note

Never commit your API key to a public GitHub repo or share it in chat. The key only needs to live in your terminal's environment variable for that session — it is not stored in any file in this project.
