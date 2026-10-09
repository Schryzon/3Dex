# AGENTS.md: 3Dex Platform Engineering Guide for AI Agents

## 1. System Overview and Architectural Paradigm

3Dex is a full-stack 3D model marketplace and collaborative printing platform. The system operates as a modular monolith at the application layer deployed across four infrastructure nodes:

1. **Frontend Node**: Next.js App Router, React 19, Tailwind CSS, React Three Fiber (WebGL 3D canvas).
2. **Backend Node**: Node.js 20 with Express.js REST API structured as an in-process modular monolith.
3. **Database Node**: PostgreSQL 16 with the `pgvector` extension, managed via Prisma ORM.
4. **Object Storage Node**: MinIO S3-compatible storage cluster for 3D binary geometry (`.glb`), textures, renders, and user media.

### Architectural Tenet
Four infrastructure nodes do not constitute microservices. The infrastructure is physically distributed across four deployment targets, but the backend business capabilities reside inside a single monolithic runtime process. All intra-backend module communications execute via in-process function invocations with zero network latency.

For detailed architectural diagrams and trade-off analyses, refer to [modular_monolith_architecture.md](file:///c:/Users/nyoma/Downloads/3Dex/docs/explanations/modular_monolith_architecture.md).

---

## 2. Directory Layout

- `apps/frontend/`: Next.js web application, UI components, Zustand stores, R3F viewer canvases.
- `apps/backend/`: Express.js application, modular business domains, middleware, Prisma client bindings.
- `docs/diagrams/`: PlantUML specifications (`.puml`), diagram compiler (`plantuml.jar`), and automated build scripts (`export.ps1`).
- `docs/diagrams/exports/`: Compiled PNG and SVG diagram artifacts.
- `docs/diagrams/modular_monolith/`: Dedicated modular monolith architectural diagram suite.
- `docs/explanations/`: Formal domain-specific technical documentation and activity workflow breakdowns.
- `docs/uml_docs.md`: Master domain model specifications, use cases, and actor hierarchies.

---

## 3. Core Business Modules (Backend Monolith)

All business logic is isolated into eight cohesive domain modules within the backend application:

1. `Auth_Module`: Identity management, JWT token signing/verification, OAuth callbacks, bcrypt password hashing, RBAC enforcement.
2. `Catalog_Module`: 3D asset metadata, file verification, category hierarchies, search filters, and pricing schemes.
3. `Commerce_Module`: Shopping carts, checkout state transitions, Midtrans Snap payment gateway integration, webhook receivers.
4. `Community_Module`: Social graph relationships (follows), user feeds, comment threads, model reviews, curated collections.
5. `Dexie_Module`: AI assistant orchestration, Hugging Face Transformers.js embeddings, pgvector cosine distance queries, Google Gemini contextual reasoning.
6. `Notification_Module`: Asynchronous in-app notifications, transactional alerts, and activity logs.
7. `Print_Module`: Distributed 3D printing orders, slicer configuration profiles, provider job claiming, and tracking updates.
8. `Admin_Module`: Trust and safety moderation, user bans, reporting queues, and persistent audit logging (`Admin_Audit_Log`).

---

## 4. Coding Conventions and Style Rules

AI agents generating or modifying code within this repository must adhere to the following rules:

### 4.1 Naming Conventions
- **Classes and Types**: `Title_Snake_Case` (e.g., `Order_Manager`, `Model_Controller`, `Auth_Middleware`).
- **Variables and Functions**: `tiny_snake_case` (e.g., `user_id`, `calculate_cart_total()`, `fetch_model_by_id()`).
- **Enums and Constants**: `UPPER_SNAKE_CASE` (e.g., `ORDER_STATUS`, `PAYMENT_STATE`, `MAX_FILE_SIZE_BYTES`).

### 4.2 Control Flow and Structure
- Maintain flat logic. Avoid deep indentation trees.
- Enforce early returns for edge cases, validations, and guard clauses.
- Keep space-delimited, clean branching:
  ```typescript
  if (is_condition_met) {
      handle_primary_flow();
      return;
  }
  handle_fallback_flow();
  ```
- Optimistic error handling: let operational assertions fail predictably rather than concealing errors behind defensive defaults.

### 4.3 Documentation Standards
- Zero emojis in all documentation files and code comments. Emojis in technical documents are strictly prohibited.
- Comprehensive, complete technical documentation. AI agents must fully explain system components, data schemas, and edge cases.
- Use GitHub-style markdown file links with forward slashes: `[target](file:///path/to/target)`.

---

## 5. Environment and Tooling Execution

- **Python Runtime**: Use `python312` (managed via Scoop package manager). Do not invoke `python` or `py` unless explicitly directed.
- **Shell**: PowerShell 7 (`pwsh`).
- **Diagram Compilation**:
  Run PowerShell to batch-compile all PlantUML diagrams into PNG and SVG:
  ```powershell
  java -jar docs/diagrams/plantuml.jar "docs/diagrams/**/*.puml" -o "../exports"
  ```
  Or execute the native script:
  ```powershell
  powershell -ExecutionPolicy Bypass -File docs/diagrams/export.ps1
  ```
- **Simplified TeX/TikZ Diagram Compilation**:
  Run PowerShell to batch-compile all TikZ standalone diagrams into PDF and 300 DPI PNG:
  ```powershell
  powershell -ExecutionPolicy Bypass -File docs/diagrams/export_tex.ps1
  ```
- **Document Rendering**:
  Generate PDF documentation via XeLaTeX:
  ```powershell
  powershell -ExecutionPolicy Bypass -File docs/export_pdf.ps1
  ```

---

## 6. Database and State Machine Conventions

### 6.1 Order State Transitions
1. `PENDING`: Initial state upon Midtrans Snap checkout generation.
2. `PAID`: Payment confirmed via webhook. Unlocks digital asset downloads immediately.
3. `PROCESSING`: Physical print job claimed by assigned provider.
4. `SHIPPED`: Physical package dispatched with courier tracking ID.
5. `COMPLETED`: Delivery confirmed by customer or 14-day auto-completion elapsed.
6. `CANCELLED`: Payment failed or cancelled by user/admin.
7. `REFUNDED`: Funds reverted.

### 6.2 Relational Transaction Rule
All multi-table mutations spanning orders, payments, purchase entitlements, and print jobs must execute inside a single Prisma `$transaction` block to guarantee ACID consistency without requiring distributed sagas.
