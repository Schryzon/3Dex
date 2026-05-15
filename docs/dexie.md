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
- **Engine:** Google Gemini Flash via `@google/genai` SDK. Chosen for its extremely high speed and low latency.
- **Safety Settings:** Configured for strict professional standards. `HARM_CATEGORY_SEXUALLY_EXPLICIT` is set to `BLOCK_ONLY_HIGH`.
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

---

## 🧠 Semantic Capabilities (Vector Search)

Dēxie powers the platform's advanced discovery features using `pgvector` and the `all-MiniLM-L6-v2` embedding model.

### 1. Dēxie AI Search (Natural Language)
Users can toggle the **Sparkles (✨)** icon in the Topbar to enter "AI Mode".
- **Natural Language Queries**: Instead of keyword matching, users can search with context: *"find me something like that kid from kingdom hearts"* or *"cool weapons for a cyberpunk game"*.
- **Mechanism**: The query is embedded into a 384-dimensional vector and compared against model embeddings using cosine distance (`<=>`) in PostgreSQL.
- **Combined Filters**: AI search seamlessly integrates with standard filters (Price, Category, Format, NSFW) within a single raw SQL execution.

### 2. Personalized Picks (Recommendations)
- **Trigger**: On the homepage or browse pages, Dēxie suggests items based on user history.
- **Data Aggregation**: The backend fetches the user's last 5 wishlist items and purchases.
- **Result**: Cosine Similarity identifies models the user does not already own, presented as "Dēxie's Top Picks". For guests, she falls back to trending/newest models.

### 3. NSFW Preference Alignment
Dēxie respects the user's "Show NSFW" preference stored in their account settings. This preference is embedded in the session JWT, allowing the AI Search and Catalog to automatically filter mature content based on user choice without manual toggles.

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
- `/auth/*` (Login/Register - focus is key here)
- `/checkout` (Payment gateway - no distractions during transaction)
- Admin Dashboards

*Note: While Dēxie was previously silent in the `/catalog`, she now maintains a presence there via the **AI Search (Sparkles)** mode.*
