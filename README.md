# 3Dēx

*3Dēx* is a 3D services & asset marketplace where clients can hire 3D artists and purchase 3D assets, with real‑time previews rendered in the browser.

This repository contains *both frontend and backend* for the platform.

---

## ✨ Features (MVP - Completed!)
- ✅ **Authentication & Authorization** (Secure JWT + Role-based Access)
- ✅ **Interactive 3D Services Marketplace** (Providers & Print Services)
- ✅ **Digital Asset Marketplace** (Models, Textures, HDRIs) with Advanced Search 
- ✅ **Community Feed & Interactions** (Posts, Likes, Comments, NSFW Filters)
- ✅ **User Profiles & Collections** (Wishlists, Libraries, Order History)
- ✅ **Artist & Provider Analytics Dashboards**
- ✅ **Secure File Storage** (MinIO/S3 Presigned URLs)
- ✅ **Client-Side 3D Previews** (Interactive canvas)
- ✅ **Order Management & Payment Integration** (Midtrans Simulation)
- ✅ **Admin Moderation Interface** (User approvals, Model approvals, Content Flags)

---

## 🧱 Tech Stack
- *Frontend*: Next.js, React, Tailwind CSS
- *Backend*: Node.js, Express
- *Database*: PostgreSQL
- *ORM*: Prisma
- *Storage*: MinIO (S3 Compatible)
- *Version Control*: Git & GitHub

---

## 📂 Project Structure
```
3dex/ 
├─ apps/ 
│  │  
│  ├─ frontend/   # Next.js frontend 
│  │  
│  └─ backend/    # Express + Prisma backend 
│
├─ docs/          # Full development guide 
│
├─ LICENSE        # The project's license details
└─ README.md      # This file
```
---

## 🚀 Getting Started
If this is your first time working on the project, *read this first*:

👉 *[dev.md](./docs/dev.md)* — complete setup, install, Git workflow, and troubleshooting.

---

## 😽 For Contributors
- Do NOT work on master
- Always branch from dev
- One task = one feature branch
- Never commit .env files

---

## 📜 License
This project is licensed under the **GNU General Public License v3.0 (GPL‑3.0)**.

You are free to use, study, modify, and distribute this software under the terms of the GPL‑3.0.  
Any distributed modifications must also be licensed under GPL‑3.0.

See the [LICENSE](./LICENSE) file for full details.

## 👥 Primary Contributors
- **I Nyoman Widiyasa Jayananda** "[Schryzon](https://github.com/Schryzon)" (Backend, Dockerization, Documentation)
- **I Kadek Mahesa Permana Putra** "[Vuxyn](https://github.com/Vuxyn)" (Frontend & UI/UX)
- **Thoriq Abdillah Falian Kusuma** "[ganijack](https://github.com/ganijack)" (Frontend & All-rounder)
