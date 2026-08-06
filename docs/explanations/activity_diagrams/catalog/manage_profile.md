# Activity Diagram - Manage User Profile

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_manage_profile.puml`

![Activity Diagram - Manage User Profile](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_manage_profile.png)

---

## Overview

This activity diagram details the operational path when a user modifies their profile settings, including profile image uploads to S3 storage, JWT token re-signing, and session update coordination.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Modifies profile fields and saves settings |
| Frontend | Captures fields and dispatches request |
| Backend | Runs field sanitization, updates DB, and issues new tokens |
| Database | Updates User record details |
| MinIO | Validates uploaded asset keys and issues presigned URLs |

---

## Process Flow

1. **[User]** Opens their profile settings page.
2. **[Frontend]** Dispatches `PATCH /users/:id/profile` containing modified fields (display name, bio, banner keys, etc.).
3. **[Backend]** Verifies the request authentication and authorization context.
   - If unauthorized: returns 403 Forbidden. Flow ends.
4. **[Backend]** Parses and filters the input payload, extracting allowed fields.
5. **[Backend]** Checks if new S3 file keys (`avatarKey` or `bannerKey`) are provided.

**Conditional Path: Image Update**

- **If image keys are present:**
  1. **[MinIO]** Backend validates that the keys exist inside the storage bucket.
  2. **[Database]** Updates the user record with the new `avatar_url` and/or `banner_url` storage keys.

6. **[Database]** Persists all other changes to the `User` table.
7. **[Backend]** Generates a fresh JWT containing updated profile summaries (display name, avatar URL, etc.).
8. **[Backend]** Issues the fresh token in a new `3dex_session` Set-Cookie header.
9. **[MinIO]** Generates updated presigned URLs for the user's avatar and banner image.
10. **[Backend]** Returns 200 OK along with the updated user data.
11. **[Frontend]** Updates its internal `AuthContext` state, refreshing the navigation bar and current view.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Authorized? | No | Return 403, stop |
| S3 keys provided? | Yes | Validate keys, update image URLs in database |

---

## Key Implementation Details

- **Sliding JWT Sessions:** When a user updates their profile, their session must reflect these updates immediately (e.g., in the navbar display name). Re-signing the JWT and returning a new session cookie prevents stale token states.
- **S3 Key Verification:** Rather than letting the user submit arbitrary strings for image paths, the backend calls MinIO storage APIs to verify the physical files exist before updating paths in the database.
