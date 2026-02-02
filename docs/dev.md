# 📘 dev.md — 3Dēx Development Guide

## A single source of truth for every baby.


---

📌 Table of Contents

1. [What Is This Project?](#what-is-this-project)
2. [Tech Stack Overview](#tech-stack-overview)
3. [Before You Start (VERY IMPORTANT)](#before-you-start-very-important)
4. [Install Everything (Windows & Linux)](#install-everything-windows--linux)
5. [Clone the Project](#clone-the-project)
6. [Project Structure Explained](#project-structure-explained)
7. [Environment Variables (.env)](#environment-variables-env)
8. [Database Setup (PostgreSQL + Prisma)](#database-setup-postgresql--prisma)
9. [Running the Project](#running-the-project)
10. [Testing That Everything Works](#testing-that-everything-works)
11. [Daily Git Workflow (NO COLLISIONS)](#daily-git-workflow-no-collisions)
12. [Working From a NON‑Existing Folder](#working-from-a-nonexisting-folder)
13. [Working From an EXISTING Folder](#working-from-an-existing-folder)
14. [Merging Your Work Safely](#merging-your-work-safely)
15. [Common Mistakes & Fixes](#common-mistakes--fixes)
16. [Golden Rules (READ THIS TWICE)](#golden-rules-read-this-twice)




---

## What Is This Project?

3Dēx is a 3D services & asset marketplace with:
```
Frontend: Next.js + Tailwind

Backend: Node.js + Express

Database: PostgreSQL + Prisma
```

This document tells you exactly how to become productive without breaking anything.


---

## Tech Stack Overview

### Layer	Tech
```
Frontend  ->  Next.js (React), Tailwind CSS
Backend   ->  Node.js, Express
Database  ->  PostgreSQL
ORM       ->  Prisma
Storage   ->  MinIO (S3 Compatible)
Versions  ->  Git + GitHub
```


---

## Before You Start (VERY IMPORTANT)

### 🧠 Baby Mental Model

- Code is shared

- Database data is NOT shared

- **Storage bucket is NOT shared (local dev)**

- Secrets are NEVER committed

- We work on branches, not on master


If you don’t understand this yet — it’s okay.

This guide will enforce it for you.


---

## Install Everything (Windows & Linux)

1. Install Git

Windows: https://git-scm.com/download/win

Linux:

```sh
sudo apt install git
```
Verify:
```sh
git --version
```

---

2. Install Node.js (LTS ONLY)

https://nodejs.org (choose LTS)


Verify:
```sh
node -v
npm -v
```

---

3. Install PostgreSQL

Windows: https://www.postgresql.org/download/windows/

Linux:

```sh
sudo apt install postgresql postgresql-contrib
```
Verify:
```sh
psql --version
pg_isready
```
Expected:
```
accepting connections
```
*Note: This is only if you installed PostgreSQL as a service, otherwise you have to start it manually.*

---

4. Install MinIO (Optional for local dev, prevents errors)

You can run it via Docker:
```sh
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```
Or just install the binary.


---

## Clone the Project
```sh
git clone https://github.com/Schryzon/3Dex.git
cd 3Dex
```
If this works, you are officially a baby developer 👶✨


---

## Project Structure Explained
```
3Dex/
├─ apps/
│  ├─ frontend/   # Next.js + Tailwind
│  └─ backend/    # Express + Prisma
├─ docs/          # Documentation
├─ dev.md
└─ README.md
```
❌ Do NOT add random folders

❌ Do NOT put databases here


---

## Environment Variables (`.env`)

### Backend (`apps/backend/.env`)
```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/threedex"
PORT=4000

# Storage
STORAGE_ENDPOINT="http://127.0.0.1:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="3dex-models"
```
### Frontend (`apps/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
🚨 NEVER COMMIT THESE FILES

They are already in `.gitignore`.


---

## Database Setup (PostgreSQL + Prisma)

If you're not using PostgreSQL as a service:
```sh
pg_ctl start -D "PATH_TO_DATA_FOLDER"
```
The data folder usually comes with the installation.
Its path can be invoked via the following environment variable names:
- `%PGDATA%` (Command Prompt)
- `$env:PGDATA` (Powershell) 
- `$PGDATA` (Linux)

Example:
```powershell
pg_ctl start -D $env:PGDATA
```

Then, from apps/backend:
```sh
npm install
npx prisma migrate dev --name init
npx prisma generate
```
If this succeeds:

- PostgreSQL is running

- Prisma is connected

- You are safe 🟢

If you want to stop PostgreSQL, do:
```sh
pg_ctl stop
```

---

## Running the Project

### Backend
```sh
cd apps/backend
npm run dev
```
Check:
```
http://localhost:4000/health
```
Expected:
```json
{ "status": "ok" }
```

---

### Frontend
```sh
cd apps/frontend
npm install
npm run dev
```
Open:
```
http://localhost:3000
```

---

## Testing That Everything Works

Checklist:

[ ] Frontend loads

[ ] Backend /health works

[ ] No red errors

[ ] Prisma migrate ran successfully


If YES → you are fully set up 🎉


---

## Daily Git Workflow (NO COLLISIONS)

### Start work
```sh
git checkout dev
git pull origin dev
git checkout -b feature/your-task-name
```
### Save work
```sh
git add .
git commit -m "clear description"
git push -u origin feature/your-task-name
```

---

## Working From a NON‑Existing Folder

If you never cloned before:
```sh
git clone https://github.com/Schryzon/3Dex.git
cd 3Dex
git checkout dev
```
Then follow setup steps above.


---

## Working From an EXISTING Folder

If you already cloned before:
```sh
git checkout dev
git pull origin dev
```
Then create your feature branch:
```sh
git checkout -b feature/new-task
```

---

## Merging Your Work Safely

Step 1: Update dev
```sh
git checkout dev
git pull origin dev
```
Step 2: Merge dev into your branch
```sh
git checkout feature/your-task
git merge dev
```
Fix conflicts here, not on dev.


---

Step 3: Merge into dev
```sh
git checkout dev
git merge feature/your-task
git push origin dev
```
Step 4: Delete branch
```sh
git branch -d feature/your-task
git push origin --delete feature/your-task
```
Clean. Safe. Professional.


---

## Common Mistakes & Fixes

❌ “Git overwrote my work”

You didn’t commit before pulling.

Fix:
```sh
git add .
git commit -m "wip"
git pull
```

---

❌ “Prisma can’t connect”

Postgres isn’t running or port isn’t `5432`.

Fix:

1. Check if PostgreSQL is running
```sh
pg_isready
```

2. If not, start it manually at a certain port (`-p 5432`)
Example: (Powershell)
```powershell
pg_ctl -o "-p 5432" start -D $env:PGDATA
```
---

## Golden Rules (READ THIS TWICE)
1. ❌ Never code on master
2. ✅ Always branch from dev
3. ❌ Never commit .env
4. ✅ One task = one branch
5. ❌ Never share DB data
6. ✅ Ask mommy before panicking
---
