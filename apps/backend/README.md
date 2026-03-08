# 3Dēx Backend

This is the *backend API* for 3Dēx.

It handles:
- ✅ Authentication & authorization (JWT, Secure Role Validations)
- ✅ Core Business Logic (Orders, Model Uploads, Print Services)
- ✅ Database Queries (Complex Prisma aggregations & indexing)
- ✅ Advanced Search & Filtering (Catalog sorting strategies)
- ✅ Social & Community Features (Posts, Likes, Comments, NSFW flags)
- ✅ Analytics Engine (Stats aggregation for Artists/Providers)
- ✅ File Storage Integrations (MinIO/S3 Presigned Uploads & Downloads)
- ✅ Admin & Moderation Operations (Approve/Reject Content, Reports)

---

## 🧱 Tech Stack
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- AWS SDK (S3 / MinIO)

---

## 📂 Structure
```
src/ 
├─ routes/        # API routes 
├─ controllers/   # Request handling 
├─ services/      # Business logic 
├─ middlewares/   # Auth, validation 
├─ utils/         # Helpers 
└─ app.js
```
---

## ⚙️ Setup

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

## 🗄 Database Setup

Make sure PostgreSQL is running, then:
```bash
npx prisma migrate dev
```

---

▶️ Run Development Server
```bash
npm run dev
```
Health check:
```
http://localhost:4000/health
```
Expected:
```json
{ "status": "ok" }
```

---

## ⚠️ Important Rules

- Database data is local only

- Never commit .env

- Schema changes must go through Prisma migrations

---
