# Activity Diagram - Verify Licensing & Terms

> **UML Type:** Activity Diagram
> **Category:** Commerce
> **Source:** `docs/diagrams/activity/commerce/activity_verify_licensing.puml`

![Activity Diagram - Verify Licensing & Terms](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/commerce/activity_verify_licensing.png)

---

## Overview

This activity diagram describes the license verification step embedded within the checkout flow. In the UCD, "Verify licensing & terms" is an `<<include>>` of "Proceed to checkout" — it is mandatory and always executed before payment.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| User | Reviews and agrees to license terms |
| Frontend | Fetches license data and gates the payment button |
| Backend | Returns license details per model |
| Database | Provides license records for all items in the order |

---

## Process Flow

1. **[User]** Reaches the checkout summary page.
2. **[Frontend]** Fetches license records for all models in the order.
3. **[Database]** Returns `License` records for each model.
4. **[Backend]** Returns license details per model.
5. **[Frontend]** Displays license terms for each model:
   - License type (FREE, PERSONAL, COMMERCIAL, EXCLUSIVE)
   - Usage restrictions
   - Attribution requirements
6. **[User]** Reviews all license terms.
   - If agrees: checks the "I agree" checkbox. Frontend enables "Continue to Payment" button.
   - If does not agree: leaves checkout.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| User agrees to all terms? | No | Checkout abandoned |

---

## Key Implementation Details

- **Gate Pattern:** The payment button is disabled until the user explicitly checks the "I agree to all license terms" checkbox. This is a UI-side gate backed by a server-side audit trail of accepted terms.
- **UCD Relationship:** This is an `<<include>>` of "Proceed to checkout" — not optional. Every checkout must pass through license verification before payment can proceed.
