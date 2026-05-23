# Activity Diagram - Unlock Downloads

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_unlock_downloads.puml`

![Activity Diagram - Unlock Downloads](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_unlock_downloads.png)

---

## Overview

This activity diagram describes the validation sequence and delivery mechanisms of the model download process. It focuses on the server-side checks that must pass before a secure S3 presigned URL is served to the client browser.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Requests model download |
| Frontend | Issues download API call and handles browser trigger |
| Backend | Runs access rules and generates short-lived URLs |
| Database | Performs model lookup and purchase verification |
| MinIO | Issues timed presigned download URL |

---

## Process Flow

1. **[User]** Clicks the "Download" trigger on the model page.
2. **[Frontend]** Sends `GET /models/:id/download` with user credentials.
3. **[Database]** Looks up the model by its unique ID.
4. **[Backend]** Checks if the model exists.
   - If not found: returns 404. Flow ends.
5. **[Database]** Queries for a valid `Purchase` record matching the requesting `user_id` and target `model_id`.
6. **[Backend]** Evaluates download eligibility based on the following OR rules:
   - Does a validated `Purchase` record exist in the database?
   - Is the current `user_id` equal to the model's `artist_id` (owner check)?
   - Does the user possess the `ADMIN` role?
   - Is the model's listing price equal to `0` (free asset)?
7. **[Backend]** Branching:
   - **No (none of the above are true):** Returns 403 Forbidden. Flow ends.
   - **Yes (at least one is true):**
     1. **[MinIO]** Backend requests MinIO to generate a short-lived presigned GET URL (short TTL).
     2. **[Backend]** Returns 200 OK along with `{ download_url, license }`.
     3. **[Frontend]** Intercepts the payload and triggers a native browser download pointing to the generated presigned S3 URL.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Model exists? | No | Return 404, stop |
| Eligible? (Purchase, Owner, Admin, or Free) | Yes | Call MinIO, generate presigned URL, return 200 |
| Eligible? | No | Return 403 Forbidden, stop |

---

## Key Implementation Details

- **Security Gatekeeping:** Access verification is performed strictly on the Backend prior to generating any S3 URLs. Simply having access to the client model page does not bypass this gate.
- **Short TTL URLs:** The S3 URL uses a very short Time-To-Live (e.g., 5 to 15 minutes) to ensure that even if the link is intercepted or shared, it becomes inactive shortly after generation.
- **Free Models:** The check `price == 0` allows any logged-in user to download free assets immediately, bypassing the need for a `Purchase` record.
