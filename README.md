# 3Dēx

*3Dēx* is a 3D services & asset marketplace where clients can hire 3D artists and purchase 3D assets, with real‑time previews rendered in the browser.

This repository contains *both frontend and backend* for the platform.

---

## ✨ Features (MVP)
- User authentication (Client / Seller)
- 3D services marketplace
- Asset marketplace with **Advanced Search & Filtering**
- **Reviews & Ratings**
- **Wishlists**
- **Artist Analytics Dashboard**
- **Secure File Storage (MinIO/S3)**
- Client‑side 3D previews
- Order & workflow management

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
