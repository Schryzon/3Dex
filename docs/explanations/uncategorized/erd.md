# Entity Relationship Diagram

> **UML Type:** Entity Relationship Diagram (ERD)
> **Source:** `docs/diagrams/plant_erd.puml`

![Entity Relationship Diagram](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/plant_erd.png)

---

## Overview

This ERD maps the full relational structure of the 3Dex PostgreSQL database as modeled via Prisma. Every entity corresponds directly to a Prisma model in `schema.prisma`. Primary keys are UUIDs. Required fields are marked with an asterisk in the source file.

---

## Entities

### User

The single unified table for all platform actors (Customer, Artist, Provider, Admin).

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | String | PK | UUID |
| email | String | UK | Unique login email |
| username | String | UK | Unique handle |
| password | String | | Nullable for OAuth-only accounts |
| google_id | String | UK | Google OAuth subject |
| role | Role | | CUSTOMER, ARTIST, PROVIDER, ADMIN |
| account_status | Account_Status | | PENDING, APPROVED, REJECTED |
| status_history | Json[] | | Array of status change records |
| approved_at | DateTime | | |
| rejected_at | DateTime | | |
| display_name | String | | |
| bio | String | | |
| avatar_url | String | | S3 key |
| banner_url | String | | S3 key |
| location | String | | |
| website | String | | |
| phone_number | String | | |
| addresses | Json[] | | Shipping address array |
| portfolio | Json[] | | Artist/Provider portfolio |
| provider_config | Json | | Provider print capabilities |
| social_twitter | String | | |
| social_instagram | String | | |
| social_artstation | String | | |
| social_behance | String | | |
| rating | Float | | Aggregated score |
| review_count | Int | | Denormalized count |
| two_factor_enabled | Boolean | | |
| last_login_at | DateTime | | |
| show_nsfw | Boolean | | Content filter preference |
| dexie_enabled | Boolean | | Dexie AI toggle |
| created_at | DateTime | NOT NULL | |
| updated_at | DateTime | NOT NULL | Auto-managed |

---

### Model

A 3D asset uploaded by an Artist.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | String | PK | UUID |
| title | String | NOT NULL | |
| description | String | | |
| price | Int | NOT NULL | IDR; 0 = free |
| file_url | String | NOT NULL | S3 key for GLB/GLTF |
| preview_url | String | | S3 key for WebP preview |
| gallery_urls | String[] | | Additional image keys |
| status | Model_Status | | PENDING, APPROVED, REJECTED |
| is_nsfw | Boolean | | |
| license | License_Type | | PERSONAL_USE, COMMERCIAL_USE |
| is_printable | Boolean | | |
| file_format | String | | Default "glb" |
| embedding | vector | | 384-dim pgvector for semantic search |
| artist_id | String | FK -> User | Required |
| category_id | String | FK -> Category | Optional |
| avg_rating | Float | | Aggregated rating |
| review_count | Int | | Denormalized count |
| created_at | DateTime | NOT NULL | |

---

### Purchase

Immutable record created when payment is confirmed for a digital model.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| user_id | String | FK -> User |
| model_id | String | FK -> Model (nullable) |
| price_paid | Int | NOT NULL |
| license | License_Type | NOT NULL |
| created_at | DateTime | NOT NULL |

**Unique:** `(user_id, model_id)`

---

### Category

A top-level taxonomy for models.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| name | String | UK |
| slug | String | UK |
| created_at | DateTime | NOT NULL |

---

### Tag

A label for filtering and semantic grouping.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| name | String | UK |
| created_at | DateTime | NOT NULL |

---

### Review

A star rating and optional comment left by a purchaser.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| rating | Int | NOT NULL |
| comment | String | |
| user_id | String | FK -> User |
| model_id | String | FK -> Model |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

**Unique:** `(user_id, model_id)`

---

### Wishlist

A saved reference to a model.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| user_id | String | FK -> User |
| model_id | String | FK -> Model |
| created_at | DateTime | NOT NULL |

**Unique:** `(user_id, model_id)`

---

### Cart_Item

A model staged for checkout.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| user_id | String | FK -> User |
| model_id | String | FK -> Model |
| quantity | Int | NOT NULL |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

**Unique:** `(user_id, model_id)`

---

### Order

An order for digital assets or a 3D print job.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | String | PK | UUID |
| user_id | String | FK -> User | Buyer |
| provider_id | String | FK -> User | Provider; null for ASSET orders |
| total_amount | Int | NOT NULL | IDR |
| status | Order_Status | NOT NULL | PENDING, PAID, FAILED, CANCELLED |
| type | Order_Type | NOT NULL | ASSET or PRINT_JOB |
| courier_name | String | | Print orders only |
| tracking_number | String | | Print orders only |
| shipping_address | Json | | Print orders only |
| proof_urls | String[] | | Photo proofs for shipped jobs |
| snap_token | String | | Midtrans token |
| snap_redirect_url | String | | Midtrans redirect |
| created_at | DateTime | NOT NULL | |
| updated_at | DateTime | NOT NULL | |

---

### Order_Item

