# Sequence Diagram - Cart Management

> **UML Type:** Sequence Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/sequence/commerce/sequence_cart_management.puml`

![Sequence Diagram - Cart Management](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/commerce/sequence_cart_management.png)

---

## Overview

This diagram covers the full cart management lifecycle: adding an item, viewing the cart, removing an individual item, and clearing the entire cart.

---

## Participants

| Participant | Role |
|---|---|
| User | The authenticated user managing their cart |
| Frontend | The client |
| CartController | Express route handler for cart operations |
| StorageClient (S3) | MinIO for presigning preview images |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Add to Cart

The user clicks "Add to Cart" on a model. The Frontend calls `add_to_cart(model_id, session_cookie)`.

CartController:
1. Looks up the model by ID. If not found: returns **404 Model not found**.
2. Checks `model.price`. If `price == 0`: returns **400 Free models cannot be added to cart** with a suggestion to download directly.
3. Calls `cart_Item.upsert` with `where: user_id_model_id`. If the item already exists, it stays at quantity 1. Otherwise a new record is created.
4. Presigns the model's `preview_url` via MinIO.
5. Returns **201 Cart_Item**. The Frontend updates the cart count badge.

### Part 2 - View Cart

The user opens the cart page. The Frontend calls `get_cart(session_cookie)`.

CartController:
1. Normalizes all existing cart items by calling `cart_Item.updateMany({ user_id, quantity != 1 }, { quantity: 1 })` to enforce that all digital items have quantity 1.
2. Fetches all cart items for the user including model, artist, and category.
3. Presigns all preview URLs in batch.
4. Returns the signed cart items. The Frontend renders the cart with a total price.

### Part 3 - Remove Item

The user clicks "Remove" on one cart item. The Frontend calls `remove_from_cart(cart_item_id, session_cookie)`.

CartController:
1. Looks up the item by `{ id, user_id }` to verify ownership.
2. If not found or not the owner: returns **404 Cart item not found**.
3. Deletes the item.
4. Returns confirmation. The Frontend updates the total.

### Part 4 - Clear Cart

The user clicks "Clear Cart". The Frontend calls `clear_cart(session_cookie)`.

CartController calls `cart_Item.deleteMany({ user_id })`. The Frontend renders an empty cart.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Model not found | 404 Not Found |
| Free model | 400 Bad Request |
| Item not found or not owned | 404 Not Found |

---

## Key Implementation Details

- The quantity enforcement step in `get_cart` ensures that even if a race condition or old data left a quantity > 1, the system normalizes it. Digital goods are always quantity 1.
- The `upsert` pattern for adding items means clicking "Add to Cart" on an already-carted model is idempotent.
- Cart items are not deleted when a user completes checkout. The frontend must explicitly clear the cart after a successful payment confirmation.
