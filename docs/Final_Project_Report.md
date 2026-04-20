<div align="center">

# FINAL PROJECT 
# SOFTWARE ENGINEERING

## 3Dēx: Online Community-Driven 3D Model Marketplace to Streamline Digital-to-Physical Production

**Lecturer: Nadiyasari Agitha, S.Kom., M.MT.**

**By:**

**I Nyoman Widiyasa Jayananda (F1D02410053)**

**I Kadek Mahesa Permana Putra (F1D02410052)**

**Thoriq Abdillah Falian Kusuma (F1D02410098)**

### DEPARTMENT OF INFORMATICS ENGINEERING
### FACULTY OF ENGINEERING
### UNIVERSITY OF MATARAM
### 2026

</div>

---

## PREFACE
Praise and gratitude are extended to God Almighty for his blessings and grace, which have enabled the authors to complete this final project report entitled “3Dēx: Online Community-Driven 3D Model Marketplace to Streamline Digital-to-Physical Production” successfully. This report is written with the aim of providing an innovative solution for the development of a system that facilitates the buying and selling of 3D models through a community-driven platform, while also supporting a more efficient transition from digital designs to physical production.

On this occasion, the authors would like to express their sincere gratitude to the lecturer of the Software Engineering course for assigning this project. The authors also extend their appreciation to all parties who have contributed and provided support in the preparation of this report.

It is hoped that this final project report will provide valuable benefits and make a positive contribution to the advancement of information technology, particularly in the field of education.

Mataram, April 20th 2026

The Authors

---

## CHAPTER I: INTRODUCTION

### 1.1 Background
The rapid evolution of computer graphics and 3D modeling has revolutionized numerous industries, including gaming, animation, architectural visualization, and manufacturing. Concurrently, the advent of affordable 3D printing technology has significantly narrowed the gap between digital ideation and physical realization [2]. Despite these advancements, a prominent challenge persists within the creator economy: the ecosystem remains fragmented.

Digital artists and 3D modelers often struggle to find unified platforms that support both the monetization of their digital assets and the direct bridging to physical production services. Consumers wishing to print a purchased 3D asset face unnecessary friction in locating reliable, local printing providers capable of handling specific material configurations. Thus, building a consolidated web marketplace capable of rendering complex 3D assets in-browser using WebGL [7] while intelligently matching clients with manufacturing providers has become highly necessary. 

### 1.2 Problem Identification
1. **Fragmented Creator Pipelines**: Artists must currently utilize disparate platforms to sell digital models, build social portfolios, and offer physical rendering/printing services.
2. **Lack of Digital-to-Physical Integration**: Consumers face technical and logistical hurdles when attempting to translate purchased digital assets into physical prints without owning 3D printing hardware.
3. **Limited Interactive Previews**: Traditional 3D marketplaces rely heavily on pre-rendered 2D images. Consumers lack the ability to inspect volumetric topological data in real-time before finalizing purchases.
4. **Poor Contextual Assistance**: Users browsing massive repositories of 3D assets often suffer from decision fatigue and require intelligent filtering and taste-based recommendation systems.

### 1.3 Problem Statement
Based on the identified problems, the core problem statement is: 
*"How to design, develop, and integrate an online, community-driven 3D model marketplace (3Dēx) that seamlessly combines digital asset trading with centralized, physical 3D printing service fulfillment while leveraging contextual AI to enhance user experience?"*

### 1.4 Objectives
The primary objectives of this project are:
1. To develop a robust full-stack web application (3Dēx) that serves multiple target actors, including Guests, Customers, Artists, Providers, and Administrators.
2. To implement a high-performance, client-side WebGL viewer that safely renders physical assets inside the browser [2].
3. To architect an automated e-commerce flow bridging digital sales and physical printing tasks, backed by secure payment gateways [5] and cloud storage [4].
4. To integrate a context-aware Artificial Intelligence assistant (Dēxie) capable of offering situational metadata and personalized model recommendations [6].

