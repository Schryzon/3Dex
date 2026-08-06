# Activity Diagram - View User Profile

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_view_user_profile.puml`

![Activity Diagram - View User Profile](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_view_user_profile.png)

---

## Overview

This activity diagram describes the flow for viewing another user's public profile page. It covers lookup by username, presigned media generation, and conditional rendering based on the viewer's authentication state.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User or Guest | Navigates to a public profile |
| Frontend | Fetches and renders profile data |
| Backend | Compiles profile response with access control |
| Database | Fetches user details, social stats, and content |
| MinIO | Generates presigned avatar and banner URLs |

---

## Process Flow

1. **[User or Guest]** Navigates to `/profile/:username`.
2. **[Frontend]** Dispatches `GET /users/:username`.
3. **[Database]** Looks up user by username.
4. **[Backend]** If not found: returns 404. Frontend shows "Profile not found".
5. **[MinIO]** Presigns `avatar_url` and `banner_url`.
6. **[Database]** Counts followers and following. Fetches pinned models (artist). Fetches recent posts (artist/provider). Fetches average rating and review count.
7. **[Backend]** Compiles profile response. Returns 200 OK.
8. **[Frontend]** Renders: avatar, banner, bio, social links, follower/following counts, model grid (if artist), recent posts (if artist/provider), rating and review count.
9. **[User or Guest]** If authenticated and viewing another's profile:
   - Shows Follow/Unfollow button.
   - Can navigate to Rate or Report actions.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| User found? | No | Return 404, show "Profile not found" |
| Authenticated + viewing other profile? | Yes | Show Follow/Unfollow, Rate, Report actions |

---

## Key Implementation Details

- **Public Profile:** The profile page is publicly accessible — even unauthenticated guests can view an artist's or provider's public content.
- **UCD Relationship:** "View user profile" includes `<<extend>>` connections to "Follow/unfollow creator" and "Moderate content & user", exposing these actions contextually from the profile view.
