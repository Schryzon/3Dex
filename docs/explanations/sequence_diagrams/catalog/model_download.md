# Sequence Diagram - Model Download

> **UML Type:** Sequence Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/sequence/catalog/sequence_model_download.puml`

![Sequence Diagram - Model Download](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/catalog/sequence_model_download.png)

---

## Overview

This diagram describes the secure file download flow. Download access is controlled server-side, requiring proof of purchase (or special authorization) before a short-lived presigned download URL is generated.

---

## Participants

| Participant | Role |
|---|---|
| Customer | The authenticated user requesting the download |
| Frontend | The client |
| ModelController | Express route handler for download |
| PurchaseService | Purchase verification logic |
| StorageService | S3 URL presigner |
| StorageClient (S3) | MinIO backend |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Download Request

The Customer clicks "Download" on a purchased model. The Frontend calls `download_model(model_id, session_cookie)`.

### 2. Model Lookup

ModelController queries the database for the model by ID.
- If not found: returns **404 Model not found**. Flow terminates.

### 3. Purchase Verification

ModelController calls PurchaseService to check `purchase.findUnique({ user_id, model_id })`.

Access is granted if any of the following is true:
- A `Purchase` record exists for the user
- The user is the model's artist (they own their own work)
- The user has the `ADMIN` role
- The model's price is 0 (free)

If none of these conditions are met: returns **403 You have not purchased this model**. Flow terminates.

### 4. Presigned Download URL

ModelController calls StorageService, which calls MinIO to generate a presigned GET URL with a short time-to-live (short TTL). This ensures the link expires quickly and cannot be shared indefinitely.

### 5. Download Initiation

ModelController returns **200 { download_url, license }**. The Frontend uses the signed URL to initiate a direct browser download from MinIO. The file stream is delivered directly from S3 to the user's browser.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Model not found | 404 Model not found |
| No purchase AND not artist AND not admin AND price > 0 | 403 Forbidden |

---

## Key Implementation Details

- The `license` field is returned alongside the download URL so the client can display a reminder of the license terms (Personal Use or Commercial Use).
- The short TTL presigned URL prevents unauthorized redistribution of download links. Even if a link is shared, it expires after a brief window.
- Free models (`price = 0`) bypass the purchase check entirely, as their file is available to anyone.
- The admin bypass allows admins to download any model for moderation review purposes.
