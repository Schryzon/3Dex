# 3Dēx Backend

This is the *backend API* for 3Dēx.

It handles:
- Authentication & authorization (JWT, Roles)
- Business logic (Orders, models, etc.)
- Database access (Prisma)
- Advanced Search & Filtering (Catalog)
- Social Features (Reviews, Wishlists)
- Analytics (Artist Dashboard)
- File Storage (MinIO/S3 Presigned URLs)
- API endpoints for frontend

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

Create .env:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres"
PORT=4000

# Storage (MinIO / S3)
STORAGE_ENDPOINT="http://127.0.0.1:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="3dex-models"
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
