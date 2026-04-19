# 3Dex Platform Unified UML Documentation

This document serves as the absolute single source of truth for the entire 3Dex platform's technical domain. It consolidates all use cases, actors, detailed models representing the objects in the program (including their attributes, constraints, and operational functions), and mapping the systemic relationships. This is designed so AI agents and architects can learn the entire system strictly through parsing this document.

---

## 1. Actors & Systems Overview

### Human Actors
- **Guest**: Unregistered user who views models and browses the platform.
- **Customer (Inherits Guest)**: Authenticated user capable of buying, saving, adding items to cart, and interacting with features.
- **Artist (Inherits Customer)**: Producer and seller capable of uploading models and defining pricing/licenses.
- **Provider (Inherits Customer)**: Capable of fulfilling specialized 3D print orders.
- **Admin (Inherits Customer)**: Platform administrator capable of content moderation, audit logging, system controls, and banning malicious actors.

### Automated/System Actors
- **System: Midtrans (Gateway)**: External payment processor reacting to payment and processing requests.
- **System: Notif Engine (Notif)**: Handles global dispatching of alerts and updates across the platform.
- **Time / Cron Scheduler (Time)**: Daemon agent executing operations at chronological intervals.
- **System: Dēxie AI Assistant**: A passive, context-aware AI persona (powered by Gemini Flash) embedded in the platform UI. She is **NOT a chatbot** — she never accepts user input. Instead, she autonomously surfaces short situational taglines and personalized model picks based on the current page and user taste signals. She can be disabled per-user via the `dexie_enabled` flag.

---

## 2. Complete List of Use Cases

### Authentication & Security Phase
- **Register & Authenticate**: Guest initiates registration or login.
- **Login via OAuth/Local**: Method of entering the system via Google or Local credentials. *(Included by Register & Authenticate)*
- **Enable 2FA Security**: Two-Factor Authentication provisioning for added account safety. *(Extends Manage User Profile)*

### User Profile Management
- **Manage User Profile & Bio**: Modify primary user display data and biographies.
- **Update Shipping Addresses**: Add or modify JSON serialized addresses logic for orders. *(Extends Profile Management)*
- **Toggle Content Visibility (NSFW)**: Allows user to show or hide not-safe-for-work elements globally. *(Extends Profile Management)*
- **Sync Social Portfolios**: Attaching ArtStation, Twitter, Behance, and Instagram logic to their account. *(Extends Profile Management)*

### Core Browsing & Engagement
- **Search Models & Filter**: Core capability for querying platform catalog elements by guest or logged users.
- **Interact with 3D Viewer**: Engaging with the core Three.js WebGL canvas to view assets.

### Inventory, Wishlist & Collections
- **Manage Wishlist**: Add/removes models for future consideration.
- **Create Curated Collections**: Building specialized folders with custom naming to store group of models.
- **Modify Collection Items**: Adding or removing models referenced in curated groups. *(Included by Create Collections)*

### E-Commerce & Post-Purchase Order Flow
- **Assemble Cart**: Queueing models into checkout lists.
- **Configure Print Materials (Specs)**: Provide instructions if the user opts for physical printing requests.
- **Proceed to Universal Checkout**: Submitting cart lists to Midtrans. *(Extends Assemble Cart)*
- **Verify Licensing & Terms**: Asserting rules surrounding legal usage of models. *(Included by Proceed Checkout)*
- **Process Webhook Payments**: Responding to remote Midtrans signals.
- **Unlock Digital Downloads**: Emitting encrypted/access-tokenized URLs back to the customer upon full transaction.

### Social Networking Activities
- **Follow / Unfollow Creator**: Registering relationship edges mapping social ties between accounts.
- **Create Social Feed Post**: Allow members to stream updates, thoughts, images, onto social feed modules.
- **Like a Social Post**: Mutating upvote arrays related to social feeds. *(Extends Create Social Feed Post)*
- **Comment on a Post**: Attaching text messages related to posts. *(Extends Create Social Feed Post)*

### Trust & Safety Actions
- **Submit Model Review**: Quantifying satisfaction scores (1-5) and textual complaints/praises on 3D objects.
- **Submit User/Provider Rating**: Peer-to-peer reputation mechanisms.
- **Report Suspect Content/User**: Submitting URLs, posts, models, and notes targeting potentially violative acts logic.

### Role-Specific Operations
- **Artist:**
  - **Upload 3D Models**: Placing data onto specialized blob storage. *(Includes Define Dual Licenses & Pricings)*
  - **Define Dual Licenses & Pricings**: Splitting monetary rates into Private/Commercial groups.
  - **Request Earning Payouts**: Cashing out accrued balance ledgers to local accounts.
