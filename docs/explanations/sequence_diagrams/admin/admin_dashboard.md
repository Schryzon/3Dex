# Sequence Diagram - Admin Dashboard

> **UML Type:** Sequence Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/sequence/admin/sequence_admin_dashboard.puml`

![Sequence Diagram - Admin Dashboard](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/admin/sequence_admin_dashboard.png)

---

## Overview

This diagram covers three distinct admin actions available from the admin dashboard: loading the summary overview, paginating through the audit log, and manually triggering a platform stats aggregation.

---

## Participants

| Participant | Role |
|---|---|
| Admin | The authenticated admin user |
| Frontend | The admin panel client |
| AdminController | Express route handler for admin endpoints |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Dashboard Summary Load

**Trigger:** Admin navigates to the Admin Dashboard page.

The Frontend calls `get_dashboard_summary()`. AdminController fires several parallel database queries:

1. Count of models with `status = PENDING`
2. Count of users with `account_status = PENDING` and `role IN [ARTIST, PROVIDER]`
3. Count of reports with `status = PENDING`
4. Latest 3 pending models (including artist data)
5. Latest 3 pending user applications
6. Latest 3 pending reports (including reporter data)
7. Latest 5 stats records ordered by `created_at` descending

The results are compiled into a single response object:
```
{
  counts: { models, users, reports },
  recent: { models[], users[], reports[] },
  stats: latestStats.data,
  history: [{ date, transactions }]
}
```

The Frontend uses this to render the dashboard counter cards and the transaction history chart.

---

### Part 2 - Audit Log Pagination

**Trigger:** Admin clicks "View Audit Logs".

The Frontend calls `get_audit_logs(page, limit, action?, admin_id?, from?, to?)`.

AdminController parses the optional filter parameters and constructs a filtered query against the `Admin_Audit_Log` table, ordering by `created_at` descending. It also counts the total number of matching records for pagination metadata.

The response is:
```
{ data: logs[], meta: { total, page, pages } }
```

The Frontend renders a paginated table of log entries.

---

### Part 3 - Stats Aggregation Trigger

**Trigger:** Admin clicks "Trigger Stats Aggregation".

The Frontend calls `trigger_stats_aggregation()`. AdminController calls `aggregate_stats()`, which queries:
- All orders, models, users, and payments for a defined period

It then creates a new `Stats` record in the database with `{ period_start, period_end, data }`.

The response confirms the aggregation was triggered. The Frontend shows a confirmation toast.

---

## Error Paths

This diagram does not include explicit error handling beyond the general authentication guard. All three actions require the user to have the `ADMIN` role, enforced by the role middleware before the controller runs.

---

## Key Implementation Details

- The dashboard summary is a single controller action that executes multiple Prisma queries. In the current implementation these are executed sequentially, not in parallel. Each query is separate.
- The audit log uses cursor-based or offset-based pagination with `take` and `skip` parameters derived from `page` and `limit`.
- Stats aggregation can also be triggered by the cron scheduler automatically. The dashboard trigger is a manual on-demand option.