A single line item within an order.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | String | PK | UUID |
| order_id | String | FK -> Order | |
| model_id | String | FK -> Model | Nullable if model deleted |
| price | Int | NOT NULL | IDR at time of purchase |
| quantity | Int | NOT NULL | |
| print_config | Json | | Material, color, infill settings |
| print_status | Print_Status | NOT NULL | PENDING through DELIVERED |
| created_at | DateTime | NOT NULL | |

---

### Payment

A Midtrans transaction record.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| order_id | String | FK -> Order |
| transaction_id | String | UK |
| payment_type | String | NOT NULL |
| gross_amount | Int | NOT NULL |
| transaction_status | String | NOT NULL |
| fraud_status | String | |
| raw_response | Json | |
| created_at | DateTime | NOT NULL |

---

### User_Review

A rating of an Artist or Provider by a verified customer.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| reviewer_id | String | FK -> User |
| target_user_id | String | FK -> User |
| rating | Int | NOT NULL |
| comment | String | |
| created_at | DateTime | NOT NULL |

**Unique:** `(reviewer_id, target_user_id)`

---

### Post

A community post with images and an optional caption.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| user_id | String | FK -> User |
| caption | String | |
| media_urls | String[] | |
| is_nsfw | Boolean | |
| like_count | Int | NOT NULL |
| comment_count | Int | NOT NULL |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

---

### Post_Like

Join table for the like relationship.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| user_id | String | FK -> User |
| post_id | String | FK -> Post |
| created_at | DateTime | NOT NULL |

**Unique:** `(user_id, post_id)`

---

### Post_Comment

A text comment on a post.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| user_id | String | FK -> User |
| post_id | String | FK -> Post |
| content | String | NOT NULL |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

---

### Stats

A point-in-time aggregation snapshot.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| period_start | DateTime | NOT NULL |
| period_end | DateTime | NOT NULL |
| data | Json | NOT NULL |
| created_at | DateTime | NOT NULL |

---

### Follow

A directed edge in the social graph.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| follower_id | String | FK -> User |
| following_id | String | FK -> User |
| created_at | DateTime | NOT NULL |

**Unique:** `(follower_id, following_id)`

---

### Notification

An in-app notification pushed to a user.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| user_id | String | FK -> User |
| type | String | NOT NULL |
| title | String | NOT NULL |
| message | String | NOT NULL |
| is_read | Boolean | NOT NULL |
| data | Json | |
| created_at | DateTime | NOT NULL |

---

### Collection

A named list of models curated by a user.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| user_id | String | FK -> User |
| name | String | NOT NULL |
| description | String | |
| is_public | Boolean | NOT NULL |
| created_at | DateTime | NOT NULL |
| updated_at | DateTime | NOT NULL |

---

### Collection_Item

Many-to-many join between Collection and Model.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| collection_id | String | FK -> Collection |
| model_id | String | FK -> Model |
| added_at | DateTime | NOT NULL |

**Unique:** `(collection_id, model_id)`

---

### Report

An abuse report submitted by a user.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| reporter_id | String | FK -> User |
| target_type | Report_Target | NOT NULL |
| model_id | String | FK -> Model (optional) |
| post_id | String | FK -> Post (optional) |
| comment_id | String | FK -> Post_Comment (optional) |
| reason | String | NOT NULL |
| status | Report_Status | NOT NULL |
| created_at | DateTime | NOT NULL |

---

### Admin_Audit_Log

An append-only record of every admin action.

| Column | Type | Constraint |
|---|---|---|
| id | String | PK |
| admin_id | String | FK -> User |
| action | Audit_Action | NOT NULL |
| target_id | String | |
| target_type | String | |
| reason | String | |
| metadata | Json | |
| created_at | DateTime | NOT NULL |

---

## Relationship Summary

| Table A | Cardinality | Table B | Via |
|---|---|---|---|
| User | 1 to many | Model | artist_id |
| User | 1 to many | Purchase | user_id |
| User | 1 to many | Review | user_id |
| User | 1 to many | Wishlist | user_id |
| User | 1 to many | Cart_Item | user_id |
| User | 1 to many | Order | user_id (customer) |
| User | 1 to many | Order | provider_id (provider) |
| User | many to many | User_Review | reviewer_id and target_user_id |
| User | 1 to many | Post | user_id |
| User | 1 to many | Post_Like | user_id |
| User | 1 to many | Post_Comment | user_id |
| User | many to many | Follow | follower_id and following_id |
| User | 1 to many | Notification | user_id |
| User | 1 to many | Collection | user_id |
| User | 1 to many | Report | reporter_id |
| User | 1 to many | Admin_Audit_Log | admin_id |
| Model | many to 1 | Category | category_id |
| Model | many to many | Tag | implicit join table |
| Model | 1 to many | Purchase | model_id |
| Model | 1 to many | Review | model_id |
| Model | 1 to many | Wishlist | model_id |
| Model | 1 to many | Cart_Item | model_id |
| Model | 1 to many | Order_Item | model_id |
| Model | 1 to many | Collection_Item | model_id |
| Order | 1 to many | Order_Item | order_id |
| Order | 1 to many | Payment | order_id |
| Post | 1 to many | Post_Like | post_id |
| Post | 1 to many | Post_Comment | post_id |
| Collection | 1 to many | Collection_Item | collection_id |
