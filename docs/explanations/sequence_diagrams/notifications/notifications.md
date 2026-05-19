# Sequence Diagram - Notifications

> **UML Type:** Sequence Diagram
> **Category:** Notifications
> **Source:** `docs/diagrams/sequence/notifications/sequence_notifications.puml`

![Sequence Diagram - Notifications](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/notifications/sequence_notifications.png)

---

## Overview

This diagram covers the notification panel lifecycle: loading notifications, marking a single notification as read, and marking all notifications as read at once.

---

## Participants

| Participant | Role |
|---|---|
| User | The authenticated user |
| Frontend | The client |
| NotificationController | Express route handler for notification operations |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Load Notifications

The user clicks the notification bell icon. The Frontend calls `list_notifications(session_cookie)`.

NotificationController queries `notification.findMany({ user_id, orderBy: created_at desc })`. Returns all notifications for the user. The Frontend renders the panel with unread notifications highlighted.

### Part 2 - Mark Single as Read

The user clicks on a specific notification. The Frontend calls `mark_read(notification_id)`.

NotificationController calls `notification.update({ id, is_read: true })`. Returns **200 OK**. The Frontend decrements the unread badge count.

### Part 3 - Mark All as Read

The user clicks "Mark all as read". The Frontend calls `mark_all_read(session_cookie)`.

NotificationController calls `notification.updateMany({ user_id, is_read: false }, { is_read: true })`. Returns **200 OK**. The Frontend clears all unread dots.

---

## Key Implementation Details

- Notifications are created by `NotificationService` at various event points: payment completion, follow events, and print job status changes.
- The `type` field on `Notification` is a free-form string used by the frontend to determine rendering style (icon, color) and navigation destination (via the `data` field).
- There is no real-time push mechanism (WebSocket or SSE) shown here. Notifications are pulled on demand when the user opens the bell panel.
- The `data` JSON field can carry arbitrary metadata (e.g., model ID, order ID) enabling the frontend to deep-link to relevant content when the notification is clicked.
