# Activity Diagram - Admin User Moderation

> **UML Type:** Activity Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/activity/admin/activity_admin_user_moderation.puml`

![Activity Diagram - Admin User Moderation](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/admin/activity_admin_user_moderation.png)

---

## Overview

This activity diagram shows the same approve/reject pattern applied to Artist and Provider account applications, with parallel fork notation for the two mutually exclusive admin decisions.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Admin | Reviews applications and makes decisions |
| Frontend | Renders the application queue and sends requests |
| Backend | Updates user status |
| Database | Persists changes and writes audit logs |

---

## Process Flow

1. **[Admin]** Views the pending user applications list.
2. **[Admin]** Reviews the applicant's portfolio or `provider_config`.
3. **[Frontend]** Displays "Approve" and "Reject" action buttons.

**Fork:**

**Approve path:**

4A. **[Admin]** Clicks "Approve".
5A. **[Frontend]** Sends `PATCH /admin/users/:id/approve`.
6A. **[Backend]** Sets `account_status = APPROVED`.
7A. **[Database]** Updates user record AND writes `Admin_Audit_Log (APPROVE_USER)`.
8A. **[Backend]** Returns 200 OK.

**Reject path:**

4B. **[Admin]** Clicks "Reject".
5B. **[Frontend]** Prompts for a rejection reason.
6B. **[Admin]** If reason is empty: shows error and stops.
7B. **[Frontend]** Sends `PATCH /admin/users/:id/reject { reason }`.
8B. **[Backend]** Sets `account_status = REJECTED`.
9B. **[Database]** Updates user record AND writes `Admin_Audit_Log (REJECT_USER)`.
10B. **[Backend]** Returns 200 OK.

**Rejoin:**

9. **[Frontend]** Applicant is removed from the pending queue.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| Admin chooses Approve? | Approve path | - |
| Admin chooses Reject? | Reject path | - |
| Rejection reason empty? | Show error, stop | Submit |

---

## Notes

- Unlike model moderation, both approval AND rejection write audit log entries for user moderation. This reflects the higher accountability required for decisions affecting user roles.
- The `status_history` JSON array on the `User` record is also updated at each approval/rejection, providing a full history of status changes.