### 1.5 Solution
The proposed solution is the execution of the 3Dēx platform. Key features designed to solve the problem statement include:
- **Interactive 3D Services Marketplace:** Bridging print service Providers and digital Artists structurally within the same cart and order mechanisms.
- **Client-Side 3D Previews:** Built on Three.js [2], allowing immersive model inspection.
- **Unified Library & Community Hub:** Fostering community through integrated social networking feeds, collections, dynamic user profiles, and portfolio sharing.
- **Order Management & Transactions:** Safe escrow structures connecting End Users, Artists, Midtrans payment systems [5], and physical delivery couriers in real-time.
- **Dēxie AI Ecosystem:** An integrated Google Gemini-powered [6] mechanism passively aiding user navigation.

### 1.6 Methodology Planning
The development of 3Dēx was executed using a high-velocity hybrid framework combining **Agile Scrum**, **DevOps CI/CD**, and **Agentic AI Augmentation (4GT/5GT)**. The project lifecycle spanned exactly 106 days, meticulously tracked across 200+ git commits.

#### 1.6.1 Agile Sprint Lifecycle (Git-Verified)
The project was structured into five distinct sprints, mapping the transition from a repository skeleton to a production-ready marketplace.

| Sprint | Timeline | Key Milestones | Commit-Backed Deliverables |
| :--- | :--- | :--- | :--- |
| **S1** | Jan 05 – Jan 25 | Foundation & Identity | Express Skeleton, OAuth 2.0, Prisma ORM Init |
| **S2** | Jan 26 – Feb 15 | Asset Management | MinIO S3 integration, Model CRUD, User Profiles |
| **S3** | Feb 16 – Mar 08 | Frontend Immersion | Three.js WebGL Engine, Social Feed, Notify System |
| **S4** | Mar 09 – Mar 29 | Finance & Moderation | Midtrans Snap, Orders, Admin Moderation Tools |
| **S5** | Mar 30 – Apr 20 | Platform Maturity | Dēxie AI (Gemini 3), Dockerization, Railway CI/CD |

#### 1.6.2 Agentic AI Ecosystem (4GT & 5GT)
Traditional development was accelerated by a multi-model 5th Generation Technique (5GT) stack, leveraging autonomous agentic pairing for complex architecture and declarative generation.

| Generation | Tooling/Model | Role in Development |
| :--- | :--- | :--- |
| **4GT (Declarative)** | Prisma ORM | Automated SQL mapping and Type-Safe binding generation. |
| **5GT (Agentic)** | **Claude 4.6 Sonnet** | UI/UX Architecture, Component logic, and Framer Motion loops. |
| **5GT (Agentic)** | **GPT-5.3 Thinking** | Complex Business Logic, Checkout flow, and Order atomicity. |
| **5GT (Contextual)** | **Gemini 3.1 Pro High** | Massive codebase analysis, UML drafting, and prompt tuning. |
| **5GT (Inference)** | **Gemini 3 Flash** | In-app Dēxie Assistant for real-time inference & user help. |

#### 1.6.3 DevOps & CI/CD Pipeline
Transitioning from local development to a cloud-native state involved a strictly orchestrated CI/CD pipeline:
1. **Containerization**: Standardizing environments using Docker for the `backend`, `frontend`, and `storage` (MinIO) services.
2. **Railway Orchestration**: Moving from early PM2/VPS tests to a production Railway dashboard with automatic scaling.
3. **Continuous Deployment**: Establishing GitHub Actions for automated linting, security scanning, and production-branch auto-deployments.

---

## CHAPTER II: ANALYSIS

### 2.1 User Problem Analysis
Users interacting with existing digital asset hubs often face high cognitive loads navigating unstructured data. Artists face pirating concerns and complex payout architectures. Providers handling physical prints struggle with disjointed order management, where model files must be manually transmitted across unencrypted channels, creating operational bottlenecks.

### 2.2 System Requirement Specification

#### 2.2.1 Process Requirements
- **Authentication & Authorization:** Secure JWT token generation, OAuth integrations (Google/Local), and robust Two-Factor Authentication.
- **File Ingress & Egress:** Securely uploading GLB, OBJ, and texture files to S3-compatible endpoints (MinIO) [4] while restricting unauthenticated downloads.
- **Payment Processing:** Integrating Midtrans Snap [5] and Webhooks capable of converting volatile cart entities into permanent paid order logs.
- **Audit & Moderation:** Global administrative logic allowing the approval, rejection, or banishment of user entities and malicious assets without corrupting historical database constraints.

