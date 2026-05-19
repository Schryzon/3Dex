# Sequence Diagram - Wishlist

> **UML Type:** Sequence Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/sequence/commerce/sequence_wishlist.puml`

![Sequence Diagram - Wishlist](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/commerce/sequence_wishlist.png)

---

## Overview

This diagram covers two related wishlist interactions: toggling the wishlist state for a model (adding or removing it), and loading the full wishlist page.

---

## Participants

| Participant | Role |
|---|---|
| User | The authenticated user |
| Frontend | The client |
| WishlistController | Express route handler for wishlist operations |
| StorageClient (S3) | MinIO for presigning preview images |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Toggle Wishlist

The user clicks the heart icon on a model card. The Frontend calls `toggle_wishlist(model_id, session_cookie)`.

WishlistController queries `wishlist.findUnique({ user_id_model_id })` to check the current state.

**If already wishlisted (remove):**
1. `wishlist.delete({ id })`
2. Returns `{ wishlisted: false }`. The Frontend un-fills the heart icon.

**If not wishlisted (add):**
1. `wishlist.create({ user_id, model_id })`
2. Returns `{ wishlisted: true }`. The Frontend fills the heart icon.

### Part 2 - Wishlist Page

The user navigates to the Wishlist page. The Frontend calls `get_wishlist(session_cookie)`.

WishlistController queries `wishlist.findMany({ user_id })` including `model.artist` and `category`.

For each wishlist item, it calls MinIO to presign the model's `preview_url`.

WishlistController returns the signed wishlist items. The Frontend renders a grid of saved models.

---

## Key Implementation Details

- The toggle is implemented as a lookup-then-create/delete rather than a dedicated toggle endpoint, meaning the state is always read from the database (no client-side optimistic state persistence).
- The `Wishlist` table has a unique constraint on `(user_id, model_id)`, enforced at the database level.
- Wishlist entries are cascade-deleted if the underlying model is deleted.
- Wishlisting is independent of purchasing. A user can wishlist a model they already own.
