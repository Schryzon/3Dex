# Activity Diagram - Sync Social Platform

> **UML Type:** Activity Diagram
> **Category:** Catalog (Profile Management)
> **Source:** `docs/diagrams/activity/catalog/activity_sync_social.puml`

![Activity Diagram - Sync Social Platform](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_sync_social.png)

---

## Overview

This activity diagram describes the flow for linking an external social media account (e.g. Instagram, Twitter/X) to a user's 3Dex profile. In the UCD, this is an `<<extend>>` of the "Manage user profile" use case.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Initiates the social link process |
| Frontend | Redirects to platform OAuth and submits the token |
| External Platform | Handles OAuth authorization and returns an access token |
| Backend | Validates the platform and exchanges the token |
| Database | Upserts the social link record |

---

## Process Flow

1. **[User]** Opens Social Settings and clicks "Connect Platform" (e.g. Instagram).
2. **[Frontend]** Redirects to the external platform's OAuth consent page.
3. **[External Platform]** User grants access. Returns OAuth access token.
4. **[Frontend]** Dispatches `POST /users/me/social { platform, access_token }`.
5. **[Backend]** Validates that the platform is a supported type (INSTAGRAM, TWITTER, etc.).
   - If unsupported: returns 400 Bad Request.
6. **[Backend]** Exchanges the token and fetches the user's profile URL from the platform.
   - If token invalid: returns 401 Auth failed.
7. **[Database]** Upserts `Social_Link` record `{ user_id, platform, profile_url }`.
8. **[Backend]** Returns 200 OK.
9. **[Frontend]** Displays the linked platform badge on the user's public profile.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Platform supported? | No | Return 400 Bad Request |
| Token valid? | No | Return 401 Auth failed |

---

## Key Implementation Details

- **OAuth Flow:** The external platform handles the auth — 3Dex only receives and validates the resulting token. The platform profile URL is stored, not the raw token.
- **UCD Relationship:** This is a profile extension (`<<extend>>`) — syncing social accounts is optional and triggered from within the Manage user profile flow.
