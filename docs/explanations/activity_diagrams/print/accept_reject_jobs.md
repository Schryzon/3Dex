# Activity Diagram - Accept/Reject Incoming Jobs

> **UML Type:** Activity Diagram
> **Category:** Print
> **Source:** `docs/diagrams/activity/print/activity_accept_reject_jobs.puml`

![Activity Diagram - Accept/Reject Incoming Jobs](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/print/activity_accept_reject_jobs.png)

---

## Overview

This activity diagram details the operational flow of print order fulfillment from the provider's side. It covers three major phases: acceptance, shipment tracking registration, and final completion.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Provider | Decides actions, processes raw prints, ships physical package |
| Frontend | Collects shipping inputs, displays status updates, sends API requests |
| Backend | Verifies job ownership and routes status transitions |
| Database | Updates order and item print statuses |

---

## Process Flow

1. **[Provider]** Opens the print job management dashboard.
2. **[Frontend]** Dispatches request for the provider's active list (`GET /print/jobs`).
3. **[Database]** Queries orders: `findMany({ provider_id, type: PRINT_JOB })`.
4. **[Backend]** Returns job cards list.

**Fulfillment Execution Phases (Sequential Transitions):**

### Phase 1: Accept Job

1. **[Provider]** Reviews specifications and clicks "Accept Job".
2. **[Frontend]** Dispatches `POST /print/orders/:id/accept`.
3. **[Backend]** Verifies the requesting user is the assigned `provider_id`.
   - If mismatch: returns 403. Flow ends.
4. **[Database]** Updates `Order_Item.print_status = ACCEPTED` for all models in the order.
5. **[Backend]** Returns 200 OK.

---

### Phase 2: Ship Job

1. **[Provider]** Finishes 3D printing the model, packages the item, drops it at the courier, and clicks "Ship Job" in the dashboard.
2. **[Frontend]** Prompts the provider to input the `tracking_number` and attach proof of shipping photos.
3. **[Provider]** Inputs tracking code, uploads photos to S3, and clicks confirm.
4. **[Frontend]** Dispatches `POST /print/orders/:id/ship` containing `{ tracking_number, proof_urls }`.
5. **[Database]** Updates `Order.tracking_number = tracking_number`, appends `proof_urls` array, and updates `Order_Item.print_status = SHIPPED`.
6. **[Backend]** Returns 200 OK.

---

### Phase 3: Deliver Job

1. **[Provider]** Receives delivery notification or clicks "Mark Completed" once delivery is verified.
2. **[Frontend]** Dispatches `POST /print/orders/:id/complete`.
3. **[Database]** Updates `Order_Item.print_status = DELIVERED`.
4. **[Backend]** Returns 200 OK.
5. **[Frontend]** Updates order visual state to show complete/closed status.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Owner check? | Mismatch | Return 403 Forbidden, stop |
| Action type? | Accept | Update Item print status to ACCEPTED |
| Action type? | Ship | Update Order tracking parameters; set status to SHIPPED |
| Action type? | Complete | Update Item print status to DELIVERED |

---

## Key Implementation Details

- **Granular Status Tracking:** Unlike digital purchases where order status transitions directly from PENDING to PAID, physical print jobs require granular item tracking. Thus, the database keeps `print_status` directly on the `Order_Item` table (with states PENDING, ACCEPTED, SHIPPED, DELIVERED).
- **Security Check:** All three endpoints verify that the acting user is the registered `provider_id` of the target order before processing changes.
- **Proof Arrays:** The `proof_urls` are stored as an array of S3 strings in the database, showing photos of the printed model before shipment to protect providers against disputes.
