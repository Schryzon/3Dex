# Sequence Diagram - Social Post

> **UML Type:** Sequence Diagram
> **Category:** Social
> **Source:** `docs/diagrams/sequence/social/sequence_social_post.puml`

![Sequence Diagram - Social Post](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/social/sequence_social_post.png)

---

## Overview

This is the most comprehensive social diagram. It covers the entire community feed experience: loading the feed, creating a new post with image uploads, toggling a like on a post, and adding a comment.

---

## Participants

| Participant | Role |
|---|---|
| User (Artist / Provider) | The authenticated user |
| Frontend | The client |
| PostController | Express route handler for post operations |
| StorageController | Express route handler for presigned URL generation |
| StorageClient (S3) | MinIO backend |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Load Feed

The user opens the Community page. The Frontend calls `get_feed_posts()`.

PostController queries `post.findMany(orderBy: created_at desc)` including user details, `_count` for likes and comments, and the current user's likes for each post.

PostController maps additional flags per post: `is_liked` (whether the current user has liked it) and `is_followed` (whether the current user follows the post's author).

Returns the feed to the Frontend.

### Part 2 - Create a Post

The user clicks "New Post". The Frontend shows a media upload form.

**Step 1: Image Upload**

For each selected image, the Frontend requests a presigned PUT URL from StorageController. StorageController returns presigned URLs. The Frontend uploads each image binary directly to MinIO.

**Step 2: Post Creation**

The Frontend calls `create_post({ caption, media_urls: [keys], is_nsfw })`.

PostController:
1. Checks `user.role`. Only `ARTIST` or `PROVIDER` can create posts.
2. If the role is `CUSTOMER` or `ADMIN`: returns **403 Only Artists and Providers can post!**
3. Validates that `media_urls` is not empty (posts require at least one image).
4. If no media: returns **400 Bad Request**.
5. Calls `post.create({ user_id, caption, media_urls, is_nsfw })`.
6. Returns **201 Post**. The post appears in the feed.

### Part 3 - Like / Unlike

The user clicks the heart icon on a post. The Frontend calls `toggle_like(post_id, session_cookie)`.

PostController checks for an existing `Post_Like` record.

**If like exists (unlike):**
1. Deletes the `Post_Like` record.
2. Decrements `post.like_count`.
3. Returns `{ message: "Unliked" }`.

**If no like (like):**
1. Creates a `Post_Like` record.
2. Increments `post.like_count`.
3. Returns `{ message: "Liked" }`.

### Part 4 - Add a Comment

The user types a comment and submits. The Frontend calls `add_comment(post_id, content)`.

PostController:
1. Validates `content` is not empty.
2. Creates `post_Comment.create({ user_id, post_id, content })`.
3. Increments `post.comment_count`.
4. Returns the `Post_Comment`. The comment appears below the post.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Post creation by Customer or Admin | 403 Forbidden |
| Post with no images | 400 Bad Request |
| Empty comment | 400 Bad Request |

---

## Key Implementation Details

- `like_count` and `comment_count` are denormalized fields on `Post`. They are updated atomically using Prisma's `increment`/`decrement` operations alongside the create/delete of the related records.
- The `is_liked` and `is_followed` flags are computed server-side per post, enabling the frontend to render the correct button states without additional requests.
- Admin users cannot create posts. Post creation is restricted to Customers with the Artist or Provider role.
