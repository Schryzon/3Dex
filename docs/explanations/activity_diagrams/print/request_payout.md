# Activity Diagram - Request Earnings Payout

> **UML Type:** Activity Diagram
> **Category:** Print
> **Source:** `docs/diagrams/activity/print/activity_request_payout.puml`

![Activity Diagram - Request Earnings Payout](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/activity/print/activity_request_payout.png)

---

## Overview

This activity diagram describes the payout request flow for Artists and Providers who have accumulated earnings from model sales or print jobs. The system validates the available balance before creating a pending payout record.

---

## Swim Lanes

| Lane | Responsibility |
|---|---|
| Artist or Provider | Initiates payout from their earnings dashboard |
| Frontend | Fetches balance, renders form, submits request |
| Backend | Validates amount against balance and minimum threshold |
| Database | Calculates available balance and creates payout record |

---

## Process Flow

1. **[Artist or Provider]** Opens the Earnings Dashboard.
2. **[Artist or Provider]** Clicks "Request Payout".
3. **[Frontend]** Dispatches `GET /payouts/balance`.
4. **[Database]** Calculates pending balance: completed sales − previous payouts.
5. **[Backend]** Returns balance summary.
6. **[Frontend]** Displays available balance and payout form (bank account / e-wallet details).
7. **[Artist or Provider]** Enters withdrawal amount and confirms payout method.
8. **[Frontend]** Dispatches `POST /payouts { amount, method, account_details }`.
9. **[Backend]** Validates `amount <= available_balance`.
   - If insufficient: returns 400 Insufficient balance.
10. **[Backend]** Validates amount meets the minimum payout threshold.
    - If below minimum: returns 400 Below minimum threshold.
11. **[Database]** Creates `Payout` record `{ status: PENDING }`.
12. **[Backend]** Queues payout for processing. Returns 201 Created.
13. **[Frontend]** Shows "Payout request submitted — processing in 1–3 business days" message.

---

## Decision Points Summary

| Decision | Path/Condition | Outcome |
|---|---|---|
| Amount <= available balance? | No | Return 400 Insufficient balance |
| Amount >= minimum threshold? | No | Return 400 Below minimum |

---

## Key Implementation Details

- **Balance Calculation:** Available balance is computed dynamically from `completed orders − existing payouts`, ensuring no overpayment edge cases.
- **Processing Queue:** Payouts are not instant — they are queued for manual or automated processing and marked `COMPLETED` once funds are transferred.
