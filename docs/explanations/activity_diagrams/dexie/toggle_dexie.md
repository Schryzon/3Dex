# Activity Diagram - Toggle Dexie On/Off

> **UML Type:** Activity Diagram
> **Category:** Dexie
> **Source:** `docs/diagrams/activity/dexie/activity_toggle_dexie.puml`

![Activity Diagram - Toggle Dexie On/Off](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/dexie/activity_toggle_dexie.png)

---

## Overview

This activity diagram describes the flow for enabling or disabling the Dexie AI assistant for a user's account. In the UCD, this is an `<<extend>>` of the "Manage user profile" use case and an `<<include>>` of the "Display contextual tagline" use case.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Navigates to Dexie preferences and clicks the toggle |
| Frontend | Fetches current state, submits change, and updates UI |
| Backend | Validates and persists the preference |
| Database | Updates the user's Dexie enabled flag |

---

## Process Flow

1. **[User]** Opens User Settings and navigates to "Dexie AI" preferences.
2. **[Frontend]** Dispatches `GET /users/me/dexie-status`.
3. **[Backend]** Returns current `dexie_enabled` flag.
4. **[Frontend]** Renders the toggle in the correct initial state (ON/OFF).
5. **[User]** Clicks the toggle switch.
6. **[Frontend]** Dispatches `PATCH /users/me { dexie_enabled: <new_value> }`.
7. **[Backend]** Validates `dexie_enabled` is a boolean.
   - If invalid: returns 400 Bad Request.
8. **[Database]** Updates `User` record `{ dexie_enabled }`.
9. **[Backend]** Returns 200 OK.
10. **[Frontend]** Updates toggle state.
    - **If now ON:** Enables personalised picks and contextual taglines.
    - **If now OFF:** Disables all Dexie AI features across the platform.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| dexie_enabled is boolean? | No | Return 400 Bad Request |
| Dexie now ON? | Yes | Enable picks + taglines |
| Dexie now OFF? | Yes | Disable all Dexie features |

---

## Key Implementation Details

- **Feature Gate:** The `dexie_enabled` flag acts as a user-level feature gate. When disabled, both the "Display contextual tagline" and "Generate personalised picks" flows return early without calling the Dexie AI service.
- **UCD Relationship:** "Toggle dexie on/off" is included in the "Display contextual tagline" flow (`<<include>>`) and extends "Manage user profile" (`<<extend>>`), making it a cross-cutting preference that affects multiple downstream use cases.
