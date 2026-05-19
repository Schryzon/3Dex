# Sequence Diagram - Model Update

> **UML Type:** Sequence Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/sequence/catalog/sequence_model_update.puml`

![Sequence Diagram - Model Update](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/catalog/sequence_model_update.png)

---

## Overview

This diagram describes the flow for an Artist editing their existing model's metadata (title, price, tags, category, license, etc.). File replacement is not covered here; this is metadata-only editing.

---

## Participants

| Participant | Role |
|---|---|
| Artist | The authenticated artist who owns the model |
| Frontend | The client |
| ModelController | Express route handler for model updates |
| ModelService | Business logic for model persistence |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Edit Form Load

The Artist opens the model edit form. The Frontend calls `get_model_detail(model_id)` to pre-fill the form with current values.

### 2. Changes and Submission

The Artist modifies fields (title, price, tags, category, etc.) and submits. The Frontend calls `update_model(model_id, { title, price, category, tags, license, is_printable, is_nsfw })`.

### 3. Authorization Check

ModelController fetches the model and validates:
- If not found: returns **404 Not Found**.
- If `model.artist_id != user.id` AND the user is not an ADMIN: returns **403 Not authorized**.

### 4. Update Execution

ModelController delegates to ModelService, which:
1. If the category has changed, resolves the new `category_id` from the provided slug via `category.findUnique`.
2. Calls `model.update` with safe fields: `title`, `price`, `category_id`, `license`, `is_printable`, `is_nsfw`.
3. For tags: first disconnects all existing tags (`set: []`), then connects the new set of tags.

### 5. Response

ModelService returns the updated model. ModelController returns **200** with the updated model. The Frontend reflects the changes.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Model not found | 404 Not Found |
| Not the owner and not admin | 403 Not Authorized |

---

## Key Implementation Details

- The tags update uses a `set: []` then `connect: [...]` pattern instead of a diff, meaning the entire tag set is replaced on each edit.
- `file_url` and `preview_url` are not editable through this endpoint. File replacement would require a separate presigned PUT URL flow similar to the initial upload.
- Admins can also update any model's metadata, which is why the authorization check includes `role == ADMIN` as a bypass condition.
- Updating a model does not reset its `status` back to PENDING. If an artist edits a model that was already approved, it stays approved. Policy enforcement of re-review after edit is not currently implemented.
