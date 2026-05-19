# Sequence Diagram - Model Review

> **UML Type:** Sequence Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/sequence/catalog/sequence_model_review.puml`

![Sequence Diagram - Model Review](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/catalog/sequence_model_review.png)

---

## Overview

This diagram covers the flow for a customer submitting a star rating and comment review for a 3D model. A prior purchase is required, and the review automatically updates the model's aggregate rating.

---

## Participants

| Participant | Role |
|---|---|
| Customer | The authenticated user writing the review |
| Frontend | The client |
| ReviewController | Express route handler for model reviews |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Review Form

The Customer clicks "Write a Review" on a model they own. The Frontend shows a form with a 1-5 star selector and an optional comment field.

### 2. Submission

The Customer submits `{ rating: 4, comment: "Great model!" }`. The Frontend calls `create_review(model_id, rating, comment, session_cookie)`.

### 3. Rating Validation

ReviewController validates that `rating` is between 1 and 5 (inclusive).
- If invalid: returns **400 Bad Request**. Flow terminates.

### 4. Purchase Verification

ReviewController queries `purchase.findUnique({ user_id_model_id: { user_id, model_id } })`.
- If no purchase record: returns **403 You must buy the model first**. Flow terminates.

### 5. Review Creation

ReviewController calls `review.create({ user_id, model_id, rating, comment })`.

If a review already exists for this user-model pair (Prisma error P2002):
- Returns **409 You already reviewed this model**. Flow terminates.

### 6. Rating Recalculation

ReviewController calls `review.aggregate({ model_id })` to compute `_avg.rating` and `_count.rating`. It then calls `model.update({ avg_rating, review_count })` to update the denormalized fields.

### 7. Response

ReviewController returns **201 Created**. The review appears on the model detail page.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Rating outside 1-5 range | 400 Bad Request |
| No purchase record | 403 Forbidden |
| Duplicate review | 409 Conflict |

---

## Key Implementation Details

- The purchase gate prevents review spam from users who have not engaged with the model.
- The unique constraint `(user_id, model_id)` on the `Review` table enforces one review per user per model at the database level.
- After each review, the `avg_rating` and `review_count` on the `Model` record are updated immediately (in the same request). These are denormalized fields kept in sync to avoid expensive aggregation queries on every model list fetch.
