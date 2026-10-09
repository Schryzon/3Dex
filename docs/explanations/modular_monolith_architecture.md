# 3Dex Modular Monolithic Architecture & Four-Node Deployment Analysis

## 1. Executive Summary

This document establishes the formal architectural specification of the 3Dex platform. 3Dex is architected as a modular monolith at the application layer, deployed across four decoupled infrastructure nodes:
1. Frontend Presentation Node (Next.js 14 App Router, React Three Fiber WebGL Canvas)
2. Backend Application Node (Modular Monolithic Node.js/Express.js Runtime)
3. Relational & Vector Database Node (PostgreSQL 16, pgvector, Prisma ORM)
4. S3 Object Storage Node (MinIO Object Storage)

A fundamental architectural distinction exists between physical deployment topology and logical software decomposition. While 3Dex operates across four distinct infrastructure nodes, the backend business capabilities reside within a single deployable application artifact and execute within a single operating system process.

---

## 2. Architectural Figures Index

The architectural model is documented in two formats:
1. **Simplified TeX/TikZ Figures**: Clean, minimal, publication-ready diagrams compiled with XeLaTeX and converted to high-definition PNG and vector PDF.
2. **PlantUML Specifications**: Standardized UML component, deployment, and sequence diagrams.

### 2.1 Simplified TeX / TikZ Architectural Figures

| Figure | Architectural Subject | TeX Source | Vector PDF | High-Res PNG |
|---|---|---|---|---|
| Figure 1 | Four-Node Deployment Topology & Application Tier | [fig_1_four_node_deployment.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_1_four_node_deployment.tex) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_1_four_node_deployment.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_1_four_node_deployment.png) |
| Figure 2 | Internal Backend Modularity & In-Process Dispatch | [fig_2_internal_modularity_flow.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_2_internal_modularity_flow.tex) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_2_internal_modularity_flow.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_2_internal_modularity_flow.png) |
| Figure 3 | Customer Purchase & Digital Delivery Workflow | [fig_3_purchase_workflow.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_3_purchase_workflow.tex) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_3_purchase_workflow.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_3_purchase_workflow.png) |
| Figure 4 | Deployment Topology vs. Logical Microservice Boundary | [fig_4_deployment_topology_vs_microservices.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_4_deployment_topology_vs_microservices.tex) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_4_deployment_topology_vs_microservices.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_4_deployment_topology_vs_microservices.png) |
| Figure 5 | Modular Monolith vs. Microservices Paradigm | [fig_5_modular_monolith_vs_microservices.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_5_modular_monolith_vs_microservices.pdf) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_5_modular_monolith_vs_microservices.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_5_modular_monolith_vs_microservices.png) |
| Figure 6 | Unified ACID Relational Transaction Pipeline | [fig_6_unified_transaction_pipeline.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_6_unified_transaction_pipeline.tex) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_6_unified_transaction_pipeline.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_6_unified_transaction_pipeline.png) |
| Figure 7 | Evolutionary Microservices Extraction Seams | [fig_7_evolutionary_extraction_path.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_7_evolutionary_extraction_path.tex) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_7_evolutionary_extraction_path.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_7_evolutionary_extraction_path.png) |
| Figure 8 | Coarse-Grained Scaling Resource Allocation | [fig_8_coarse_grained_scaling.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_8_coarse_grained_scaling.tex) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_8_coarse_grained_scaling.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_8_coarse_grained_scaling.png) |
| Figure 9 | Monolithic Shared Runtime Blast Radius | [fig_9_single_failure_domain.tex](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/tex/fig_9_single_failure_domain.tex) | [PDF](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_9_single_failure_domain.pdf) | [PNG](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/tex/fig_9_single_failure_domain.png) |

### 2.2 Standard UML Architectural Figures

