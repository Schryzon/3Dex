# Sequence Diagram - Checkout

> **UML Type:** Sequence Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/sequence/commerce/sequence_checkout.puml`

![Sequence Diagram - Checkout](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/commerce/sequence_checkout.png)

---

## Overview

This diagram describes the digital asset checkout flow. It covers order creation, duplicate purchase prevention, Midtrans Snap API integration, and the final payment popup presentation.

---

## Participants

| Participant | Role |
|---|---|
| Customer | The authenticated user checking out |
| Frontend | The client |
| OrderController | Express route handler for checkout |
| OrderService | Business logic for order creation |
| MidtransClient | Midtrans Snap payment gateway API client |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Checkout Trigger

The Customer clicks "Checkout" from the cart. The Frontend reads the cart items (list of model_ids) and sends `checkout({ items: [{ model_id, quantity }] }, session_cookie)` to OrderController.

### 2. Model Validation

OrderService queries `model.findMany({ id IN model_ids })` to validate all models exist and are APPROVED.

### 3. Duplicate Purchase Check

For each model in the order, OrderService checks `purchase.findUnique({ user_id, model_id })`.

If any model has already been purchased by this user:
- OrderService throws an error: "Already purchased: [model title]".
- OrderController returns **400**. The Frontend shows the error. Flow terminates.

### 4. Order Creation

OrderService creates the order:
```
order.create({
  user_id,
  type: ASSET,
  status: PENDING,
  items: [ { model_id, price } for each model ]
})
```

The database returns the order with its computed `total_amount`.

### 5. Midtrans Snap Token

OrderService calls the Midtrans client to create a transaction:
```
{
  transaction_details: { order_id, gross_amount },
  item_details: [...],
  customer_details: {...}
}
```

Midtrans returns `{ token, redirect_url }`.

OrderService updates the order with `{ snap_token, snap_redirect_url }`.

### 6. Payment Popup

OrderController returns **200 { snap_token, snap_redirect_url, total }**. The Frontend calls `window.snap.pay(snap_token)`, which opens the Midtrans payment popup in the browser.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Empty items array | 400 Bad Request |
| Model already purchased | 400 Already purchased |
| Midtrans gateway error | 500 (implied rollback) |

---

## Key Implementation Details

- The `type: ASSET` distinguishes this from a `PRINT_JOB` order.
- The Midtrans Snap token is stored on the `Order` so the frontend can re-open the payment popup if the user closes it before completing payment.
- After the popup completes (success or failure), Midtrans sends a webhook to `/orders/notification`. The actual Purchase creation happens in the webhook handler, not here.
- The cart is NOT automatically cleared here. The frontend must handle clearing the cart after receiving confirmation of payment success from Midtrans.
