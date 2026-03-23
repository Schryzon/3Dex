# 3Dēx

<p align="center">
    <img src="https://github.com/Schryzon/3Dex/actions/workflows/deploy.yml/badge.svg" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/License-GPL--3.0-blue.svg?style=flat-square" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" />
</p>

3Dēx is a 3D services and asset marketplace where clients can hire 3D artists and purchase 3D assets, featuring real-time previews rendered in the browser.

This repository contains both the frontend and backend for the platform.

---

## Table of Contents
- [Features](#features-phase-1---implementation-complete)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Contributor Guidelines](#contributor-guidelines)
- [License](#license)
- [Primary Contributors](#primary-contributors)

---

## Features (Phase 1 - Implementation Complete)
- Authentication & Authorization (Secure JWT + Role-based Access)
- Interactive 3D Services Marketplace (Providers & Print Services)
- Digital Asset Marketplace (Models, Textures, HDRIs) with Advanced Search
- Community Feed & Interactions (Posts, Likes, Comments, NSFW Filters)
- User Profiles & Collections (Wishlists, Libraries, Order History)
- Artist & Provider Analytics Dashboards
- Secure File Storage (MinIO/S3 Presigned URLs)
- Client-Side 3D Previews (Interactive canvas)
- Order Management & Payment Integration (Midtrans Simulation)
- Admin Moderation Interface (User approvals, Model approvals, Content Flags)

---

## Tech Stack
- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Prisma
- Storage: MinIO (S3 Compatible)
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

---

## Contributor Guidelines
- Do not work on the master branch.
- Always branch from the dev branch.
- One task per feature branch.
- Never commit .env files.

---

## License
This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

You are free to use, study, modify, and distribute this software under the terms of the GPL-3.0.  
Any distributed modifications must also be licensed under GPL-3.0.

See the [LICENSE](./LICENSE) file for full details.

## Primary Contributors
- **I Nyoman Widiyasa Jayananda** "[Schryzon](https://github.com/Schryzon)" (Backend, SysAdmin)
- **I Kadek Mahesa Permana Putra** "[Vuxyn](https://github.com/Vuxyn)" (Frontend, UI/UX)
- **Thoriq Abdillah Falian Kusuma** "[ganijack](https://github.com/ganijack)" (Frontend, Integration)
