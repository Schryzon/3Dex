# Sequence Diagram - User Registration

> **UML Type:** Sequence Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/sequence/auth/sequence_register.puml`

![Sequence Diagram - User Registration](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/auth/sequence_register.png)

---

## Overview

This diagram describes the registration flow for new users using local credentials (email, username, password). Registration always creates a Customer account. Artist and Provider accounts are upgraded separately through the admin approval flow.

---

## Participants

| Participant | Role |
|---|---|
| New User | The human actor filling the registration form |
| Frontend | The Next.js client hosting the form |
| AuthController | Express route handler for `/auth/register` |
| AuthService | Business logic layer |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. Form Submission

The user fills in email, username, and password and submits the form. The Frontend sends these to AuthController.

### 2. Field Validation

AuthController validates that all three fields are present.

- If any field is missing: returns **400 Missing fields**. The flow terminates.

### 3. Password Hashing

AuthService hashes the password using `bcrypt.hash(password, 10)` before any database write.

### 4. User Creation

AuthService calls `user.create` on the database with:
- `email`, `username`, hashed `password`
- `role = CUSTOMER`
- `account_status = APPROVED` (Customers are auto-approved; they do not require admin review)

If the database raises a unique constraint violation (Prisma error code P2002) due to a duplicate email or username:
- AuthController returns **409 Email or username exists**. The flow terminates.

### 5. Response

AuthController returns **201 Created** with `{ id, email }`. The Frontend displays a success message and redirects to `/login`.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Missing email, username, or password | 400 Missing fields |
| Duplicate email or username | 409 Conflict |

---

## Key Implementation Details

- Registration does not issue a session cookie or JWT. The user must log in separately after registering.
- The `role` is hardcoded to `CUSTOMER` in the registration flow. Users who want to become Artists or Providers must apply through the profile settings, which changes their role and sets `account_status = PENDING` for admin review.
- bcrypt cost factor is 10, balancing security and performance on the server.
