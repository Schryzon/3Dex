# Cloudflare CORS/PATCH Checklist

Use this checklist when frontend requests to `api.3dex.studio` fail with `OPTIONS blocked` or `PATCH unsafe`. This is a common issue when deploying single-page applications or Next.js apps behind a strict Cloudflare proxy.

---

## 🛑 Understanding the Problem
Cloudflare's default security posture is aggressive. It often interprets standard RESTful patterns—like preflight `OPTIONS` requests and partial update `PATCH` methods—as potentially malicious traffic if not explicitly configured.

1. **The Preflight Problem**: Browsers send an `OPTIONS` request before cross-origin mutating requests (`POST`, `PATCH`, `DELETE`). If Cloudflare intercepts and blocks this (e.g., returning a 403 or 405) before it reaches the Express backend, the browser will instantly throw a CORS error, *even if the backend CORS configuration is correct*.
2. **The PATCH Problem**: Some older WAF (Web Application Firewall) rules sets classify `PATCH` as an unnatural HTTP method, instantly dropping the request.

---

## ✅ Required Behavior
- Forward `OPTIONS` requests directly to origin (do not block or cache at edge).
- Explicitly allow `PATCH` and `POST` methods, especially to mutating endpoints like `/users/profile`.
- Maintain credentialed CORS (`withCredentials: true`) with explicit, exact allowed origins (no `*` wildcards).

---

## ⚙️ Origin/API Settings (Backend)

Your Express backend must be the ultimate authority on CORS. Ensure the following:

- **Allowed Origins**: Set `ALLOWED_ORIGINS` to include the production frontend origin exactly.
  ```env
  ALLOWED_ORIGINS="https://3dex.studio,https://www.3dex.studio"
  ```
- **CORS Methods**: Keep backend CORS methods comprehensive.
  ```typescript
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }));
  ```
- **Fallback Routes**: Maintain a backend route fallback just in case `PATCH` remains problematic on certain networks.
  ```typescript
  // If PATCH fails, we support a POST fallback
  router.post('/users/profile/update', profileController.update);
  ```

---

## 🛡️ Cloudflare Dashboard Checks

Log into the Cloudflare dashboard and verify these settings for the `3dex.studio` zone:

### 1. Web Application Firewall (WAF)
- Navigate to **Security > WAF**.
- Check the **Managed Rules**. If a rule blocks `PATCH` on `/users/profile`, either create an exception (Skip WAF) for the `/users/*` path, or adjust the rule sensitivity.
- Check **Custom Rules**. Ensure no rules are indiscriminately blocking non-GET requests.

### 2. Caching Rules
`OPTIONS` requests should *never* be cached.
- Navigate to **Caching > Cache Rules**.
- Create a rule to bypass cache for the API.
  - **Expression**: `(http.host eq "api.3dex.studio")`
  - **Action**: Bypass cache
- This ensures preflight requests hit the origin so the Express CORS middleware can dynamically respond with the correct `Access-Control-Allow-Origin` based on the incoming request's Origin header.

### 3. Page Rules (Legacy) or Transform Rules
- If using Transform Rules, ensure you aren't stripping `Origin` or `Access-Control-Request-Headers` before they reach the backend.
- If using Page Rules, disable "Browser Cache TTL" and "Edge Cache TTL" for `api.3dex.studio/*`.

---

## 🔍 Quick Verification & Debugging

### Using the Browser
1. Open the browser Network tab.
2. Trigger an action (like updating a profile).
3. You should see a successful `OPTIONS /users/profile` (Status 200 or 204).
4. Followed immediately by:
   - `PATCH /users/profile` (Status 200), or
   - `POST /users/profile/update` (Status 200).
5. Inspect the response headers of the `OPTIONS` request. It MUST include `Access-Control-Allow-Credentials: true` and a specific `Access-Control-Allow-Origin`.

### Using cURL
Test the preflight request directly from your terminal to bypass browser caching:
```bash
curl -I -X OPTIONS "https://api.3dex.studio/users/profile" \
  -H "Origin: https://3dex.studio" \
  -H "Access-Control-Request-Method: PATCH" \
  -H "Access-Control-Request-Headers: content-type"
```

**Expected Output**:
```http
HTTP/2 204
access-control-allow-origin: https://3dex.studio
access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE
access-control-allow-credentials: true
```
If you see `HTTP/2 403 Forbidden` or `HTTP/2 405 Method Not Allowed`, Cloudflare is still intercepting the request.
