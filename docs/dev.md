# 📘 dev.md — 3Dēx Development Guide

## A single source of truth for every baby.


---

📌 Table of Contents

1. [What Is This Project?](what-is-this-project)
2. [Tech Stack Overview](tech-stack-overview)
3. [Before You Start (VERY IMPORTANT)](before-you-start-very-important)
4. [Install Everything (Windows & Linux)](install-everything-windows--linux)
5. [Clone the Project](clone-the-project)
6. [Project Structure Explained](project-structure-explained)
7. [Environment Variables (.env)](environment-variables-env)
8. [Database Setup (PostgreSQL + Prisma)](database-setup-postgresql--prisma)
9. [Running the Project](running-the-project)
10. [Testing That Everything Works](testing-that-everything-works)
11. [Daily Git Workflow (NO COLLISIONS)](daily-git-workflow-no-collisions)
12. [Working From a NON‑Existing Folder](working-from-a-nonexisting-folder)
13. [Working From an EXISTING Folder](working-from-an-existing-folder)
14. [Merging Your Work Safely](merging-your-work-safely)
15. [Common Mistakes & Fixes](common-mistakes--fixes)
16. [Golden Rules (READ THIS TWICE)](golden-rules-read-this-twice)




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
Versions  ->  Git + GitHub
```


---

## Before You Start (VERY IMPORTANT)

### 🧠 Baby Mental Model

- Code is shared

- Database data is NOT shared

- Secrets are NEVER committed

- We work on branches, not on master


If you don’t understand this yet — it’s okay.

This guide will enforce it for you.


---

## Install Everything (Windows & Linux)

1. Install Git

Windows: https://git-scm.com/download/win

Linux:

```bash
sudo apt install git
```
Verify:
```bash
git --version
```

---

2. Install Node.js (LTS ONLY)

https://nodejs.org (choose LTS)


Verify:
```bash
node -v
npm -v
```

---

3. Install PostgreSQL

Windows: https://www.postgresql.org/download/windows/

Linux:

```bash
sudo apt install postgresql postgresql-contrib
```
Verify:
```bash
psql --version
pg_isready
```
Expected:
```
accepting connections
```

---

## Clone the Project
```bash
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
├─ dev.md
└─ README.md
```
❌ Do NOT add random folders

❌ Do NOT put databases here


---

## Environment Variables (.env)

Backend (apps/backend/.env)
```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/postgres"
PORT=4000
```
Frontend (apps/frontend/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
🚨 NEVER COMMIT THESE FILES

They are already in `.gitignore`.


---

## Database Setup (PostgreSQL + Prisma)

From apps/backend:
```bash
npm install
npx prisma migrate dev --name init
```
If this succeeds:

- PostgreSQL is running

- Prisma is connected

- You are safe 🟢



---

## Running the Project

### Backend
```bash
cd apps/backend
npm run dev
```
Check:
```
http://localhost:4000/health
```
Expected:
```
{ "status": "ok" }
```

---

### Frontend
```bash
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
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-task-name
```
### Save work
```bash
git add .
git commit -m "clear description"
git push -u origin feature/your-task-name
```

---

## Working From a NON‑Existing Folder

If you never cloned before:
```bash
git clone https://github.com/Schryzon/3Dex.git
cd 3Dex
git checkout dev
```
Then follow setup steps above.


---

## Working From an EXISTING Folder

If you already cloned before:
```bash
git checkout dev
git pull origin dev
```
Then create your feature branch:
```bash
git checkout -b feature/new-task
```

---

## Merging Your Work Safely

Step 1: Update dev
```bash
git checkout dev
git pull origin dev
```
Step 2: Merge dev into your branch
```bash
git checkout feature/your-task
git merge dev
```
Fix conflicts here, not on dev.


---

Step 3: Merge into dev
```bash
git checkout dev
git merge feature/your-task
git push origin dev
```
Step 4: Delete branch
```bash
git branch -d feature/your-task
git push origin --delete feature/your-task
```
Clean. Safe. Professional.


---

## Common Mistakes & Fixes

❌ “Git overwrote my work”

You didn’t commit before pulling.

Fix:
```bash
git add .
git commit -m "wip"
git pull
```

---

❌ “Prisma can’t connect”

Postgres isn’t running or port isn’t `5432`.

Fix:

```bash
pg_isready
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
