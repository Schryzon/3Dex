# Activity Diagram - Notifications

> **UML Type:** Activity Diagram
> **Category:** Notifications
> **Source:** `docs/diagrams/activity/notifications/activity_notifications.puml`

![Activity Diagram - Notifications](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/notifications/activity_notifications.png)

---

## Overview

This activity diagram describes the notification pull and mark-as-read workflow. It highlights the operations executed when loading lists, updating single notification records, and clearing all notifications at once.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Interacts with notification panel trigger and item links |
| Frontend | Issues API calls and updates local state counters |
| Backend | Runs session validation and constructs updates |
| Database | Queries and updates the `Notification` table |

---

## Process Flow

1. **[User]** Clicks the notification bell icon.
2. **[Frontend]** Dispatches `GET /notifications` to load history.
3. **[Database]** Queries `Notification` table: `findMany({ user_id, orderBy: created_at desc })`.
4. **[Backend]** Returns 200 OK along with notifications array.
5. **[Frontend]** Renders the list and updates the global unread count badge.

**User Interaction Fork (mutually exclusive choices):**

- **Choice A: Click Single Notification**
  1. **[User]** Clicks a single notification item in the popover.
  2. **[Frontend]** Dispatches `PATCH /notifications/:id/read`.
  3. **[Database]** Updates `Notification` record: `is_read = true`.
  4. **[Backend]** Returns 200 OK.
  5. **[Frontend]** Decrements the navbar unread count by 1 and navigates to the notification's destination path.

- **Choice B: Click "Mark All as Read"**
  1. **[User]** Clicks "Mark all as read" button.
  2. **[Frontend]** Dispatches `POST /notifications/read-all`.
  3. **[Database]** Updates all matching records: `updateMany({ user_id, is_read: false }, { is_read: true })`.
  4. **[Backend]** Returns 200 OK.
  5. **[Frontend]** Sets the unread count badge to 0.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Click action? | Single | Send patch, update single item, decrement badge count, navigate |
| Click action? | Mark All | Send read-all post, update all records to read, zero badge count |

---

## Key Implementation Details

- **Deep Linking:** The `Notification` model includes a JSON `data` column. This holds contextual details (e.g., `{ model_id: "...", post_id: "..." }`), which the frontend reads when a notification is clicked to determine where to redirect the user.
- **Atomic Read-All Updates:** The `updateMany` operation on the Database runs as a single SQL update command, ensuring fast execution even if the user has many unread records.
