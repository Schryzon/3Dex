# Activity Diagram - Define Licenses & Pricings

> **UML Type:** Activity Diagram
> **Category:** Catalog
> **Source:** `docs/diagrams/activity/catalog/activity_define_licenses.puml`

![Activity Diagram - Define Licenses & Pricings](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_define_licenses.png)

---

## Overview

This activity diagram describes the process by which an Artist sets or updates the license type and pricing for their uploaded 3D model. This use case is included (`<<include>>`) as part of the "Upload 3D Models" use case in the UCD.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Artist | Selects license type and enters price |
| Frontend | Submits the license configuration |
| Backend | Validates ownership and input data |
| Database | Upserts the license record |

---

## Process Flow

1. **[Artist]** Selects a license type (FREE, PERSONAL, COMMERCIAL, EXCLUSIVE) for a model.
2. **[Frontend]** Dispatches `POST /models/:id/licenses { license_type, price }`.
3. **[Backend]** Verifies the requestor is the model owner.
   - If not owner: returns 403 Forbidden.
4. **[Backend]** Validates the `license_type` is a valid enum value.
   - If invalid: returns 400.
5. **[Backend]** Validates `price >= 0`.
   - If negative: returns 400.
6. **[Database]** Upserts the `License` record for `(model_id, license_type)`.
7. **[Backend]** Returns 200 OK with the license details.
8. **[Frontend]** Updates the license badge and price display on the model page.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Is owner? | No | Return 403 Forbidden |
| License type valid? | No | Return 400 Bad Request |
| Price >= 0? | No | Return 400 Invalid price |

---

## Key Implementation Details

- **License Types:** The platform supports four license tiers — FREE (no charge, open use), PERSONAL (paid, personal projects only), COMMERCIAL (paid, commercial use permitted), and EXCLUSIVE (paid, single buyer exclusivity).
- **Upsert Pattern:** Artists can update their license configuration at any time. The upsert ensures a single active license record per `(model_id, license_type)` combination, preventing duplicate entries.
