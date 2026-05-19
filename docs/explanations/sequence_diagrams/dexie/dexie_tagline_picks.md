# Sequence Diagram - Dexie Tagline and Picks

> **UML Type:** Sequence Diagram
> **Category:** Dexie
> **Source:** `docs/diagrams/sequence/dexie/sequence_dexie_tagline_picks.puml`

![Sequence Diagram - Dexie Tagline and Picks](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/dexie/sequence_dexie_tagline_picks.png)

---

## Overview

This is the most complex diagram in the Dexie AI feature. It covers two combined flows: generating a contextual AI tagline as the user navigates to a model detail page, and serving personalized model picks when the user returns to the home page.

---

## Participants

| Participant | Role |
|---|---|
| User | The authenticated user |
| Frontend (DexieContext) | The React context managing Dexie state |
| DexieController | Express route handler for Dexie endpoints |
| DexieService | Business logic for tagline and picks generation |
| EmbeddingService | Semantic embedding generator |
| GeminiClient | Google Gemini Flash API client |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Tagline Generation (Catalog Route)

**Trigger:** User navigates to `/catalog/:model_id`.

1. The Frontend's DexieContext evaluates the path and constructs a context key: `{ ctx: "catalog", tag: model_id }`.
2. The Frontend calls `get_tagline(ctx: catalog, tag: model_id, session?)`.

DexieController checks if Dexie is enabled for the user via `user.dexie_enabled`.
- If disabled: returns `{ enabled: false, message: null }`. Dexie stays hidden.

DexieService checks the **per-user cache** (1-hour TTL) for the user's cached tagline.
- **Cache hit:** Returns the cached message immediately.
- **Cache miss:** Calls the Gemini Flash API with a prompt at temperature 0.9.

If Gemini returns a 503 (rate limit):
- DexieService performs an exponential backoff retry (max 2 retries).
- If still failing: returns a random `FALLBACK_MESSAGE`.

On success:
- Sets the **per-user cache** (1-hour TTL).
- Sets the **global cache** for the same context (6-hour TTL).

DexieController returns `{ enabled: true, message }`.

The Frontend deduplicates the message against a session-scoped `seenMessages` Set:
- If seen: stays quiet (shows nothing).
- If new: displays the Dexie message bubble.

---

### Part 2 - Personalized Picks (Home Page)

**Trigger:** User navigates to `/` after seeing a new Dexie message.

The Frontend calls `get_picks(limit: 8)`. DexieController calls `get_dexie_picks(user_id, { limit: 8 })`.

DexieService fetches user taste signals:
- Recent 5 wishlist items (with model tags and category)
- Recent 5 purchase items (with model tags and category)

**If no taste data (new user):**
- Fetches the newest 8 APPROVED models as fallback picks.

**If taste data exists:**
1. Combines the tags and categories of wishlisted and purchased models into a single text string.
2. Calls EmbeddingService to embed the text using `all-MiniLM-L6-v2`, producing a 384-dimension query vector.
3. EmbeddingService runs a raw SQL cosine similarity query against the `embedding` column in the `Model` table.
4. The database returns models sorted by cosine similarity to the user's taste vector.

DexieController returns `{ enabled: true, picks }`. The Frontend renders the "Dexie's Picks" carousel section.

---

## Key Implementation Details

- The dual-cache strategy (per-user 1hr, global 6hr) balances personalization with API cost. Frequent users get fresh content; infrequent users see globally cached responses.
- The `seenMessages` Set in the Frontend prevents the same AI message from being shown more than once per session, avoiding repetitive UI.
- The cosine similarity query is a raw SQL call because Prisma does not natively support `pgvector` operations. The EmbeddingService executes a parameterized `SELECT` with `<->` or `<=>` operators.
- Wishlist and purchase data are used as implicit "taste" signals, avoiding the need for explicit preference collection.
