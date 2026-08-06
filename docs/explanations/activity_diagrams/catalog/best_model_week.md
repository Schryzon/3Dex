# Activity Diagram - View Best Model of the Week

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_best_model_week.puml`

![Activity Diagram - View Best Model of the Week](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_best_model_week.png)

---

## Overview

This activity diagram describes the automated weekly process of selecting and featuring the best-selling 3D model of the week. The `<<system>> Time` actor triggers the aggregation, and the result is surfaced on the homepage for Guests and Users alike.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| <<system>> Time | Fires the weekly cron trigger |
| Backend (Cron) | Runs the aggregation and upsert logic |
| Database | Aggregates purchases and stores the featured model |
| Frontend | Renders the "Model of the Week" card on the homepage |

---

## Process Flow

1. **[<<system>> Time]** Weekly cron job fires every Monday at 00:00 UTC.
2. **[Backend (Cron)]** Calls `GET /internal/cron/best-model-week`.
3. **[Backend (Cron)]** Defines `period_start` (7 days ago) and `period_end` (now).
4. **[Database]** Aggregates `Purchase` records in the period, groups by `model_id`, counts purchases per model, and orders by `purchase_count DESC`.
5. **[Database]** Picks the top model.
6. **[Backend (Cron)]** Evaluates result:
   - **Top model found:** Upserts `Weekly_Featured` record `{ model_id, week_start, week_end }`.
   - **No purchases:** Logs "No purchases this week — skipping update".
7. **[Frontend]** Homepage "Model of the Week" card reflects the newly featured model.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Top model found? | No | Log skip, no update |

---

## Key Implementation Details

- **Cron Actor:** The `<<system>> Time` actor in the UCD represents the automated scheduler. No human initiates this — it fires on a fixed weekly cadence.
- **Upsert:** The weekly featured record is upserted, not inserted, so there is always at most one active "Model of the Week" at any given time.
- **Guest Visibility:** This featured model is publicly visible to unauthenticated guests on the homepage, serving as a discovery and marketing hook.
