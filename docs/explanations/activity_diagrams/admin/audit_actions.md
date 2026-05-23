# Activity Diagram - Audit Admin Actions

> **UML Type:** Activity Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/activity/admin/activity_audit_actions.puml`

![Activity Diagram - Audit Admin Actions](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/admin/activity_audit_actions.png)

---

## Overview

This activity diagram describes the flow for viewing the admin audit log — a record of all moderation and administrative actions taken on the platform. This corresponds to the "Audit admin actions" use case in the UCD.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Admin | Navigates to and filters the audit log |
| Frontend | Fetches and renders audit entries |
| Backend | Validates admin role and returns paginated results |
| Database | Queries audit log with optional filters |

---

## Process Flow

1. **[Admin]** Navigates to `/admin/audit-log`.
2. **[Frontend]** Dispatches `GET /admin/audit-log { page, filters }`.
   - Filters: `action_type`, `admin_id`, `target_type`, `date_range`.
3. **[Backend]** Verifies the requestor is an `ADMIN`.
   - If not admin: returns 403 Forbidden.
4. **[Database]** Queries `Admin_Audit_Log` with filters. Includes admin username and target details. Orders by `created_at DESC`.
5. **[Backend]** Returns paginated audit entries.
6. **[Frontend]** Renders audit log table showing: timestamp, admin, action, target, reason.
7. **[Admin]** Reviews a specific entry and clicks it for detail view.
8. **[Frontend]** Dispatches `GET /admin/audit-log/:id`.
9. **[Database]** Fetches full audit entry with metadata.
10. **[Backend]** Returns 200 OK with full entry.
11. **[Frontend]** Shows the audit detail panel.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Requestor is ADMIN? | No | Return 403 Forbidden |

---

## Key Implementation Details

- **Immutable Log:** Audit log entries are append-only. No admin (including super-admins) can delete or modify audit entries — this ensures an unalterable record of platform governance.
- **Accountability:** Each entry records the specific admin who took the action, the target, the action type, and the timestamp, providing full traceability for every moderation decision.
