# Activity Diagram - Complete Profile

> **UML Type:** Activity Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/activity/auth/activity_complete_profile.puml`

![Activity Diagram - Complete Profile](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/auth/activity_complete_profile.png)

---

## Overview

This activity diagram describes the profile completion step that new Google OAuth users must complete before using the platform. After registering via Google, users are redirected here to choose a permanent username.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | The new Google OAuth user |
| Frontend | Enforces the redirect and renders the form |
| Backend | Validates and saves the chosen username |
| Database | Checks uniqueness and persists the update |

---

## Process Flow

1. **[Frontend]** After Google OAuth login with `needs_username = true`, redirects to `/complete-profile`.
2. **[User]** Sees the "Choose a username" form.
3. **[Frontend]** Checks auth session. If not authenticated or `needs_username = false`: redirects away. Flow ends.
4. **[User]** Enters desired username.
5. **[Frontend]** Client validates:
   - Username is 3-30 characters, alphanumeric, no spaces.
   - If invalid: shows inline error. User corrects.
6. **[Frontend]** Sends `PATCH /users/complete-profile { username }`.
7. **[Backend]** Validates:
   - Username is present.
   - Matches allowed pattern (3-30 chars, `^[a-zA-Z0-9_]+$`).
   - If invalid: returns 400.
8. **[Database]** Checks username uniqueness.
   - If taken (P2002): Backend returns 409 "Username already taken".
9. **[Database]** Updates user record with the chosen username.
10. **[Backend]** Signs a fresh JWT and sets a new `3dex_session` cookie.
11. **[Backend]** Returns 200 with updated user.
12. **[Frontend]** Hydrates `AuthContext`, redirects to home. User can now use the platform.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| Session valid and needs_username? | Show form | Redirect away |
| Client validation passes? | Submit | Show error, retry |
| Server validation passes? | Continue | Return 400 |
| Username unique? | Save | Return 409, retry |

---

## Notes

- This is a mandatory step for Google OAuth new users only. Local registration users choose their username during registration.
- After this step, `needs_username` becomes irrelevant since the user now has a permanent username.
- The fresh JWT issued at the end updates the cookie so subsequent `GET /auth/me` calls return the correct username.
- The page redirects away if the user already has a username, preventing repeated visits to the complete-profile form.
