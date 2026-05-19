# Sequence Diagram - Model Upload

> **UML Type:** Sequence Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/sequence/catalog/sequence_model_upload.puml`

![Sequence Diagram - Model Upload](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/catalog/sequence_model_upload.png)

---

## Overview

This diagram covers the complete model upload workflow. Files are uploaded directly to S3 using presigned PUT URLs, then the model metadata is saved to the database. Finally, an embedding is generated asynchronously for semantic search.

---

## Participants

| Participant | Role |
|---|---|
| Artist | The authenticated artist user |
| Frontend | The Next.js client |
| StorageController | Express route handler for presigned URL generation |
| StorageService | S3 URL presigner |
| StorageClient (S3) | MinIO S3 storage backend |
| ModelController | Express route handler for model creation |
| ModelService | Business logic for model persistence |
| EmbeddingService | Semantic embedding generator |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Presigned URL for GLB File

The Artist fills the upload form. The Frontend requests a presigned PUT URL for the `.glb` file by calling `get_upload_url(filename, content_type: model/gltf-binary)`.

StorageController delegates to StorageService, which calls MinIO to generate a `presigned_url` and an S3 `key`. The Frontend receives both.

### 2. Direct Upload to S3

The Frontend uploads the raw GLB binary directly to MinIO using the presigned URL (`PUT presigned_url`). The file never passes through the application server.

### 3. Presigned URL for Preview Image

The process repeats for the WebP preview image. The Frontend receives a separate `upload_url` and `preview_key`.

### 4. Preview Upload

The Frontend uploads the preview image directly to MinIO.

### 5. Model Metadata Submission

The Frontend submits the model metadata to ModelController:
```
{ title, price, file_url: key, preview_url: preview_key,
  artist_id, category, tags, license, is_printable, is_nsfw }
```

ModelController:
1. Validates required fields are present.
2. Extracts the file extension from `file_url` to populate `file_format`.
3. If the format is not `.glb` or `.gltf`: returns **400 Invalid file format**.
4. Resolves `category_id` from the category slug via `category.findUnique({ slug })`.
5. Delegates to ModelService, which calls `model.create(...)`.

The model is created with `status = PENDING`.

### 6. Embedding Generation (Fire and Forget)

ModelController immediately calls `EmbeddingService.embed_and_save_model(model.id)` without awaiting the result. This is a background task.

EmbeddingService:
1. Fetches the model's `title` and `description`.
2. Encodes the combined text using the `all-MiniLM-L6-v2` sentence embedding model.
3. Saves the resulting 384-dimensional vector to `model.embedding` via Prisma.

### 7. Response

ModelController returns **201 Created** with the model object while the embedding runs in the background. The Frontend shows the artist a "Model uploaded! Pending admin review." message.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Missing required metadata fields | 400 Bad Request |
| File format not GLB or GLTF | 400 Invalid file format |
| Category slug not found | 404 or null category_id |

---

## Key Implementation Details

- The direct-to-S3 upload pattern means the application server never handles the file bytes, keeping it lightweight.
- New models start as `PENDING`. They will not appear in the public catalog until an admin approves them.
- The embedding is generated fire-and-forget; upload success does not depend on embedding completion.
- The `all-MiniLM-L6-v2` model produces 384-dimension vectors stored in the `embedding` column using PostgreSQL's `pgvector` extension.
