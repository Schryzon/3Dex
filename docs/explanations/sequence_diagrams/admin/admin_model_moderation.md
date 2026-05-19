# Sequence Diagram - Admin Model Moderation

> **UML Type:** Sequence Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/sequence/admin/sequence_admin_model_moderation.puml`

![Sequence Diagram - Admin Model Moderation](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/admin/sequence_admin_model_moderation.png)

---

## Overview

This diagram describes how an Admin reviews, approves, or rejects 3D models submitted by Artists. Models start in the `PENDING` state and must be approved before appearing in the public catalog.

---

## Participants

| Participant | Role |
|---|---|
| Admin | The authenticated admin user |
| Frontend | The admin panel client |
| AdminController | Express route handler for admin model actions |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Load Pending Queue

The Admin navigates to the model moderation page. The Frontend calls `get_pending_models()`. AdminController queries the database for all models with `status = PENDING`. The Frontend displays them in a review queue.

### 2. Approve a Model

The Admin clicks "Approve" on a model in the queue.

The Frontend calls `approve_model(model_id)`. AdminController:
1. Calls `model.update({ id, status: APPROVED })`

> Note: The approval action does not create an audit log entry in this diagram. Only rejections create audit log records, as approvals are less likely to be disputed.

The Frontend receives the updated model object and removes it from the pending queue.

### 3. Reject a Model

The Admin clicks "Reject" on a different model.

The Frontend prompts the Admin to enter a rejection reason.

The Admin enters text and confirms. The Frontend calls `reject_model(model_id, reason)`.

AdminController:
1. Validates that `reason` is not empty.
2. Calls `model.update({ id, status: REJECTED })`, including the artist in the fetched result.
3. Creates an `Admin_Audit_Log` record with:
   - `admin_id`: the acting admin's user ID
   - `action`: `REJECT_MODEL`
   - `target_id`: the model's ID
   - `reason`: the entered reason text
   - `metadata`: `{ title, artist, price }`

The Frontend receives confirmation and removes the model from the queue.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Rejection reason is empty | 400 Bad Request (validated by controller) |

---

## Key Implementation Details

- Only rejections write audit log entries. This is because rejections are the actionable decision that needs accountability, while approvals are the expected default outcome.
- After rejection, the model remains in the database with `status = REJECTED`. The artist can see this state in their dashboard. The admin can choose to re-approve a rejected model at any time.
- The `metadata` field in the audit log preserves a snapshot of the model's details at the time of action, ensuring the log is meaningful even if the model is later deleted.
