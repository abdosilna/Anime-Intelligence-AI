# Anime Intelligence AI (AI Engine & Knowledge Base API)

> **Specialized AI Engine, Multilingual Knowledge Retrieval System, and REST API for Japanese Anime, Manga, Characters, Chronologies, Official Streaming Availability, and Scene Discovery.**

---

## 🌟 Overview & Core Capabilities

**Anime Intelligence AI** is built from scratch as an AI backend engine and retrieval-augmented generation (RAG) system specialized in the anime domain. It is designed to be integrated into any separate website, mobile app, or client frontend.

### Key Architectural Modules:
1. **Multilingual Anime Knowledge Engine**:
   - Normalized anime records: titles, aliases, synopses, genres, themes, season/episodes, release dates, studios, staff, character rosters with voice actors and abilities, and source references.
   - Native support for **Arabic (Modern Standard Arabic and Moroccan Darija)**, **Japanese (Kanji, Hiragana, Katakana, and Romaji with macron folding)**, and **English**.
   - Normalized Arabic search: Alef variation normalization (`أ, إ, آ, ٱ -> ا`), Taa Marbuta (`ة -> ه`), Yaa (`ى -> ي`), Tashkeel (diacritics) stripping, Tatweel stripping, definite article (`ال-`) prefix handling, and Moroccan Darija loanwords.

2. **Intelligent RAG Question Answering**:
   - Grounded context retrieval before answer generation to eliminate factual hallucinations.
   - Dual-engine architecture:
     - Powered by **Gemini 3.8 Flash** via `@google/genai` when `GEMINI_API_KEY` is present.
     - Deterministic local grounded RAG fallback when offline or without an API key, ensuring high availability.
   - **Spoiler Shield**: Strict toggle between `safe` mode (redacting twists and endings) and `unrestricted` mode (with labeled `[SPOILER]` warnings).
   - Clear distinction between confirmed canon source material and anime filler/theories.

3. **Official Streaming Availability**:
   - Region-aware legal streaming availability (Morocco `MA`, United States `US`, Japan `JP`, France `FR`, United Kingdom `UK`, Germany `DE`, Canada `CA`, Egypt `EG`, Saudi Arabia `SA`, UAE `AE`).
   - Deep links to official platforms (Crunchyroll, Netflix, Shahid VIP, Amazon Prime Video, Disney+, HIDIVE) with audio dub and subtitle language metadata.
   - Zero hallucination policy: If an official deep link cannot be verified, direct platform search fallback links are provided with confidence ratings.

4. **Scene and Clip Discovery**:
   - Natural language scene search (e.g., *"Levi ambushes the beast titan in the smoke"*, *"Tanjiro unlocks dance of the fire god against Rui"*, *"Gojo reveals domain expansion against Jogo"*, *"Bocchi slide guitar solo with glass bottle"*).
   - Returns verified canonical season, episode, approximate timestamp range, and direct legal links to official video channels (Crunchyroll Collection, TOHO animation, MAPPA Channel, Aniplex).

5. **Personalized Discovery & Recommendations**:
   - Multi-criteria scoring matching genres, mood, story pacing, episode budget, and regional legal availability.
   - Concrete reasons for each recommendation in both English and Arabic.
   - Balances mainstream hits with hidden gems and critically acclaimed masterpieces.

6. **OpenAPI 3.0.3 REST API**:
   - Complete documented REST endpoints returning standard JSON schemas, status codes, and source citations.

---

## 🚀 REST API Reference

The server exposes standard RESTful endpoints under port `3000`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health, indexed counts, and engine status |
| `GET` | `/anime/search?q=&genre=&year=&limit=` | Search anime records across Arabic, English, and Japanese |
| `GET` | `/anime/:id` | Get comprehensive anime record by slug |
| `GET` | `/anime/:id/characters` | Get character roster, abilities, and voice actor credits |
| `GET` | `/anime/:id/episodes` | Get episode counts, canon manga chapters, and filler status |
| `POST` | `/chat` | RAG Q&A with spoiler control and language selection |
| `POST` | `/recommendations` | Multi-criteria recommendations with English & Arabic reasons |
| `GET` | `/availability?anime_id=&country=` | Official legal streaming availability by country code |
| `POST` | `/scenes/search` | Natural language scene description search |
| `GET` | `/images/search?q=&type=&limit=` | High-resolution official posters and key visuals |
| `GET` | `/sources/:id` | Source provenance audit and verification records |
| `GET` | `/api/openapi.json` | Complete OpenAPI 3.0.3 specification in JSON format |

