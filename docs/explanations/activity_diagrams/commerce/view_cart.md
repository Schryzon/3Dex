# Activity Diagram - View Cart

> **UML Type:** Activity Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/activity/commerce/activity_view_cart.puml`

![Activity Diagram - View Cart](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/commerce/activity_view_cart.png)

---

## Overview

This activity diagram describes the process of viewing, managing, and interacting with a user's shopping cart. It covers fetching cart contents, adjusting quantities, removing items, and adding new models.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Navigates to cart and performs item management |
| Frontend | Fetches cart data and dispatches item mutations |
| Backend | Computes totals and returns cart data |
| Database | Stores and retrieves cart item records |
| MinIO | Generates presigned preview URLs for cart items |

---

## Process Flow

1. **[User]** Navigates to `/cart`.
2. **[Frontend]** Dispatches `GET /cart`.
3. **[Database]** Fetches `Cart_Item` records for the user, joined with model details.
4. **[MinIO]** Presigns `preview_urls` for all cart items.
5. **[Backend]** Computes subtotal and returns 200 OK `{ items[], subtotal }`.
6. **[Frontend]** Renders cart items list, subtotal, and "Proceed to Checkout" button.
7. **[User]** Interacts with the cart in parallel branches:
   - **Adjust quantity:** `PATCH /cart/:item_id { quantity }` → Database updates → Frontend re-renders totals.
   - **Remove item:** `DELETE /cart/:item_id` → Database deletes → Frontend removes card.
   - **Add new model (from catalog):** `POST /cart { model_id }` → Database upserts → Frontend updates badge count.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| *(none — all cart mutations are validated by type)* | — | — |

---

## Key Implementation Details

- **Upsert on Add:** Adding a model already in the cart upserts the `Cart_Item` quantity rather than creating a duplicate entry, preventing double-counting.
- **Real-time Totals:** Subtotal is recomputed client-side on quantity changes for instant feedback, with the server as source of truth on final checkout.
