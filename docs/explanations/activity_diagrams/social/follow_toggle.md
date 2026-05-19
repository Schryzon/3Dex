# Activity Diagram - Follow Toggle

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_follow_toggle.puml`

![Activity Diagram - Follow Toggle](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_follow_toggle.png)

---

## Overview

This activity diagram describes the dual-path follow/unfollow toggle flow. It details how the backend handles session validation, checks follow states in the database, and dispatches in-app notifications only on fresh follow events.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Clicks the follow/unfollow toggle button |
| Frontend | Sends the toggle request and handles UI states |
| Backend | Runs credentials checks and triggers notifications |
| Database | Performs lookups, inserts, and deletions |
| Notification Service | Sends alerts to the target user |

---

## Process Flow

1. **[User]** Clicks the "Follow" or "Unfollow" button on a profile page.
2. **[Frontend]** Dispatches `POST /social/follow/toggle` with `{ target_user_id }`.
3. **[Backend]** Verifies the requesting user is authenticated.
   - If not authenticated: returns 401 Unauthorized. Flow ends.
4. **[Backend]** Verifies `user_id != target_user_id` (users cannot follow themselves).
   - If attempting self-follow: returns 400 Bad Request. Flow ends.
5. **[Database]** Queries `Follow` table for a record matching the unique pair `(follower_id, following_id)`.
6. **[Backend]** Evaluates the check:

**Decision Branch: Follow Record Exists?**

- **Path A: Record Exists (Unfollow)**
  1. **[Database]** Deletes the `Follow` record.
  2. **[Backend]** Returns 200 OK with `{ following: false }`.
  3. **[Frontend]** Reverts button text to "Follow".

- **Path B: Record Does Not Exist (Follow)**
  1. **[Database]** Inserts a new `Follow` record.
  2. **[Notification Service]** Dispatches a notification to the target user:
     - `type = FOLLOW`
     - `message = "@follower_username started following you!"`
  3. **[Backend]** Returns 200 OK with `{ following: true }`.
  4. **[Frontend]** Updates button text to "Following".

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Authenticated? | No | Return 401, stop |
| Self-follow? | Yes | Return 400 Bad Request, stop |
| Record exists? | Yes | Delete follow record, return following: false |
| Record exists? | No | Create follow record, notify target, return following: true |

---

## Key Implementation Details

- **Database-Level Integrity:** The unique composite index on `(follower_id, following_id)` ensures that a follower can never create multiple records for the same target artist in the database.
- **Asymmetric Notification Rules:** While a new follow event triggers an instant notification for the artist, an unfollow event silently deletes the record without sending any alerts, protecting user privacy.
