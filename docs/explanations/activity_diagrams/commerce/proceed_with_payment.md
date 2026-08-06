# Activity Diagram - Proceed with Payment

> **UML Type:** Activity Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/activity/commerce/activity_proceed_with_payment.puml`

![Activity Diagram - Proceed with Payment](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/commerce/activity_proceed_with_payment.png)

---

## Overview

This activity diagram describes the system's asynchronous response to the Midtrans payment notification webhook. It details how the transaction status is read, how payments are upserted for idempotency, and how the user's purchased assets are unlocked.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Midtrans API | Dispatches POST notification webhook |
| Backend | Parses notifications, routes logic, and verifies signatures |
| Database | Updates Orders, creates Purchases, and logs transactions |
| Notification Service | Sends alerts to the user's notification list |

---

## Process Flow

1. **[Midtrans API]** Sends `POST /orders/notification` with transaction details.
2. **[Backend]** Verifies the webhook signature using the shared merchant server key.
   - If signature is invalid: returns 401 Unauthorized. Flow ends.
3. **[Database]** Looks up the target `Order` by the provided `order_id`.
   - If order not found: Backend returns 404. Flow ends.
4. **[Database]** Upserts a `Payment` record using the `transaction_id` as the key. This ensures the webhook handling is idempotent.
5. **[Backend]** Evaluates the transaction status parameter.

**Conditional Path Branching:**

- **Path A: Settlement or Capture (Success)**
  - Conditions: `transaction_status == settlement` OR (`transaction_status == capture` and `fraud_status != deny`).
  1. **[Database]** Updates `Order.status = PAID`.
  2. **[Database]** Creates a `Purchase` record for each `Order_Item` in the order, unlocking the model for download.
  3. **[Notification Service]** Dispatches a notification to the customer.

- **Path B: Deny, Cancel, or Expire (Failure)**
  - Conditions: `transaction_status` is in `[deny, cancel, expire]`.
  1. **[Database]** Updates `Order.status = CANCELLED`.
  2. **[Notification Service]** Dispatches a notification to the customer indicating failure.

- **Path C: Pending**
  - Conditions: `transaction_status == pending`.
  1. **[Database]** Leaves `Order.status = PENDING`.

**Rejoin:**

6. **[Backend]** Returns 200 OK to Midtrans.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Signature Valid? | No | Return 401 Unauthorized, stop |
| Status Settlement/Capture? | Yes | Order = PAID, Create Purchases, notify user |
| Status Deny/Cancel/Expire? | Yes | Order = CANCELLED, notify user |
| Status Pending? | Yes | Keep Order = PENDING |

---

## Key Implementation Details

- **Idempotency via Upsert:** Since Midtrans may retry webhooks if network glitches occur, the `Payment` upsert avoids duplicate payment processing. If a payment record with the same transaction ID already exists, its details are updated but duplicate `Purchase` records are not created.
- **Secure Webhook Verification:** The system computes a SHA-512 hash using `order_id`, `status_code`, `gross_amount`, and the server key, comparing it to the webhook's `signature_key` to prevent fraud.
