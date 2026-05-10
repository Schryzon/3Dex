# 3Dex Documentation Root

Welcome to the 3Dex platform's technical documentation directory. This folder contains all the architectural, operational, and development guides necessary to understand, run, and maintain the 3Dex ecosystem.

## Index of Documentation

### 1. Developer & Core Guides
- **[Development Guide (`dev.md`)](./dev.md)**
  The primary technical reference for the 3Dex project. Includes installation instructions, environment variable setups, database initialization, and Git workflow. **Start here if you are a new developer.**
  
- **[Unit Testing Strategy (`unit-testing.md`)](./unit-testing.md)**
  Details our approach to testing both the frontend and backend. Covers Jest configuration, mocking external services (like S3 and Midtrans), and running tests locally and in CI/CD pipelines.

### 2. Architecture & Design
- **[Unified UML Documentation (`uml_docs.md`)](./uml_docs.md)**
  The absolute single source of truth for the platform's technical domain. It outlines all human and automated actors, exhaustive use cases, and complete entity-relationship models detailing the exact attributes and functions of every object in the system.

- **[Dēxie AI Ecosystem (`dexie.md`)](./dexie.md)**
  Documentation for the resident AI spirit, Dēxie. Details her persona, the technical architecture using Gemini Flash, caching mechanisms, vector search logic for personalized picks, and the mobile-friendly Orb interaction model.

### 3. Infrastructure & DevOps
- **[VPS and MinIO Setup (`minio_setup.md`)](./minio_setup.md)**
  A guide on deploying and configuring a private, S3-compatible storage solution using MinIO. Includes Tailscale security restrictions and Docker deployment configurations.

- **[Cloudflare CORS/PATCH Checklist (`cloudflare_cors.md`)](./cloudflare_cors.md)**
  A troubleshooting checklist and configuration guide for resolving `OPTIONS` and `PATCH` request blockages at the Cloudflare edge, specifically for the API origin.

---

## Documentation Philosophy

- **System-Level Clarity**: Docs are written for system designers. We prioritize predictability, explicit state definitions, and clear boundaries.
- **Living Documents**: These files should be updated whenever a major architectural change is merged.
- **Truth over Safety**: We document exact behaviors, including known fail-states and edge cases.
