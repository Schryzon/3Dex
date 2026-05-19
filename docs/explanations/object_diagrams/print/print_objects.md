# Object Diagram - Print Context

> **UML Type:** Object Diagram
> **Category:** Print
> **Source:** `docs/diagrams/objects/print/print_objects.puml`

![Object Diagram - Print Context](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/objects/print/print_objects.png)

---

## Overview

This object diagram captures a runtime snapshot of the print job domain, modeling a full print order lifecycle from customer submission through payment. It shows the relationships between the customer, provider, order, items, configuration, payment, and model.

---

## Objects

### alice_buyer : Customer

The customer who submitted the print order.

| Attribute | Value |
|---|---|
| id | "usr_cust_2" |
| username | "Alice3D" |

---

### fast_print : Provider

The approved 3D printing service provider assigned to fulfill the job.

| Attribute | Value |
|---|---|
| id | "usr_prov_1" |
| username | "FastPrint3D" |
| role | "Provider" |

---

### order_01 : Order

The print job order record.

| Attribute | Value |
|---|---|
| id | "ord_777" |
| total_amount | 5000 (IDR) |
| status | "Processing" (Order_Status.PENDING or custom state) |
| type | "Print" (Order_Type.PRINT_JOB) |
| courier_name | "JNE" |
| tracking_number | "TRACK123456" |

> Note: The diagram shows `status = "Processing"`. The schema does not have a "Processing" state in `Order_Status`. The actual valid values are PENDING, PAID, FAILED, and CANCELLED. Processing state is tracked at the `Order_Item` level via the `print_status` field (Print_Status enum: PENDING, ACCEPTED, PROCESSING, SHIPPED, DELIVERED, CANCELLED).

---

### order_item_01 : Order_Item

A single line item in the print order.

| Attribute | Value |
|---|---|
| id | "item_123" |
| price | 5000 (IDR) |
| quantity | 1 |
| print_status | "Printing" (Print_Status.PROCESSING) |

---

### print_config_01 : Json

The print configuration JSON embedded in the `order_item_01` record.

| Attribute | Value |
|---|---|
| material | "PLA" |
| infill | "20%" |
| color | "Black" |

---

### payment_01 : Payment

The successful Midtrans payment record for this order.

| Attribute | Value |
|---|---|
| id | "pay_456" |
| transaction_status | "Success" (Midtrans "settlement" value) |
| payment_type | "Credit_Card" |
| gross_amount | 5000 (IDR) |

---

### cyber_helmet : Model

The model being printed.

| Attribute | Value |
|---|---|
| id | "mdl_helm_99" |
| is_printable | true |

---

## Relationships

| From | Relationship | To | Description |
|---|---|---|---|
| alice_buyer | places | order_01 | Customer creates the order |
| fast_print | provider_for | order_01 | Provider is assigned to the order |
| order_01 | contains (composition) | order_item_01 | Item is part of the order |
| order_item_01 | print_config (composition) | print_config_01 | Config JSON embedded in item |
| order_item_01 | referenced in | cyber_helmet | Item points to the model being printed |
| order_01 | processes (composition) | payment_01 | Payment record linked to the order |

---

## System Behavior Notes

- Print orders use `Order_Type.PRINT_JOB`. The `provider_id` foreign key on `Order` is set at creation time when the customer selects a provider.
- Print configuration (material, infill, color, scale) is stored in the `print_config` JSON column on each `Order_Item`. The provider reads this to understand what to produce.
- The `print_status` field on `Order_Item` tracks the physical lifecycle of each item independently (PENDING -> ACCEPTED -> SHIPPED -> DELIVERED or CANCELLED).
- The payment for a print job is separate from digital asset payments. Print jobs may use a different billing arrangement since the payment_01 shown here has a nonzero `gross_amount`.
