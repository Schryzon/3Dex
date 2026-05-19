# Use Case Diagram

> **UML Type:** Use Case Diagram
> **Source:** `docs/diagrams/3dex-ucd.drawio.xml`

![Use Case Diagram](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/final_ucd_exported.png)

---

## Overview

This use case diagram represents the comprehensive behavioral model of the 3Dex platform. It maps the complete range of system capabilities to human and external system actors. The diagram separates functions into logical sub-domains and establishes precise `<<include>>` and `<<extend>>` relationships to represent execution logic.

---

## Actors

The 3Dex platform categorizes actors into human participants (inheriting base capabilities in a structured hierarchy) and external system components.

### Human Actors

| Actor | Description |
|---|---|
| **Guest** | An unauthenticated, anonymous visitor. Can perform base browsing activities like searching and viewing. |
| **User/Customer** | A registered, authenticated user. Serves as the base role for all active human participants. Inherits all capabilities of **Guest**. |
| **Artist** | A registered creator authorized to upload, manage, and sell 3D models. Inherits all capabilities of **User/Customer**. |
| **Provider** | A registered 3D printing service provider who handles local fabrication and delivery of print orders. Inherits all capabilities of **User/Customer**. |
| **Admin** | The system administrator who moderates content, processes applications, manages system health, and audits actions. Inherits all capabilities of **User/Customer**. |

### External & System Actors

| Actor | Type | Description |
|---|---|---|
| **> Midtrans** | External Payment Gateway | Responsible for secure transaction processing and payment status webhooks. |
| **> Dexie AI** | Gemini-powered Subsystem | Handles intelligent tagline generation and personalized recommendation queries. |
| **> Delivery service** | Logistics Gateway | Receives and updates tracking information for physical 3D print products. |
| **> Time** | Chron Scheduler | Automated timer that triggers recurring background operations (e.g., weekly best models update). |

---

## Use Cases by Domain

### Identity & Profile Management
*   **Register and authenticate**: Accessible by **Guest** to establish a new account.
*   **Login via OAuth/local**: Included in **Register and authenticate** to authenticate users via local credentials or Google OAuth.
*   **Manage user profile**: Central use case for modifying personal information.
    *   *Extensions*:
        *   **Update shipping address**: Adds physical shipping details to the user profile.
        *   **Enable 2FA security**: Activates two-factor authentication (2FA).
        *   **Sync social platform**: Connects portfolios (Behance, Artstation, Twitter, etc.).
        *   **Toggle content visibility (NFSW)**: Sets content filters.
        *   **Toggle dexie on/off**: Persists AI preferences.
        *   **Submit role application**: Allows standard customers to apply to become an Artist or Provider.

### Catalog & Discovery
*   **Search models & filters**: Allows searching via categories, pricing, and tag filters.
*   **View model details**: High-fidelity Three.js-based viewer page.
*   **Display contextual tagline**: Dynamically generates routes/headers via **> Dexie AI**. Extends **Toggle dexie on/off**.
*   **Generate personalised picks**: Taste-based recommendations using pgvector similarity. Uses **> Dexie AI** and extends **Toggle dexie on/off** and **View model details**.
*   **View best model of the week**: Highlighted showcase on the home page.

### Social & Feedback
*   **Follow/unfollow creator**: Subscribes to creators to receive feed updates.
*   **Create social feed post**: Enabled for **Artist** and **Provider** to publish updates.
*   **Like/Comment**: Allows liking and commenting on community posts.
*   **Rate counterparty**: Submits provider or artist reviews after a completed print job or model purchase.
*   **Submit review**: Submits detailed reviews for models.
*   **Report content/user**: Submits abuse or moderation reports.

### Curation & Shopping
*   **Create curated wishlist/collection**: Allows users to save models.
    *   *Includes*:
        *   **Modify collection items**: Adding or removing models from specific folders.
