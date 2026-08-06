# Activity Diagram - Update Shipping Address

> **UML Type:** Activity Diagram
> **Category:** Catalog (Profile Management)
> **Source:** `docs/diagrams/activity/catalog/activity_update_shipping.puml`

![Activity Diagram - Update Shipping Address](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/catalog/activity_update_shipping.png)

---

## Overview

This activity diagram describes the flow for updating a user's saved shipping address. In the UCD, this is an `<<extend>>` of the "Manage user profile" use case.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Opens account settings and edits address |
| Frontend | Submits the address update |
| Backend | Validates fields and format |
| Database | Upserts the shipping address record |

---

## Process Flow

1. **[User]** Opens account settings and navigates to shipping address section.
2. **[User]** Edits shipping address fields (street, city, province, postal code, country).
3. **[Frontend]** Dispatches `PATCH /users/me/shipping { street, city, province, postal_code, country }`.
4. **[Backend]** Validates all required fields are present.
   - If missing: returns 400 Bad Request.
5. **[Backend]** Validates the `postal_code` format.
   - If invalid format: returns 400.
6. **[Database]** Upserts `Shipping_Address` record for the user.
7. **[Backend]** Returns 200 OK.
8. **[Frontend]** Displays "Address saved" confirmation toast.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Required fields present? | No | Return 400 Bad Request |
| Postal code format valid? | No | Return 400 Invalid postal code |

---

## Key Implementation Details

- **Upsert Pattern:** Each user has one canonical shipping address. The upsert operation creates it on first save or overwrites it on subsequent updates, avoiding duplicate address records.
- **UCD Relationship:** This is a profile extension (`<<extend>>`) — the shipping address is optional and the user triggers it conditionally from within their profile management flow.
