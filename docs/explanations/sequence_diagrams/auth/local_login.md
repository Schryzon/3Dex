# Sequence Diagram - Local Login

> **UML Type:** Sequence Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/sequence/auth/sequence_local_login.puml`

![Sequence Diagram - Local Login](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/auth/sequence_local_login.png)

---

## Overview

This diagram describes the message flow when a user logs in using their email and password (local authentication). It covers field validation, credential verification, JWT issuance, and S3 URL signing.

---

## Participants

| Participant | Role |
|---|---|
| User | The human actor submitting the login form |
| Frontend | The Next.js client managing the login form and session state |
| AuthController | The Express route handler for `/auth/login` |
| AuthService | Business logic layer for authentication |
| Database | PostgreSQL via Prisma |
| StorageService | S3 pre-signing helper for avatar and banner URLs |

---

## Flow

### 1. Form Submission

The user fills in the login form with their email and password and submits it. The Frontend sends a POST request to the AuthController.

### 2. Field Validation

AuthController immediately validates that both `email` and `password` are present in the request body.

- If either field is missing: returns **400 Missing fields** to the Frontend, which displays an error to the user. The flow terminates.

### 3. Credential Lookup

AuthController delegates to AuthService, which queries the database for a user record with the given email.

- If no user is found: AuthService returns null, AuthController returns **401 Invalid credentials**. The flow terminates.

### 4. Password Verification

AuthService calls `bcrypt.compare(password, user.password)` to verify the submitted plaintext against the stored hash.

- If the password does not match: returns **401 Invalid credentials**. The flow terminates.

### 5. Last Login Update

AuthService updates the user's `last_login_at` timestamp in the database.

### 6. JWT Signing and Cookie

AuthController signs a JWT containing `{ id, email, username, role }`. It then sets an HTTP-only session cookie named `3dex_session` with `sameSite=lax` and a 7-day `maxAge`.

### 7. S3 URL Signing

AuthController calls StorageService to generate a presigned S3 URL for the user's `avatar_url`. The signed URL is embedded in the response.

### 8. Response and Redirect

AuthController returns **200** with the user object (including the signed avatar URL). The Frontend stores the user in `AuthContext` and redirects to the home page.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Missing email or password | 400 Missing fields |
| User not found by email | 401 Invalid credentials |
| Password mismatch | 401 Invalid credentials |

---

## Key Implementation Details

- The error message is intentionally generic ("Invalid credentials") for both user-not-found and wrong-password cases, preventing user enumeration attacks.
- The cookie is `httpOnly`, meaning JavaScript on the client cannot read it. The server reads it on every subsequent authenticated request via the auth middleware.
- `StorageService` calls MinIO (S3-compatible) to generate a short-lived presigned GET URL for the avatar so the client can display the profile image without exposing permanent keys.
