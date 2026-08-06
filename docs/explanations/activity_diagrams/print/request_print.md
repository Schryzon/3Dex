# Activity Diagram - Request Print

> **UML Type:** Activity Diagram
> **Category:** Print
> **Source:** `docs/diagrams/activity/print/activity_request_print.puml`

![Activity Diagram - Request Print](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/print/activity_request_print.png)

---

## Overview

This activity diagram describes the physical 3D print order creation process. It maps how customers browse localized print providers by compatibility parameters and how the order is registered in the database for the provider's queue.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Customer | Browses providers and configures print jobs |
| Frontend | Handles filters, queries, and checkout assembly |
| Backend | Executes routing logic, checks credentials, and processes orders |
| Database | Performs lookups and creates the Print Job Order record |

---

## Process Flow

1. **[Customer]** Initiates the "Print this model" wizard from a model detail page.
2. **[Frontend]** Dispatches query `GET /print/providers?material=PLA&city=Bandung`.
3. **[Database]** Queries `User` table for records where `role == PROVIDER` and `account_status == APPROVED`.
4. **[Backend]** Filters the returned provider lists:
   - Matches the requested material against the provider's `provider_config.materials` array.
   - Sorts results prioritising local proximity (city/country match).
5. **[Backend]** Returns matching providers list.
6. **[Customer]** Selects a provider, configures shipping details, and clicks "Submit Print Order".
7. **[Frontend]** Dispatches `POST /print/orders` with:
   - `provider_id`, `shipping_address`, `courier_name`, `items` (model IDs and specifications like layer heights or fill densities).
8. **[Database]** Looks up target provider and model records.
9. **[Backend]** Verifies the provider exists and is active.
   - If invalid: returns 400 Bad Request. Flow ends.
10. **[Database]** Inserts a new `Order` record:
    - `type = PRINT_JOB`
    - `status = PENDING`
    - `shipping_address` written as JSON
    - `items` created with `print_status = PENDING`
11. **[Backend]** Returns 201 Created.
12. **[Frontend]** Directs the user to the print order tracking page.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Provider valid and active? | No | Return 400 Bad Request, stop |
| Proximity matches? | Yes | Bubble provider to the top of search list |

---

## Key Implementation Details

- **Print vs. Asset Orders:** In contrast to digital asset orders which immediately generate a Midtrans payment token, a `PRINT_JOB` order is saved in the database first to let the provider calculate custom pricing (shipping, handling, scaling adjustments) or accept/reject the job before final billing occurs.
- **Provider Specifications:** The provider configurations (capabilities, equipment, localized pricing) are stored in the database as a single structured `Json` field (`provider_config`), which makes it easy to add custom capabilities without needing migrations.
