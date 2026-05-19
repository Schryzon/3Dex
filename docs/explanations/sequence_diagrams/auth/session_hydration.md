# Sequence Diagram - Session Hydration

> **UML Type:** Sequence Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/sequence/auth/sequence_session_hydration.puml`

![Sequence Diagram - Session Hydration](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/auth/sequence_session_hydration.png)

---

## Overview

Session hydration occurs every time the application mounts or the user refreshes the page. It re-validates the session cookie and populates the frontend's `AuthContext` with fresh user data, ensuring the UI always reflects the current server state.

---

## Participants

| Participant | Role |
|---|---|
| User | The human actor loading the application |
| Frontend | The Next.js client running `GET /auth/me` on mount |
| AuthController | Express route handler for `/auth/me` |
| StorageService | S3 URL presigner |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. App Mount or Page Refresh

Whenever the app loads, the Frontend calls `GET /auth/me`, sending the `3dex_session` cookie automatically via the browser.

### 2. JWT Validation

AuthController runs the auth middleware, which decodes the JWT from the session cookie.

- If no cookie is present or the token is invalid/expired: returns **401 Unauthorized**. The Frontend clears `AuthContext` and shows the guest (logged-out) UI. The flow terminates.

### 3. Database Lookup

The decoded token contains the user's ID. AuthController queries the database to get the full current user record.

- If the user no longer exists (deleted account): returns **404 Not Found**. The Frontend logs out and redirects. The flow terminates.

### 4. Security Sanitization

AuthController strips sensitive fields (`password`, `google_id`) from the user object before building the response.

### 5. Token Refresh

AuthController signs a fresh JWT and sets a new `3dex_session` cookie. This implements a sliding-window session: every app load extends the session for another 7 days.

### 6. URL Signing

StorageService generates presigned S3 URLs for the user's `avatar_url` and `banner_url`.

### 7. Response

AuthController returns **200** with the full sanitized user object, including signed URLs. The Frontend hydrates `AuthContext` and renders the user-aware UI.

---

## Error Paths

| Condition | HTTP Response | Frontend Action |
|---|---|---|
| No cookie or invalid JWT | 401 Unauthorized | Clear AuthContext, show guest state |
| User deleted from database | 404 Not Found | Logout and redirect |

---

## Key Implementation Details

- This flow is the primary mechanism ensuring the frontend always has fresh user state without requiring an explicit re-login.
- The token refresh on each hydration call means the user effectively stays logged in as long as they visit the app at least once every 7 days.
- `strip_sensitive_fields` removes `password` and `google_id` before the object is returned to the client. These fields are never sent to the browser.
- This is different from a dedicated token refresh endpoint: it simultaneously validates, fetches current data, and re-issues the token in one call.
