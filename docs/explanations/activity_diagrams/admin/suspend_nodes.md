# Activity Diagram - Suspend Malicious Nodes

> **UML Type:** Activity Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/activity/admin/activity_suspend_nodes.puml`

![Activity Diagram - Suspend Malicious Nodes](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/admin/activity_suspend_nodes.png)

---

## Overview

This activity diagram describes the process by which an Admin suspends a malicious user account (spam bot, scammer, or repeat policy abuser). This corresponds to the "Suspend malicious nodes" use case in the UCD.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Admin | Reviews flagged user and initiates suspension |
| Frontend | Submits the suspension request |
| Backend | Validates inputs and executes suspension |
| Database | Updates user status, writes audit log, and invalidates sessions |

---

## Process Flow

1. **[Admin]** Views a flagged user or content report and identifies malicious behavior.
2. **[Admin]** Decides the account is a malicious node (spam bot, scammer, repeat abuser).
3. **[Frontend]** Dispatches `POST /admin/users/:id/suspend { reason, duration_days }`.
4. **[Backend]** Validates the user is not already `SUSPENDED`.
   - If already suspended: returns 409 Conflict.
5. **[Backend]** Validates the `reason` field is provided.
   - If empty: returns 400 Bad Request.
6. **[Database]** Updates `User { account_status: SUSPENDED, suspended_until }`.
7. **[Database]** Writes `Admin_Audit_Log { action: SUSPEND_USER, target_user_id, reason }`.
8. **[Database]** Invalidates all active sessions for the target user.
9. **[Backend]** Returns 200 OK.
10. **[Frontend]** User marked as SUSPENDED in the admin panel.
11. Suspended user receives "access denied" on next request.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Already suspended? | Yes | Return 409 Conflict |
| Reason provided? | No | Return 400 Bad Request |

---

## Key Implementation Details

- **Session Invalidation:** All active JWT sessions for the suspended user are invalidated immediately, blocking instant re-access without requiring a new login.
- **Audit Trail:** Every suspension is recorded in `Admin_Audit_Log` with the responsible admin's ID, the target user, and the reason — ensuring accountability and traceability.
- **Terminology:** "Malicious nodes" in the UCD refers to accounts actively violating platform trust — bots, fraudsters, or serial abusers.
