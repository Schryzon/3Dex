# Sequence Diagram - Model Delete

> **UML Type:** Sequence Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/sequence/catalog/sequence_model_delete.puml`

![Sequence Diagram - Model Delete](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/catalog/sequence_model_delete.png)

---

## Overview

This diagram describes how a model is deleted, covering two distinct paths: an Artist deleting their own model, and an Admin force-deleting a model with a mandatory reason. Both paths write to the audit log.

---

## Participants

| Participant | Role |
|---|---|
| Artist / Admin | The actor initiating the deletion |
| Frontend | The client |
| ModelController | Express route handler for model deletion |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Delete Request

The Artist or Admin triggers the delete action. The Frontend sends `delete_model(model_id, reason?)`.

### 2. Model Lookup

ModelController queries the database for the model, including artist details.
- If not found: returns **404 Model not found**. Flow terminates.

### 3. Admin Path

If the caller has the `ADMIN` role:
1. ModelController validates that `reason` is present.
2. If reason is empty: returns **400 Admins must provide a reason**. Flow terminates.
3. Creates an `Admin_Audit_Log` record with:
   - `action = DELETE_MODEL`
   - `target_id = model_id`
   - `target_type = MODEL`
   - `reason = <entered reason>`
   - `metadata = { title, artist_id, artist_username, price, deleted_by: ADMIN }`

### 4. Artist (Owner) Path

If the caller is not an admin:
1. If `model.artist_id != user.id`: returns **403 Not authorized**. Flow terminates.
2. Creates an `Admin_Audit_Log` record with:
   - `action = DELETE_MODEL`
   - `reason = "Owner-initiated deletion"`
   - `metadata = { title, artist_id, deleted_by: OWNER }`

### 5. Deletion with Cascade

ModelController calls `model.delete({ id })`. The database enforces:
- **CASCADE deletes:** `Review`, `Wishlist`, `Cart_Item`, `Collection_Item`
- **SET NULL:** `Order_Item.model_id`, `Purchase.model_id`

This means Purchase records and Order Items are preserved (for financial record keeping) but their model reference is nullified.

### 6. Response

ModelController returns **200 Model deleted successfully**. The Frontend removes the model from the listing.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Model not found | 404 Not Found |
| Admin with no reason | 400 Bad Request |
| Not owner and not admin | 403 Forbidden |

---

## Key Implementation Details

- Owner-initiated deletions also write an audit log, treating the owner as the "admin" of their own content. This is notable because the `Admin_Audit_Log` table records these self-deletions with `admin_id = artist_id`.
- The SET NULL behavior on `Purchase.model_id` and `Order_Item.model_id` is critical: it ensures that a customer's purchase history remains intact even after the underlying model is removed, preserving financial records.
- CASCADE deletions on reviews mean ratings are lost when a model is deleted. This is expected.
