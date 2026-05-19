# Activity Diagram - Report

> **UML Type:** Activity Diagram
> **Category:** Admin
> **Source:** `docs/diagrams/activity/admin/activity_report.puml`

![Activity Diagram - Report](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/admin/activity_report.png)

---

## Overview

This activity diagram shows the end-to-end report lifecycle from user submission to admin resolution, using parallel forks to represent the two resolution outcomes: Resolve or Dismiss.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Submits the abuse report |
| Frontend | Manages the report form and confirmation |
| Backend | Validates and persists |
| Database | Stores report and updates status |
| Admin | Reviews and resolves reports |

---

## Process Flow

**User Submission Phase:**

1. **[User]** Clicks "Report" on a model, post, or comment.
2. **[Frontend]** Sends `POST /reports { target_type, reason, target_id }`.
3. **[Backend]** Validates:
   - `target_type` must be in `[MODEL, POST, COMMENT]`.
   - `reason` must not be empty.
   - If invalid: returns 400. Flow ends.
4. **[Database]** Creates `Report { status: PENDING }`.
5. **[Backend]** Returns 201 Created.
6. **[Frontend]** Shows "Report submitted" notification to user.

**Admin Resolution Phase:**

7. **[Admin]** Reviews the reports list at `GET /admin/reports`.
8. **[Admin]** Makes a resolution decision.

**Fork:**

**Resolve path:**

9A. **[Admin]** Clicks "Resolve".
10A. **[Frontend]** Sends `PATCH /admin/reports/:id { status: REVIEWED }`.
11A. **[Database]** Updates `Report.status = REVIEWED`.

**Dismiss path:**

9B. **[Admin]** Clicks "Dismiss".
10B. **[Frontend]** Sends `PATCH /admin/reports/:id { status: DISMISSED }`.
11B. **[Database]** Updates `Report.status = DISMISSED`.

**Rejoin:**

12. **[Frontend]** Report closed in UI.

---

## Decision Points Summary

| Decision | Yes Path | No Path |
|---|---|---|
| target_type valid? | Continue | Return 400 |
| reason present? | Continue | Return 400 |
| Admin resolves? | REVIEWED path | - |
| Admin dismisses? | DISMISSED path | - |

---

## Notes

- Report resolution does not automatically take action on the reported content. If the admin decides the report is valid, they must separately delete the content or ban the user.
- The `Report_Status` enum has three values: `PENDING` (submitted, awaiting review), `REVIEWED` (admin has seen and resolved it), and `DISMISSED` (admin has seen and rejected it as invalid).
