# Object Diagram - Social Context

> **UML Type:** Object Diagram
> **Category:** Social
> **Source:** `docs/diagrams/objects/social/social_objects.puml`

![Object Diagram - Social Context](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/objects/social/social_objects.png)

---

## Overview

This object diagram models the social domain at runtime. It shows how an Artist and a Customer interact through posts, likes, comments, follows, and reviews.

---

## Objects

### cyber_artist : Artist

The creator being followed and reviewed.

| Attribute | Value |
|---|---|
| id | "usr_artist_1" |
| username | "CyberCrafter" |

---

### alice_buyer : Customer

The user interacting with the artist's content.

| Attribute | Value |
|---|---|
| id | "usr_cust_2" |
| username | "Alice3D" |

---

### post_01 : Post

A community post published by the artist.

| Attribute | Value |
|---|---|
| id | "pst_888" |
| caption | "Working on a new mech design!" |
| like_count | 15 |
| comment_count | 5 |

---

### post_like_01 : Post_Like

A like record created by Alice on the post.

| Attribute | Value |
|---|---|
| id | "lik_12" |

---

### post_comment_01 : Post_Comment

A comment left by Alice on the post.

| Attribute | Value |
|---|---|
| id | "cmt_34" |
| content | "Looks awesome!" |

---

### follow_01 : Follow

A directed follow edge from Alice to the artist.

| Attribute | Value |
|---|---|
| id | "fol_99" |

---

### model_review_01 : Review

A model review written by Alice for one of the artist's models.

| Attribute | Value |
|---|---|
| id | "rev_55" |
| rating | 5 |
| comment | "Prints perfectly!" |

---

### artist_review_01 : User_Review

A user-level review of the artist as a seller, written by Alice.

| Attribute | Value |
|---|---|
| id | "urev_88" |
| rating | 5 |
| comment | "Great artist, very responsive." |

---

## Relationships

| From | Relationship | To | Description |
|---|---|---|---|
| cyber_artist | creates (composition) | post_01 | Artist owns the post |
| alice_buyer | creates | post_like_01 | Alice created the like |
| alice_buyer | creates | post_comment_01 | Alice created the comment |
| post_01 | has (composition) | post_like_01 | Like is part of the post |
| post_01 | has (composition) | post_comment_01 | Comment is part of the post |
| alice_buyer | follows | follow_01 | Alice initiated the follow |
| follow_01 | following | cyber_artist | The follow points to the artist |
| alice_buyer | writes (composition) | model_review_01 | Review owned by Alice |
| alice_buyer | gives | artist_review_01 | User review given by Alice |
| artist_review_01 | receives | cyber_artist | Artist receives the user review |

---

## System Behavior Notes

- `like_count` and `comment_count` on `Post` are denormalized counters. They are incremented/decremented atomically in the database alongside the create/delete of `Post_Like` and `Post_Comment` records.
- `Review` (model review) and `User_Review` (person review) are two separate tables. A `Review` requires a prior `Purchase`, while a `User_Review` requires either a purchase from the artist or a completed print job from the provider.
- The `Follow` table is directional: `follower_id` is Alice, `following_id` is the artist. When Alice follows the artist, a `Notification` is created for the artist.
- Post creation is restricted to users with `role = ARTIST` or `role = PROVIDER`. Customers cannot create posts.
