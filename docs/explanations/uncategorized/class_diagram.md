# Class Diagram

> **UML Type:** Class Diagram
> **Source:** `docs/diagrams/plant_class_diagram.puml`

![Class Diagram](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/plant_class_diagram.png)

---

## Overview

This diagram describes the full object-oriented class model of the 3Dex platform. It defines each domain entity as a class with attributes and operations, then maps the inheritance hierarchy and associations among them.

---

## Inheritance Hierarchy

All user roles extend a single base `User` class:

- **Customer** extends `User` - can shop, checkout, review, and write posts.
- **Artist** extends `User` - can upload and manage 3D models.
- **Provider** extends `User` - can manage print jobs.
- **Admin** extends `User` - can moderate content and users.

This matches the Prisma `Role` enum (`CUSTOMER`, `ARTIST`, `ADMIN`, `PROVIDER`) stored on the single `User` table.

---

## Classes

### User

The base entity for all platform actors.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| email | String | Unique login email |
| username | String | Unique handle |
| password | String | bcrypt-hashed; null for OAuth-only accounts |
| google_id | String | Unique Google OAuth subject ID |
| role | Role | One of CUSTOMER, ARTIST, PROVIDER, ADMIN |
| account_status | Account_Status | PENDING, APPROVED, REJECTED |
| status_history | Json[] | Audit trail of status changes |
| approved_at | DateTime | Timestamp of approval |
| rejected_at | DateTime | Timestamp of rejection |
| display_name | String | Public display name |
| bio | String | Profile bio |
| avatar_url | String | S3 key for avatar image |
| banner_url | String | S3 key for profile banner |
| location | String | Free-text location |
| website | String | Personal website link |
| phone_number | String | Contact number |
| addresses | Json[] | Shipping addresses array |
| portfolio | Json[] | Portfolio items for Artists/Providers |
| provider_config | Json | Print capabilities config for Providers |
| social_twitter | String | Twitter/X handle |
| social_instagram | String | Instagram handle |
| social_artstation | String | ArtStation handle |
| social_behance | String | Behance handle |
| rating | Float | Aggregate rating from User_Review records |
| review_count | Int | Total number of reviews received |
| two_factor_enabled | Boolean | 2FA preference flag |
| last_login_at | DateTime | Timestamp of most recent login |
| show_nsfw | Boolean | NSFW content visibility preference |
| dexie_enabled | Boolean | Whether Dexie AI assistant is active |
| created_at | DateTime | Account creation timestamp |
| updated_at | DateTime | Last modification timestamp |

**Operations:** `register()`, `login()`, `updateProfile()`, `changePassword()`, `deleteAccount()`

---

### Customer (extends User)

A base user who can browse, buy, and engage with content.

**Additional Operations:** `addToCart(model_id, qty)`, `checkout()`, `purchaseModel(model_id)`, `writeReview(model_id, rating)`

---

### Artist (extends User)

A creator who uploads and sells 3D models. Requires admin approval (`account_status = APPROVED`).

**Additional Operations:** `uploadModel(data)`, `updateModel(id, data)`, `deleteModel(id)`, `viewSalesStats()`

---

### Provider (extends User)

A 3D printing service provider. Also requires admin approval.

**Additional Operations:** `acceptPrintJob(order_id)`, `updatePrintStatus(order_id, status)`, `updateProviderConfig(config)`

---

### Admin (extends User)

A platform moderator with elevated privileges.

**Additional Operations:** `approveModel(id)`, `rejectModel(id)`, `approveUser(id)`, `rejectUser(id)`, `suspendUser(id)`, `generatePlatformReport()`, `viewAuditLogs()`

---

### Model

A 3D asset listed on the platform.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| title | String | Model name |
| description | String | Optional description |
| price | Int | Price in IDR; 0 for free |
| file_url | String | S3 key for the GLB/GLTF file |
| preview_url | String | S3 key for WebP preview image |
| gallery_urls | String[] | S3 keys for additional gallery images |
| status | Model_Status | PENDING, APPROVED, REJECTED |
| is_nsfw | Boolean | NSFW content flag |
| license | License_Type | PERSONAL_USE or COMMERCIAL_USE |
| is_printable | Boolean | Whether the model supports print orders |
| file_format | String | Default "glb" |
| embedding | vector | 384-dimension semantic embedding (pgvector) |
| artist_id | String | FK to User (Artist role) |
| category_id | String | FK to Category |
| avg_rating | Float | Aggregated average rating |
| review_count | Int | Number of reviews |
| created_at | DateTime | Creation timestamp |

