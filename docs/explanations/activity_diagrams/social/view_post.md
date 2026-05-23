# Activity Diagram - View Post

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_view_post.puml`

![Activity Diagram - View Post](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_view_post.png)

---

## Overview

This activity diagram describes the process of loading and rendering the community feed. It focuses on the server-side operations that assemble social posts and dynamically inject user-specific social states (such as whether the current user has liked a post or followed its author).

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Requests the community page |
| Frontend | Issues API calls and renders post widgets |
| Backend | Assembles search queries and maps custom flags |
| Database | Queries posts, comments, likes, and follows |

---

## Process Flow

1. **[User]** Navigates to the Community Feed page.
2. **[Frontend]** Dispatches `GET /posts` with the user's session token.
3. **[Database]** Queries `Post` records, ordering by `created_at` descending.
4. **[Database]** Fetches related entity counts in the query:
   - Count of `Post_Like` records per post.
   - Count of `Post_Comment` records per post.
5. **[Backend]** Verifies the requesting user session status (authenticated vs. guest).

**Conditional Logic Branching:**

- **If User is Authenticated:**
  1. **[Database]** Queries `Post_Like` for records matching `(user_id, post_id)` to determine like status.
  2. **[Database]** Queries `Follow` for records matching `(follower_id, post.user_id)` to determine follow status.
  3. **[Backend]** Injects dynamic flags per post: `is_liked = true/false`, `is_followed = true/false`.
- **If User is a Guest (Anonymous):**
  1. **[Backend]** Sets flags to defaults: `is_liked = false`, `is_followed = false`.

6. **[Backend]** Returns 200 OK along with the compiled posts payload.
7. **[Frontend]** Renders the post cards, using the dynamic flags to style the like (heart) and follow buttons.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Authenticated? | Yes | Query DB for likes and follows, inject dynamic boolean flags |
| Authenticated? | No | Set like/follow flags to false |

---

## Key Implementation Details

- **Server-Side Mapping:** Mapping flags like `is_liked` and `is_followed` directly on the server reduces frontend logic and prevents a flurry of additional API calls from the client to determine interaction states.
- **Denormalized Optimization:** Although comment and like counts can be calculated dynamically, the backend utilizes denormalized counters (`like_count` and `comment_count`) on the `Post` table to keep list fetches highly performant.