#### 2.2.2 Output Information
The system must generate and format:
1. Presigned temporal URLs for digital downloads.
2. Transactional receipts mapping exact monetary flows (IDR) and tax boundaries.
3. Vectorized recommendations calculating array similarities between users' historical `wishlist` caches and the `embedded` properties of catalog models using Cosine Similarity.

#### 2.2.3 Data Sources
Data ingested by 3Dēx originates from:
- **Human Input:** Artist uploads, user social feed posts, print configuration parameters mapping structural requirements (scale, material, infill).
- **Automated Hooks:** Midtrans sandbox [5] transactional state resolutions.
- **Vector Generations:** Google Gemini Embedding models [6] transforming strings into floating-point arrays for the AI sub-systems.

#### 2.2.4 Information Flow
1. **User requests** hit the Next.js [1] edge routers, moving over HTTPS into the Express Node.js environment.
2. **Business logic modules** intercept the payloads, querying external micro-services (such as MinIO for blob signatures [4] or Midtrans for payment tokens [5]).
3. Payload results are **sanitized and persisted** mapped explicitly via the Prisma ORM [3] to internal PostgreSQL instances.
4. Mutated arrays are distributed to **client devices** via optimized JSON and rendered onto React DOM trees [1].

#### 2.2.5 Processing Information
Internal data transforms involve aggregating arrays of reviews into real-time averages, translating cart objects into grouped ledger orders based on Provider routing, and calculating cryptographic signatures verifying payment authenticity.

### 2.3 System Modeling

#### 2.3.1 Use Case Diagams
The Use Case Diagrams illustrate the interactions between the five primary actors (Guest, Customer, Artist, Provider, Admin) and the 3Dēx system.

<p align="center">
  <img src="./diagrams/final_ucd_exported.png" alt="Detailed Use Case" />
  <br>
  <b>Figure 2.1a: Detailed Use Case Diagram for the 3Dēx Platform.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/plant_usecase.png" alt="PlantUML Use Case" />
  <br>
  <b>Figure 2.1b: Structural Use Case mapping actor hierarchies.</b>
</p>

#### 2.3.2 Activity Diagrams
The Activity Diagrams visualize the process flows across various system modules.

##### 2.3.2.1 Modular Process Flows
To ensure granular understanding, each subsystem possesses dedicated activity flows:

<p align="center">
  <img src="./diagrams/exports/activity/auth/activity_auth.png" alt="Auth Activity" />
  <br>
  <b>Figure 2.2a: Activity Diagram for Authentication Module.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/catalog/activity_catalog_interaction.png" alt="Catalog Activity" />
  <br>
  <b>Figure 2.2b: Activity Diagram for Catalog & Model Interaction.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/commerce/activity_cart_checkout.png" alt="Cart & Checkout Activity" />
  <br>
  <b>Figure 2.2c: Activity Diagram for Cart and Universal Checkout.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/commerce/activity_collections.png" alt="Collections Activity" />
  <br>
  <b>Figure 2.2d: Activity Diagram for User Collections management.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/commerce/activity_wishlist.png" alt="Wishlist Activity" />
  <br>
  <b>Figure 2.2e: Activity Diagram for User Wishlist management.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/print/activity_print_order.png" alt="Print Order Activity" />
  <br>
  <b>Figure 2.2f: Activity Diagram for Physical Print Order creation.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/print/activity_print_job_lifecycle.png" alt="Print Job Activity" />
  <br>
  <b>Figure 2.2g: Activity Diagram for Printing Provider Job Lifecycle.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/social/activity_community_feed.png" alt="Community Feed Activity" />
  <br>
  <b>Figure 2.2h: Activity Diagram for Community Social Feed.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/social/activity_post_like.png" alt="Social Interaction Activity" />
  <br>
  <b>Figure 2.2i: Activity Diagram for Social Interactions (Likes/Comments).</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/dexie/activity_dexie_tagline.png" alt="Dexie Activity" />
  <br>
  <b>Figure 2.2j: Activity Diagram for Dēxie AI Assistant interactions.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/notifications/activity_notifications.png" alt="Notifications Activity" />
  <br>
  <b>Figure 2.2k: Activity Diagram for Real-time System Notifications.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/activity/admin/activity_admin_moderation.png" alt="Admin Activity" />
  <br>
  <b>Figure 2.2l: Activity Diagram for Administrative Moderation workflows.</b>
