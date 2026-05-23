# Activity Diagram - Define Print Capability

> **UML Type:** Activity Diagram
> **Category:** Print
> **Source:** `docs/diagrams/activity/print/activity_define_print_capability.puml`

![Activity Diagram - Define Print Capability](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/print/activity_define_print_capability.png)

---

## Overview

This activity diagram describes the process by which a Provider configures their 3D printing capabilities on the platform. This is what enables them to appear in the print provider discovery system when users request a print job.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Provider | Fills in print capability details |
| Frontend | Submits configuration to the backend |
| Backend | Validates role and input data |
| Database | Upserts the provider configuration record |

---

## Process Flow

1. **[Provider]** Opens Provider Settings.
2. **[Provider]** Fills the print capability form:
   - Materials supported (PLA, PETG, ABS, etc.)
   - Layer heights available (quality tiers)
   - Build volume and max print size
   - Price per gram
   - Supported colors
3. **[Frontend]** Dispatches `POST /print/providers/capability { materials, layer_heights, build_volume, price_per_gram, supported_colors }`.
4. **[Backend]** Verifies the requestor's role is `PROVIDER`.
   - If not provider: returns 403 Forbidden.
5. **[Backend]** Validates `materials` array is not empty.
   - If empty: returns 400 Bad Request.
6. **[Backend]** Validates `price_per_gram > 0`.
7. **[Database]** Upserts `Provider_Config` record for the user.
8. **[Backend]** Returns 200 OK with the updated config.
9. **[Frontend]** Shows "Capability profile updated" confirmation. Provider becomes discoverable in print provider search.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| User is PROVIDER? | No | Return 403 Forbidden |
| Materials non-empty? | No | Return 400 Bad Request |
| price_per_gram > 0? | No | Validation error |

---

## Key Implementation Details

- **Discoverability:** A provider without a configured `Provider_Config` record is invisible in the print order flow. This configuration is a prerequisite for accepting print jobs.
- **Upsert Pattern:** Providers can update their capabilities at any time. The upsert ensures only one configuration record per provider exists.
