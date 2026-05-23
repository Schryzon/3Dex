# Activity Diagram - Search Models & Filters

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_search_models.puml`

![Activity Diagram - Search Models & Filters](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_search_models.png)

---

## Overview

This activity diagram details the WHERE clause construction logic for the catalog listing endpoint, showing exactly how each filter parameter affects the database query.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Initiates a catalog request |
| Frontend | Sends the parameterized request |
| Backend | Constructs the query dynamically |
| Database | Executes the query |
| MinIO | Signs preview URLs |

---

## Process Flow

1. **[User]** Requests the catalog or model grid.
2. **[Frontend]** Sends `GET /models` with params: `search`, `category`, `filter`, `sort`, `page`.
3. **[Backend]** Checks caller identity (`is_admin`, `is_self`).

**Status filter construction:**
4. **[Backend]** If admin or self-view: no status filter (all statuses visible). Otherwise: `status = APPROVED`.

**Role filter construction:**
5. **[Backend]** If not admin and not self: adds `artist.role = ARTIST` to ensure only artist-uploaded models are shown.

**Other filters applied in sequence:**
6. **[Backend]** Build NSFW filter based on `show_nsfw` parameter.
7. **[Backend]** Apply search term via OR across title, description, tags, category.
8. **[Backend]** Apply price range (`min_price` / `max_price`).
9. **[Backend]** Apply `category_id`.
10. **[Backend]** Apply `tags` inclusion / `exclude_id`.
11. **[Backend]** Apply sort order and pagination (`skip`, `take`).

**Execution:**
12. **[Database]** Executes `model.findMany(where, orderBy, skip, take)`.
13. **[Database]** Counts total matching records for pagination metadata.
14. **[MinIO]** Presigns `preview_url` and `file_url` for each result.
15. **[Backend]** Compiles `{ data: Model[], meta: { total, pages } }`.
16. **[Backend]** Returns 200 OK.
17. **[Frontend]** Renders paginated model grid.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| Caller is admin or self? | No status filter | status = APPROVED |
| Not admin and not self? | Add artist role filter | No role filter |

---

## Notes

- The filter chain is additive. Each parameter appends to the WHERE clause.
- The NSFW filter respects both the user's personal preference (`show_nsfw`) and the model's `is_nsfw` flag.
- The `exclude_id` parameter allows the frontend to exclude the currently viewed model from "similar models" sections on detail pages.