</p>

### 2.4 Data Analysis
The ecosystem mandates strong data relational mapping to guarantee atomicity. No model or user deletion should leave hanging ghost dependencies. Consequently, cascading deletes and set-null constraints are rigorously analyzed across every edge bridging `Users`, `Models`, and transactional history.

---

## CHAPTER III: DESIGN

### 3.1 Database Design
The core persistence architecture runs on PostgreSQL with standard extensions including `pgvector` for native ML embedding operations.

<p align="center">
  <img src="./diagrams/exports/plant_erd.png" alt="Entity Relationship Diagram" />
  <br>
  <b>Figure 3.1: Entity Relationship Diagram showing all 21 system tables and their constraints.</b>
</p>

### 3.2 Class Diagram
The Class Diagram abstracts the backend services and controllers into Object-Oriented structures, demonstrating inheritance and service-layer encapsulation.

<p align="center">
  <img src="./diagrams/exports/plant_class_diagram.png" alt="Class Diagram" />
  <br>
  <b>Figure 3.2: Class Diagram representing the System Architecture.</b>
</p>

### 3.3 Sequence Diagrams
The following sequence diagrams provide a chronological look at object interactions across all primary system capabilities.

#### 3.3.1 Management & Security Sequences
Detailed interactions for account security and platform administration.

<p align="center">
  <img src="./diagrams/exports/sequence/auth/sequence_auth.png" alt="Auth Sequence" />
  <br>
  <b>Figure 3.3a: Sequence Diagram for User Authentication (OAuth/Local).</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/admin/sequence_admin_moderation.png" alt="Admin Moderation" />
  <br>
  <b>Figure 3.3b: Sequence Diagram for Administrative Content Moderation.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/admin/sequence_admin_audit_logs.png" alt="Admin Audit" />
  <br>
  <b>Figure 3.3c: Sequence Diagram for Admin Audit Log system.</b>
</p>

#### 3.3.2 Marketplace & Catalog Sequences
Detailed interactions for model handling and search.

<p align="center">
  <img src="./diagrams/exports/sequence/catalog/sequence_model_upload.png" alt="Model Upload" />
  <br>
  <b>Figure 3.4a: Sequence Diagram for Model Asset Upload & Processing.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/catalog/sequence_model_update.png" alt="Model Update" />
  <br>
  <b>Figure 3.4b: Sequence Diagram for Model Metadata Synchronization.</b>
</p>

#### 3.3.3 E-Commerce & Payment Sequences
Financial and transactional logic flows.

<p align="center">
  <img src="./diagrams/exports/sequence/commerce/sequence_cart_management.png" alt="Cart Management" />
  <br>
  <b>Figure 3.5a: Sequence Diagram for Persistent Cart Management.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/commerce/sequence_checkout.png" alt="Checkout Flow" />
  <br>
  <b>Figure 3.5b: Sequence Diagram for Universal Checkout & Midtrans Snap Integration.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/commerce/sequence_payment_webhook.png" alt="Payment Webhook" />
  <br>
  <b>Figure 3.5c: Sequence Diagram for Midtrans Payment Webhook Resolution.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/commerce/sequence_wishlist.png" alt="Wishlist Flow" />
  <br>
  <b>Figure 3.5d: Sequence Diagram for User Wishlist operations.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/commerce/sequence_collections.png" alt="Collections Flow" />
  <br>
  <b>Figure 3.5e: Sequence Diagram for Collection assembly.</b>
</p>

#### 3.3.4 Physical Production & Social Sequences
Bridging to providers and community interactions.

<p align="center">
  <img src="./diagrams/exports/sequence/print/sequence_print_order.png" alt="Print Order" />
  <br>
  <b>Figure 3.6a: Sequence Diagram for Print Order routing.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/print/sequence_print_job_management.png" alt="Print Job Management" />
  <br>
  <b>Figure 3.6b: Sequence Diagram for Print Provider Job Management.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/social/sequence_social_post.png" alt="Social Post" />
  <br>
  <b>Figure 3.6c: Sequence Diagram for Community Post Creation.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/social/sequence_user_review.png" alt="User Review" />
  <br>
  <b>Figure 3.6d: Sequence Diagram for Model Review Logic.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/social/sequence_follow_unfollow.png" alt="Follow/Unfollow" />
  <br>
  <b>Figure 3.6e: Sequence Diagram for Social Graph (Follow/Unfollow) logic.</b>
