# Object Diagram - Notifications Context

> **UML Type:** Object Diagram
> **Category:** Notifications
> **Source:** `docs/diagrams/objects/notifications/notifications_objects.puml`

![Object Diagram - Notifications Context](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/objects/notifications/notifications_objects.png)

---

## Overview

This object diagram shows a snapshot of the notifications domain, modeling two distinct notification records delivered to a single Artist user.

---

## Objects

### cyber_artist : Artist

The notification recipient.

| Attribute | Value |
|---|---|
| id | "usr_artist_1" |
| username | "CyberCrafter" |

---

### notif_01 : Notification

A system notification triggered by an admin action.

| Attribute | Value |
|---|---|
| id | "not_444" |
| type | "SYSTEM" |
| title | "Model Approved" |
| message | "Your model was approved!" |
| is_read | false |

---

### notif_02 : Notification

A social notification triggered by a follow action.

| Attribute | Value |
|---|---|
| id | "not_445" |
| type | "SOCIAL" |
| title | "New Follower" |
| message | "Alice3D started following you." |
| is_read | true |

---

## Relationships

| From | Relationship | To | Description |
|---|---|---|---|
| cyber_artist | receives (composition) | notif_01 | System notification owned by artist |
| cyber_artist | receives (composition) | notif_02 | Social notification owned by artist |

---

## System Behavior Notes

- The `type` field is a free-form string in the schema. The values "SYSTEM" and "SOCIAL" are application-level conventions used by the `NotificationService`.
- The `is_read = false` on `notif_01` means it will appear highlighted in the notification panel and contribute to the unread badge count.
- Notifications are created by `NotificationService.create_notification()` and dispatched from multiple points in the application: the payment webhook, the follow handler, and the print job lifecycle manager.
- The `data` field (not shown here) can carry optional JSON metadata, for example a model ID or post ID that the notification relates to, enabling deep-link navigation.