| Figure | Subject | Source File | Rendered PNG | Vector SVG |
|---|---|---|---|---|
| Figure 1 | Four-Node Deployment Topology & Application Tier | [fig_1_four_node_deployment.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_1_four_node_deployment.puml) | [fig_1_four_node_deployment.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_1_four_node_deployment.png) | [fig_1_four_node_deployment.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_1_four_node_deployment.svg) |
| Figure 2 | Internal Backend Modularity & Request Pipeline | [fig_2_internal_modularity_flow.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_2_internal_modularity_flow.puml) | [fig_2_internal_modularity_flow.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_2_internal_modularity_flow.png) | [fig_2_internal_modularity_flow.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_2_internal_modularity_flow.svg) |
| Figure 3 | Customer Purchase & Digital Delivery Workflow | [fig_3_purchase_workflow.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_3_purchase_workflow.puml) | [fig_3_purchase_workflow.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_3_purchase_workflow.png) | [fig_3_purchase_workflow.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_3_purchase_workflow.svg) |
| Figure 4 | Deployment Topology vs. Logical Microservice Boundary | [fig_4_deployment_topology_vs_microservices.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_4_deployment_topology_vs_microservices.puml) | [fig_4_deployment_topology_vs_microservices.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_4_deployment_topology_vs_microservices.png) | [fig_4_deployment_topology_vs_microservices.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_4_deployment_topology_vs_microservices.svg) |
| Figure 5 | Modular Monolith vs. Microservices Paradigm | [fig_5_modular_monolith_vs_microservices.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_5_modular_monolith_vs_microservices.puml) | [fig_5_modular_monolith_vs_microservices.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_5_modular_monolith_vs_microservices.png) | [fig_5_modular_monolith_vs_microservices.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_5_modular_monolith_vs_microservices.svg) |
| Figure 6 | Unified ACID Relational Transaction Pipeline | [fig_6_unified_transaction_pipeline.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_6_unified_transaction_pipeline.puml) | [fig_6_unified_transaction_pipeline.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_6_unified_transaction_pipeline.png) | [fig_6_unified_transaction_pipeline.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_6_unified_transaction_pipeline.svg) |
| Figure 7 | Evolutionary Microservices Extraction Seams | [fig_7_evolutionary_extraction_path.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_7_evolutionary_extraction_path.puml) | [fig_7_evolutionary_extraction_path.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_7_evolutionary_extraction_path.png) | [fig_7_evolutionary_extraction_path.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_7_evolutionary_extraction_path.svg) |
| Figure 8 | Coarse-Grained Scaling Resource Allocation | [fig_8_coarse_grained_scaling.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_8_coarse_grained_scaling.puml) | [fig_8_coarse_grained_scaling.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_8_coarse_grained_scaling.png) | [fig_8_coarse_grained_scaling.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_8_coarse_grained_scaling.svg) |
| Figure 9 | Monolithic Shared Runtime Blast Radius | [fig_9_single_failure_domain.puml](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/modular_monolith/fig_9_single_failure_domain.puml) | [fig_9_single_failure_domain.png](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_9_single_failure_domain.png) | [fig_9_single_failure_domain.svg](file:///c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/modular_monolith/fig_9_single_failure_domain.svg) |

---

## 3. Detailed Architectural Analysis

### 3.1 Four-Node Infrastructure Deployment (Figure 1 & Figure 4)

The deployment infrastructure is partitioned into four distinct physical or containerized nodes:

1. **Frontend Presentation Node**:
   - Host runtime: Node.js with Next.js App Router (Port 3000).
   - Responsibilities: Server-Side Rendering (SSR), static page hydration, client-side routing, React Three Fiber canvas orchestration, camera and geometry control, user input handling, and local state management via Zustand.
   - Boundary: Communicates exclusively over HTTPS / REST API with the backend application node.

2. **Backend Application Node**:
   - Host runtime: Node.js with Express.js REST server (Port 5000).
   - Responsibilities: Central ingress routing, token verification (JWT), Role-Based Access Control (RBAC), and execution of business domain modules.
   - Internal Structure: Houses all 8 business modules inside a single monolithic runtime boundary.

3. **Database Infrastructure Node**:
   - Host runtime: PostgreSQL 16 (Port 5432).
   - Enhancements: Vector index support via `pgvector` extension for semantic HNSW approximate nearest neighbor search.
   - Abstraction: Mediated via Prisma ORM client with strict schema validation.

4. **Object Storage Infrastructure Node**:
   - Host runtime: MinIO S3-Compatible Server (Port 9000).
   - Responsibilities: High-capacity persistence of binary 3D assets (`.glb`), compressed model geometry, renders, and media avatars.
   - Access Control: Backend-managed pre-signed PUT and time-limited GET URLs.

### 3.2 Internal Backend Modularity & In-Process Execution (Figure 2 & Figure 3)

The backend avoids an undifferentiated "big ball of mud" by organizing capabilities into cohesive, domain-driven modules:
- `Auth_Module`: Identity management, OAuth token exchanges, bcrypt credential verification, RBAC authorization.
- `Catalog_Module`: 3D model taxonomy, categorical tags, search indexing, pricing metadata.
- `Commerce_Module`: Shopping carts, checkout pipelines, order state machine, payment gateway webhooks.
- `Community_Module`: Social graph edges (follows), activity feeds, comment threads, reviews.
- `Dexie_Module`: Situational AI recommendations, high-dimensional vector embeddings, semantic ranking, and Gemini Flash contextual prompts.
- `Notification_Module`: System notifications, event delivery, and activity digests.
- `Print_Module`: Distributed 3D printing jobs, material spec validation, slicing profiles, and provider job assignment.
- `Admin_Module`: Platform governance, moderation review queue, audit trail logging (`Admin_Audit_Log`).

#### Zero Network Latency Advantage
When a customer purchases a 3D model, the interaction between `Commerce_Module`, `Catalog_Module`, and `Payment_Sub` occurs entirely in-memory:
- No inter-service HTTP requests or gRPC calls.
- Zero network serialization/deserialization overhead.
- No network partition failure modes or distributed timeout retries.

### 3.3 Relational ACID Transaction Guarantees (Figure 6)

In a distributed microservices architecture, a multi-entity purchase requires distributed sagas or two-phase commit (2PC) protocols across multiple separate databases. In 3Dex, multi-domain integrity is preserved within a single PostgreSQL transaction block:
1. `INSERT INTO "Order"` creates the primary transactional record.
2. `INSERT INTO "OrderItem"` registers line items.
3. `INSERT INTO "Payment"` records monetary reconciliation and updates user creator balance.
4. `INSERT INTO "Purchase"` provisions digital entitlement and download access keys.
5. `INSERT INTO "PrintJob"` queues manufacturing dispatch if physical 3D fabrication was requested.
6. Execution of `COMMIT TRANSACTION` guarantees atomic persistence. If any step fails, the entire batch rolls back cleanly.

### 3.4 Evolutionary Extraction & Modular Seams (Figure 7)

Because domain boundaries are cleanly established through internal module interfaces, future extraction of individual microservices does not require rewriting core business logic. As traffic patterns dictate, high-demand modules can be extracted along bounded context seams:
- Extraction Path 1: `Dexie_Module` into a dedicated GPU-backed vector inference service.
- Extraction Path 2: `Print_Module` into an asynchronous IoT print provider dispatcher.
- Extraction Path 3: `Auth_Module` into a centralized identity service.

### 3.5 Operational Tradeoffs (Figure 8 & Figure 9)

While the modular monolith offers superior operational simplicity and transactional guarantees, it introduces two architectural tradeoffs:
1. **Coarse-Grained Scaling**:
   Under heavy vector search load on `Dexie_Module`, the orchestrator must replicate the entire backend container. Idle modules such as `Auth_Module` or `Admin_Module` are duplicated, consuming redundant memory and connection pool slots.
2. **Single Failure Domain**:
   An unhandled exception or memory leak in one module (such as a parsing defect in a 3D asset processor) crashes the entire Node.js runtime process, bringing down all co-hosted modules simultaneously.
