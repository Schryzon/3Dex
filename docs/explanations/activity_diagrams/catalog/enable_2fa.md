# Activity Diagram - Enable 2FA Security

> **UML Type:** Activity Diagram
> **Category:** Catalog (Profile Management)
> **Source:** `docs/diagrams/activity/catalog/activity_enable_2fa.puml`

![Activity Diagram - Enable 2FA Security](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_enable_2fa.png)

---

## Overview

This activity diagram describes the flow for enabling Time-based One-Time Password (TOTP) two-factor authentication on a user's account. In the UCD, this is an `<<extend>>` of the "Manage user profile" use case.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Initiates 2FA setup and verifies OTP |
| Frontend | Orchestrates setup flow and displays QR code |
| Backend | Generates TOTP secret and validates OTP |
| Database | Stores TOTP secret and 2FA enabled flag |

---

## Process Flow

1. **[User]** Opens Security Settings and clicks "Enable 2FA".
2. **[Frontend]** Dispatches `POST /auth/2fa/setup`.
3. **[Backend]** Generates TOTP secret using `otplib`. Creates QR code URI (`otpauth://`).
4. **[Frontend]** Displays QR code and manual entry key.
5. **[User]** Scans QR code with authenticator app (Google Authenticator, Authy, etc.).
6. **[User]** Enters the 6-digit OTP to confirm setup.
7. **[Frontend]** Dispatches `POST /auth/2fa/verify { otp }`.
8. **[Backend]** Validates OTP against the secret.
   - If invalid OTP: returns 400. Frontend shows "Invalid code" error.
9. **[Database]** Updates user: `{ totp_secret, two_fa_enabled: true }`.
10. **[Backend]** Returns 200 OK with backup codes.
11. **[Frontend]** Displays backup codes modal and "2FA enabled" confirmation.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| OTP valid? | No | Return 400, show error |

---

## Key Implementation Details

- **TOTP Standard:** The system uses the RFC 6238 TOTP standard, compatible with all standard authenticator apps.
- **Backup Codes:** One-time backup codes are generated and shown once on setup. Users must save them securely before closing the modal.
- **UCD Relationship:** This is a profile extension (`<<extend>>`) — enabling 2FA is optional and triggered from within the Manage user profile flow.
