# Object Diagram - Complete System Snapshot

> **UML Type:** Object Diagram
> **Category:** Uncategorized (Complete System Overview)
> **Source:** `docs/diagrams/objects/complete_system_object_diagram.puml`

![Object Diagram - Complete System Snapshot](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/objects/complete_system_object_diagram.png)

---

## Overview

This is the master object diagram for the entire 3Dex platform. It instantiates one representative object from every major domain and connects them to illustrate how all parts of the system interact in a single coherent runtime snapshot.

---

## Objects by Domain

### Users

| Object Name | Type | Key Attributes |
|---|---|---|
| sys_admin | Admin | id="usr_admin_1", username="super_admin", role="Admin" |
| cyber_artist | Artist | id="usr_artist_1", username="CyberCrafter", role="Artist" |
| alice_buyer | Customer | id="usr_cust_2", username="Alice3D", role="Customer" |
| fast_print | Provider | id="usr_prov_1", username="FastPrint3D", role="Provider" |

### Catalog and Models

| Object Name | Type | Key Attributes |
|---|---|---|
| cat_scifi | Category | id="cat_001", name="Sci-Fi" |
| tag_cyberpunk | Tag | id="tag_001", name="Cyberpunk" |
| tag_helmet | Tag | id="tag_002", name="Helmet" |
| cyber_helmet | Model | id="mdl_helm_99", title="Cyberpunk Helmet 3D", price=2500, status="Approved", is_printable=true |

### Shopping and Orders

| Object Name | Type | Key Attributes |
|---|---|---|
| purchase_01 | Purchase | id="pur_101", price_paid=2500, license="Personal" |
| cart_item_01 | Cart_Item | id="cart_123", quantity=1 |
| wishlist_01 | Wishlist | id="wish_456" |
| order_01 | Order | id="ord_777", total_amount=5000, status="Processing" |
| order_item_01 | Order_Item | id="item_123", price=5000, quantity=1 |
| payment_01 | Payment | id="pay_456", transaction_status="Success" |

### Social and Community

| Object Name | Type | Key Attributes |
|---|---|---|
| model_review_01 | Review | id="rev_55", rating=5, comment="Prints perfectly!" |
| artist_review_01 | User_Review | id="urev_88", rating=5, comment="Great artist, very responsive." |
| post_01 | Post | id="pst_888", caption="Working on a new mech design!" |
| post_like_01 | Post_Like | id="lik_12" |
| post_comment_01 | Post_Comment | id="cmt_34", content="Looks awesome!" |
| follow_01 | Follow | id="fol_99" |
| collection_01 | Collection | id="col_111", name="Favorite Sci-Fi Props" |
| col_item_01 | Collection_Item | id="citem_222" |

### System and Admin

| Object Name | Type | Key Attributes |
|---|---|---|
| report_01 | Report | id="rep_333", reason="Inappropriate content" |
| notif_01 | Notification | id="not_444", message="Your model was approved!" |
| audit_log_01 | Admin_Audit_Log | id="aud_555", action="APPROVE_MODEL" |
| platform_stats | Stats | id="stat_1", period_start="2026-04-01", period_end="2026-04-30" |

---

## Relationships

### Catalog and Model Relationships

| From | Relationship | To |
|---|---|---|
| cyber_artist | creates | cyber_helmet |
| cat_scifi | categorizes | cyber_helmet |
| cyber_helmet | tagged_with | tag_cyberpunk |
| cyber_helmet | tagged_with | tag_helmet |

### Commerce Relationships

| From | Relationship | To |
|---|---|---|
| alice_buyer | purchases | purchase_01 |
| purchase_01 | has | cyber_helmet |
| alice_buyer | owns (composition) | cart_item_01 |
| cart_item_01 | in cart | cyber_helmet |
| alice_buyer | owns (composition) | wishlist_01 |
| wishlist_01 | in wishlist | cyber_helmet |
| alice_buyer | places | order_01 |
| fast_print | provider_for | order_01 |
| order_01 | contains (composition) | order_item_01 |
| order_item_01 | referenced in | cyber_helmet |
| order_01 | processes (composition) | payment_01 |

### Social Relationships

| From | Relationship | To |
|---|---|---|
| alice_buyer | writes (composition) | model_review_01 |
| model_review_01 | has | cyber_helmet |
| alice_buyer | gives | artist_review_01 |
| artist_review_01 | receives | cyber_artist |
| cyber_artist | creates (composition) | post_01 |
| alice_buyer | creates | post_like_01 |
| alice_buyer | creates | post_comment_01 |
| post_01 | has (composition) | post_like_01 |
| post_01 | has (composition) | post_comment_01 |
| alice_buyer | follows | follow_01 |
| follow_01 | following | cyber_artist |
| alice_buyer | manages | collection_01 |
| collection_01 | contains (composition) | col_item_01 |
| col_item_01 | referenced in | cyber_helmet |

### System and Admin Relationships

| From | Relationship | To |
|---|---|---|
| alice_buyer | submits | report_01 |
| report_01 | target | post_01 |
| cyber_artist | receives (composition) | notif_01 |
| sys_admin | performs_action | audit_log_01 |
| audit_log_01 | target | cyber_helmet |

---

## System Behavior Notes

- This diagram is the union of all sub-category object diagrams. It demonstrates the full graph of dependencies in a single user journey where Alice browses, purchases, and reviews a model, while the artist posts content, the provider fulfills a print job, and the admin oversees everything.
- All `id` values are representative slugs, not real UUIDs, for readability.
- The `status = "Processing"` on `order_01` is a conceptual simplification. In the actual schema, this maps to intermediate states tracked by `Order_Item.print_status` rather than the `Order.status` field (which uses PENDING/PAID/FAILED/CANCELLED).
