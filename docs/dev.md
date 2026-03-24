# Development Guide - 3Dēx

This document serves as the primary technical reference for the 3Dēx project.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack Overview](#tech-stack-overview)
3. [Core Principles](#core-principles)
4. [Installation Guide](#installation-guide)
5. [Cloning the Project](#cloning-the-project)
6. [Project Structure](#project-structure)
7. [Environment Variables](#environment-variables)
8. [Database Setup (PostgreSQL + Prisma)](#database-setup-postgresql--prisma)
9. [Running the Project](#running-the-project)
10. [Verification Checklist](#verification-checklist)
11. [Git Workflow](#git-workflow)
12. [Working with a New Local Copy](#working-with-a-new-local-copy)
13. [Updating an Existing Local Copy](#updating-an-existing-local-copy)
14. [Safe Merging Strategy](#safe-merging-strategy)
15. [Troubleshooting](#troubleshooting)
16. [Core Rules](#core-rules)

---

## Project Overview

3Dēx is a completed MVP for a 3D services and asset marketplace featuring:
```
Frontend: Next.js + Tailwind
Backend: Node.js + Express
Database: PostgreSQL + Prisma
```

This guide details the setup and development processes to ensure consistent implementation and avoid breaking changes.

---

## Tech Stack Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js (React), Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Storage | MinIO (S3 Compatible) |
| Version Control | Git + GitHub |

---

## Core Principles

### Development Mental Model

- Code is shared across the team.
- Database data is maintained locally and not shared.
- Storage buckets are local for development purposes.
- Secrets must never be committed to version control.
- Features are developed on dedicated branches, not on the master branch.

If you are new to these concepts, this guide will help you follow these practices.

---

## Installation Guide

### 1. Git
- Windows: [git-scm.com/download/win](https://git-scm.com/download/win)
- Linux: `sudo apt install git`

Verify: `git --version`

---

### 2. Node.js (LTS Version)
- Download from: [nodejs.org](https://nodejs.org) (Choose the LTS version)

Verify: `node -v`, `npm -v`

---

### 3. PostgreSQL
- Windows: [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- Linux: `sudo apt install postgresql postgresql-contrib`

Verify: `psql --version`, `pg_isready`

*Note: Verification depends on whether PostgreSQL is installed as a service.*

---

### 4. MinIO (Optional for local development)
MinIO can be run via Docker:
```sh
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```

---

## Cloning the Project
```sh
git clone https://github.com/Schryzon/3Dex.git
cd 3Dex
```

---

## Project Structure
```
3Dex/
├─ .github/       # CI/CD workflows
├─ .vscode/       # Workspace settings
├─ apps/
│  ├─ backend/    # Express backend
│  └─ frontend/   # Next.js frontend
├─ docs/          # Technical documentation
├─ LICENSE        # Project license
└─ README.md      # Main documentation
```
Avoid adding redundant folders or storing databases within the repository.

---

## Environment Variables

### Backend (`apps/backend/.env`)
Copy `apps/backend/.env.example` to `apps/backend/.env`.
```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/threedex"
PORT=4000
```

### Frontend (`apps/frontend/.env.local`)
Copy `apps/frontend/.env.local.example` to `apps/frontend/.env.local`.
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Docker (`.env.docker`)
**For Docker Compose Only**.
Copy `.env.docker.example` to `.env.docker`.

Never commit these files; they are included in `.gitignore`.

---

## Database Setup (PostgreSQL + Prisma)

If PostgreSQL is not running as a service, start it manually:
```powershell
pg_ctl start -D $env:PGDATA
```

Then, from `apps/backend`:
```sh
npm install
npx prisma migrate dev --name init
npx prisma generate
```

Success indicators:
- PostgreSQL is running.
- Prisma connected successfully.

To stop PostgreSQL: `pg_ctl stop`

---

## Running the Project

### Backend
```sh
cd apps/backend
npm run dev
```
Health check: `http://localhost:4000/health` (Expected: `{ "status": "ok" }`)

### Frontend
```sh
cd apps/frontend
npm install
npm run dev
```
Access via: `http://localhost:3000`

---

## Verification Checklist

- [ ] Frontend loads correctly.
- [ ] Backend `/health` endpoint returns "ok".
- [ ] No console errors.
- [ ] Prisma migrations completed successfully.

---

## Git Workflow

### Starting a New Task
```sh
git checkout dev
git pull origin dev
git checkout -b feature/your-task-name
```

### Saving Progress
```sh
git add .
git commit -m "Brief description of changes"
git push -u origin feature/your-task-name
```

---

## Working with a New Local Copy
```sh
git clone https://github.com/Schryzon/3Dex.git
cd 3Dex
git checkout dev
```
Follow the setup steps mentioned above.

---

## Updating an Existing Local Copy
```sh
git checkout dev
git pull origin dev
git checkout -b feature/new-task
```

---

## Safe Merging Strategy

### Step 1: Update the Dev Branch
```sh
git checkout dev
git pull origin dev
```

### Step 2: Merge Dev into Feature Branch
```sh
git checkout feature/your-task
git merge dev
```
Resolve any conflicts locally in the feature branch.

### Step 3: Merge into Dev and Push
```sh
git checkout dev
git merge feature/your-task
git push origin dev
```

### Step 4: Cleanup
```sh
git branch -d feature/your-task
git push origin --delete feature/your-task
```

---

## Troubleshooting

- **"Git overwrote my work"**: Ensure you commit your changes before pulling updates.
  ```sh
  git add .
  git commit -m "wip"
  git pull
  ```

- **"Prisma connection error"**: Verify PostgreSQL is running on the expected port (default 5432).
  ```sh
  pg_isready
  ```

---

## Core Rules

1. Do not code directly on the master branch.
2. Always branch from the dev branch.
3. Never commit environment variables (.env).
4. Dedicate one branch per task.
5. Do not share local database data.
6. Consult the team Lead or documentation if issues persist.
