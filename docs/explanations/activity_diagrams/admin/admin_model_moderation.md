# Activity Diagram - Admin Model Moderation

> **UML Type:** Activity Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/activity/admin/activity_admin_model_moderation.puml`

![Activity Diagram - Admin Model Moderation](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/admin/activity_admin_model_moderation.png)

---

## Overview

This activity diagram shows the model moderation process using a parallel fork to represent the two mutually exclusive admin decisions: approve or reject.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Admin | Navigates the review queue and makes decisions |
| Frontend | Renders the queue, prompts for reasons, sends requests |
| Backend | Updates model status and writes audit logs |
| Database | Persists changes |

---

## Process Flow

1. **[Admin]** Views the pending model queue on the admin dashboard.
2. **[Admin]** Selects a model to review (previews the 3D file in the viewer).
3. **[Frontend]** Displays action buttons: "Approve" and "Reject".

**Fork - Admin chooses one of:**

**Approve path:**

4A. **[Admin]** Clicks "Approve".
5A. **[Frontend]** Sends `PATCH /admin/models/:id/approve`.
6A. **[Backend]** Updates the model: `status = APPROVED`.
7A. **[Database]** Updates model record.
8A. **[Backend]** Returns 200 OK.

**Reject path:**

4B. **[Admin]** Clicks "Reject".
5B. **[Frontend]** Prompts the Admin to enter a rejection reason.
6B. **[Admin]** Validates: if reason empty, shows error and stops.
7B. **[Frontend]** Sends `PATCH /admin/models/:id/reject { reason }`.
8B. **[Backend]** Updates the model: `status = REJECTED`.
9B. **[Database]** Updates model record AND writes `Admin_Audit_Log (REJECT_MODEL)`.
10B. **[Backend]** Returns 200 OK.

**Rejoin:**

9. **[Frontend]** Model is removed from the pending queue.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| Admin chooses Approve? | Approve path | - |
| Admin chooses Reject? | Reject path | - |
| Rejection reason empty? | Show error, stop | Submit |

---

## Notes

- Approval does not write an audit log. Rejection does. This asymmetry is intentional.
- The "reason required" validation is enforced at the Frontend level (prompt) and should also be validated on the Backend before the database write.
