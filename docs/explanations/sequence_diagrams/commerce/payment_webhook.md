# Sequence Diagram - Payment Webhook

> **UML Type:** Sequence Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/sequence/commerce/sequence_payment_webhook.puml`

![Sequence Diagram - Payment Webhook](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/commerce/sequence_payment_webhook.png)

---

## Overview

This diagram shows what happens when Midtrans delivers a payment notification webhook to the system. This is the critical step where a PENDING order becomes PAID and the user's purchased models are unlocked.

---

## Participants

| Participant | Role |
|---|---|
| MidtransClient | The Midtrans payment gateway delivering the notification |
| OrderController | Express route handler for `/orders/notification` |
| OrderService | Business logic for payment processing |
| Database | PostgreSQL via Prisma |
| NotificationService | In-app notification creator |

---

## Flow

### 1. Webhook Delivery

Midtrans sends a POST to `/orders/notification` with payload:
```
{
  order_id, transaction_status, fraud_status,
  payment_type, transaction_id, gross_amount
}
```

### 2. Order Lookup

OrderService queries `order.findUnique({ id: order_id })` including its items.
- If not found: returns **404**. Midtrans may retry. Flow terminates.

### 3. Payment Record Upsert

OrderService upserts a `Payment` record using `transaction_id` as the unique key:
```
payment.upsert({
  transaction_id, payment_type, gross_amount,
  transaction_status, fraud_status, raw_response
})
```

This ensures idempotency: if Midtrans delivers the same webhook twice, the payment record is updated, not duplicated.

### 4. Status Branching

**Path A - Payment Success:**

If `transaction_status = "settlement"` OR (`transaction_status = "capture"` AND `fraud_status != "deny"`):

1. `order.update({ status: PAID })`
2. For each `Order_Item`: `purchase.upsert({ user_id, model_id, price_paid, license })`
3. `NotificationService.notify_user(user_id, "Your purchase is complete!")`

**Path B - Payment Failed or Cancelled:**

If `transaction_status IN ["deny", "cancel", "expire"]`:

1. `order.update({ status: CANCELLED })`
2. `NotificationService.notify_user(user_id, "Payment failed or cancelled.")`

**Path C - Payment Pending:**

If `transaction_status = "pending"`:
1. `order.update({ status: PENDING })` (no change in most cases)

### 5. Response

OrderService returns `{ message: "ok" }`. OrderController responds **200 OK** to Midtrans.

---

## Key Implementation Details

- The webhook endpoint must return 200 promptly. Midtrans interprets timeouts or non-200 responses as failures and retries.
- The `Purchase.upsert` pattern handles retried webhooks gracefully: if a purchase already exists for `(user_id, model_id)`, no duplicate is created.
- The `raw_response` JSON field on `Payment` stores the full Midtrans webhook payload for debugging and audit purposes.
- Notification creation is done inline in the webhook handler. If this fails, the order status has already been updated, so the notification is best-effort.