- **Provider:**
  - **Accept/Reject Incoming Jobs**: Responding to newly spawned physical print tasks.
  - **Define Print Capability Configs**: Storing limits, types of material they can extrude.
  - **Update Courier & Tracking Info**: Writing dispatch coordinates/shipping data back to orders.
- **Admin:**
  - **Moderate Content & Users (Approve/Reject)**: Gatekeeping uploaded models or requested users who wish to transition scopes.
  - **Resolve Abuse Reports**: Processing Trust & Safety tickets.
  - **Ban/Suspend Malicious Nodes**: Striking account statuses to disconnected.
  - **View & Audit Admin Actions**: Exploring logs on `Admin_Audit_Log` mapping tracking all destructive capabilities globally.
  - **Export System Revenue Stats**: Reading global chronological money trails.

### Automated System Operations
- **Compile Global Aggregated Stats**: Aggregating sales metrics per defined timeline blocks.
- **Prune Abandoned Webhooks/Carts**: Dropping pending or expired snap tokens that polluted disk storage.
- **Recalculate Averages from Reviews**: Dynamically recalculating total score sums vs participants to ensure normalized ranges.
- **Dispatch In-App/Email Alerts**: Transforming state changes into human-readable notifications metrics via trigger webhooks.

### Dēxie AI Ecosystem
- **Surface Contextual Tagline** *(Triggered automatically on page navigation)*: On navigating to a supported route (home, cart, wishlist, catalog detail, artist profile, library), the system calls `GET /dexie/tagline?ctx=<ctx>&tag=<id>`. Dēxie generates a short 2-3 sentence punchy situational message via Gemini Flash, keyed to the current context. Responses are cached per-user (1 hour) and globally for non-personalized contexts (6 hours) and deduplicated within a session. Returns `enabled: false` silently if the user has toggled Dēxie off. Fallback messages are served on Gemini 503s.
- **Serve Personalised Picks (Taste-based)** *(Triggered on homepage / browse pages)*: `GET /dexie/picks` aggregates the user's last 5 wishlist items and last 5 purchases, concatenates their titles, tags, and categories into a combined string, embeds it via `all-MiniLM-L6-v2` (vector(384)), and runs a cosine similarity search against the Model table's `embedding` column to return the top N similar models not already owned. Guests fall back to newest approved models.
- **Toggle Dēxie On/Off** *(User action)*: `PATCH /dexie/toggle` with `{ enabled: boolean }` (requires auth) updates the `dexie_enabled` flag on the User record. When disabled, all tagline and picks endpoints return `{ enabled: false }` and the frontend hides the assistant entirely.

---

## 3. Data Models, Constraints, Attributes, & Functions

Below details exhaustive class abstractions mapping tables directly to objects containing fields, typings, keys constraints, and internal behavioral functions.

### **User** (Core Actor Model)
- **Attributes**: 
  - `id`: String (PK)
  - `email`: String (UK)
  - `username`: String (UK)
  - `password`: String
  - `google_id`: String (UK)
  - `role`: Role 
  - `account_status`: Account_Status
  - `status_history`: Json[]
  - `approved_at`: DateTime
  - `rejected_at`: DateTime
  - `display_name`: String
  - `bio`: String
  - `avatar_url`: String
  - `banner_url`: String
  - `location`: String
  - `website`: String
  - `phone_number`: String
  - `addresses`: Json[]
  - `portfolio`: Json[]
  - `provider_config`: Json
  - `social_twitter`: String
  - `social_instagram`: String
  - `social_artstation`: String
  - `social_behance`: String
  - `rating`: Float
  - `review_count`: Int
  - `two_factor_enabled`: Boolean
  - `last_login_at`: DateTime
  - `show_nsfw`: Boolean
  - `dexie_enabled`: Boolean
  - `created_at`: DateTime
  - `updated_at`: DateTime
- **Functions**:
  - `register()`
  - `login()`
  - `updateProfile(data: User)`
  - `changePassword(new_password: String)`
  - `deleteAccount()`

### **Customer** (Extends User)
- **Functions**:
  - `addToCart(model_id: String, qty: Int)`
  - `checkout()`
  - `purchaseModel(model_id: String)`
  - `writeReview(model_id: String, rating: Int)`

### **Artist** (Extends User)
- **Functions**:
  - `uploadModel(data: Model)`
  - `updateModel(id: String, data: Model)`
  - `deleteModel(id: String)`
  - `viewSalesStats()`

