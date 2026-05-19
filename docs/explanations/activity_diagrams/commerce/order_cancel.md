# Activity Diagram - Order Cancel

> **UML Type:** Activity Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/activity/commerce/activity_order_cancel.puml`

![Activity Diagram - Order Cancel](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/commerce/activity_order_cancel.png)

---

## Overview

This activity diagram describes the order cancellation flow. It covers how a user manually cancels a pending order (or how it expires), and how the system communicates this state change to the Midtrans payment gateway to void the transaction.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Customer or Cron System | Initiates cancellation or triggers expiry |
| Frontend | Sends cancellation request |
| Backend | Runs checks, updates order, and calls Midtrans |
| Database | Updates Order status in PostgreSQL |
| Midtrans API | Voids or cancels transaction on the gateway side |

---

## Process Flow

1. **[Customer or Cron System]** Clicks "Cancel Order" on the order details page, or the background cron system finds an order that has exceeded its payment window.
2. **[Frontend]** Dispatches `POST /orders/:id/cancel`.
3. **[Database]** Looks up the target `Order` by ID.
4. **[Backend]** Checks if the order exists.
   - If not found: returns 404. Flow ends.
5. **[Backend]** Verifies the order status is currently `PENDING`.
   - If status is already `PAID` or `CANCELLED`: returns 400 Bad Request. Flow ends.
6. **[Backend]** Calls the **[Midtrans API]** `/cancel` endpoint for this transaction to cancel the payment token.
7. **[Database]** Updates the order: `status = CANCELLED`.
8. **[Backend]** Returns 200 OK.
9. **[Frontend]** Updates order view to show "Cancelled".

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Order exists? | No | Return 404, stop |
| Status is PENDING? | No | Return 400 Bad Request, stop |
| Midtrans cancel call? | - | Informs gateway to close Snap token |

---

## Key Implementation Details

- **Gateway Sync:** Simply marking an order as `CANCELLED` in our local database is not enough. We must explicitly call Midtrans to cancel/void the transaction so the user cannot use the previous Snap token or redirect URL to pay.
- **Auto-Expiry:** In addition to manual cancellations, a background worker runs periodically to transition orders that are still pending after 24 hours to `CANCELLED` status, triggering the same Midtrans cancellation endpoint.
