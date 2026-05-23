# Activity Diagram - Submit Role Application

> **UML Type:** Activity Diagram
> **Category:** Catalog (Profile Management)
> **Source:** `docs/diagrams/activity/catalog/activity_submit_role_app.puml`

![Activity Diagram - Submit Role Application](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_submit_role_app.png)

---

## Overview

This activity diagram describes the process of submitting a role upgrade application (to become an Artist or Provider). In the UCD, this is an `<<extend>>` of the "Manage user profile" use case.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Fills and submits the role application form |
| Frontend | Submits the application |
| Backend | Validates inputs and checks for duplicates |
| Database | Stores the pending application |

---

## Process Flow

1. **[User]** Opens the "Become an Artist/Provider" page.
2. **[User]** Fills in the application form: reason, portfolio URL, requested role.
3. **[Frontend]** Dispatches `POST /role-applications { requested_role, reason, portfolio_url }`.
4. **[Backend]** Validates `requested_role` is `ARTIST` or `PROVIDER`.
   - If invalid: returns 400.
5. **[Backend]** Checks for an existing pending application.
6. **[Database]** Looks up `Role_Application` by `user_id` and `status = PENDING`.
7. **[Backend]** If a pending application exists: returns 409 Conflict.
8. **[Database]** Creates `Role_Application { user_id, requested_role, reason, portfolio_url, status: PENDING }`.
9. **[Backend]** Returns 201 Created.
10. **[Frontend]** Shows "Application submitted — pending admin review" confirmation.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Requested role valid? | No | Return 400 Bad Request |
| Pending application exists? | Yes | Return 409 Conflict |

---

## Key Implementation Details

- **Admin Review:** The submitted application enters the admin moderation queue, where it appears alongside the `activity_admin_user_moderation` flow for approval or rejection.
- **UCD Relationship:** This is a profile extension (`<<extend>>`) — applying for a role is optional and triggered from within the Manage user profile flow.
