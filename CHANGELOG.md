# Bhasha Setu v3 — What's New

## Bug Fixed: "yes plz apply" didn't work

**Before:** When you said "apply PM Kisan for Ravi Kumar" and the bot found the citizen, it just replied with a text message. Typing "yes" or "apply for them" afterward went nowhere, because each message is understood independently — there's no memory of what you just discussed.

**Now:** Finding an existing citizen + a mentioned scheme returns a real structured `pending_apply` object with a **Confirm / Cancel** button — same pattern as updates and new-citizen inserts. Click **Confirm** and it actually creates the application row in `Scheme_Applications` and logs it. No more free-text "yes" that goes nowhere.

Try it:
```
I want to apply PM Kisan for Ravi Kumar.
```
→ Blue "📋 Scheme application" banner appears → click **Confirm** → application is created.

---

## New: "How it works" is now its own tab

The 4-step pipeline explainer used to sit in a permanent sidebar taking up space. It's now a dedicated **⚙️ How it works** tab — click into it when you want to see it, otherwise it's out of the way. It also now shows whether AI mode is on or off.

---

## New: Citizens tab shows real data

The **👥 Citizens** tab now loads and displays **every citizen currently in the Excel file** as cards (name, ID, mobile, city, address, ration card status) — not just search results. Use **Show All** to reset, or type in the search box to filter by name/mobile.

---

## New: Optional real AI understanding

By default the app still works completely offline using the regex extractor (same as before, zero setup). But you can now optionally plug in a **free Groq API key** to get:
- Real language understanding for messy/unusual phrasing, in any of the 4 languages
- Actual answers to open-ended scheme questions ("What documents do I need for Ayushman Bharat?")

See `README_AI.md` for exact steps — it's one environment variable, no code changes. The header shows an **"AI: ON"** or **"AI: OFF (regex mode)"** badge so you always know which mode is active.

---

## Files in this package

```
bhasha-setu-v3/
├── server.py           ← backend (fixed apply bug + optional AI)
├── frontend.html        ← frontend (tabs: Chat / Citizens / How it works / Activity Log)
├── requirements.txt     ← unchanged
├── README_AI.md         ← how to enable free AI mode
└── CHANGELOG.md          ← this file
```

Note: `bhasha_setu_data.xlsx` is not included — it will be auto-created (with the seeded Ravi Kumar record) the first time you start the server, same as before. If you want to keep your existing data with the citizens you've already added, copy your current `bhasha_setu_data.xlsx` into this folder before starting the server.

---

## Quick Start

**Terminal 1 — backend:**
```
cd bhasha-setu-v3
python -m uvicorn server:app --reload --port 8000
```

**Terminal 2 — frontend:**
```
cd bhasha-setu-v3
python -m http.server 5500
```

**Browser:** open `http://localhost:5500/frontend.html`

---

## Test Queries

**Apply for an existing citizen (the fixed flow):**
```
I want to apply PM Kisan for Ravi Kumar.
```

**Add a brand new citizen:**
```
My name is Priya Sharma, I live in Bangalore, mobile is 9123456780, and I want to apply for PM Kisan.
```

**Update existing citizen:**
```
Mera mobile number 9876543210 hai, aur mera address ab Tambaram ho gaya hai.
```

**Ask about a scheme (works better with AI mode on):**
```
What documents do I need for Ayushman Bharat?
```