### **Provider** (Extends User)
- **Functions**:
  - `acceptPrintJob(order_id: String)`
  - `updatePrintStatus(order_id: String, status: Print_Status)`
  - `updateProviderConfig(config: Json)`

### **Admin** (Extends User)
- **Functions**:
  - `approveModel(id: String)`
  - `rejectModel(id: String)`
  - `approveUser(id: String)`
  - `rejectUser(id: String)`
  - `suspendUser(id: String)`
  - `generatePlatformReport()`
  - `viewAuditLogs()`

### **Model** (3D Asset Node)
- **Attributes**:
  - `id`: String (PK)
  - `title`: String
  - `description`: String
  - `price`: Int
  - `file_url`: String
  - `preview_url`: String
  - `gallery_urls`: String[]
  - `status`: Model_Status
  - `is_nsfw`: Boolean
  - `license`: License_Type
  - `is_printable`: Boolean
  - `file_format`: String
  - `embedding`: Unsupported("vector(384)")
  - `artist_id`: String (FK)
  - `category_id`: String (FK)
  - `avg_rating`: Float
  - `review_count`: Int
  - `created_at`: DateTime
- **Functions**:
  - `updateStatus(status: Model_Status)`
  - `calculateAvgRating(): Float`
  - `incrementReviewCount()`

### **Purchase**
- **Attributes**:
  - `id`: String (PK)
  - `user_id`: String (FK)
  - `model_id`: String (FK)
  - `price_paid`: Int
  - `license`: License_Type
  - `created_at`: DateTime
- **Functions**:
  - `verifyLicense(license: License_Type): Boolean`

### **Category & Tag**
- **Category Attributes**: `id`: String (PK), `name`: String (UK), `slug`: String (UK), `created_at`: DateTime
- **Tag Attributes**: `id`: String (PK), `name`: String (UK), `created_at`: DateTime

### **Review**
- **Attributes**:
  - `id`: String (PK)
  - `rating`: Int
  - `comment`: String
  - `user_id`: String (FK)
  - `model_id`: String (FK)
  - `created_at`: DateTime
  - `updated_at`: DateTime
- **Functions**:
  - `updateComment(content: String)`

### **Wishlist & Cart_Item**
- **Wishlist Attributes**: `id`: String (PK), `user_id`: String (FK), `model_id`: String (FK), `created_at`: DateTime 
  - **Functions**: `moveToCart()`
- **Cart_Item Attributes**: `id`: String (PK), `user_id`: String (FK), `model_id`: String (FK), `quantity`: Int, `created_at`: DateTime, `updated_at`: DateTime
  - **Functions**: `updateQuantity(qty: Int)`

### **Order**
- **Attributes**:
  - `id`: String (PK)
  - `user_id`: String (FK)
  - `provider_id`: String (FK)
  - `total_amount`: Int
  - `status`: Order_Status
  - `type`: Order_Type
  - `courier_name`: String
  - `tracking_number`: String
  - `shipping_address`: Json
  - `proof_urls`: String[]
  - `snap_token`: String
  - `snap_redirect_url`: String
  - `created_at`: DateTime
  - `updated_at`: DateTime
- **Functions**:
  - `calculateTotal()`
  - `updateStatus(status: Order_Status)`
  - `generateSnapToken()`

### **Order_Item**
- **Attributes**:
  - `id`: String (PK)
  - `order_id`: String (FK)
  - `model_id`: String (FK)
  - `price`: Int
  - `quantity`: Int
  - `print_config`: Json
  - `print_status`: Print_Status
  - `created_at`: DateTime
- **Functions**:
  - `updatePrintConfig(config: Json)`

### **Payment**
- **Attributes**:
  - `id`: String (PK)
  - `order_id`: String (FK)
  - `transaction_id`: String (UK)
  - `payment_type`: String
  - `gross_amount`: Int
  - `transaction_status`: String
  - `fraud_status`: String
  - `raw_response`: Json
  - `created_at`: DateTime
- **Functions**:
  - `processTransaction()`
  - `verifyFraudStatus()`
  - `refund()`

### **Social & Feed Structures (Post, Post_Like, Post_Comment)**
- **Post Attributes**: `id`: String (PK), `user_id`: String (FK), `caption`: String, `media_urls`: String[], `is_nsfw`: Boolean, `like_count`: Int, `comment_count`: Int, `created_at`: DateTime, `updated_at`: DateTime
  - **Functions**: `addLike()`, `removeLike()`, `addComment(content: String)`
