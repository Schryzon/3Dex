# Dēxie AI Ecosystem 🫧

Dēxie (デクシー) is the project's resident AI spirit — a non-intrusive assistant designed to provide quirky, context-aware insights to users without the overhead of a standard chatbot.

---

## 🎭 Persona: Emu × Ako
Dēxie's personality is a carefully balanced fusion of two high-energy characters:
- **Emu Otori (Project Sekai):** Explosively cheerful, optimistic, and uses "Haai~" as a signature.
- **Udagawa Ako (BanG Dream!):** Chuunibyou energy, slightly dramatic flair, and refers to herself in the third person.

**Core Directives:**
- She is **not** a chatbot. She does not accept user input.
- She provides punchy, 1-2 sentence taglines based on what the user is currently viewing.
- She stays out of the way on mobile via the **Orb interaction model**.

---

## 🛠️ Technical Architecture

### 1. Backend (The Brain)
- **Engine:** `gemini-3.1-flash-lite-preview`. Chosen for its high speed and low latency.
- **Safety Settings:** Configured for strict professional standards — `SEXUALLY_EXPLICIT` is set to `BLOCK_ONLY_HIGH` (to allow for model metadata discussion), while Harassment, Hate Speech, and Dangerous Content are strictly blocked at `BLOCK_LOW_AND_ABOVE`.
- **Context Awareness:**
    - **Catalog Detail:** Fetches the actual model name, creator, and category from PostgreSQL to generate specialized comments.
    - **Cart:** Analyzes the user's specific items to provide personalized nudges.
    - **Global Cache:** Uses a 6-hour shared cache for common page contexts (Guest browsing, Home) to ensure consistency and minimize API costs.
- **Service:** `dexie.service.ts` handles the AI prompt engineering and caching logic.

### 2. Frontend (The Presence)
- **Context Provider:** `DexieContext.tsx` tracks route changes and fetches situational taglines.
- **Deduplication:** Features a session-level "Seen Message" registry. Dēxie will never repeat the same line twice in a single session.
- **Orb Interaction Mode (`DexieAssistant.tsx`):**
    - **Bubble State:** Initial arrival shows a full message bubble.
    - **Orb State:** Automatically collapses into a small, pulsing Orb after 8 seconds to avoid blocking critical mobile UI (like "Buy Now" buttons).
    - **Dismissal:** Users can banning her entirely for the session via a discrete `×` button on both the bubble and the Orb.

---

## ⚙️ Configuration

### For Developers
To enable Dēxie locally, add your Gemini API key to `apps/backend/.env`:
```env
GEMINI_API_KEY="AIzaSy..."
```

### For Users
Users can toggle Dēxie on/off from their profile settings. This preference is persisted in the `User` table via the `dexie_enabled` field.

---

## 🤫 Silent Zones
Dēxie is programmed to stay completely silent in the following areas:
- `/catalog` (Main browse list)
- `/auth/*` (Login/Register)
- Admin Dashboards
