# Activity Diagram - Cart Add

> **UML Type:** Activity Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/activity/commerce/activity_cart_add.puml`

![Activity Diagram - Cart Add](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/commerce/activity_cart_add.png)

---

## Overview

This activity diagram describes the process of adding an item to the shopping cart, detailing the validations for item status, price constraints, and deduplication of existing digital items.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Customer | Requests addition to cart |
| Frontend | Issues add-to-cart API call |
| Backend | Runs business rules and model validations |
| Database | Performs lookups and upsert operations |

---

## Process Flow

1. **[Customer]** Clicks "Add to Cart" on a model details page.
2. **[Frontend]** Dispatches `POST /cart` with `{ model_id }` and authentication headers.
3. **[Database]** Looks up the model by its unique ID.
4. **[Backend]** Checks if the model exists and is approved (`status == APPROVED`).
   - If not: returns 404/400. Flow ends.
5. **[Backend]** Checks model price. If `price == 0`:
   - Returns 400 Bad Request ("Free models cannot be added to cart; download directly"). Flow ends.
6. **[Database]** Checks if a `Cart_Item` already exists for this `(user_id, model_id)` combination.
7. **[Database]** Executes database upsert:
   - **If exists:** Leaves quantity at `1` (digital products do not allow multiple quantities).
   - **If not exists:** Creates a new `Cart_Item` record with quantity `1`.
8. **[Backend]** Returns 201 Created or 200 OK with the cart item.
9. **[Frontend]** Increments the cart item counter in the global navigation bar.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Model exists & APPROVED? | No | Return 404 or 400, stop |
| Model price > 0? | No | Return 400 Bad Request, stop |
| Already in cart? | Yes | Perform idempotent upsert (quantity remains 1) |

---

## Key Implementation Details

- **Price Guard:** Free assets (`price == 0`) bypass the cart mechanism. They are meant to be downloaded directly. The cart system enforces this on the server side.
- **Deduplication:** Unlike physical goods, digital assets cannot be bought multiple times in the same order. Thus, `quantity` is constrained strictly to `1`.
- **Database Unique Constraint:** An upsert or unique constraint on `(user_id, model_id)` inside the `Cart_Item` table ensures structural integrity even if concurrent clicks dispatch multiple requests.
