# Activity Diagram - Proceed to Checkout

> **UML Type:** Activity Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/activity/commerce/activity_proceed_to_checkout.puml`

![Activity Diagram - Proceed to Checkout](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/commerce/activity_proceed_to_checkout.png)

---

## Overview

This activity diagram covers the checkout flow from initiating order validation to generating a payment gateway token and displaying the Midtrans payment popup.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Customer | Initiates checkout and pays |
| Frontend | Issues API request and renders Midtrans Snap iframe |
| Backend | Runs safety checks, aggregates prices, and creates orders |
| Database | Performs purchase validation and creates Order record |
| Midtrans API | Registers transaction and issues Snap tokens |

---

## Process Flow

1. **[Customer]** Clicks "Checkout" inside the Cart page.
2. **[Frontend]** Dispatches `POST /orders/checkout` with `{ items: [{ model_id, quantity }] }`.
3. **[Database]** Looks up the selected models.
4. **[Backend]** Validates all items are available and `APPROVED`.
5. **[Database]** Queries `Purchase` history to ensure none of these items are already owned by the user.
   - If a duplicate purchase is detected: returns 400 Bad Request. Flow ends.
6. **[Database]** Computes the sum of all model prices and inserts a new `Order` record:
   - `status = PENDING`
   - `type = ASSET`
   - `total_amount = sum(prices)`
7. **[Backend]** Initiates request to **[Midtrans API]** Snap endpoint with order metadata and gross amount.
8. **[Midtrans API]** Registers the transaction and issues a unique `{ snap_token, redirect_url }`.
9. **[Database]** Updates the `Order` record, writing the retrieved `snap_token` and `snap_redirect_url`.
10. **[Backend]** Returns 200 OK along with the token and order summaries.
11. **[Frontend]** Triggers the global window script `snap.pay(token)`.
12. **[Customer]** Sees the interactive payment modal overlay (Midtrans Snap widget).

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Items exist & APPROVED? | No | Return 404/400, stop |
| Already purchased? | Yes | Return 400 Bad Request, stop |

---

## Key Implementation Details

- **Duplicate Check:** To prevent users from buying items they already own, the checkout endpoint performs a strict verification against the `Purchase` table. If any item in the cart is already purchased, checkout is blocked.
- **Midtrans Snap Integration:** The transaction is registered with Midtrans *before* the customer pays. The resulting token is saved in the database, allowing the user to resume payment if the popup is closed.
- **Transactional Consistency:** If the Midtrans API call fails, the local `Order` record remains in `PENDING` state or can be rolled back.
