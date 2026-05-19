# Activity Diagram - Session Hydration

> **UML Type:** Activity Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/activity/auth/activity_session_hydration.puml`

![Activity Diagram - Session Hydration](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/auth/activity_session_hydration.png)

---

## Overview

This activity diagram shows the session hydration process that runs on every page mount or refresh, determining whether the user's session is still valid and populating the UI with fresh user data.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Triggers the load by navigating to the app |
| Frontend | Initiates the hydration call on mount |
| Backend | Validates the cookie and fetches current user data |
| Database | Provides the current user record |

---

## Process Flow

1. **[User]** Opens or refreshes the app.
2. **[Frontend]** `useEffect` triggers `GET /auth/me` (with the `3dex_session` cookie).
3. **[Backend]** Auth middleware attempts to decode the JWT from the cookie.
   - If no cookie or invalid/expired token: returns 401. Frontend clears `AuthContext`, shows guest UI. Flow ends.
4. **[Database]** Fetches the user record by the ID in the JWT payload.
   - If user not found: returns 401 or 404. Frontend logs out. Flow ends.
5. **[Backend]** Strips sensitive fields (`password`, `google_id`) from the user object.
6. **[Backend]** Signs a fresh JWT and sets a new `3dex_session` cookie (sliding window).
7. **[Backend]** Calls MinIO to presign `avatar_url` and `banner_url`.
8. **[Backend]** Returns 200 with sanitized user + signed URLs.
9. **[Frontend]** Hydrates `AuthContext` with the user data.
10. **[Frontend]** Renders the authenticated UI state.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| Valid JWT in cookie? | Continue | Return 401, clear session |
| User exists in DB? | Continue | Return 401/404, logout |

---

## Notes

- This flow runs on every app load, not just login. This is by design to ensure the UI always reflects the current server state (e.g., if an admin has suspended the user's account).
- The token refresh on each hydration call extends the session, implementing a sliding-window expiry.
- Only public-safe fields are returned. `password` and `google_id` are never sent to the browser.
