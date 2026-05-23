# Activity Diagram - Submit Review

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_submit_review.puml`

![Activity Diagram - Submit Review](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_submit_review.png)

---

## Overview

This activity diagram describes the validation sequence and denormalization updates when a customer submits a review (rating and optional text comment) for a 3D model.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Customer | Submits the review details |
| Frontend | Form validation and UI updates |
| Backend | Runs business logic, verifies purchase, and triggers updates |
| Database | Persists review, checks constraints, and recalculates averages |

---

## Process Flow

1. **[Customer]** Fills out the review form (rating between 1-5 and comment text) and clicks submit.
2. **[Frontend]** Dispatches `POST /models/:id/reviews` with the request body.
3. **[Backend]** Validates that `rating` is an integer between 1 and 5.
   - If invalid: returns 400 Bad Request. Flow ends.
4. **[Database]** Looks up the `Purchase` record for the user and model.
5. **[Backend]** Checks if the model was purchased.
   - If not purchased: returns 403 Forbidden. Flow ends.
6. **[Database]** Attempts to insert a new `Review` record.
7. **[Database]** Checks for duplicate constraint violations (Prisma unique constraint P2002 on `(user_id, model_id)`).
   - If a review already exists: Backend returns 409 Conflict. Flow ends.
8. **[Database]** Executes aggregation query: computes new count and average rating for the model.
9. **[Database]** Updates the `Model` record with the updated `avg_rating` and `review_count`.
10. **[Backend]** Returns 201 Created.
11. **[Frontend]** Appends the review to the model detail page review list.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Rating is valid (1-5)? | No | Return 400, stop |
| Purchased by user? | No | Return 403, stop |
| Already reviewed? | Yes (P2002) | Return 409, stop |

---

## Key Implementation Details

- **Denormalization Strategy:** To avoid executing heavy database aggregations (`AVG` and `COUNT`) on every catalog listing query, the system keeps denormalized `avg_rating` and `review_count` fields directly on the `Model` record. These are updated atomically whenever a new review is successfully persisted.
- **Purchase Restriction:** Verified purchase validation is mandatory. Users cannot review models they do not own.
