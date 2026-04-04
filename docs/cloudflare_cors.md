# Cloudflare CORS/PATCH Checklist

Use this checklist when frontend requests to `api.3dex.studio` fail with `OPTIONS blocked` or `PATCH unsafe`.

## Required behavior
- Forward `OPTIONS` requests to origin (do not block at edge).
- Allow `PATCH` and `POST` methods to `/users/profile` endpoints.
- Keep credentialed CORS (`withCredentials: true`) with explicit allowed origins.

## Origin/API settings
- Set backend `ALLOWED_ORIGINS` to include production frontend origin exactly.
- Keep backend CORS methods including `OPTIONS` and `PATCH`.
- Keep backend route fallback: `POST /users/profile/update`.

## Cloudflare checks
- Disable/adjust WAF rule that blocks `PATCH` on `/users/profile`.
- Disable method restrictions that return 405/403 before origin.
- Ensure cache rules bypass API paths (`/users/*`, `/storage/*`).
- Ensure `OPTIONS` requests are not cached with invalid headers.

## Quick verification
1. Browser Network tab should show successful `OPTIONS /users/profile`.
2. Followed by either:
   - `PATCH /users/profile` 200, or
   - fallback `POST /users/profile/update` 200.
3. Response should include CORS headers and cookie-compatible origin.
