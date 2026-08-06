# Activity Diagram - Report Content/User

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_report_content.puml`

![Activity Diagram - Report Content/User](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_report_content.png)

---

## Overview

This activity diagram describes the flow for reporting abusive, inappropriate, or illegal content or users on the platform. The resulting report enters the admin's moderation queue for resolution.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Triggers the report action |
| Frontend | Renders the report modal and submits the report |
| Backend | Validates the report payload and checks for duplicates |
| Database | Creates and stores the pending report record |

---

## Process Flow

1. **[User]** Clicks the "Report" option on a model, post, comment, or user.
2. **[Frontend]** Opens the report modal.
3. **[User]** Selects a report category (SPAM, NSFW, ABUSIVE, ILLEGAL) and optionally writes a description.
4. **[User]** Confirms and submits the report.
5. **[Frontend]** Dispatches `POST /reports { target_type, target_id, reason, description }`.
6. **[Backend]** Validates `target_type` is one of `[MODEL, POST, COMMENT, USER]`.
7. **[Backend]** Validates `reason` is non-empty.
   - If invalid: returns 400 Bad Request.
8. **[Backend]** Checks for a duplicate report from the same user.
9. **[Database]** Looks up existing `Report` by `(reporter_id, target_id, target_type)`.
   - If duplicate exists: returns 409 Already reported.
10. **[Database]** Creates `Report` record `{ status: PENDING }`.
11. **[Backend]** Returns 201 Created.
12. **[Frontend]** Shows "Report submitted — our team will review it" toast.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Target type valid? | No | Return 400 Bad Request |
| Reason non-empty? | No | Return 400 Bad Request |
| Duplicate report? | Yes | Return 409 Already reported |

---

## Key Implementation Details

- **Admin Queue:** Submitted reports go into the admin moderation queue, where they are processed through the `activity_resolve_reports` flow.
- **Duplicate Prevention:** The unique constraint on `(reporter_id, target_id, target_type)` prevents the same user from spamming multiple reports on the same content item.