**Operations:** `updateStatus()`, `calculateAvgRating()`, `incrementReviewCount()`

---

### Purchase

A permanent record of a user owning a model after payment.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| user_id | String | FK to User |
| model_id | String | FK to Model (nullable for deleted models) |
| price_paid | Int | Price at time of purchase in IDR |
| license | License_Type | License type at time of purchase |
| created_at | DateTime | Purchase timestamp |

**Constraint:** Unique on `(user_id, model_id)`.

---

### Category

A taxonomy grouping for models.

| Field | Type | Notes |
|---|---|---|
| id | String | UUID primary key |
| name | String | Unique display name |
| slug | String | Unique URL slug |
| created_at | DateTime | Creation timestamp |

---

### Tag

A free-form label attached to models. Many-to-many with `Model`.

| Field | Type | Notes |
|---|---|---|
| id | String | UUID primary key |
| name | String | Unique tag name |
| created_at | DateTime | Creation timestamp |

---

### Review

A model review written by a verified purchaser.

| Field | Type | Notes |
|---|---|---|
| id | String | UUID primary key |
| rating | Int | 1-5 stars |
| comment | String | Optional text |
| user_id | String | FK to User |
| model_id | String | FK to Model |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last edit timestamp |

**Constraint:** Unique on `(user_id, model_id)`.

---

### Wishlist

A saved model reference per user. Toggle-based.

| Field | Type |
|---|---|
| id | String |
| user_id | String |
| model_id | String |
| created_at | DateTime |

**Constraint:** Unique on `(user_id, model_id)`.

---

### Cart_Item

A staging area before checkout. All digital cart items have quantity 1.

| Field | Type |
|---|---|
| id | String |
| user_id | String |
| model_id | String |
| quantity | Int |
| created_at | DateTime |
| updated_at | DateTime |

**Constraint:** Unique on `(user_id, model_id)`.

---

### Order

Represents a checkout transaction, either for digital assets or print jobs.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| user_id | String | FK to User (customer) |
| provider_id | String | FK to User (Provider); null for ASSET orders |
| total_amount | Int | Total in IDR |
| status | Order_Status | PENDING, PAID, FAILED, CANCELLED |
| type | Order_Type | ASSET or PRINT_JOB |
| courier_name | String | Courier for print jobs |
| tracking_number | String | Tracking code for shipped print jobs |
| shipping_address | Json | Address JSON for print delivery |
| proof_urls | String[] | Photo evidence for shipped jobs |
| snap_token | String | Midtrans Snap token |
| snap_redirect_url | String | Midtrans redirect URL |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last modification timestamp |

---

### Order_Item

A single line within an order referencing one model.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| order_id | String | FK to Order |
| model_id | String | FK to Model (nullable if model deleted) |
| price | Int | Unit price in IDR at time of purchase |
| quantity | Int | Quantity (1 for digital, configurable for print) |
| print_config | Json | Material, infill, color, scale settings |
| print_status | Print_Status | PENDING, ACCEPTED, PROCESSING, SHIPPED, DELIVERED, CANCELLED |
| created_at | DateTime | Creation timestamp |

---

### Payment

A Midtrans transaction record linked to an order.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| order_id | String | FK to Order |
| transaction_id | String | Unique Midtrans transaction ID |
| payment_type | String | e.g. "credit_card", "gopay" |
| gross_amount | Int | Total charged in IDR |
| transaction_status | String | Midtrans status string |
| fraud_status | String | Midtrans fraud detection result |
| raw_response | Json | Full Midtrans webhook payload |
| created_at | DateTime | Webhook received timestamp |

---

### User_Review

A review of an Artist or Provider by a verified transacting user.

| Field | Type | Notes |
|---|---|---|
| id | String | UUID primary key |
| reviewer_id | String | FK to User (reviewer) |
| target_user_id | String | FK to User (artist or provider) |
| rating | Int | 1-5 stars |
| comment | String | Optional comment |
| created_at | DateTime | Creation timestamp |

**Constraint:** Unique on `(reviewer_id, target_user_id)`.

---

### Post

A community post created by Artists or Providers.

