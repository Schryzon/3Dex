# 3Dēx Backend

This is the backend API for 3Dēx.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Structure](#structure)
- [Setup](#setup)
- [Database Setup](#database-setup)
- [Running the Development Server](#running-the-development-server)
- [Important Rules](#important-rules)

---

It handles:
- Authentication & authorization (JWT, Secure Role Validations)
- Core Business Logic (Orders, Model Uploads, Print Services)
- Database Queries (Prisma aggregations & indexing)
- Advanced Search & Filtering (Catalog sorting strategies)
- Social & Community Features (Posts, Likes, Comments, NSFW flags)
- Analytics Engine (Stats aggregation for Artists/Providers)
- File Storage Integrations (MinIO/S3 Presigned Uploads & Downloads)
- Admin & Moderation Operations (Approve/Reject Content, Reports)

---

## Tech Stack
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- AWS SDK (S3 / MinIO)

---

## Structure
```
src/ 
├─ controllers/   # Request handling 
├─ middlewares/   # Authentication and validation 
├─ routes/        # API routes 
├─ services/      # Business logic 
├─ utils/         # Helpers 
├─ validators/    # Request validation logic
├─ __tests__/     # Test suites
├─ app.ts         # Express app configuration
├─ prisma.ts      # Database client instantiation
└─ server.ts      # Application entry point
```
---

## Setup

### 1. Install dependencies
```bash
npm install
```
### 2. Environment variables

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

---

## Database Setup

Ensure PostgreSQL is running, then execute:
```bash
npx prisma migrate dev
```

---

## Running the Development Server
```bash
npm run dev
```
Health check:
```
http://localhost:4000/health
```
Expected response:
```json
{ "status": "ok" }
```

---

## Important Rules

- Database data is local only.
- Never commit .env files.
- Schema changes must be implemented via Prisma migrations.
