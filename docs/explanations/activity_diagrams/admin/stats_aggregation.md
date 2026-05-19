# Activity Diagram - Stats Aggregation

> **UML Type:** Activity Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/activity/admin/activity_stats_aggregation.puml`

![Activity Diagram - Stats Aggregation](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/admin/activity_stats_aggregation.png)

---

## Overview

This activity diagram describes the background stats aggregation process, which computes platform-level metrics for a defined time period and stores them in the `Stats` table for dashboard display.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Cron Service or Admin | Triggers the aggregation task |
| Backend (Cron Service) | Orchestrates the computation |
| Database | Executes parallel count/sum queries and stores results |
| Frontend | Reflects updated data in the admin chart |

---

## Process Flow

1. **[Cron Service or Admin]** Triggers `STATS_AGGREGATION` (either via scheduled cron or manual dashboard button).
2. **[Backend (Cron Service)]** Calls `initialize aggregate_stats()`.
3. **[Backend (Cron Service)]** Defines `period_start` and `period_end` timestamps.
4. **[Database]** Executes parallel aggregation queries:

   Fork A:
   - Count total `Order` records with `status = PAID` in the period.
   - Sum `gross_amount` from all `Payment` records in the period.

   Fork B:
   - Count new `User` registrations in the period.
   - Count new `Model` records created in the period.

   Fork C:
   - Find top-selling models (most Order_Items fulfilled in the period).
   - Find top-earning artists (sum of sales by artist in the period).

5. **[Backend (Cron Service)]** Aggregates all results into a single JSON data object.
6. **[Database]** Creates a new `Stats` record: `{ period_start, period_end, data }`.
7. **[Backend (Cron Service)]** Returns the new `Stats` record.
8. **[Frontend]** Admin dashboard chart reflects the updated data on next load.

---

## Decision Points Summary

There are no conditional branches in this flow. The process is always executed fully once triggered.

---

## Notes

- The parallel fork in the Database lane shows that multiple aggregation queries should ideally run concurrently. In practice, Prisma does not natively parallelize queries in a transaction; a `Promise.all` wrapper would be needed.
- Each `Stats` record is a timestamped snapshot. Multiple records accumulate over time, providing a history of platform metrics. The dashboard displays the most recent record and can chart the history.
- The `data` JSON field structure is application-defined and would include fields like `{ total_orders, total_revenue, new_users, new_models, top_models: [], top_artists: [] }`.
- The cron trigger interval is not specified in the diagram. A reasonable interval for a marketplace would be daily or weekly aggregation.
