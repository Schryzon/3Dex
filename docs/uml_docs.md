# 3Dex Platform Unified UML Documentation

This document serves as the absolute single source of truth for the entire 3Dex platform's technical domain. It consolidates all use cases, actors, state machines, detailed models representing the objects in the program (including their attributes, constraints, and operational functions), and mapping the systemic relationships. 

This is designed so AI agents and architects can learn the entire system strictly through parsing this document.

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
- **System: Dēxie AI Assistant**: A passive, context-aware AI persona (powered by Gemini Flash) embedded in the platform UI. She autonomously surfaces short situational taglines and personalized model picks based on the current page and user taste signals. She can be disabled per-user via the `dexie_enabled` flag.

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

---

## 3. Core State Machines

System behavior relies on strict enumerations to define workflow progression.

### Order State Machine
Defines the lifecycle of a purchase from Cart to Delivery.
1. `PENDING`: Initial state upon Midtrans Snap generation.
2. `PAID`: Webhook received successful payment notification. Digital assets are unlocked.
3. `PROCESSING`: (If physical print) Provider has accepted the job and is printing.
4. `SHIPPED`: Provider dispatched the physical item and attached tracking info.
5. `COMPLETED`: User confirmed receipt, or 14 days passed since shipped.
6. `CANCELLED`: Payment failed, or Admin intervened.
7. `REFUNDED`: Funds returned to user.

### Model State Machine
Defines visibility and legality of a 3D asset.
1. `DRAFT`: Uploaded, metadata incomplete. Invisible to public.
2. `PENDING_REVIEW`: Submitted by Artist, awaiting Admin approval.
3. `APPROVED`: Visible on Catalog and purchasable.
4. `REJECTED`: Failed moderation. Artist must fix issues.
5. `ARCHIVED`: Soft-deleted by the Artist.
6. `TAKEDOWN`: Hard-hidden by Admin due to DMCA/ToS violations.

---

## 4. Data Models, Constraints, Attributes, & Functions

Below details exhaustive class abstractions mapping tables directly to objects containing fields, typings, keys constraints, and internal behavioral functions.

### **User** (Core Actor Model)
- **Attributes**: 
  - `id`: String (PK)
  - `email`: String (UK)
  - `username`: String (UK)
  - `password`: String
  - `google_id`: String (UK)
  - `role`: Role (`GUEST`, `CUSTOMER`, `ARTIST`, `PROVIDER`, `ADMIN`)
  - `account_status`: Account_Status (`ACTIVE`, `SUSPENDED`, `BANNED`)
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
  - `license`: License_Type (`STANDARD`, `COMMERCIAL`, `EDITORIAL`)
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

### **Order**
- **Attributes**:
  - `id`: String (PK)
  - `user_id`: String (FK)
  - `provider_id`: String (FK)
  - `total_amount`: Int
  - `status`: Order_Status
  - `type`: Order_Type (`DIGITAL`, `PRINT`)
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
- **Post_Like Attributes**: `id`: String (PK), `user_id`: String (FK), `post_id`: String (FK), `created_at`: DateTime
- **Post_Comment Attributes**: `id`: String (PK), `user_id`: String (FK), `post_id`: String (FK), `content`: String, `created_at`: DateTime, `updated_at`: DateTime

### **Platform Tools (Notification, Audit, Stats, Report)**
- **Notification Attributes**: `id`: String (PK), `user_id`: String (FK), `type`: String, `title`: String, `message`: String, `is_read`: Boolean, `data`: Json, `created_at`: DateTime
- **Report Attributes**: `id`: String (PK), `reporter_id`: String (FK), `target_type`: Report_Target, `model_id`: String, `post_id`: String, `comment_id`: String, `reason`: String, `status`: Report_Status, `created_at`: DateTime
- **Admin_Audit_Log Attributes**: `id`: String (PK), `admin_id`: String (FK), `action`: Audit_Action, `target_id`: String, `target_type`: String, `reason`: String, `metadata`: Json, `created_at`: DateTime

---

## 5. Total Complete Database Relational Entity Map
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
