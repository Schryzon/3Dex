# Activity Diagram - Comment on a Post

> **UML Type:** Activity Diagram
> **Category:** Social
> **Source:** `docs/diagrams/activity/social/activity_comment_on_post.puml`

![Activity Diagram - Comment on a Post](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/social/activity_comment_on_post.png)

---

## Overview

This activity diagram describes the flow for posting a comment on a community feed post. Authentication is required, and upon success a notification is sent to the post owner.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Navigates to post and submits comment |
| Frontend | Validates session, renders input, and submits comment |
| Backend | Validates content and creates comment record |
| Database | Persists comment and creates notification |

---

## Process Flow

1. **[User]** Navigates to a post and clicks "Comment".
2. **[Frontend]** Validates the user is authenticated.
   - If not authenticated: redirects to `/login`.
3. **[Frontend]** Displays the comment input field.
4. **[User]** Types comment text and submits.
5. **[Frontend]** Dispatches `POST /posts/:post_id/comments { content }`.
6. **[Backend]** Validates content is non-empty and within the character limit.
   - If invalid: returns 400 Bad Request.
7. **[Database]** Creates `Post_Comment` record `{ post_id, user_id, content }`.
8. **[Backend]** Returns 201 Created with comment data.
9. **[Frontend]** Appends the new comment to the thread.
10. **[Database]** Creates a `Notification` for the post owner.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Authenticated? | No | Redirect to /login |
| Content valid? | No | Return 400 Bad Request |

---

## Key Implementation Details

- **Auth Gate:** Comments are restricted to authenticated users only. Guests can view comments but must register to participate.
- **Notification Side Effect:** A notification is automatically created for the post owner whenever a new comment is posted, enabling real-time engagement awareness.
