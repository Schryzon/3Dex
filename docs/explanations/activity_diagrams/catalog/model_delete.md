# Activity Diagram - Model Delete

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_model_delete.puml`

![Activity Diagram - Model Delete](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_model_delete.png)

---

## Overview

This activity diagram describes the procedural flow and access gates when a model is deleted from the platform. It tracks two distinct execution paths: an Owner (Artist) deletion request and an Admin deletion request, detailing authorization checks and database cascading behavior.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Artist or Admin | Initiates the deletion flow and inputs justifications |
| Frontend | Captures action and payload, sends request |
| Backend | Executes business rules, validates roles and ownership |
| Database | Performs lookup, updates logs, and executes cascading deletions |

---

## Process Flow

1. **[Artist or Admin]** Triggers the "Delete Model" action in the UI. If the actor is an Admin, they must also provide a deletion reason.
2. **[Frontend]** Dispatches `DELETE /models/:id { reason }`.
3. **[Database]** Looks up the target model by ID.
4. **[Backend]** Checks if the model exists.
   - If not found: returns 404. Flow ends.
5. **[Backend]** Checks if the user is an Admin.

**Decision Branch: User is Admin vs. User is Artist (Owner)**

- **Path A: User is Admin**
  1. Backend checks if the reason is present and not empty.
     - If reason is empty: returns 400. Flow ends.
  2. Database writes an `Admin_Audit_Log` entry for `DELETE_MODEL` initiated by Admin.

- **Path B: User is Artist**
  1. Backend verifies `model.artist_id == user_id`.
     - If not equal (unauthorized): returns 403. Flow ends.
  2. Database writes an `Admin_Audit_Log` entry for `DELETE_MODEL` initiated by Owner.

**Rejoin and Final Execution:**

6. **[Database]** Deletes the model record from the database.
7. **[Database]** Triggers database-level cascade actions:
   - **CASCADE (Deleted):** `Review`, `Wishlist`, `Cart_Items`, `Collection_Item` records referencing the model.
   - **SET NULL:** `Order_Items` and `Purchases` fields pointing to the model are cleared (nullified) to preserve financial history.
8. **[Backend]** Returns 200 OK.
9. **[Frontend]** Removes the model from the current UI context.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Model exists? | No | Return 404, stop |
| Caller role? | Admin | Check reason; if empty, return 400. Write Admin Audit Log |
| Caller role? | Artist | Check ownership; if unauthorized, return 403. Write Owner Audit Log |
| Constraint Check | Cascade | Delete dependent lists; nullify purchases |

---

## Key Implementation Details

- **Cascade Rules:** The prisma schema designates `onDelete: Cascade` for temporary user lists (Cart, Wishlist) and rating systems (Reviews). However, for completed transactions and operational records (`Purchases`, `Order_Items`), it uses `onDelete: SetNull` so transaction lists remain structurally intact.
- **Audit Logs:** The database logs owner deletions too, providing a comprehensive log of all content removals.