*   **View cart**: Interactive checkout preparation stage.
*   **Proceed to checkout**: Initiates checkout processing.
    *   *Includes*:
        *   **Verify licensing & terms**: Ensures valid license type selection (Personal vs. Commercial).
    *   *Extensions*:
        *   **Configure print materials**: Configures infill, colors, and scaling for physical 3D print requests.

### Financial & Fulfillment
*   **Proceed with payment**: Handles order creation and token acquisition via **> Midtrans**.
*   **Unlock downloads**: Grants pre-signed S3 download URLs upon verified order completion.
*   **Request earnings payout**: Enables **Artist** and **Provider** to withdraw accumulated earnings.
*   **Define print capability**: Enabled for **Provider** to manage capabilities (materials, colors, local pricing).
*   **Accept/reject incoming jobs**: Managed by **Provider** to claim print jobs.
*   **Update tracking info**: Enables **Provider** and **> Delivery service** to record shipping references.
*   **View Delivery Status**: Allows users to track physical shipping progress.
*   **View Analytics**: Allows **Artist** and **Provider** to track monthly revenues and performance.

### Administrative Operations
*   **Moderate content & user**: General content and account lifecycle moderation.
*   **Resolve abuse reports**: Reviews and closes submitted reports.
*   **Suspend malicious nodes**: Suspends offending users or bans specific items.
*   **Audit admin actions**: Records all administrative changes to an append-only ledger (`Admin_Audit_Log`).
*   **Manage platform stats**: Views system revenue and model performance snapshots.

---

## Core Relationships

### Include Relationships (`<<include>>`)

| Base Use Case | Included Use Case | Rationale |
|---|---|---|
| **Register and authenticate** | **Login via OAuth/local** | Every new registration session concludes with active authentication. |
| **Create curated wishlist/collection** | **Modify collection items** | Saving a collection implies the mandatory capacity to structure and edit its items. |
| **Upload 3D Models** | **Define licenses & pricings** | All catalog uploads must have designated licensing terms and prices. |
| **Proceed to checkout** | **Verify licensing & terms** | Checking out requires explicit acceptance of the specific license. |

### Extend Relationships (`<<extend>>`)

| Extension Use Case | Base Use Case | Extension Point / Condition |
|---|---|---|
| **Update shipping address** | **Manage user profile** | Triggered conditionally when shipping fields are populated. |
| **Enable 2FA security** | **Manage user profile** | Triggered conditionally when user toggles 2FA security. |
| **Sync social platform** | **Manage user profile** | Triggered conditionally when linking external accounts. |
| **Toggle content visibility (NFSW)** | **Manage user profile** | Triggered conditionally when editing sensitive filters. |
| **Toggle dexie on/off** | **Manage user profile** | Triggered conditionally when customising AI preferences. |
| **Submit role application** | **Manage user profile** | Triggered when a customer applies for Artist/Provider status. |
| **Configure print materials** | **Proceed to checkout** | Triggered when the checkout payload contains a physical print job. |
| **Display contextual tagline** | **Toggle dexie on/off** | Active only when the Dexie AI system toggle is set to `enabled`. |
| **Generate personalised picks** | **Toggle dexie on/off** | Active only when the Dexie AI system toggle is set to `enabled`. |
| **Generate personalised picks** | **View model details** | Triggered conditionally when displaying similarity recommendations. |

### External System Integrations

*   **Midtrans Gateway**:
    *   Invoked by **Proceed with payment** to handle transaction processing.
    *   Triggers **Unlock downloads** upon receiving a verified payment webhook.
*   **Dexie AI Gateway**:
    *   Triggers **Display contextual tagline** and **Generate personalised picks** to inject Gemini-powered recommendations into active browsing contexts.
*   **Delivery Service**:
    *   Triggers **Update tracking info** to sync physical courier status back to the order record.
*   **Time Scheduler**:
    *   Triggers **Update weekly best models** dynamically every calendar interval.
