# Activity Diagram - Toggle Content Visibility (NSFW)

> **UML Type:** Activity Diagram
> **Category:** Catalog (Profile Management)
> **Source:** `docs/diagrams/activity/catalog/activity_toggle_nsfw.puml`

![Activity Diagram - Toggle Content Visibility (NSFW)](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_toggle_nsfw.png)

---

## Overview

This activity diagram describes the flow for toggling the NSFW (Not Safe For Work) content visibility preference on a user's account. In the UCD, this is an `<<extend>>` of the "Manage user profile" use case.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Triggers the NSFW toggle |
| Frontend | Submits the preference and updates the local state |
| Backend | Validates and persists the preference change |
| Database | Updates the user record |

---

## Process Flow

1. **[User]** Opens Account Settings and navigates to the Content preferences section.
2. **[User]** Toggles the "Show NSFW Content" switch.
3. **[Frontend]** Dispatches `PATCH /users/me { show_nsfw: true/false }`.
4. **[Backend]** Validates the request body contains a boolean `show_nsfw` field.
   - If invalid: returns 400 Bad Request.
5. **[Database]** Updates `User` record: `{ show_nsfw }`.
6. **[Backend]** Returns 200 OK.
7. **[Frontend]** Updates local user preference in `AuthContext`.
8. **[Frontend]** If currently on the catalog, refreshes the feed to apply/remove the NSFW filter.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Request body valid? | No | Return 400 Bad Request |

---

## Key Implementation Details

- **Server-Side Enforcement:** The NSFW preference is enforced server-side. The catalog filter (`GET /models`) reads `show_nsfw` from the session and filters results accordingly — preventing client-side manipulation of content visibility.
- **UCD Relationship:** This is a profile extension (`<<extend>>`) — toggling NSFW visibility is optional and triggered from within the Manage user profile flow.
