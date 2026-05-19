# Activity Diagram - Model Upload

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_model_upload.puml`

![Activity Diagram - Model Upload](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_model_upload.png)

---

## Overview

This activity diagram shows the model upload process with swim lanes, emphasizing the parallel fork between the immediate 201 Created response and the asynchronous background embedding generation.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Artist | Fills and submits the upload form |
| Frontend | Requests presigned URLs and sends file data |
| MinIO | S3-compatible storage for file upload |
| Backend | Validates metadata and creates the model record |
| Backend (Worker) | Asynchronous embedding generation |
| Gemini API | Text embedding model endpoint |
| Database | Persists model record and vector embedding |

---

## Process Flow

1. **[Artist]** Fills upload form (title, file, tags, category, etc.).
2. **[Frontend]** Requests presigned PUT URLs for GLB and WebP preview files.
3. **[MinIO]** Returns signed URLs.
4. **[Frontend]** Uploads GLB binary directly to MinIO.
5. **[Frontend]** Uploads WebP preview directly to MinIO.
6. **[Frontend]** Sends `POST /models { all metadata + S3 keys }`.
7. **[Backend]** Validates inputs and checks file extension.
   - If invalid format: returns 400. Flow ends.
8. **[Database]** Resolves `category_id` from slug.
9. **[Database]** Creates `Model` record with `status: PENDING`.

**Fork (parallel):**

**Main path:**
10A. **[Backend]** Returns 201 Created.
11A. **[Frontend]** Shows "Pending review" to Artist.

**Background path:**
10B. **[Backend (Worker)]** Calls `embed_and_save_model(model.id)`.
11B. **[Gemini API]** Encodes model title/description text via `all-MiniLM`.
12B. **[Database]** Saves 384-dim vector to `model.embedding`.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| File format valid (glb/gltf)? | Continue | Return 400, stop |

---

## Notes

- The parallel fork after model creation reflects the fire-and-forget nature of embedding generation. The user does not wait for the embedding to complete.
- The diagram labels the embedding model as "all-MiniLM" which refers to `all-MiniLM-L6-v2`. It is noted in the diagram as executed via Gemini API context, though in practice the embedding is done using a sentence-transformer library, not the Gemini Flash text generation API.
