# Godly Use Case Diagram

This exhaustive diagram represents **every** feature, flow, and abstraction boundary within the 3Dex platform. It heavily maps out actor generalization alongside automated triggers originating from autonomous `System` entities (e.g. Midtrans) and `Time` schedulers.

```mermaid
flowchart LR
    %% Structural & Design constraints
    classDef actor fill:#fce4ec,stroke:#880e4f,stroke-width:2px;
    classDef system fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px;
    classDef time fill:#e0f2f1,stroke:#004d40,stroke-width:2px;
    classDef uc fill:#ffffff,stroke:#424242,stroke-width:1px;

    %% Base Actors
    Guest(("Guest")):::actor
    Customer(("Customer")):::actor
    Artist(("Artist")):::actor
    Provider(("Provider")):::actor
    Admin(("Admin")):::actor

    %% Non-Human Actors
    SystemMidtrans(("<<System>><br>Midtrans PG")):::system
    SystemNotif(("<<System>><br>Notif Engine")):::system
    TimeActor(("<<Time>><br>Cron Scheduler")):::time

    %% Inheritance visually represented via dotted lines
    Customer -. inherits .-> Guest
    Artist -. inherits .-> Customer
    Provider -. inherits .-> Customer
    Admin -. inherits .-> Customer

    subgraph 3Dex Platform Environment [3Dex Complete Architecture Bound]
        direction TB

        %% Auth & Profile
        Auth([Register / Login]):::uc
        2FA([Manage 2FA Security]):::uc
        Profile([Manage Profile & Bio]):::uc
        Address([Manage Shipping Addresses]):::uc
        Theme([Toggle NSFW & Themes]):::uc

        %% Catalog
        Search([Browse & Filter Assets]):::uc
        View([Interact with 3D Viewer]):::uc
        Wishlist([Manage Wishlist/Saves]):::uc
        Collection([Create & Manage Curated Collections]):::uc
        
        %% Social Community
        Follow([Follow / Unfollow Users]):::uc
        Post([Create Social Feed Posts]):::uc
        Interact([Like & Comment on Posts]):::uc
        Report([Report Abuse / TOS Violation]):::uc
        
        %% E-Commerce
        Cart([Manage Shopping Cart]):::uc
        PrintConfig([Configure Print Materials / Sizes]):::uc
        Checkout([Checkout & Place Order]):::uc
        Download([Unlock & Download Digital Assets]):::uc
        Review([Submit Restricted User/Model Reviews]):::uc

        %% Artist & Provider
        Upload([Upload Native 3D Models / Set Assets]):::uc
        Pricing([Set Dual Licensing & Pricing]):::uc
        Portfolio([Arrange External Portfolio Links]):::uc
        
        AcceptPrint([Accept/Deny Incoming Print Orders]):::uc
        TrackShip([Update Logistics & Tracking Info]):::uc

        %% Admin Moderation
        Approve([Approve/Reject Content Pipelines]):::uc
        Moderate([Review Reports & Enforce Bans]):::uc
        GenStats([Visualize Periodical Platform Stats]):::uc

        %% System Operations
        Webhook([Process Payment Webhooks]):::uc
        NotifyUser([Dispatch In-App & Email Notifications]):::uc
        CronCart([Prune Abandoned Payments/Carts]):::uc
        CronStats([Compile Periodic Data Analytics]):::uc
        CalcRatings([Recalculate Weighted Averages]):::uc
    end

    %% Human Connections
    Guest --> Auth
    Guest --> Search
    Guest --> View

    Customer --> Profile
    Customer --> Wishlist
    Customer --> Collection
    Customer --> Follow
    Customer --> Post
    Customer --> Report
    Customer --> Cart
    Customer --> Checkout
    Customer --> Review
    Customer --> Download

    Artist --> Upload
    Artist --> Portfolio

    Provider --> PrintConfig
    Provider --> AcceptPrint
    Provider --> TrackShip

    Admin --> Approve
    Admin --> Moderate
    Admin --> GenStats

    %% Non-Human Connections & Triggers
    SystemMidtrans --> Webhook
    Checkout -. "<<include>>" .-> Webhook
    Webhook -. "<<trigger>>" .-> NotifyUser
    
    SystemNotif --> NotifyUser

    TimeActor --> CronCart
    TimeActor --> CronStats
    TimeActor --> CalcRatings

    %% Extensions & Inclusions within Platform
    Auth -. "<<extend>>" .-> 2FA
    Profile -. "<<extend>>" .-> Address
    Profile -. "<<extend>>" .-> Theme
    Post -. "<<extend>>" .-> Interact
    Upload -. "<<include>>" .-> Pricing
    Follow -. "<<trigger>>" .-> NotifyUser
    Review -. "<<trigger>>" .-> CalcRatings
```
