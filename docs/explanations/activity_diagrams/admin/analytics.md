# Activity Diagram - Analytics

> **UML Type:** Activity Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/activity/admin/activity_analytics.puml`

![Activity Diagram - Analytics](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/admin/activity_analytics.png)

---

## Overview

This activity diagram shows how both Artists and Admins access their respective analytics dashboards. The key difference is the role-based access gate and the scope of data returned.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Admin or Artist | The actor requesting analytics |
| Frontend | Navigates to the analytics page and renders charts |
| Backend | Validates role and aggregates data |
| Database | Executes parallel aggregation queries |

---

## Process Flow

1. **[Admin or Artist]** Opens the analytics page.
2. **[Frontend]** Sends `GET /analytics/artist-stats` (for Artist) or `GET /admin/analytics` (for Admin).
3. **[Backend]** Validates the user's role matches the endpoint.
   - If unauthorized role: returns 403 Forbidden. Frontend shows error page. Flow ends.
4. **[Database]** Executes parallel aggregation queries:
   - Count total models (filtered by artist for Artist, platform-wide for Admin)
   - Count total purchases and sum revenue
   - Count reviews and calculate average rating
   - Fetch recent purchases and aggregate time-series revenue data
   - Find top-selling models
   - Find top-earning artists (Admin only)
5. **[Backend]** Compiles all results into a single aggregated stats JSON.
6. **[Backend]** Returns 200 with the data.
7. **[Frontend]** Renders:
   - Revenue bar/line chart
   - Top models by sales
   - Rating distribution
   - Follower count (Artist view)

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| Role matches endpoint? | Continue | Return 403 |

---

## Notes

- Artist analytics are scoped to that artist's own models and sales. Admin analytics are platform-wide.
- The diagram shows the Database lane with parallel fork notation, indicating that the aggregation queries should ideally be executed concurrently. In the current Prisma implementation, these are likely sequential unless wrapped in `Promise.all`.
- The Frontend renders different chart types depending on the data returned. The backend response shape is the same for both roles; the difference is in the data scope.
