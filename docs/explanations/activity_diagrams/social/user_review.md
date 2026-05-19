# Activity Diagram - User Review

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_user_review.puml`

![Activity Diagram - User Review](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_user_review.png)

---

## Overview

This activity diagram describes the peer-to-peer user review process (rating/reviewing an Artist or Provider directly). It details eligibility verification checks (requiring a prior completed transaction) and automatic profile rating aggregation updates.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Customer | Accesses profile and submits reviews |
| Frontend | Checks eligibility status and renders forms |
| Backend | Processes transaction validation and compiles ratings |
| Database | Queries purchases, print orders, and aggregates scores |

---

## Process Flow

### Phase 1: Eligibility Check

1. **[Customer]** Navigates to an artist or provider's profile page.
2. **[Frontend]** Dispatches `GET /users/:id/reviews/eligibility` with credentials.
3. **[Database]** Queries `User_Review` to check if the caller has already reviewed this user.
   - **If review already exists:** Backend returns `{ eligible: false, reason: "ALREADY_REVIEWED" }`. Frontend hides form. Flow ends.
4. **[Database]** Queries transaction tables:
   - For an **Artist**: Checks for a `Purchase` record of any model belonging to this artist.
   - For a **Provider**: Checks for a paid `Order` of type `PRINT_JOB` assigned to this provider.
5. **[Backend]** Evaluates transaction presence.
   - If no transaction exists: returns `{ eligible: false, reason: "NO_TRANSACTION" }`. Frontend displays block notice. Flow ends.
   - If a transaction exists: returns `{ eligible: true }`. Frontend renders review form.

---

### Phase 2: Review Submission

6. **[Customer]** Fills out rating (1-5) and comment, and clicks submit.
7. **[Frontend]** Dispatches `POST /users/:id/reviews` containing `{ rating, comment }`.
8. **[Backend]** Verifies the rating is an integer between 1 and 5.
9. **[Backend]** Verifies `reviewer_id != target_user_id` (preventing self-reviews).
   - If invalid: returns 400. Flow ends.
10. **[Database]** Inserts the `User_Review` record.
11. **[Database]** Runs aggregation query: recalculates total review counts and average rating for the target user.
12. **[Database]** Updates the target `User` record with the new `rating` and `review_count` scores.
13. **[Backend]** Returns 200 OK along with the new review record.
14. **[Frontend]** Appends the review to the public profile reviews list.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Already reviewed? | Yes | Return eligible: false, stop |
| Completed transaction? | No | Return eligible: false, stop |
| Self-review? | Yes | Return 400 Bad Request, stop |

---

## Key Implementation Details

- **Peer-to-Peer vs. Product Reviews:** Peer-to-peer ratings are stored in the `User_Review` table and aggregate onto the target's `User` record, whereas model reviews are stored in the `Review` table and aggregate onto the `Model` record.
- **Transaction Gate:** To prevent rating manipulation, reviews are restricted. Users must buy a 3D model from an artist or complete a physical print job with a provider before they are eligible to rate them.
