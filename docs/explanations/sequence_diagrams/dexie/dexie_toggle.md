# Sequence Diagram - Dexie Toggle

> **UML Type:** Sequence Diagram
> **Category:** Dexie
> **Source:** `docs/diagrams/sequence/dexie/sequence_dexie_toggle.puml`

![Sequence Diagram - Dexie Toggle](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/dexie/sequence_dexie_toggle.png)

---

## Overview

This diagram shows how a user enables or disables the Dexie AI assistant from their settings page. The toggle persists to the database and immediately updates the frontend's Dexie state.

---

## Participants

| Participant | Role |
|---|---|
| User | The authenticated user |
| Frontend | The client |
| DexieController | Express route handler for the toggle endpoint |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Disable Dexie

The user opens the Settings page. The Frontend renders a toggle switch showing Dexie's current on/off state.

**User flips toggle to OFF:**

1. Frontend calls `toggle_dexie(enabled: false, session_cookie)`.
2. DexieController validates that `enabled` is a boolean.
3. DexieController calls `user.update({ id, dexie_enabled: false })`.
4. Returns **200 { message: "Dexie will quietly wait...", dexie_enabled: false }**.
5. Frontend calls `DexieContext.setEnabled(false)` and clears the current message (`setMessage(null)`).
6. The Dexie bubble disappears and the toggle shows OFF state.

### Part 2 - Re-enable Dexie

**User flips toggle to ON:**

1. Frontend calls `toggle_dexie(enabled: true, session_cookie)`.
2. DexieController calls `user.update({ id, dexie_enabled: true })`.
3. Returns **200 { message: "Dexie is active!", dexie_enabled: true }**.
4. Frontend calls `DexieContext.setEnabled(true)` and immediately calls `fetchTagline()` to surface a new Dexie message.
5. The Dexie bubble appears again.

---

## Key Implementation Details

- The `dexie_enabled` field is a `Boolean` column on the `User` table in Prisma, defaulting to `true`.
- Disabling Dexie affects both the tagline and the picks feature. The `is_dexie_enabled` check in DexieService gates both flows.
- The toggle immediately triggers a tagline fetch on re-enable, ensuring the user sees a message promptly without needing to navigate away and back.
- This is a user preference, not a platform-wide setting. Each user controls their own Dexie experience independently.
