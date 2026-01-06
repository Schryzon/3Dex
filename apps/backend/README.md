# 3Dēx Backend

This is the *backend API* for 3Dēx.

It handles:
- Authentication & authorization
- Business logic
- Database access
- File & order management
- API endpoints for frontend

---

## 🧱 Tech Stack
- Node.js
- Express
- PostgreSQL
- Prisma ORM

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
