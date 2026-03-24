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
- Responsive UI & Modern UX (Tailwind CSS, Radix UI)
- Protected Routes & Role-based authentication
- Advanced API integration & State Management (React Query)
- 3D Previews (Built-in canvas integrations)
- Payment processing (Midtrans Sandbox integration)
- Content Moderation interfaces (Admin Dashboards)

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
