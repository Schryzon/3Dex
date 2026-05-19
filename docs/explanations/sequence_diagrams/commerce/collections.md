# Sequence Diagram - Collections

> **UML Type:** Sequence Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/sequence/commerce/sequence_collections.puml`

![Sequence Diagram - Collections](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/commerce/sequence_collections.png)

---

## Overview

This diagram covers the full collections feature: listing all collections, creating a new collection, viewing a collection's contents, adding a model to a collection, and removing a model from a collection.

---

## Participants

| Participant | Role |
|---|---|
| User | The authenticated user |
| Frontend | The client |
| CollectionController | Express route handler for collection operations |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - List Collections

The user opens "My Collections". The Frontend calls `get_collections(session_cookie)`.

CollectionController queries `collection.findMany({ user_id })` including item counts. Returns the collection grid.

### Part 2 - Create Collection

The user clicks "New Collection". The Frontend shows a form for name, description, and visibility.

The user submits `{ name, description, is_public: true }`. The Frontend calls `create_collection({ name, description, is_public })`.

CollectionController calls `collection.create({ user_id, name, description, is_public })`. Returns **201 Collection**. The new collection card appears in the UI.

### Part 3 - View Collection Detail

The user opens a collection. The Frontend calls `get_collection(collection_id)`.

CollectionController queries `collection.findUnique({ id })` including items and their associated models (with artist and tags).

**Privacy Gate:** If the collection is private (`is_public = false`) AND the requesting user is not the owner: returns **403 Forbidden**. Flow terminates.

Otherwise, returns the collection with items. The Frontend renders the model grid.

### Part 4 - Add a Model

The user clicks "Add to Collection" on a catalog model. The Frontend shows a collection picker modal.

The user selects a target collection. The Frontend calls `add_item(collection_id, model_id)`.

CollectionController:
1. Validates that the collection belongs to the requesting user.
2. Calls `collection_Item.create({ collection_id, model_id })`.
3. Returns **201 Collection_Item**. The model is added to the collection.

### Part 5 - Remove a Model

The user clicks the remove icon on an item. The Frontend calls `remove_item(collection_id, model_id)`.

CollectionController:
1. Validates ownership of the collection.
2. Calls `collection_Item.delete({ collection_id_model_id })`.
3. Returns confirmation. The Frontend removes the item.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Private collection viewed by non-owner | 403 Forbidden |
| Ownership validation fails | 403 or 404 (implied) |

---

## Key Implementation Details

- The `is_public` flag allows users to share their collections with others via a direct link. Only the owner can see private collections.
- `Collection_Item` has a unique constraint on `(collection_id, model_id)`, preventing the same model from being added twice.
- Both the `Collection` and `Collection_Item` are cascade-deleted when the parent collection is deleted, or the `Collection_Item` is cascade-deleted when the referenced model is deleted.
