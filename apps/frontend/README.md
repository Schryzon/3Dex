# 3Dēx Frontend

This is the frontend application for 3Dēx, built with Next.js and Tailwind CSS.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Structure](#structure)
- [Setup](#setup)
- [Running the Development Server](#running-the-development-server)
- [Design Workflow](#design-workflow)
- [Important Notes](#important-notes)

---

It handles:
- Responsive UI & modern UX (Tailwind CSS, Radix UI, Modern Typography)
- Protected Routes & Role-based authentication
- Advanced API integration & State Management (React Query)
- Unified Library Hub (Tabbed interface for Saved, Downloads, Uploads)
- Content Moderation & User Preferences (NSFW Filtering toggles & persistent state)
- 3D Previews (Optimized built-in interactive canvas)
- Payment processing (Midtrans Sandbox & Production integration)
- Admin Dashboards (User & Content moderation)

---

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- TypeScript

---

## Structure
```
src/ 
├─ app/            # Pages & routing 
├─ components/     # Reusable UI components 
├─ features/       # Feature‑based logic 
├─ lib/            # Core library and utilities 
├─ styles/         # Global styles 
├─ types/          # Global type definitions
└─ __tests__/     # Test suites
```
---

## Setup

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

## Running the Development Server
```bash
npm run dev
```
Open:
```
http://localhost:3000
```

---

## Design Workflow

1. UI development is based on Figma designs.
2. Figma serves as a reference, not for auto‑generated code.
3. Build the UI component‑by‑component.
4. Aim for high fidelity in layout and spacing while maintaining flexibility.

---

## Important Notes

- Do not store secrets in the frontend application.
- Only environment variables prefixed with `NEXT_PUBLIC_` are accessible in the browser.