- **Post_Like Attributes**: `id`: String (PK), `user_id`: String (FK), `post_id`: String (FK), `created_at`: DateTime
- **Post_Comment Attributes**: `id`: String (PK), `user_id`: String (FK), `post_id`: String (FK), `content`: String, `created_at`: DateTime, `updated_at`: DateTime
  - **Functions**: `editContent(content: String)`

### **Relationships Structures (User_Review, Follow, Collection, Collection_Item)**
- **User_Review Attributes**: `id`: String, `reviewer_id`: String, `target_user_id`: String, `rating`: Int, `comment`: String, `created_at`: DateTime
  - **Functions**: `updateReviewData(rating: Int, comment: String)`
- **Follow Attributes**: `id`: String, `follower_id`: String, `following_id`: String, `created_at`: DateTime
- **Collection Attributes**: `id`: String (PK), `user_id`: String (FK), `name`: String, `description`: String, `is_public`: Boolean, `created_at`: DateTime, `updated_at`: DateTime
  - **Functions**: `addItem(model_id: String)`, `removeItem(model_id: String)`
- **Collection_Item Attributes**: `id`: String (PK), `collection_id`: String (FK), `model_id`: String (FK), `added_at`: DateTime

### **Platform Tools (Notification, Audit, Stats, Report)**
- **Notification Attributes**: `id`: String (PK), `user_id`: String (FK), `type`: String, `title`: String, `message`: String, `is_read`: Boolean, `data`: Json, `created_at`: DateTime
  - **Functions**: `markAsRead()`
- **Report Attributes**: `id`: String (PK), `reporter_id`: String (FK), `target_type`: Report_Target, `model_id`: String, `post_id`: String, `comment_id`: String, `reason`: String, `status`: Report_Status, `created_at`: DateTime
  - **Functions**: `reviewReport(status: Report_Status)`
- **Admin_Audit_Log Attributes**: `id`: String (PK), `admin_id`: String (FK), `action`: Audit_Action, `target_id`: String, `target_type`: String, `reason`: String, `metadata`: Json, `created_at`: DateTime
- **Stats Attributes**: `id`: String (PK), `period_start`: DateTime, `period_end`: DateTime, `data`: Json, `created_at`: DateTime
  - **Functions**: `triggerAggregation()`


---

## 4. Total Complete Database Relational Entity Map
The total relational map describing structural ties between models universally:
- **User ||--o{ Model**: User creates multiple models (Artist).
- **User ||--o{ Purchase**: User performs purchases.
- **User ||--o{ Review**: User writes model reviews.
- **User ||--o{ Wishlist**: User tags item to wishlist.
- **User ||--o{ Cart_Item**: User groups items in cart.
- **User ||--o{ Order**: User creates orders (Customer context).
- **User ||--o{ Order**: User fulfills orders (Provider context).
- **User ||--o{ User_Review**: User reviews another user & mapping to being reviewed.
- **User ||--o{ Post**: User drives posts onto social feed.
- **User ||--o{ Post_Like**: User casts likes.
- **User ||--o{ Post_Comment**: User comments on threads.
- **User ||--o{ Follow**: Connects source follower to target following edges.
- **User ||--o{ Notification**: Maps alerts sent directly to users inbox.
- **User ||--o{ Collection**: User manages curations.
- **User ||--o{ Report**: User generates legal reports.
- **User ||--o{ Admin_Audit_Log**: User (Admin) executes sensitive logged mutations.

- **Model }o--|| Category**: Models are partitioned strictly within exact category.
- **Model }o--o{ Tag**: Models are attached multiple freeform tags.
- **Model ||--o{ Purchase**: Model records references across purchases.
- **Model ||--o{ Review**: Model fetches its review comments.
- **Model ||--o{ Wishlist**: Model is tracked by user wishlists.
- **Model ||--o{ Cart_Item**: Model operates locally dynamically in carts.
- **Model ||--o{ Order_Item**: Represents snapshot state mapping a Model per row in active Order.
- **Model ||--o{ Collection_Item**: Model acts functionally grouped via proxy items in an active Collection.

- **Order ||--|{ Order_Item**: A transaction sequence owns one or dozens of items.
- **Order ||--|{ Payment**: Tracking Gateway transactions mapped precisely against the Order entity.

- **Post ||--o{ Post_Like**: Maps likes natively onto a post root.
- **Post |o--o{ Post_Comment**: Trees of text tied sequentially backward towards a source Post instance.

- **Collection ||--|{ Collection_Item**: Maps explicit inclusion rules linking abstract lists back into precise `model_id` pointers.
