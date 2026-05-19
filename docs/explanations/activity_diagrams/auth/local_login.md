# Activity Diagram - Local Login

> **UML Type:** Activity Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/activity/auth/activity_local_login.puml`

![Activity Diagram - Local Login](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/auth/activity_local_login.png)

---

## Overview

This activity diagram models the process flow of local (email + password) login as a series of steps and decisions distributed across the Admin, Frontend, Backend, and Database swim lanes.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Interacts with the login form |
| Frontend | Validates input client-side and sends the request |
| Backend | Executes authentication logic |
| Database | Stores and returns user data |

---

## Process Flow

1. **[User]** Opens the login form.
2. **[Frontend]** User submits email and password.
3. **[Frontend]** Client-side validation: checks fields are not empty.
   - If empty: shows a field required error. Flow ends.
4. **[Frontend]** Sends `POST /auth/login { email, password }`.
5. **[Backend]** Receives the request; runs field presence validation again.
   - If missing fields: returns 400.
6. **[Database]** Looks up user by email.
   - If not found: Backend returns 401 Invalid credentials.
7. **[Backend]** Calls `bcrypt.compare(input, hash)`.
   - If mismatch: returns 401 Invalid credentials.
8. **[Database]** Updates `last_login_at`.
9. **[Backend]** Signs JWT, sets `3dex_session` cookie.
10. **[Backend]** Returns 200 with user object.
11. **[Frontend]** Stores user in `AuthContext`, redirects to home.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| Fields empty? | Show error, stop | Continue |
| User found? | Continue | Return 401 |
| Password match? | Continue | Return 401 |

---

## Relationship to Sequence Diagram

This diagram reinforces the same flow shown in `sequence_local_login.puml` but uses swim lanes to emphasize which system component is responsible for each step, making the responsibility boundaries clearer for implementation purposes.

---

## Notes

- The double validation (client-side and server-side) is intentional. Client-side validation gives immediate feedback; server-side validation is the authoritative gate.
- The `bcrypt.compare` step happens only after confirming the user exists, preventing unnecessary computation on non-existent accounts.
