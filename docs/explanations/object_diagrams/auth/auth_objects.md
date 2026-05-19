# Object Diagram - Auth Context

> **UML Type:** Object Diagram
> **Category:** Auth
> **Source:** `docs/diagrams/objects/auth/auth_objects.puml`

![Object Diagram - Auth Context](c:/Users/nyoma/Downloads/3Dex/docs/diagrams/exports/objects/auth/auth_objects.png)

---

## Overview

This object diagram illustrates the runtime state of a User and their associated `status_history` JSON entries after two login attempts. It models the auth-context snapshot as it exists in the database.

---

## Objects

### john_doe : User

A concrete instance of the `User` entity representing an authenticated customer.

| Attribute | Value |
|---|---|
| id | "usr_001" |
| email | "john@example.com" |
| username | "johndoe99" |
| role | "Customer" |
| account_status | "Active" (APPROVED in schema) |
| two_factor_enabled | true |
| last_login_at | "2026-04-27T10:00:00Z" |

> Note: `account_status = "Active"` in the diagram corresponds to `Account_Status.APPROVED` in the Prisma schema.

---

### login_history_01 : Json

A JSON entry embedded in the `status_history` array on the User record. Represents a successful login event.

| Attribute | Value |
|---|---|
| ip_address | "192.168.1.10" |
| device | "Windows PC" |
| status | "Success" |
| timestamp | "2026-04-27T10:00:00Z" |

---

### login_history_02 : Json

A second embedded JSON entry representing a failed login attempt.

| Attribute | Value |
|---|---|
| ip_address | "192.168.1.15" |
| device | "MacBook Pro" |
| status | "Failed" |
| timestamp | "2026-04-26T15:30:00Z" |

---

## Relationships

| From | Relationship | To | Description |
|---|---|---|---|
| john_doe (User) | status_history (composition) | login_history_01 (Json) | First entry in the status_history Json array |
| john_doe (User) | status_history (composition) | login_history_02 (Json) | Second entry in the status_history Json array |

> The composition notation indicates that `login_history_01` and `login_history_02` are owned by and cannot exist independently from `john_doe`. In practice, they are stored directly as JSON objects in the `status_history` column.

---

## System Behavior Notes

- The `status_history` field is a `Json[]` column on the `User` table in Prisma. When an admin approves or rejects a user, a new JSON record is appended to this array.
- This diagram represents the snapshot after one successful session and one failed attempt, showing that the platform tracks session events in-place on the User record.
- The `last_login_at` field is updated by the `AuthService` on every successful login, as shown in the `sequence_local_login.puml` diagram.
