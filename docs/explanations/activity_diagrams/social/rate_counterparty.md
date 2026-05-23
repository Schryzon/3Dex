# Activity Diagram - Rate Counterparty

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_rate_counterparty.puml`

![Activity Diagram - Rate Counterparty](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_rate_counterparty.png)

---

## Overview

This activity diagram describes the peer-to-peer rating flow for rating an Artist or Provider. It enforces eligibility checks (transaction-gating and duplicate prevention) before allowing a review submission. This corresponds to the "Rate counterparty" use case in the UCD, which includes (`<<include>>`) "View user profile".

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Visits profile and submits star rating |
| Frontend | Checks eligibility and renders form |
| Backend | Validates eligibility, rating, and self-review prevention |
| Database | Checks transactions, creates review, aggregates rating |

---

## Process Flow

### Phase 1: Eligibility Check

1. **[User]** Visits an Artist or Provider profile page.
2. **[Frontend]** Dispatches `GET /users/:id/reviews/eligibility`.
3. **[Backend]** Checks if reviewer is the target.
   - If self-review: returns `eligible: false (SELF)`.
4. **[Database]** Checks `User_Review` for an existing review from this user to this target.
   - If already reviewed: returns `eligible: false (ALREADY_REVIEWED)`. Frontend hides form.
5. **[Database]** Checks for a completed transaction:
   - For an Artist: looks for a `Purchase` record from this artist.
   - For a Provider: looks for a completed `PRINT_JOB` order from this provider.
6. **[Backend]** Evaluates transaction:
   - Transaction exists: returns `eligible: true`. Frontend shows form.
   - No transaction: returns `eligible: false (NO_TRANSACTION)`. Frontend shows "Complete a transaction first" notice.

---

### Phase 2: Review Submission

7. **[User]** Selects star rating (1–5) and writes comment. Clicks "Submit Review".
8. **[Frontend]** Dispatches `POST /users/:id/reviews { rating, comment }`.
9. **[Backend]** Validates `rating` is integer 1–5.
   - If invalid: returns 400.
10. **[Database]** Creates `User_Review` record.
11. **[Database]** Recalculates avg rating and review count for target user.
12. **[Database]** Updates `User` record `{ rating, review_count }`.
13. **[Backend]** Returns 200 OK.
14. **[Frontend]** Review appears on the target's public profile.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Self-review? | Yes | Return eligible: false (SELF) |
| Already reviewed? | Yes | Return eligible: false (ALREADY_REVIEWED), hide form |
| Completed transaction? | No | Return eligible: false (NO_TRANSACTION), show notice |
| Rating valid (1–5)? | No | Return 400 Bad Request |

---

## Key Implementation Details

- **Transaction Gate:** Prevents review manipulation. You must have completed a real transaction with the user before rating them.
- **Peer-to-Peer vs. Model Reviews:** This flow stores in `User_Review` and aggregates onto `User.rating`. It is distinct from model reviews (`Review` table → `Model.avg_rating`).
