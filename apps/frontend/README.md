# 3Dēx Frontend

This is the *frontend application* for 3Dēx, built with *Next.js* and *Tailwind CSS*.

It handles:
- ✅ Responsive UI & Modern UX (Tailwind CSS, Radix UI)
- ✅ Protected Routes & Role-based authentication
- ✅ Advanced API integration & State Management (React Query)
- ✅ 3D Previews (Built-in canvas integrations)
- ✅ Payment processing (Midtrans Sandbox integration)
- ✅ Content Moderation interfaces (Admin Dashboards)

---

## 🧱 Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- TypeScript

---

## 📂 Structure
```
src/ 
├─ app/            # Pages & routes 
├─ components/     # Reusable UI components 
├─ features/       # Feature‑based UI logic 
├─ lib/            # Helpers (fetchers, utils) 
└─ styles/         # Global styles
```
---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```
### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

---

▶️ Run Development Server
```bash
npm run dev
```
Open:
```
http://localhost:3000
```

---

## 🎨 Design Workflow

1. UI is based on Figma designs

2. Figma is a reference, not auto‑generated code

3. Build UI component‑by‑component

4. Match layout & spacing, not pixel‑perfect perfection



---

## ⚠️ Notes

- Do NOT put secrets in frontend

- Only variables starting with `NEXT_PUBLIC_` are accessible in browser
---
