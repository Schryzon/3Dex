# Activity Diagram - Dexie Picks

> **UML Type:** Activity Diagram
> **Category:** Dexie
> **Source:** `docs/diagrams/activity/dexie/activity_dexie_picks.puml`

![Activity Diagram - Dexie Picks](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/dexie/activity_dexie_picks.png)

---

## Overview

This activity diagram describes the personalized product recommendation flow powered by Dexie AI. It details the process of collecting user interactions (likes, purchases, wishlist items), generating semantic search query embeddings, and querying PostgreSQL with cosine similarity to retrieve personalized recommendations.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Customer | Navigates to the home page or catalog feed |
| Frontend | Issues recommendations retrieval API call |
| Backend | Retrieves taste vectors and constructs queries |
| Embedding Service | Converts interaction keywords into a continuous space vector |
| Database | Executes high-performance cosine similarity queries |

---

## Process Flow

1. **[Customer]** Accesses the home screen or personalized dashboard.
2. **[Frontend]** Dispatches `GET /dexie/picks?limit=8` with user headers.
3. **[Backend]** Verifies the requesting user session.
   - If user is anonymous (guest): Backend queries for the newest 8 approved models as general fallbacks and skips personal embedding paths. Flow rejoins at step 8.
4. **[Database]** Queries for the user's recent interactions:
   - Fetches the last 5 wishlisted items (including tags and categories).
   - Fetches the last 5 purchased items (including tags and categories).
5. **[Backend]** Checks if any interaction history exists.
   - **No history found:** Queries for the newest 8 approved models as fallbacks. Flow rejoins at step 8.
   - **History exists:** Combines all tags and categories from the historical items into a single, clean text string.
6. **[Embedding Service]** Converts the compiled interaction keywords into a 384-dimensional dense vector using the `all-MiniLM-L6-v2` transformer model.
7. **[Database]** Executes a raw SQL parameter-safe query comparing the query vector against the pre-computed `model.embedding` column using PostgreSQL's cosine distance operator (`<=>`).
8. **[Database]** Retrieves the top 8 models with the smallest cosine distance (highest semantic similarity) that have `status == APPROVED` and do not belong to the user themselves.
9. **[Backend]** Returns 200 OK along with the recommendations payload.
10. **[Frontend]** Renders the curated products in the "Dexie's Picks" carousel.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Logged in? | No | Load newest 8 models as general fallbacks |
| Taste data exists? | No | Load newest 8 models as fallbacks |
| Taste data exists? | Yes | Generate embedding, execute raw pgvector cosine similarity |

---

## Key Implementation Details

- **Raw SQL Cosine Similarity:** Because standard Prisma queries do not support PostgreSQL `<=>` vector distance operators, the database interaction uses the `prisma.$queryRaw` helper to execute the comparison securely.
- **Cold Start Recovery:** By checking for empty interaction arrays and automatically reverting to a chronological fallback queue, the recommendation system is safe against cold-start bottlenecks.
