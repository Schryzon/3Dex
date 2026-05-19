# Activity Diagram - Dexie Tagline

> **UML Type:** Activity Diagram
> **Category:** Dexie
> **Source:** `docs/diagrams/activity/dexie/activity_dexie_tagline.puml`

![Activity Diagram - Dexie Tagline](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/dexie/activity_dexie_tagline.png)

---

## Overview

This activity diagram describes the process of generating contextual AI taglines (assistant speech bubbles) when a user navigates the platform. It maps the integration of user settings checks, multi-tier caching (Redis/Memory), Gemini Flash API fallback flows, and frontend display deduplication.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Navigates the application |
| Frontend | Tracks path changes, sends requests, and filters repetitive dialogue |
| Backend | Verifies feature flags, routes cache lookups, and manages fallback states |
| Cache Service | Resolves per-user and global AI tagline keys |
| Gemini API | Generates personalized text dynamically |

---

## Process Flow

1. **[User]** Navigates to a platform path (e.g., `/catalog/:id`).
2. **[Frontend]** Identifies path change and constructs a context coordinate: `{ ctx: "catalog", tag: model_id }`.
3. **[Frontend]** Dispatches request: `GET /dexie/tagline?ctx=catalog&tag=model_id`.
4. **[Backend]** Queries `user.dexie_enabled`.
   - If disabled: returns `{ enabled: false, message: null }`. Flow ends.
5. **[Cache Service]** Looks up the per-user contextual tagline cache key (1-hour TTL).

**Cache Evaluation:**

- **Path A: Cache Hit**
  1. Cache Service returns the saved tagline directly. Rejoins at step 9.

- **Path B: Cache Miss**
  1. Backend checks the global contextual cache key (6-hour TTL).
  2. If global cache hits: Returns global tagline. Rejoins at step 9.
  3. If global cache misses: Backend initiates request to **[Gemini API]** with custom context prompts.

**Gemini API Call and Fallback Evaluation:**

- **If Gemini returns 200 OK:**
  - Saves the resulting string to the per-user cache (1-hour TTL) and global cache (6-hour TTL). Rejoins at step 9.
- **If Gemini returns 503 (Rate Limit or Error):**
  - Backend runs exponential backoff retries (up to 2 times).
  - If retries fail: Resolves a random, statically stored fallback tagline from the local library. Rejoins at step 9.

**Rejoin and Frontend Handshake:**

6. **[Backend]** Returns 200 OK with the finalized tagline.
7. **[Frontend]** Receives the tagline and compares it against `seenMessages` in local state.
   - If already seen in the current session: Hides bubble. Flow ends.
   - If completely new: Adds message to `seenMessages`, sets local state, and plays the tagline animation overlay.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Dexie enabled? | No | Return enabled: false, stop |
| User Cache Hit? | Yes | Return cached tagline, stop |
| Global Cache Hit? | Yes | Return cached tagline, stop |
| Gemini API status? | Fail after retries | Return random fallback tagline |
| Message already seen? | Yes | Hide bubble, stop |

---

## Key Implementation Details

- **Two-Tier Cache Strategy:** A per-user cache protects the system from repeated calls when the same user navigates back and forth. A global cache protects the system by sharing generic page tagline prompts (like home page welcoming lines) across different users.
- **Session Deduplication:** The frontend keeps a tracking state (`seenMessages`) which is initialized as an empty Set when the user mounts the app. This prevents the AI assistant from showing the same pop-up repeatedly, which would lead to poor user experience.
