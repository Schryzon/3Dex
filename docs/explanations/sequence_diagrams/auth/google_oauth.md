# Sequence Diagram - Google OAuth Login

> **UML Type:** Sequence Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/sequence/auth/sequence_google_oauth.puml`

![Sequence Diagram - Google OAuth Login](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/auth/sequence_google_oauth.png)

---

## Overview

This diagram describes the complete message flow for Google OAuth authentication using Google One Tap or the standard OAuth prompt. It handles three distinct cases: returning Google user, existing local user linking their Google account, and brand new users.

---

## Participants

| Participant | Role |
|---|---|
| User | The human actor clicking "Continue with Google" |
| Frontend | The Next.js client initiating the OAuth flow |
| OAuthClient | The Google OAuth2 client library |
| AuthController | The Express route handler for `/auth/google` |
| AuthService | Business logic for Google authentication |
| Database | PostgreSQL via Prisma |

---

## Flow

### 1. OAuth Prompt

The user clicks "Continue with Google". The Frontend triggers the Google One Tap prompt (or OAuth redirect). Google's library returns a credential string (an ID token).

### 2. Token Delivery

The Frontend sends the credential to AuthController via `google_login(credential)`.

### 3. Token Verification

AuthService sends the credential to Google's OAuth2 API for verification. Google returns a `GooglePayload` containing `{ sub, email, name, picture }`.

### 4. User Lookup - Three Cases

AuthService queries the database to find an existing user by `google_id = sub`.

**Case A - Returning Google user:** A user with that `google_id` exists. AuthService uses them directly.

**Case B - Existing local user (account linking):** No user found by `google_id`, but a user exists with the same email. AuthService updates that user's record, setting `google_id = sub`. This links the Google account to the existing local account.

**Case C - Brand new user:** No user found by either `google_id` or email. AuthService creates a new user record with an auto-generated username, sets `role = CUSTOMER`, `account_status = APPROVED`, and marks `isNew = true`.

### 5. JWT and Cookie

AuthController signs a JWT and sets the `3dex_session` cookie, same as local login.

### 6. Conditional Redirect

- If `isNew = true`: AuthController responds with `{ user, needs_username: true }`. The Frontend redirects to `/complete-profile` so the user can set a proper username.
- Otherwise: responds with `{ user, needs_username: false }` and Frontend redirects to home.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Missing credential in request body | 400 Bad Request |
| Google token verification fails | 401 Google Auth Failed |

---

## Key Implementation Details

- Auto-generated usernames for new Google users are temporary placeholders. The `/complete-profile` step forces the user to choose a valid username before proceeding.
- Google OAuth users bypass the `PENDING` account status; they are auto-approved as `CUSTOMER` immediately. Only Artist and Provider applications require admin approval.
- The `google_id` field is stored as a unique key on the `User` table, enabling fast lookup on subsequent logins without needing to reverify the email.
