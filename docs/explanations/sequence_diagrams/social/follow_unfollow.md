# Sequence Diagram - Follow and Unfollow

> **UML Type:** Sequence Diagram
> **Category:** Social
> **Source:** `docs/diagrams/sequence/social/sequence_follow_unfollow.puml`

![Sequence Diagram - Follow and Unfollow](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/social/sequence_follow_unfollow.png)

---

## Overview

This diagram describes the follow and unfollow flows when a user visits another user's profile, checks the follow state, and toggles it.

---

## Participants

| Participant | Role |
|---|---|
| User | The authenticated user performing the action |
| Frontend | The client |
| FollowController | Express route handler for follow operations |
| NotificationService | In-app notification creator |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Load Profile and Follow Stats

The user visits an artist's profile. The Frontend calls `get_follow_stats(target_user_id)`.

FollowController queries:
- `follow.findMany({ following_id: target })` to get followers
- `follow.findMany({ follower_id: target })` to get following

Returns follower/following counts and a boolean `is_following` flag. The Frontend renders the Follow button accordingly.

### Part 2 - Follow

The user clicks "Follow". The Frontend calls `follow(target_user_id, session_cookie)`.

FollowController:
1. Checks `follow.findUnique({ follower_id: user_id, following_id: target_user_id })`.
2. If already following: returns **400 Already following**. Flow terminates.
3. Calls `follow.create({ follower_id: user_id, following_id: target_user_id })`.
4. Calls NotificationService to create a notification for the target user:
   ```
   { type: FOLLOW, title: "New Follower", message: "@user started following you" }
   ```
5. Returns `{ message: "Followed" }`. The Frontend changes the button to "Following".

### Part 3 - Unfollow

The user clicks "Unfollow". The Frontend calls `unfollow(following_id, session_cookie)`.

FollowController:
1. Checks `follow.findUnique({ follower_id: user_id, following_id: target_user_id })`.
2. If not following: returns **404 Follow not found**.
3. Calls `follow.delete({ id })`.
4. Returns `{ message: "Unfollowed" }`. The Frontend reverts the button to "Follow".

Note: Unfollowing does NOT create a notification for the target user.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Already following | 400 Already following |
| Follow record not found during unfollow | 404 Not Found |

---

## Key Implementation Details

- The `Follow` table has a unique constraint on `(follower_id, following_id)`, preventing duplicate follow records at the database level.
- Follow notifications use `type = FOLLOW` as a string convention. The `data` JSON field on the notification can carry the follower's user ID for the frontend to render a profile link.
- The `is_following` flag returned by `get_follow_stats` is derived by checking if a Follow record exists where `follower_id = current_user AND following_id = target`. This is computed server-side.