</p>

#### 3.3.5 AI & Notification Sequences
Automated system responses and assistive technologies.

<p align="center">
  <img src="./diagrams/exports/sequence/dexie/sequence_dexie_tagline_picks.png" alt="Dexie Tagline/Picks" />
  <br>
  <b>Figure 3.7a: Sequence Diagram for Dēxie AI personalized tagline Generation.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/dexie/sequence_dexie_toggle.png" alt="Dexie Toggle" />
  <br>
  <b>Figure 3.7b: Sequence Diagram for AI ecosystem state toggling.</b>
</p>

<p align="center">
  <img src="./diagrams/exports/sequence/notifications/sequence_notifications.png" alt="Notifications" />
  <br>
  <b>Figure 3.7c: Sequence Diagram for Real-time Notification distribution.</b>
</p>

### 3.4 Interface Design
The User Interface leverages a custom, hyper-modern aesthetic incorporating specific contextual designs, glassy overlays, dark-mode-first contrast, and animated interaction feedback from Framer Motion [1].
- **Home/Landing Page:** Implements high-performance horizontal looping arrays mapping top-rated models. Integrating the passive AI Assistant "Dēxie" neatly to the side viewport.
- **Model Detail View:** Features an expansive WebGL Three.js [2] render context spanning the majority block. Overlay tooltips display licensing matrices and checkout buttons.
- **Admin Dashboards:** Table-based dense layouts sorting logs and actionable reports with pagination controls.

---

## CHAPTER IV: CONCLUSION

### 4.1 Conclusion
3Dēx successfully serves as a robust prototype for an online, community-driven marketplace targeting the 3D generation. The software demonstrates structural capability in marrying real-time WebGL asset viewing alongside safe, distributed e-commerce processing. By explicitly linking independent Artists, automated Providers, and casual Consumers inside a single bounded context, the platform eliminates the need for sprawling disparate toolsets. Furthermore, the integration of the contextual Dēxie AI significantly reduces the cognitive burden on users navigating large asset repositories. The comprehensive modular engineering behind Next.js and Express lays a stable foundation supporting future systemic growth.

### 4.2 Suggestions
Future iterations and academic researchers who examine the 3Dēx repository should consider:
1. **Machine Learning Model Optimizations:** Replacing the basic `all-MiniLM-L6-v2` tag aggregation with dedicated Convolutional Neural Networks (CNN) capable of generating 3D topological awareness native to the files themselves.
2. **Mobile Application Distribution:** Implementing React Native clients to handle augmented reality (AR) previews locally rather than relying exclusively on browser-based viewing.
3. **Automated Print Analysis:** Establishing automated slicer microservices that execute physical model viability checks—calculating exact print material amounts needed—before the Provider accepts the job request. 

---

## REFERENCES

[1] Vercel Inc., "Next.js by Vercel - The React Framework," Vercel, 2026. [Online]. Available: https://nextjs.org/. 

[2] "Three.js - JavaScript 3D library," Three.js, 2026. [Online]. Available: https://threejs.org/. 

[3] Prisma Data, Inc., "Prisma | Next-generation Node.js and TypeScript ORM," Prisma, 2026. [Online]. Available: https://www.prisma.io/. 

[4] MinIO, "MinIO | High Performance, Kubernetes Native Object Storage," MinIO Inc., 2026. [Online]. Available: https://min.io/. 

[5] Midtrans, "Midtrans Documentation | Payment Gateway Indonesia," PT Midtrans, 2026. [Online]. Available: https://docs.midtrans.com/. 

[6] Google Inc., "Gemini API | Generative AI for Developers," Google Cloud, 2026. [Online]. Available: https://ai.google.dev/. 

[7] "MDN Web Docs: WebGL API," Mozilla Foundation, 2026. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API. 

[8] R. S. Pressman and B. R. Maxim, *Software Engineering: A Practitioner's Approach*, 9th ed. New York, NY: McGraw-Hill Education, 2019.

[9] I. Sommerville, *Software Engineering*, 10th ed. Pearson, 2015.
