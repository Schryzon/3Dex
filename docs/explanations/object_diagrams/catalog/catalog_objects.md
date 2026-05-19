# Object Diagram - Catalog Context

> **UML Type:** Object Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/objects/catalog/catalog_objects.puml`

![Object Diagram - Catalog Context](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/objects/catalog/catalog_objects.png)

---

## Overview

This object diagram represents the runtime state of the catalog domain. It shows a specific 3D model instance linked to its creator (Artist), its category, and its tags.

---

## Objects

### cyber_artist : Artist

The creator of the featured model.

| Attribute | Value |
|---|---|
| id | "usr_artist_1" |
| username | "CyberCrafter" |
| role | "Artist" |

---

### cat_scifi : Category

The category the model belongs to.

| Attribute | Value |
|---|---|
| id | "cat_001" |
| name | "Sci-Fi" |
| slug | "sci-fi" |

---

### tag_cyberpunk : Tag

A descriptive tag applied to the model.

| Attribute | Value |
|---|---|
| id | "tag_001" |
| name | "Cyberpunk" |

---

### tag_helmet : Tag

A second descriptive tag applied to the model.

| Attribute | Value |
|---|---|
| id | "tag_002" |
| name | "Helmet" |

---

### cyber_helmet : Model

The 3D model at the centre of this snapshot.

| Attribute | Value |
|---|---|
| id | "mdl_helm_99" |
| title | "Cyberpunk Helmet 3D" |
| price | 2500 (IDR) |
| status | "Approved" (Model_Status.APPROVED) |
| is_printable | true |
| file_format | "STL" |
| avg_rating | 4.8 |
| review_count | 15 |

> Note: The file_format field shows "STL" in this object diagram. The Prisma schema defaults to "glb" for uploaded models. This is technically inconsistent - the system accepts GLB/GLTF files via the upload flow. STL would need explicit handling.

---

## Relationships

| From | Relationship | To |
|---|---|---|
| cyber_artist | creates | cyber_helmet |
| cat_scifi | categorizes | cyber_helmet |
| cyber_helmet | tagged_with | tag_cyberpunk |
| cyber_helmet | tagged_with | tag_helmet |

> The `categorizes` link is represented with an aggregation (open diamond) notation indicating that a Category can exist without any models. The `creates` link is a directed association from Artist to Model. Tags are connected via a many-to-many implicit join table managed by Prisma.

---

## System Behavior Notes

- The `status = "Approved"` state means this model is publicly visible in the catalog to non-admin users.
- The `avg_rating` and `review_count` are denormalized fields updated after each review submission by aggregating the `Review` table.
- The `is_printable = true` flag makes this model available for selection in the Print Order flow.
