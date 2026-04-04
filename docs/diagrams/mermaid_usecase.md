# Use Case Diagram

This diagram represents the use cases derived from the 3Dex application schema, explicitly highlighting actor inheritance (generalization) and use case dependencies (`include` and `extend`).

```mermaid
flowchart LR
    %% Actors
    Guest(("Guest"))
    Customer(("Customer"))
    Artist(("Artist"))
    Provider(("Provider (Print)"))
    Admin(("Admin"))

    %% Generalization (Inheritance)
    Customer -- inherits --> Guest
    Artist -- inherits --> Customer
    Provider -- inherits --> Customer
    Admin -- inherits --> Customer

    subgraph 3Dex Platform Environment
        UC_Auth([Register / Login])
        UC_Profile([Manage User Profile])
        UC_Search([Browse / Search Models])
        UC_View([View Model Details])
        UC_Cart([Add to Wishlist / Cart])
        UC_Checkout([Checkout & Place Order])
        UC_Pay([Process Payment Midtrans])
        UC_Download([Download 3D Model])
        UC_Print([Request 3D Print Job])
        UC_Review([Review Model / Provider])
        UC_Social([Social: Follow / Post])
        UC_Interact([Social: Like / Comment])
        UC_Collection([Manage Collections])
        
        UC_Upload([Upload & Sell Models])
        UC_Portfolio([Manage Portfolio])
        
        UC_AcceptPrint([Accept & Manage Print Jobs])
        UC_ConfigPrint([Configure Print Materials])
        
        UC_Approve([Approve / Reject Content])
        UC_Stats([Manage Platform Stats])
        UC_ManageUsers([Manage Users])
        UC_Reports([Review Reports])
    end

    %% Base Associations
    Guest --> UC_Auth
    Guest --> UC_Search

    Customer --> UC_Profile
    Customer --> UC_Cart
    Customer --> UC_Checkout
    Customer --> UC_Download
    Customer --> UC_Print
    Customer --> UC_Review
    Customer --> UC_Social
    Customer --> UC_Collection

    Artist --> UC_Upload
    Artist --> UC_Portfolio

    Provider --> UC_AcceptPrint
    Provider --> UC_ConfigPrint

    Admin --> UC_Approve
    Admin --> UC_Stats
    Admin --> UC_ManageUsers
    Admin --> UC_Reports

    %% Includes (Mandatory execution)
    UC_Checkout -. "<<include>>" .-> UC_Pay
    UC_Print -. "<<include>>" .-> UC_Checkout

    %% Extends (Optional extension / Alternative flow)
    UC_View -. "<<extend>>" .-> UC_Search
    UC_Cart -. "<<extend>>" .-> UC_View
    UC_Interact -. "<<extend>>" .-> UC_Social
    UC_Portfolio -. "<<extend>>" .-> UC_Upload
```
