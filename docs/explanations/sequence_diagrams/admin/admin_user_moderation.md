# Sequence Diagram - Admin User Moderation

> **UML Type:** Sequence Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/sequence/admin/sequence_admin_user_moderation.puml`

![Sequence Diagram - Admin User Moderation](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/admin/sequence_admin_user_moderation.png)

---

## Overview

This diagram describes how an Admin reviews, approves, or rejects pending Artist and Provider applications. Customers are auto-approved at registration; only role-upgrade applications from Artists and Providers require manual review.

---

## Participants

| Participant | Role |
|---|---|
| Admin | The authenticated admin user |
| Frontend | The admin panel client |
| AdminController | Express route handler for admin user actions |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Load Pending Applications

The Admin opens the user moderation view. The Frontend calls `get_pending_users(status: PENDING, roles: ARTIST, PROVIDER)`.

AdminController queries the database for users with `account_status = PENDING` and `role IN [ARTIST, PROVIDER]`. The Frontend displays the applicants alongside their portfolio or provider_config data.

### 2. Approve an Application

The Admin clicks "Approve" on an Artist applicant.

The Frontend calls `approve_user(user_id)`. AdminController:

1. Calls `user.update` setting:
   - `account_status = APPROVED`
   - `approved_at = now()`
   - `status_history: push({ status: APPROVED, admin_id })`
2. Creates an `Admin_Audit_Log` record with:
   - `action = APPROVE_USER`
   - `target_id = user_id`
   - `reason = "Application approved by admin"`
   - `metadata = { username, role, email }`

The Frontend receives confirmation and removes the user from the queue.

### 3. Reject an Application

The Admin clicks "Reject" on a Provider applicant.

The Frontend prompts the Admin for a rejection reason. After the Admin enters and confirms the reason, the Frontend calls `reject_user(user_id, reason)`.

AdminController:

1. Validates that `reason` is not empty.
2. Calls `user.update` setting:
   - `account_status = REJECTED`
   - `rejected_at = now()`
   - `status_history: push({ status: REJECTED, reason, admin_id })`
3. Creates an `Admin_Audit_Log` record with:
   - `action = REJECT_USER`
   - `target_id = user_id`
   - `reason = <entered reason>`
   - `metadata = { username, role, email }`

The Frontend receives confirmation and updates the queue.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Rejection reason is empty | 400 Bad Request |

---

## Key Implementation Details

- Both approval and rejection write audit log entries for user moderation. This differs from model moderation, where only rejections are logged.
- The `status_history` field is a `Json[]` array on the `User` table. Each approval or rejection appends a new entry, preserving the full history of status changes with timestamps and the acting admin's ID.
- After rejection, the applicant's `account_status` is set to `REJECTED`. They can see this in their profile settings. Whether they can re-apply is an application-level policy decision not enforced at the database level.
- Approved Artists and Providers gain access to role-specific features immediately after the database update. There is no additional activation step.
