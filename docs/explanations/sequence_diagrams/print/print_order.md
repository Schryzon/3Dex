# Sequence Diagram - Print Order

> **UML Type:** Sequence Diagram
> **Category:** Print
> **Source:** `docs/diagrams/sequence/print/sequence_print_order.puml`

![Sequence Diagram - Print Order](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/sequence/print/sequence_print_order.png)

---

## Overview

This diagram describes how a customer browses available print providers and submits a print job order for a 3D model.

---

## Participants

| Participant | Role |
|---|---|
| Customer | The authenticated user |
| Frontend | The client |
| PrintController | Express route handler for print operations |
| Database | PostgreSQL via Prisma |

---

## Flow

### Part 1 - Browse Providers

The Customer wants to get a model physically printed. The Frontend calls `get_providers(city, material)`.

PrintController queries `user.findMany({ role: PROVIDER, account_status: APPROVED })`. It then applies:
1. **Material filter:** Keeps only providers whose `provider_config.materials` array includes the requested material (e.g., "PLA").
2. **Location sort:** Scores providers based on city/country match and sorts by proximity priority.

PrintController returns sorted providers. The Frontend shows each provider with their rating, supported materials, and location.

### Part 2 - Submit Print Order

The Customer selects a provider and configures print items (material, color, scale per model). The Customer submits:
```
{
  provider_id,
  items: [{ model_id, print_config }],
  shipping_address,
  courier_name
}
```

The Frontend calls `create_print_order({ provider_id, items, shipping_address, courier_name })`.

PrintController:
1. Looks up the provider by ID to validate they exist and are approved.
2. If invalid: returns **400 Invalid provider!**
3. Creates the order:
```
order.create({
  user_id, provider_id,
  type: PRINT_JOB, status: PENDING,
  shipping_address, courier_name,
  items: [{ model_id, price: 0, print_config, print_status: PENDING }]
})
```

Note: Print orders start with `price: 0` per item; the financial agreement between customer and provider is handled externally or through a separate billing flow.

PrintController returns **201 Order**. The Frontend confirms: "Print order submitted! Waiting for provider."

---

## Error Paths

| Condition | HTTP Response |
|---|---|
| Invalid or unapproved provider | 400 Invalid provider |

---

## Key Implementation Details

- Print orders use `Order_Type.PRINT_JOB`. This distinguishes them from digital asset orders (`ASSET`) in all order management views.
- The `provider_config` JSON field on the Provider's User record holds their capabilities (materials, colors, location, pricing). The filtering logic reads this field.
- Unlike digital purchases, print orders do not go through Midtrans immediately. The provider must accept the job first. Payment handling for print jobs may follow a separate flow.
- The `shipping_address` is a JSON field on the Order, containing the delivery details provided by the customer.
