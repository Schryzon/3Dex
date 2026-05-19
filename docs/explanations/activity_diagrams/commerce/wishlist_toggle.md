# Activity Diagram - Wishlist Toggle

> **UML Type:** Activity Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/activity/commerce/activity_wishlist_toggle.puml`

![Activity Diagram - Wishlist Toggle](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/commerce/activity_wishlist_toggle.png)

---

## Overview

This activity diagram describes the dual-path logic of wishlisting a model. It covers how a single heart click checks current status and branches to either create (add) or delete (remove) the wishlist record.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Clicks the heart icon |
| Frontend | Issues the toggle request and handles optimistic UI |
| Backend | Verifies session and routes toggle action |
| Database | Performs lookup, insert, or delete operations |

---

## Process Flow

1. **[User]** Clicks the "Wishlist" (heart) icon on a model.
2. **[Frontend]** Dispatches `POST /wishlist/toggle` with `{ model_id }`.
3. **[Backend]** Verifies the requesting user is authenticated.
   - If not authenticated: returns 401 Unauthorized. Flow ends.
4. **[Database]** Queries `Wishlist` table for a record matching the `(user_id, model_id)` unique pair.
5. **[Backend]** Evaluates the check:

**Decision Branch: Exist or Not?**

- **Path A: Record Exists (Remove from Wishlist)**
  1. **[Database]** Deletes the `Wishlist` record.
  2. **[Backend]** Returns 200 OK with `{ wishlisted: false }`.
  3. **[Frontend]** Changes heart icon to outline.

- **Path B: Record Does Not Exist (Add to Wishlist)**
  1. **[Database]** Inserts a new `Wishlist` record.
  2. **[Backend]** Returns 200 OK with `{ wishlisted: true }`.
  3. **[Frontend]** Changes heart icon to filled.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Authenticated? | No | Return 401, stop |
| Record exists? | Yes | Delete wishlist record, return wishlisted: false |
| Record exists? | No | Create wishlist record, return wishlisted: true |

---

## Key Implementation Details

- **Atomic Unique Constraint:** The database has a unique index on `(user_id, model_id)`. Even in highly concurrent environments, this prevents duplicate entries.
- **Toggle Endpoint Pattern:** Rather than exposing separate `POST` (add) and `DELETE` (remove) endpoints, the `/wishlist/toggle` endpoint simplifies frontend state management by returning the new status as a boolean, allowing the client to adjust its styling dynamically.
