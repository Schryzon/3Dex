# Object Diagram - Commerce Context

> **UML Type:** Object Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/objects/commerce/commerce_objects.puml`

![Object Diagram - Commerce Context](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/objects/commerce/commerce_objects.png)

---

## Overview

This object diagram shows a runtime snapshot of the commerce domain. It models a customer's cart, wishlist, collection, and completed purchase for a single model.

---

## Objects

### alice_buyer : Customer

The purchasing user.

| Attribute | Value |
|---|---|
| id | "usr_cust_2" |
| username | "Alice3D" |

---

### cyber_helmet : Model

The 3D model in question.

| Attribute | Value |
|---|---|
| id | "mdl_helm_99" |
| price | 2500 (IDR) |

---

### cart_item_01 : Cart_Item

A cart entry for the model.

| Attribute | Value |
|---|---|
| id | "cart_123" |
| quantity | 2 |

> Note: The diagram shows quantity = 2. In the real system, the cart normalization logic forces quantity = 1 for all digital models (`cart_Item.updateMany` sets quantity to 1 on every cart fetch). This object is a conceptual representation.

---

### wishlist_01 : Wishlist

A wishlist entry for the model.

| Attribute | Value |
|---|---|
| id | "wish_456" |

---

### collection_01 : Collection

A named collection owned by the customer.

| Attribute | Value |
|---|---|
| id | "col_111" |
| name | "Favorite Sci-Fi Props" |

---

### col_item_01 : Collection_Item

The join record linking the collection to the model.

| Attribute | Value |
|---|---|
| id | "citem_222" |

---

### purchase_01 : Purchase

The confirmed purchase record created after payment success.

| Attribute | Value |
|---|---|
| id | "pur_101" |
| price_paid | 2500 (IDR) |
| license | "Personal" (License_Type.PERSONAL_USE) |

---

## Relationships

| From | Relationship | To | Description |
|---|---|---|---|
| alice_buyer | owns (composition) | cart_item_01 | Cart item belongs to customer |
| cart_item_01 | in cart | cyber_helmet | Model referenced in cart |
| alice_buyer | owns (composition) | wishlist_01 | Wishlist entry belongs to customer |
| wishlist_01 | in wishlist | cyber_helmet | Model saved to wishlist |
| alice_buyer | manages | collection_01 | Customer owns the collection |
| collection_01 | contains (composition) | col_item_01 | Collection item belongs to collection |
| col_item_01 | referenced in | cyber_helmet | Model referenced in collection |
| alice_buyer | purchases | purchase_01 | Confirmed ownership record |
| purchase_01 | has | cyber_helmet | Purchase links to the model |

---

## System Behavior Notes

- In the real system, a user can simultaneously have a model in their wishlist, cart, collection, and purchase records. These are four independent tables in Prisma.
- The `Purchase` record is only created by the Midtrans webhook handler after `transaction_status = "settlement"`. A cart item alone does not mean the user owns the model.
- The `Collection_Item` is deleted via CASCADE if either the parent `Collection` or the referenced `Model` is deleted.
- The `Wishlist` entry is similarly CASCADE-deleted if the model is deleted.
