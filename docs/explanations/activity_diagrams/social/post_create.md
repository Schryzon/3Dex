# Activity Diagram - Post Create

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_post_create.puml`

![Activity Diagram - Post Create](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_post_create.png)

---

## Overview

This activity diagram describes the process of creating a new community post. It outlines the role-based validation checks (only Artists and Providers are allowed to post) and S3 file attachment flows.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Artist or Provider | Fills out caption and uploads images |
| Frontend | Requests presigned URLs, uploads to MinIO, and sends metadata |
| MinIO | S3-compatible storage backend |
| Backend | Runs role checks, validates input, and persists the post |
| Database | Inserts the new Post record |

---

## Process Flow

1. **[Artist or Provider]** Fills out the caption, sets NSFW toggles, and selects images.
2. **[Frontend]** Requests presigned PUT URLs from the backend for each image.
3. **[MinIO]** Returns signed S3 upload URLs.
4. **[Frontend]** Uploads raw image binaries directly to MinIO using the presigned URLs.
5. **[Frontend]** Dispatches `POST /posts` with `{ caption, media_urls: [keys], is_nsfw }`.
6. **[Backend]** Verifies user credentials and role.
   - If user role is `CUSTOMER` or `ADMIN`: returns 403 Forbidden ("Only Artists and Providers can create community posts"). Flow ends.
7. **[Backend]** Validates the request payload:
   - Verifies the caption length and formats.
   - Verifies `media_urls` is not empty (community posts must contain at least one image/media attachment).
   - If invalid: returns 400 Bad Request. Flow ends.
8. **[Database]** Inserts the new `Post` record containing the media paths and initial zeroed statistics (`like_count = 0`, `comment_count = 0`).
9. **[Backend]** Returns 201 Created along with the new post details.
10. **[Frontend]** Appends the post to the top of the community feed.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Role is Artist or Provider? | No | Return 403 Forbidden, stop |
| Media attachments exist? | No | Return 400 Bad Request, stop |

---

## Key Implementation Details

- **Role Constraints:** The `Post` table represents promotional or portfolio updates. To maintain high-quality feed content, only approved creators (`ARTIST` or `PROVIDER`) are authorized to upload posts. Regular users (`CUSTOMER`) can interact through likes and comments but cannot post directly.
- **Direct S3 Uploads:** Similar to model uploads, image binaries are uploaded directly to MinIO storage from the frontend to keep the application server highly responsive.