---

## 📡 Example API Requests & Responses

### 1. RAG Chat (`POST /chat`)
**Request:**
```bash
curl -X POST "http://localhost:3000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "اشرح لي قصة هجوم العمالقة ومسار الكانون بدون حرق",
    "spoilerMode": "safe",
    "language": "ar"
  }'
```

**Response:**
```json
{
  "role": "assistant",
  "content": "### 🎌 هجوم العمالقة (Attack on Titan)\n**الاستوديو**: Wit Studio / MAPPA | **التقييم**: ⭐ 9.05/10\n\n#### 📖 نبذة عن القصة:\nمنذ قرون، كادت البشرية تُباد على يد عمالقة متوحشين...\n\n#### 📜 التسلسل الزمني ومسار الكانون:\n- المصدر الأصلي: Manga chapters 1-139 by Hajime Isayama\n- حلقات الفيلر: خالٍ تمامًا من الفيلر (Canon بنسبة 100%)\n\n🛡️ وضع الحماية من الحرق مفعّل: تم إخفاء مصائر الشخصيات والنهاية.",
  "timestamp": 1729584000000,
  "citations": [
    {
      "title": "Attack on Titan",
      "animeId": "attack-on-titan",
      "url": "https://www.crunchyroll.com/series/GR751KNZY/attack-on-titan",
      "source": "AniList GraphQL, Jikan v4, Bessatsu Shonen Archive"
    }
  ],
  "spoilersContained": false
}
```

### 2. Check Streaming in Morocco (`GET /availability`)
**Request:**
```bash
curl -X GET "http://localhost:3000/availability?anime_id=attack-on-titan&country=MA" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "animeId": "attack-on-titan",
  "animeTitle": "Attack on Titan",
  "country": "MA",
  "countryName": "Morocco",
  "platforms": [
    {
      "platform": "Crunchyroll",
      "countries": ["US", "MA", "UK", "FR", "DE", "CA", "EG", "SA"],
      "url": "https://www.crunchyroll.com/series/GR751KNZY/attack-on-titan",
      "isDeepLink": true,
      "dubAvailable": ["English", "Spanish", "Portuguese", "German", "French"],
      "subAvailable": ["Arabic", "English", "French"],
      "lastVerified": "2026-10-01",
      "confidence": "verified"
    },
    {
      "platform": "Shahid",
      "countries": ["MA", "EG", "SA", "AE"],
      "url": "https://shahid.mbc.net/ar/series/Attack-on-Titan",
      "isDeepLink": true,
      "dubAvailable": ["Arabic"],
      "subAvailable": ["Arabic"],
      "lastVerified": "2026-09-20",
      "confidence": "verified",
      "notes": "Official MENA region licensed streaming on Shahid VIP."
    }
  ]
}
```

### 3. Natural Language Scene Search (`POST /scenes/search`)
**Request:**
```bash
curl -X POST "http://localhost:3000/scenes/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Levi ambushes the beast titan in the smoke",
    "limit": 1
  }'
```

**Response:**
```json
{
  "query": "Levi ambushes the beast titan in the smoke",
  "total": 1,
  "matches": [
    {
      "id": "scene-levi-vs-beast-titan",
      "animeId": "attack-on-titan",
      "animeTitle": "Attack on Titan (Season 3 Part 2)",
      "season": 3,
      "episode": 54,
      "timestampApprox": "14:20 - 16:50",
      "sceneTitle": "Captain Levi Dismantles the Beast Titan",
      "sceneTitleArabic": "ليفاي أكرمان يمزق العملاق الوحش",
      "charactersInvolved": ["Levi Ackerman", "Zeke Yeager", "Erwin Smith"],
      "officialClipUrl": "https://www.youtube.com/watch?v=kYv9j9_5qGE",
      "officialClipChannel": "Crunchyroll Collection (Official Verified YouTube)",
      "confidence": "verified"
    }
  ]
}
```

