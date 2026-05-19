# Sequence Diagram - User Review

> **UML Type:** Sequence Diagram
> **Category:** Social
> **Source:** `docs/diagrams/sequence/social/sequence_user_review.puml`

![Sequence Diagram - User Review](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/social/sequence_user_review.png)

---

## Overview

This diagram describes how a customer reviews an Artist or Provider as a person (not a model). It covers eligibility checking, submission, and automatic recalculation of the target user's aggregate rating.

---

## Participants

| Participant | Role |
|---|---|
| Customer | The authenticated user submitting the review |
| Frontend | The client |
| ReviewController | Express route handler for user reviews |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Eligibility Check

The Customer opens an artist or provider's profile. The Frontend calls `check_review_eligibility(target_user_id, session_cookie)`.

ReviewController:

1. Checks `user_Review.findUnique({ reviewer_id_target_user_id })`.
   - If already reviewed: returns `{ eligible: false, reason: ALREADY_REVIEWED }`. Frontend hides the review button.

2. Checks for a prior purchase from the artist:
   `purchase.findFirst({ user_id, model.artist_id: target_user_id })`

3. Checks for a completed print job from the provider:
   `order.findFirst({ user_id, provider_id: target_user_id, status: PAID, type: PRINT_JOB })`

   - If neither exists: returns `{ eligible: false, reason: NO_TRANSACTION }`. Frontend shows "Buy from this creator first."

4. If at least one transaction exists: returns `{ eligible: true }`. Frontend shows the review form.

### Part 2 - Review Submission

The Customer submits `{ target_user_id, rating, comment }`. The Frontend calls `add_user_review(target_user_id, rating, comment)`.

ReviewController:
1. Validates that `reviewer_id != target_user_id` (no self-reviews).
2. Validates `rating` is between 1 and 5.
3. Re-checks transaction existence (double-check for security).
4. Calls `user_Review.create({ reviewer_id, target_user_id, rating, comment })`.
5. Calls `user_Review.aggregate({ target_user_id })` to compute `_avg.rating` and `_count.rating`.
6. Calls `user.update({ id: target_user_id, rating: avg, review_count: count })` to update the target's public rating.

Returns **200 User_Review**. The profile rating is updated immediately.

---

## Error Paths

| Condition | Response |
|---|---|
| Already reviewed | `{ eligible: false, reason: ALREADY_REVIEWED }` |
| No transaction with the target | `{ eligible: false, reason: NO_TRANSACTION }` |
| Self-review attempt | Blocked by validation |
| Duplicate review at DB level | 409 Conflict |

---

## Key Implementation Details

- The eligibility check is separate from the submission endpoint. This allows the UI to proactively hide or show the review form without the user attempting a submission.
- `User_Review` is distinct from `Review` (model review). This table tracks peer-to-peer user ratings, not model quality.
- The `rating` and `review_count` fields on `User` are updated after each new review, keeping the aggregate current without requiring expensive full-table aggregations on every profile view.
- The unique constraint on `(reviewer_id, target_user_id)` ensures one review per pair at the database level.
