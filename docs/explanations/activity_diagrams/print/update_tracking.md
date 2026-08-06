# Activity Diagram - Update Tracking Info

> **UML Type:** Activity Diagram
> **Category:** Print
> **Source:** `docs/diagrams/activity/print/activity_update_tracking.puml`

![Activity Diagram - Update Tracking Info](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/print/activity_update_tracking.png)

---

## Overview

This activity diagram describes the flow for updating delivery tracking information on a print order. The `<<external>> Delivery service` actor in the UCD triggers this update via a webhook when shipment status changes.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| <<external>> Delivery service | Sends webhook on status change |
| Backend | Validates webhook signature and processes the update |
| Database | Updates the order and creates a notification |
| Frontend | Reflects updated status on the customer's order page |

---

## Process Flow

1. **[<<external>> Delivery service]** Detects shipment status change and sends a webhook.
2. **[Backend]** Receives `POST /webhooks/delivery { order_id, tracking_number, carrier, status, estimated_delivery }`.
3. **[Backend]** Validates the webhook signature.
   - If invalid: returns 403 Forbidden.
4. **[Database]** Looks up `Order` by `order_id`.
5. **[Backend]** If order not found: returns 404.
6. **[Database]** Updates `Order { tracking_number, carrier, delivery_status, estimated_delivery }`.
7. **[Backend]** Creates a `Notification` for the customer `{ type: DELIVERY_UPDATE }`.
8. **[Backend]** Returns 200 OK.
9. **[Frontend]** Customer views the updated delivery status on `/orders/:id`.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Webhook signature valid? | No | Return 403 Forbidden |
| Order found? | No | Return 404 Not Found |

---

## Key Implementation Details

- **External Actor:** The `<<external>> Delivery service` is the UCD actor for this use case — the update is initiated externally, not by the user or provider.
- **Webhook Signature:** To prevent spoofed delivery updates, the webhook payload must carry a valid HMAC signature that the backend verifies against a shared secret.
- **Notification Side Effect:** A push/in-app notification is generated for the customer whenever delivery status changes, keeping them informed without polling.
