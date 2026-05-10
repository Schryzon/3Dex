# Dēxie AI Ecosystem 🫧

Dēxie (デクシー) is the project's resident AI spirit — a non-intrusive assistant designed to provide quirky, context-aware insights to users without the overhead of a standard chatbot. She acts as a silent observer that only speaks when she has something situationally relevant to say.

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
- **Engine:** `gemini-3.1-flash-lite-preview` via `@google/genai` SDK. Chosen for its extremely high speed and low latency, which is critical for synchronous page-load AI generation.
- **Safety Settings:** Configured for strict professional standards. `HARM_CATEGORY_SEXUALLY_EXPLICIT` is set to `BLOCK_ONLY_HIGH` (to allow for anatomical 3D model metadata discussion without false positives), while Harassment, Hate Speech, and Dangerous Content are strictly blocked at `BLOCK_LOW_AND_ABOVE`.
- **Context Awareness & Prompt Engineering:**
    - **System Instructions**: The Gemini model is initialized with a strict system instruction dictating her tone, length limits, and formatting rules.
    - **Catalog Detail**: Fetches the actual model name, creator, and category from PostgreSQL to generate specialized comments. (e.g., "Woah! This Cyberpunk Sword by [Artist] is overflowing with dark energy!")
    - **Cart**: Analyzes the user's specific items and total price to provide personalized nudges.
    - **Global Cache**: Uses a 6-hour shared cache (via Redis or in-memory map) for common page contexts (Guest browsing, Home) to ensure consistency and minimize API costs.
- **Service:** `dexie.service.ts` handles the AI prompt engineering and caching logic.

### 2. Frontend (The Presence)
- **Context Provider:** `DexieContext.tsx` tracks route changes using Next.js `usePathname` and `useSearchParams`, and fetches situational taglines on navigation.
- **Deduplication State:** Features a session-level "Seen Message" registry using `sessionStorage`. Dēxie will never repeat the exact same line twice in a single session to maintain the illusion of consciousness.
- **Orb Interaction Mode (`DexieAssistant.tsx`):**
    - **Bubble State:** Initial arrival shows a full message bubble with typewriter animation.
    - **Orb State:** Automatically collapses into a small, pulsing Orb after 8 seconds to avoid blocking critical mobile UI (like "Buy Now" buttons). Hovering or tapping the Orb expands it back.
    - **Dismissal:** Users can banish her entirely for the session via a discrete `×` button on both the bubble and the Orb.

---

## 🧠 Personalised Picks (Vector Search)

Dēxie isn't just about taglines; she also powers the recommendation engine.

- **Trigger:** On the homepage or browse pages, a call to `GET /dexie/picks` is made.
- **Data Aggregation:** The backend fetches the user's last 5 wishlist items and last 5 purchased models.
- **Embedding Generation:** The titles, tags, and categories of these items are concatenated into a string and embedded using the lightweight `all-MiniLM-L6-v2` model (producing a 384-dimensional vector).
- **Cosine Similarity:** The system runs a high-performance Cosine Similarity search against the `Model` table's `embedding` column using `pgvector`.
- **Result:** Dēxie returns the top N similar models the user does not already own, presented as "Dēxie's Top Picks". For unauthenticated guests, she falls back to the newest approved models.

---

## ⚙️ Configuration

### For Developers
To enable Dēxie locally, add your Gemini API key to `apps/backend/.env`:
```env
GEMINI_API_KEY="AIzaSy..."
```
If the API key is missing or invalid, the backend gracefully falls back to pre-written static strings so the UI doesn't break.

### For Users
Users can toggle Dēxie on/off from their profile settings. This preference is persisted in the `User` table via the `dexie_enabled` boolean field. When disabled, the frontend completely unmounts the `DexieAssistant` component to save bandwidth and compute.

---

## 🤫 Silent Zones
Dēxie is programmed to stay completely silent (no API calls made) in the following areas:
- `/catalog` (Main browse list - to avoid distracting from the grid)
- `/auth/*` (Login/Register - focus is key here)
- `/checkout` (Payment gateway - no distractions during transaction)
- Admin Dashboards
