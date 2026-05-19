# Sequence Diagram - Report Submission and Resolution

> **UML Type:** Sequence Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/sequence/admin/sequence_report.puml`

![Sequence Diagram - Report Submission and Resolution](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/admin/sequence_report.png)

---

## Overview

This diagram covers the full lifecycle of an abuse report: from a user submitting a report on a piece of content, to an admin reviewing and resolving it. It is split into two phases shown in the same diagram.

---

## Participants

| Participant | Role |
|---|---|
| User | The authenticated user submitting the report |
| Frontend | The client |
| ReportController | Express route handler for report creation |
| AdminController | Express route handler for report resolution |
| Database | PostgreSQL via Prisma |

---

## Flow

### Phase 1 - User Submits a Report

**Trigger:** User clicks "Report" on a model, post, or comment.

1. The Frontend shows a form for the user to select a reason.
2. The user selects a reason and submits.
3. The Frontend calls `create_report({ target_type, reason, [model_id|post_id|comment_id] })`.

ReportController:
1. Validates that `target_type` is one of `MODEL`, `POST`, or `COMMENT`.
2. Validates that `reason` is not empty.
3. Creates a `Report` record with `status = PENDING`.

ReportController returns **201 Created**. The Frontend shows a "Report submitted" confirmation to the user.

---

### Phase 2 - Admin Resolves the Report

**Trigger:** Admin opens the pending reports list.

1. The Frontend calls `list_reports(status: PENDING)`.
2. AdminController queries the database for all pending reports including reporter details.
3. The Frontend displays the report list to the Admin.

**Trigger:** Admin clicks "Resolve" on a report.

1. The Frontend calls `resolve_report(report_id, status: REVIEWED)`.
2. AdminController updates the report's `status` to `REVIEWED`.
3. The Frontend removes the report from the pending queue.

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Invalid target_type | 400 Bad Request |
| Empty reason | 400 Bad Request |

---

## Key Implementation Details

- The `target_type` enum in the schema is `Report_Target` with values `MODEL`, `POST`, `COMMENT`.
- Depending on the `target_type`, one of `model_id`, `post_id`, or `comment_id` is populated. The others are null.
- The resolution status can be either `REVIEWED` or `DISMISSED` (`Report_Status` enum). The diagram only shows the `REVIEWED` path. The dismiss path follows the same mechanics but sets `status = DISMISSED`.
- Reports do not automatically trigger any action on the reported content. The admin must take a separate moderation action (delete, ban, etc.) if warranted.
- This diagram shows `resolve_report` handled by the `AdminController`, not the `ReportController`, because only admins can resolve reports. Report creation is available to all authenticated users.
