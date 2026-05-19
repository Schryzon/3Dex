# Activity Diagram - User Registration

> **UML Type:** Activity Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/activity/auth/activity_register.puml`

![Activity Diagram - User Registration](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/auth/activity_register.png)

---

## Overview

This activity diagram shows the user registration process across swim lanes, emphasizing the validation steps, password hashing, and uniqueness enforcement.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Fills and submits the registration form |
| Frontend | Client-side validation |
| Backend | Server-side validation and persistence |
| Database | Data creation and constraint checking |

---

## Process Flow

1. **[User]** Fills in email, username, and password.
2. **[Frontend]** Client validates that all fields are present and the username meets format rules (3-30 characters, alphanumeric, no spaces).
   - If invalid: shows field error. Flow ends.
3. **[Frontend]** Sends `POST /auth/register { email, username, password }`.
4. **[Backend]** Validates presence of all fields.
   - If missing: returns 400.
5. **[Backend]** Calls `bcrypt.hash(password, 10)`.
6. **[Database]** Calls `user.create({ email, username, password_hash, role: CUSTOMER, account_status: APPROVED })`.
7. **[Database]** Checks unique constraints on `email` and `username`.
   - If Prisma error P2002 (unique violation): Backend returns 409 Conflict ("Email or username already taken").
8. **[Backend]** Returns 201 Created.
9. **[Frontend]** Shows success message, redirects to `/login`.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| Client fields valid? | Continue | Show error, stop |
| Server fields present? | Continue | Return 400 |
| DB unique constraint passes? | Continue | Return 409 |

---

## Notes

- Registration creates only `CUSTOMER` accounts. Role upgrades require a separate application flow.
- No session token is issued at registration. The user must log in separately after completing registration.
- The username validation rules (3-30 chars, alphanumeric) are enforced at both the client level and should be enforced at the Prisma level via `@db.VarChar(30)`.
