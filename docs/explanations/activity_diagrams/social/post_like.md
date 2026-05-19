# Activity Diagram - Post Like

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_post_like.puml`

![Activity Diagram - Post Like](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_post_like.png)

---

## Overview

This activity diagram describes the process of toggling a like on a community post. It details the session validation, checks for existing likes, and updates the denormalized like counters.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Clicks the post heart icon |
| Frontend | Dispatches the toggle API call |
| Backend | Validates requests and adjusts counter caches |
| Database | Inserts or deletes like records and updates like counts |

---

## Process Flow

1. **[User]** Clicks the "Like" (heart) button on a feed card.
2. **[Frontend]** Dispatches `POST /posts/:id/like` with user credentials.
3. **[Backend]** Verifies the user is authenticated.
   - If not: returns 401 Unauthorized. Flow ends.
4. **[Database]** Queries `Post_Like` for a record matching `(user_id, post_id)`.
5. **[Backend]** Branching based on existence check:

**Decision Branch: Like Record Exists?**

- **Path A: Record Exists (Unlike Post)**
  1. **[Database]** Deletes the `Post_Like` record.
  2. **[Database]** Atomically decrements the `like_count` field on the target `Post` record.
  3. **[Backend]** Returns 200 OK with `{ liked: false }`.
  4. **[Frontend]** Reverts heart style to outline.

- **Path B: Record Does Not Exist (Like Post)**
  1. **[Database]** Inserts a new `Post_Like` record.
  2. **[Database]** Atomically increments the `like_count` field on the target `Post` record.
  3. **[Backend]** Returns 200 OK with `{ liked: true }`.
  4. **[Frontend]** Styles heart to filled red.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Authenticated? | No | Return 401, stop |
| Like record exists? | Yes | Delete like record, decrement post like count, return liked: false |
| Like record exists? | No | Create like record, increment post like count, return liked: true |

---

## Key Implementation Details

- **Atomic Increments:** To prevent race conditions from concurrent clicks, the backend utilizes Prisma's atomic increment/decrement updates (e.g., `like_count: { increment: 1 }` or `decrement: 1`), avoiding out-of-sync counters in the database.
- **Idempotent Unique Constraints:** The unique composite key on `(user_id, post_id)` inside the `Post_Like` table guarantees that a user cannot register multiple likes on a single post.
