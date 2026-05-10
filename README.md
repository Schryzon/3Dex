# 3Dēx

<p align="center">
  <img src="og-image.png" alt="3Dēx Social Preview" width="44%" />
</p>

<p align="center">
    <img src="https://github.com/Schryzon/3Dex/actions/workflows/deploy.yml/badge.svg" />
    <img src="https://img.shields.io/github/repo-size/Schryzon/3Dex?style=flat-square&color=gray" />
    <img src="https://img.shields.io/github/stars/Schryzon/3Dex?style=flat-square&color=yellow" />
    <img src="https://img.shields.io/github/forks/Schryzon/3Dex?style=flat-square&color=blue" />
    <br />
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Three.js-black?style=flat-square&logo=three.js&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=react-query&logoColor=white" />
    <br />
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
    <br />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" />
    <img src="https://img.shields.io/badge/Zustand-443E38?style=flat-square" />
    <img src="https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white" />
    <img src="https://img.shields.io/badge/License-AGPL--3.0-orange.svg?style=flat-square" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" />
</p>

3Dēx is a 3D services and asset marketplace where clients can hire 3D artists and purchase 3D assets, featuring real-time previews rendered in the browser.

This repository contains both the frontend and backend for the platform.

---

## Table of Contents
- [Features](#features)
- [Actors & Business Model](#actors--business-model)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Contributor Guidelines](#contributor-guidelines)
- [License](#license)
- [Primary Contributors](#primary-contributors)

---

## Features
- Authentication & Authorization (Secure JWT + Role-based Access)
- Interactive 3D Services Marketplace (Providers & Print Services)
- Digital Asset Marketplace (Models, Textures, HDRIs) with Advanced Search
- Community Feed & Interactions (Posts, Likes, Comments)
- Content Moderation & NSFW Filtering (Blurring, Content Flags, Admin Approvals)
- Unified Library Hub (Consolidated Saved, Downloads, and My Uploads)
- Artist & Provider Analytics Dashboards
- Secure File Storage (MinIO/S3 Presigned URLs)
- Client-Side 3D Previews (Optimized interactive canvas)
- Order Management & Payment Integration (Midtrans Sandbox / Production)
- **Dēxie AI Assistant** (Emu x Ako persona, contextual situational AI)

---

## Actors & Business Model

3Dēx operates as a multi-sided marketplace, connecting creators, consumers, and physical manufacturers into a single unified ecosystem. 

### I. System Actors
- **Guest**: Unregistered user browsing the catalog and interacting with the 3D viewer.
- **Customer**: Authenticated user capable of purchasing digital downloads, requesting physical prints, and participating in the social feed.
- **Artist**: Content creator who uploads 3D models and sets dual pricing (Personal vs. Commercial licenses).
- **Provider**: Verified hardware partner capable of fulfilling specialized physical 3D print orders via localized manufacturing.
- **Admin**: Platform maintainer responsible for content moderation, dispute resolution, and trust & safety.

### II. Business Flow & Revenue Routing
The platform bridges the gap between digital artists and hobbyists without hardware, monetizing through a combination of direct sales and print-on-demand fulfillment.

```mermaid
graph TD
    %% Define Styles
    classDef artist fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:white;
    classDef customer fill:#10b981,stroke:#047857,stroke-width:2px,color:white;
    classDef provider fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:white;
    classDef platform fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:white;
    classDef database fill:#1f2937,stroke:#111827,stroke-width:2px,color:white;
    classDef money fill:#ecfccb,stroke:#84cc16,stroke-width:2px,color:#3f6212,stroke-dasharray: 5 5;

    %% Nodes
    A[Artist / Creator]:::artist
    C[Customer]:::customer
    P[Print Provider]:::provider
    DB[(3D Catalog)]:::database
    Mid[Midtrans Payment Gateway]:::platform
    
    %% Flows
    A -- Uploads Model & Sets Pricing --> DB
    C -- Browses & Previews --> DB
    
    C -- 1. Buys Digital Download --> Mid
    C -- 2. Requests Physical Print --> Mid
    
    %% Digital Route
    Mid -.->|Digital Payment Success| D[Unlock Encrypted Download URL]:::database
    D -.->|Direct Download| C
    
    %% Physical Route
    Mid -.->|Print Payment Escrow| Q[Print Job Queue]:::database
    Q -- Job Assigned --> P
    P -- Manufactures & Ships Physical Item --> C
    
    %% Revenue Splits
    Rev{Revenue Split Engine}:::money
    Mid ==> Rev
    
    Rev ==>|Artist Digital Payout 90%| A
    Rev ==>|Artist Print Royalty %| A
    Rev ==>|Provider Material & Labor Payout| P
    Rev ==>|Platform Operations Fee| Platform[3Dēx Platform Treasury]:::platform
```

---

## Tech Stack
- Frontend: Next.js, React, React Query, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Prisma
- Storage: MinIO (S3 Compatible)
- **AI Ecosystem:** Google Gemini (Generative AI)
- Version Control: Git & GitHub

---

## Project Structure
```
3Dex/
├─ .github/           # GitHub Actions workflows
├─ .vscode/           # Editor settings
├─ apps/
│  ├─ backend/        # Express + Prisma backend
│  └─ frontend/       # Next.js frontend
├─ docs/              # Project documentation
├─ docker-compose.yml # Docker configuration
├─ ecosystem.config.js # PM2 configuration
├─ LICENSE            # Project license
├─ package.json       # Workspace dependencies
└─ README.md          # Primary documentation
```
---

## Getting Started
Refer to the following guide for initial setup and development:

[dev.md](./docs/dev.md) — complete setup, installation, Git workflow, and troubleshooting.

For further architectural references, see the [Documentation Index](./docs/README.md).

---

## Contributor Guidelines
We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on our branching strategy and code philosophy.
Also, please review our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License
This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

You are free to use, study, modify, and distribute this software under the terms of the AGPL-3.0.  
Any distributed modifications (including those offered over a network) must also be licensed under AGPL-3.0 and made available as open source.

See the [LICENSE](./LICENSE) file for full details.

## Primary Contributors
- **I Nyoman Widiyasa Jayananda** "[Schryzon](https://github.com/Schryzon)" (Backend, SysAdmin, Project Manager)
- **I Kadek Mahesa Permana Putra** "[Vuxyn](https://github.com/Vuxyn)" (Frontend, UI/UX, QA)
- **Thoriq Abdillah Falian Kusuma** "[ganijack](https://github.com/ganijack)" (Frontend, Integration, OAuth)

## Secondary Contributors
- **Ni Putu Ayu Dian Sulastri** (Documentation, Proposal, Competition Assistant)
- **Mataram Dev community** (Hosting, Support)