---

## 💻 Beginner Setup Guide

### Running on a Computer (Linux / macOS / Windows with WSL)

1. **Clone or navigate to the project directory**:
   ```bash
   cd anime-intelligence-ai
   ```

2. **Install Node.js (version 20+ recommended)**:
   Verify with `node -v` and `npm -v`.

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* If you have a Gemini API key from Google AI Studio, add it in `.env`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
   *Note: If no key is set, the system automatically uses its local deterministic grounded RAG engine.*

5. **Run the Automated Tests**:
   ```bash
   npm test
   ```

6. **Start the Engine & Developer Workbench**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

### Running on an Android Phone (via Termux)

You can run this full-stack AI engine entirely on an Android phone using **Termux** (free terminal emulator):

1. **Install Termux** from F-Droid or GitHub.
2. **Update packages and install Node.js and Git**:
   ```bash
   pkg update && pkg upgrade -y
   pkg install nodejs-lts git -y
   ```
3. **Navigate to the app folder**:
   ```bash
   git clone <your-repo-url>
   cd anime-intelligence-ai
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Start the server**:
   ```bash
   npm run dev
   ```
6. **Access the Engine**:
   Open Chrome or Firefox on your Android phone and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧪 Automated Tests & Quality Verification

Run unit and integration tests using:
```bash
./node_modules/.bin/tsx --test src/engine/__tests__/engine.test.ts
```

### Verified Test Suite Results:
- `Subtest 1`: Arabic Normalization & Darija handling (`PASSED`)
- `Subtest 2`: Romaji & English normalization with macron folding (`PASSED`)
- `Subtest 3`: Multilingual Knowledge Base Search across Arabic, Romaji, Kanji, character names (`PASSED`)
- `Subtest 4`: Streaming Availability & Region Resolution (Morocco, USA, France, fallback links) (`PASSED`)
- `Subtest 5`: Natural Language Scene & Clip Discovery (Levi, Tanjiro, Spike) (`PASSED`)
- `Subtest 6`: Recommendation Engine Scoring & Dual English/Arabic explanations (`PASSED`)
- `Subtest 7`: RAG Q&A & Spoiler Shield Handling (`PASSED`)

---

## 🔑 API Keys, External Services, & Cost Profile

| Service | Necessity | Free Tier Limits / Costs | Role in System |
|---|---|---|---|
| **Google Gemini API** (`@google/genai`) | **Optional** | Generous free tier via Google AI Studio | Powers generative RAG synthesis with `gemini-3.8-flash`. When omitted, local grounded deterministic RAG executes at zero cost. |
| **AniList GraphQL API** | **Optional** (Public) | 90 requests/minute, no API key required | Live metadata ingestion and synchronization. |
| **Jikan API v4** (MyAnimeList) | **Optional** (Public) | 3 requests/second, no API key required | Unofficial MAL catalog synchronization. |
| **Kitsu API** | **Optional** (Public) | Free public JSON:API | Fallback metadata catalog. |
| **In-Memory Normalized Knowledge Store** | **Core (Zero Cost)** | Completely local & free | Ultra-fast sub-millisecond multi-attribute indexing and search. |

---

## ⚖️ Licensing, Anti-Hallucination Policy & Limitations

1. **Zero Hallucination Protocol**:
   - The engine never invents fake anime titles, episodes, character facts, availability, or URLs.
   - If streaming rights cannot be confirmed in a user's country, official search portal fallbacks are provided and marked with confidence: `unconfirmed`.

2. **Copyright & Media Ethics**:
   - No copyrighted video files or unauthorized full episodes are hosted, redistributed, or downloaded.
   - Scene discovery links exclusively to official, verified publisher channels on YouTube (Crunchyroll Collection, TOHO animation, MAPPA Channel, Kadokawa, Aniplex).
   - Posters and artwork are referenced with source attribution to their respective animation studios and production committees.

3. **Known Limitations**:
   - Live external sync depends on public third-party uptime (AniList/Jikan); the engine incorporates an embedded seed store so it remains fully functional offline.
   - Regional streaming licenses change frequently; verified entries include a `lastVerified` timestamp.
