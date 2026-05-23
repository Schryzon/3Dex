# Activity Diagram - View Model Details

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_view_model_detail.puml`

![Activity Diagram - View Model Details](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_view_model_detail.png)

---

## Overview

This activity diagram describes the flow when a user or guest navigates to a model's detail page. It covers model lookup, access control, signed URL generation, and the rendering of the full model detail view including the 3D viewer, license, and reviews.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User or Guest | Initiates navigation to a model page |
| Frontend | Dispatches the API request and renders the detail view |
| Backend | Validates access, compiles data, and enforces visibility rules |
| Database | Fetches model record, reviews summary, and artist data |
| MinIO | Generates presigned URLs for the model file and preview image |

---

## Process Flow

1. **[User or Guest]** Navigates to `/models/:id`.
2. **[Frontend]** Dispatches `GET /models/:id`.
3. **[Database]** Looks up model by ID.
4. **[Backend]** Checks model existence.
   - If not found: returns 404. Frontend redirects to `/catalog`.
5. **[Backend]** Checks visibility:
   - If model status is not `APPROVED` and the requestor is not the owner or admin: returns 403.
6. **[MinIO]** Generates presigned `preview_url` and `file_url`.
7. **[Database]** Fetches review summary (avg_rating, review_count) and artist profile.
8. **[Backend]** Compiles full model detail object. Returns 200 OK.
9. **[Frontend]** Renders: 3D GLB viewer, metadata, license info, price, reviews section, artist card.
10. **[User or Guest]** If authenticated: can add to cart, wishlist, or download. If not: prompted to register on action.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Model found? | No | Return 404, redirect to catalog |
| Model visible? | PENDING/REJECTED & not owner/admin | Return 403 |
| Authenticated? | No | Gated actions prompt registration |

---

## Key Implementation Details

- **Role-based Visibility:** Pending and rejected models are only visible to their owner and platform admins, ensuring unapproved content doesn't surface publicly.
- **Presigned URLs:** Short-lived signed URLs from MinIO protect model files from being directly scraped or linked without proper authorization.
