# Sequence Diagram - Catalog Search

> **UML Type:** Sequence Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/sequence/catalog/sequence_catalog_search.puml`

![Sequence Diagram - Catalog Search](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/catalog/sequence_catalog_search.png)

---

## Overview

This diagram describes the full request-response cycle for the catalog model listing endpoint, including permission-aware filtering, sorting, pagination, and per-model S3 URL signing.

---

## Participants

| Participant | Role |
|---|---|
| User | Any visitor (authenticated or guest) |
| Frontend | The Next.js client rendering the catalog grid |
| ModelController | Express route handler for `/models` |
| StorageService | S3 URL presigner |
| StorageClient (S3) | MinIO S3 storage backend |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Search Input

The user types in the search box or applies filters (category, price range, sort). The Frontend sends `list_models(search, category_id, min_price, max_price, sort, page, limit)`.

### 2. User Context Check

ModelController checks the caller's identity:
- `is_self`: true if the user is authenticated and the `artist_id` filter matches their own ID
- `is_admin`: true if the user has the `ADMIN` role

### 3. WHERE Clause Construction

Based on the context:
- **Status filter:** Only APPROVED models are visible to regular users. Admins and self-views include all statuses.
- **Artist role filter:** Only models from users with `role = ARTIST` are shown unless the caller is an admin or viewing their own models.
- **NSFW filter:** NSFW models are hidden unless `show_nsfw=true` is in the query (respecting the user's preference).
- **Search:** Performs an OR search across `title`, `description`, `tags.name`, and `category.name`.
- **Price range:** Applies `gte` and `lte` filters on the `price` field.
- **Category:** Filters by `category_id`.

### 4. Sort Order

The `sort` parameter maps to one of: `newest`, `oldest`, `price_asc`, `price_desc`, `rating`, or `popular`.

### 5. Pagination

`skip = (page - 1) * limit`, `take = limit`. The controller also runs `model.count({ where })` to return total count for pagination UI.

### 6. Database Query

`model.findMany` is called with the built `where`, `orderBy`, `take`, and `skip` along with `include: { artist, category, tags }`.

### 7. S3 URL Signing

For each returned model, ModelController calls StorageService to:
- Presign the `preview_url`
- Presign the `file_url`
- Sign the artist's `avatar_url`

### 8. Response

The response is `{ data: Model[], meta: { total, page, limit, pages } }`. The Frontend renders the paginated model grid.

---

## Key Implementation Details

- The loop for URL signing is per-model, which means N presign calls for N models. This is the current approach and is the primary source of catalog latency in production environments with many results.
- The `embedding` field is not used in keyword search. Keyword search is a direct Prisma filter on text fields. The `embedding` is used only in the Dexie AI semantic search flow.
- Free models (`price = 0`) appear in the catalog and can be downloaded without checkout.
