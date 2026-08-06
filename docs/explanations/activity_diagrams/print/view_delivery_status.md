# Activity Diagram - View Delivery Status

> **UML Type:** Activity Diagram
> **Category:** Print
> **Source:** `docs/diagrams/activity/print/activity_view_delivery_status.puml`

![Activity Diagram - View Delivery Status](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/print/activity_view_delivery_status.png)

---

## Overview

This activity diagram describes the flow for viewing the delivery status of a print order, including tracking information and proof photos provided by the provider. It also covers the customer's ability to confirm delivery, which triggers the provider's payout.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Navigates to order and confirms delivery |
| Frontend | Fetches and renders order details and status |
| Backend | Validates access and triggers payout on confirmation |
| Database | Stores order updates and status changes |

---

## Process Flow

1. **[User]** Navigates to `/orders/:id` or `/orders`.
2. **[Frontend]** Dispatches `GET /orders/:id`.
3. **[Database]** Fetches `Order` with `Order_Items` and provider details.
4. **[Backend]** Validates existence and authorization.
   - If not found: returns 404.
   - If not owner/provider/admin: returns 403.
5. **[Backend]** Returns order details.
6. **[Frontend]** Renders:
   - Order summary (items, quantities, totals)
   - Current delivery status badge
   - Tracking number and carrier (if shipped)
   - Estimated delivery date
   - Proof photos uploaded by provider
7. **[User]** If delivery has been received:
   - Clicks "Confirm Delivery".
   - **[Frontend]** Dispatches `PATCH /orders/:id { action: CONFIRM_DELIVERY }`.
   - **[Database]** Updates `Order { status: COMPLETED }`.
   - **[Backend]** Triggers payout to provider.
   - **[Backend]** Returns 200 OK.
   - **[Frontend]** Shows "Order completed" status.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Order found? | No | Return 404 |
| Authorized? | No | Return 403 Forbidden |
| Delivery received? | Yes | Customer confirms, order completes, payout triggers |

---

## Key Implementation Details

- **Payout Trigger:** The customer's "Confirm Delivery" action is the final gate before the provider receives their earnings. This protects against premature payouts on undelivered orders.
- **Access Control:** The order detail page is accessible to the customer, the assigned provider, and admins — no other users can view it.
