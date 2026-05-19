# Activity Diagram - Post Delete

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_post_delete.puml`

![Activity Diagram - Post Delete](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_post_delete.png)

---

## Overview

This activity diagram describes the community post deletion process. It highlights the security checks verifying either author ownership or admin moderator status before deleting post and cascade-related data.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Author or Admin | Triggers deletion |
| Frontend | Dispatches delete request |
| Backend | Verifies session, matches ownership, and authorizes deletion |
| Database | Performs lookups and handles cascade deletions |

---

## Process Flow

1. **[Author or Admin]** Clicks the "Delete Post" button on a feed card.
2. **[Frontend]** Dispatches `DELETE /posts/:id` with user headers.
3. **[Database]** Looks up the post by ID.
4. **[Backend]** Checks if the post exists.
   - If not found: returns 404. Flow ends.
5. **[Backend]** Evaluates authorization boundaries:
   - Is the user ID equal to `post.user_id` (ownership check)?
   - Does the user possess the `ADMIN` role?
6. **[Backend]** Branching:
   - **No (neither is true):** Returns 403 Forbidden. Flow ends.
   - **Yes (at least one is true):**
     1. **[Database]** Deletes the `Post` record.
     2. **[Database]** Executes database-level cascades:
        - Deletes associated `Post_Like` records.
        - Deletes associated `Post_Comment` records.
     3. **[Backend]** Returns 200 OK.
     4. **[Frontend]** Removes the post card from the community feed.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Post exists? | No | Return 404, stop |
| Authorized? (Owner or Admin) | Yes | Delete post, cascade comments and likes, return 200 |
| Authorized? | No | Return 403 Forbidden, stop |

---

## Key Implementation Details

- **Cascade Settings:** The prisma schema designates cascading deletes for post engagements. Deleting a post automatically wipes clean its dependent likes and comments from PostgreSQL.
- **Admin Moderation Bypass:** The admin bypass allows platform moderators to remove offensive or non-compliant posts immediately without requiring the author's credentials.
