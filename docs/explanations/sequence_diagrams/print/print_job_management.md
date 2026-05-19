# Sequence Diagram - Print Job Management

> **UML Type:** Sequence Diagram
> **Category:** Print
> **Source:** `docs/diagrams/sequence/print/sequence_print_job_management.puml`

![Sequence Diagram - Print Job Management](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/print/sequence_print_job_management.png)

---

## Overview

This diagram describes the provider-side view of managing incoming print jobs. It covers viewing jobs, accepting a job, shipping with tracking information, and marking delivery as complete.

---

## Participants

| Participant | Role |
|---|---|
| Provider | The authenticated printing service provider |
| Frontend | The client |
| PrintController | Express route handler for print job management |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - View Incoming Jobs

The Provider navigates to their job dashboard. The Frontend calls `get_provider_jobs(session_cookie)`.

PrintController queries `order.findMany({ provider_id, type: PRINT_JOB })` including the customer user and all order items with their models. Returns the job list. The Frontend displays job cards.

### Part 2 - Accept a Job

The Provider clicks "Accept" on a job. The Frontend calls `manage_print_order(order_id, action: ACCEPT)`.

PrintController:
1. Fetches the order and verifies that `order.provider_id == req.user.id` (ownership check).
2. Updates the order record.
3. Updates all `Order_Item` records for this order: `print_status = ACCEPTED`.

Returns **200 "Order ACCEPTED successfully!"**. The Frontend updates the job status.

### Part 3 - Ship the Job

The Provider uploads proof photos and enters a tracking number, then clicks "Ship". The Frontend calls `manage_print_order(order_id, action: SHIP, tracking_number, proof_urls)`.

PrintController:
1. Validates that `tracking_number` is present.
2. Updates the order: `{ tracking_number, proof_urls }`.
3. Updates all `Order_Item` records: `print_status = SHIPPED`.

Returns **200 "Order SHIPPED successfully!"**.

### Part 4 - Mark Delivered

The Provider clicks "Mark Delivered". The Frontend calls `manage_print_order(order_id, action: COMPLETE)`.

PrintController updates all `Order_Item` records: `print_status = DELIVERED`.

Returns **200 "Order COMPLETED successfully!"**. The job is closed.

---

## Key Implementation Details

- The `manage_print_order` endpoint is a single unified action handler that uses the `action` parameter to branch into ACCEPT, SHIP, or COMPLETE logic.
- `print_status` lives on `Order_Item`, not on `Order`. The parent `Order.status` transitions from PENDING to PAID only when actual payment is processed. Print-specific lifecycle states are tracked at the item level.
- `proof_urls` is a `String[]` column on the `Order` table. Providers upload proof photos to S3 and submit their keys as an array.
- Ownership verification (`order.provider_id == req.user.id`) prevents providers from managing orders they are not assigned to.