| Field | Type | Notes |
|---|---|---|
| id | String | UUID primary key |
| user_id | String | FK to User |
| caption | String | Post text |
| media_urls | String[] | S3 keys for uploaded images |
| is_nsfw | Boolean | NSFW flag |
| like_count | Int | Denormalized count |
| comment_count | Int | Denormalized count |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last edit timestamp |

---

### Post_Like

Join record between a User and a Post for the like feature.

| Field | Type |
|---|---|
| id | String |
| user_id | String |
| post_id | String |
| created_at | DateTime |

**Constraint:** Unique on `(user_id, post_id)`.

---

### Post_Comment

A text comment attached to a Post.

| Field | Type |
|---|---|
| id | String |
| user_id | String |
| post_id | String |
| content | String |
| created_at | DateTime |
| updated_at | DateTime |

---

### Stats

A periodic aggregation record created by the admin dashboard's aggregation trigger.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| period_start | DateTime | Aggregation window start |
| period_end | DateTime | Aggregation window end |
| data | Json | Aggregated metrics JSON |
| created_at | DateTime | When this record was computed |

---

### Follow

A directional social connection from one user to another.

| Field | Type |
|---|---|
| id | String |
| follower_id | String |
| following_id | String |
| created_at | DateTime |

**Constraint:** Unique on `(follower_id, following_id)`.

---

### Notification

An in-app notification record delivered to a user.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| user_id | String | FK to recipient User |
| type | String | Notification category string |
| title | String | Short heading |
| message | String | Body text |
| is_read | Boolean | Read state |
| data | Json | Optional metadata payload |
| created_at | DateTime | Delivery timestamp |

---

### Collection

A user-curated named group of models.

| Field | Type |
|---|---|
| id | String |
| user_id | String |
| name | String |
| description | String |
| is_public | Boolean |
| created_at | DateTime |
| updated_at | DateTime |

---

### Collection_Item

A join record linking a Collection to a Model.

| Field | Type |
|---|---|
| id | String |
| collection_id | String |
| model_id | String |
| added_at | DateTime |

**Constraint:** Unique on `(collection_id, model_id)`.

---

### Report

A user-submitted abuse report targeting a model, post, or comment.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| reporter_id | String | FK to User who filed the report |
| target_type | Report_Target | MODEL, POST, or COMMENT |
| model_id | String | FK to Model (optional) |
| post_id | String | FK to Post (optional) |
| comment_id | String | FK to Post_Comment (optional) |
| reason | String | Free-text reason |
| status | Report_Status | PENDING, REVIEWED, DISMISSED |
| created_at | DateTime | Submission timestamp |

---

### Admin_Audit_Log

An immutable record of every admin action taken on the platform.

| Field | Type | Description |
|---|---|---|
| id | String | UUID primary key |
| admin_id | String | FK to User (Admin role) |
| action | Audit_Action | DELETE_MODEL, DELETE_POST, DELETE_COMMENT, BAN_USER, REJECT_MODEL, REJECT_USER, APPROVE_USER, USER_STEP_DOWN |
| target_id | String | ID of the affected entity |
| target_type | String | Human-readable entity type string |
| reason | String | Mandatory justification |
| metadata | Json | Extra context (title, username, price, etc.) |
| created_at | DateTime | Action timestamp |

---

## Associations Summary

| From | Relationship | To | Notes |
|---|---|---|---|
| User | owns (composition) | Cart_Item, Wishlist, Post | Deleted when user deleted |
| Order | contains (composition) | Order_Item, Payment | Part of order |
| Post | has (composition) | Post_Like, Post_Comment | Part of post |
| Collection | contains (composition) | Collection_Item | Part of collection |
| Artist | creates | Model | One Artist, many Models |
| Category | categorizes | Model | Optional FK |
| Model | referenced in | Order_Item, Collection_Item, Review, Purchase, Wishlist, Cart_Item | Nullable after deletion |
| Customer | purchases | Purchase | |
| Customer | places | Order | |
| Provider | fulfills | Order | provider_id FK |
| User | gives / receives | User_Review | Self-referential via reviewer_id and target_user_id |
| User | follows | Follow | Directional social graph |
| User | receives | Notification | |
| User | manages | Collection | |
| User | submits | Report | |
| Admin | performs_action | Admin_Audit_Log | |
| Model | tagged_with | Tag | Many-to-many via implicit join |
