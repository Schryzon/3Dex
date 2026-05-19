# Activity Diagram - Google OAuth

> **UML Type:** Activity Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/activity/auth/activity_google_oauth.puml`

![Activity Diagram - Google OAuth](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/auth/activity_google_oauth.png)

---

## Overview

This activity diagram maps the full process flow for Google OAuth authentication through swim lanes. It is more detailed than the sequence diagram in that it explicitly shows the three-way user-lookup branch.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Initiates the OAuth flow |
| Frontend | Manages the Google prompt and response |
| Backend | Verifies token and handles all three lookup paths |
| Database | Stores and returns user data |

---

## Process Flow

1. **[User]** Clicks "Continue with Google".
2. **[Frontend]** Triggers Google One Tap or OAuth redirect.
3. **[Google Auth]** Returns a credential (ID token).
4. **[Frontend]** Sends `POST /auth/google { credential }`.
5. **[Backend]** Validates that `credential` is present.
   - If missing: returns 400.
6. **[Backend]** Calls Google's `tokeninfo` to verify the token.
   - If verification fails: returns 401.
7. **[Backend]** Extracts `{ sub, email, name, picture }` from payload.
8. **[Database]** Attempts to find user by `google_id = sub`.

**Three-way decision:**

**Path A - Google user found:**
9A. **[Backend]** Uses the existing user directly.

**Path B - No Google match, existing email user:**
9B. **[Database]** Finds user by email.
10B. **[Database]** Updates that user's record: `google_id = sub`.
11B. **[Backend]** Sets `isNew = false`.

**Path C - Completely new user:**
9C. **[Database]** Creates new user: `{ google_id: sub, email, role: CUSTOMER, account_status: APPROVED }`.
10C. **[Backend]** Sets `isNew = true`.

**Rejoin:**

10. **[Backend]** Signs JWT, sets `3dex_session` cookie.
11. **[Backend]** Returns 200.
12. **[Frontend]** Checks `needs_username`:
    - If true (`isNew`): redirects to `/complete-profile`.
    - Otherwise: redirects to home.

---

## Decision Points Summary

| Decision | Path |
|---|---|
| Missing credential | 400, stop |
| Token verification fails | 401, stop |
| User found by google_id? | Path A |
| No google match, user found by email? | Path B |
| Neither match | Path C |
| needs_username? | Redirect to complete-profile |

---

## Notes

- Path B (account linking) silently links the Google account to an existing local account without any user action. This is transparent to the user.
- The `isNew` flag controls whether the user is forced to set a username before using the platform.
