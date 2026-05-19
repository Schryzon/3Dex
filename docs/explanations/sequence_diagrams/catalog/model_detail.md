# Sequence Diagram - Model Detail

> **UML Type:** Sequence Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/sequence/catalog/sequence_model_detail.puml`

![Sequence Diagram - Model Detail](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/catalog/sequence_model_detail.png)

---

## Overview

This diagram shows what happens when a user clicks on a model card to view its detail page. It covers ownership checks, URL signing, and conditional rendering based on whether the user has purchased the model.

---

## Participants

| Participant | Role |
|---|---|
| User | Any visitor (authenticated or guest) |
| Frontend | The Next.js client rendering the model detail page |
| ModelController | Express route handler for model detail |
| PurchaseService | Business logic for checking purchase status |
| StorageService | S3 URL presigner |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Model Lookup

The Frontend calls `get_model_detail(model_id, user?)`. ModelController queries the database for the model including its `artist`, `category`, `tags`, and `reviews._count`.

- If not found: returns **404 Not Found**. The Frontend shows a 404 page. Flow terminates.

### 2. Purchase Check (Authenticated Users Only)

If the user is authenticated:

1. ModelController calls PurchaseService to check `purchase.findUnique({ user_id_model_id })`.
2. Three sub-cases determine `isPurchased`:
   - If `model.artist_id == user_id`: the artist always owns their own model, so `isPurchased = true`.
   - If a `Purchase` record exists: `isPurchased = true`.
   - Otherwise: `isPurchased = false`.

If the user is a guest: `isPurchased = false`.

### 3. URL Signing

ModelController calls StorageService to presign:
- The model's `preview_url`
- The model's `file_url`
- All `gallery_urls`
- The artist's `avatar_url`

### 4. Response

ModelController returns the model object with the `isPurchased` flag and all signed URLs. The Frontend conditionally renders either a "Buy" button (not purchased) or a "Download" button (purchased), alongside the Three.js 3D viewer, gallery, and price information.

---

## Key Implementation Details

- The `isPurchased` flag is derived server-side, not client-side, to prevent tampering.
- Even non-purchased users can view the model's 3D preview (using the presigned `preview_url`), but the actual downloadable file requires purchase authorization.
- The creator's `file_url` presigned URL is returned to all callers. The download endpoint enforces the purchase gate; the detail page URL itself does not block access to the signed URL but the actual file is only meaningful after download authorization is confirmed separately.
- Gallery images are also presigned, meaning they are only accessible via time-limited URLs returned from the API.
