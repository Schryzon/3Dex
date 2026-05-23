# Activity Diagram - Configure Print Materials

> **UML Type:** Activity Diagram
> **Category:** Print
> **Source:** `docs/diagrams/activity/print/activity_configure_print_materials.puml`

![Activity Diagram - Configure Print Materials](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/print/activity_configure_print_materials.png)

---

## Overview

This activity diagram describes the flow for configuring print material options before submitting a print job order. In the UCD, "Configure print materials" is an `<<include>>` of "Proceed to checkout" for print orders.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Selects material, color, layer height, and quantity |
| Frontend | Fetches provider capabilities and computes cost estimate |
| Backend | Returns provider capability options |
| Database | Provides the provider configuration record |

---

## Process Flow

1. **[User]** Selects a provider and a model for printing.
2. **[User]** Opens the print configuration panel.
3. **[Frontend]** Dispatches `GET /print/providers/:id/capability`.
4. **[Database]** Fetches `Provider_Config` for the provider.
5. **[Backend]** Returns: `materials[]`, `colors[]`, `layer_heights[]`, `price_per_gram`.
6. **[Frontend]** Renders the configuration form with the provider's available options.
7. **[User]** Selects:
   - Material (e.g. PLA, PETG, ABS)
   - Color
   - Layer height (quality tier)
   - Quantity
8. **[Frontend]** Computes estimated price: `weight_grams × price_per_gram × quantity`.
9. **[Frontend]** Displays cost estimate.
10. **[User]** Confirms configuration.
11. **[Frontend]** Stores configuration as `{ material, color, layer_height, quantity }` in the order payload. Enables "Submit Print Order" button.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| *(selections driven by provider options only)* | — | — |

---

## Key Implementation Details

- **Dynamic Options:** The form is always populated from the provider's live capability config — no hardcoded options. This ensures the user only selects materials and specs the provider actually supports.
- **Cost Estimation:** The price estimate is computed client-side for instant feedback. The server revalidates the final price on order submission to prevent manipulation.
- **UCD Relationship:** This is an `<<include>>` of "Proceed to checkout" in the print flow — configuration is mandatory before a print order can be placed.
