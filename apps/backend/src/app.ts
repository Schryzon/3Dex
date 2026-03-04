import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swagger_ui from "swagger-ui-express";
import { swagger_spec } from "./utils/swagger";

// Import Routes
import health_routes from "./routes/health";
import auth_routes from "./routes/auth";
import model_routes from "./routes/models";
import user_routes from "./routes/users";
import admin_routes from "./routes/admin";
import payment_routes from "./routes/payments";
import catalog_routes from "./routes/catalog";
import wishlist_routes from "./routes/wishlist";
import analytics_routes from "./routes/analytics";
import storage_routes from "./routes/storage";
import order_routes from "./routes/orders";
import post_routes from "./routes/posts";
import review_routes from "./routes/reviews";
import print_routes from "./routes/print";
import purchase_routes from "./routes/purchases";
import cart_routes from "./routes/cart";
import notification_routes from "./routes/notification";
import follow_routes from "./routes/follow";
import collection_routes from "./routes/collections";

// Initialize Backend
const app = express();

// CORS Configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// Parse cookies — required for HTTP-only cookie auth
app.use(cookieParser());

// Routes
app.get("/health", (req, res) => res.json({ status: "OK" }));
app.use("/docs", swagger_ui.serve, swagger_ui.setup(swagger_spec));
app.use("/auth", auth_routes);
app.use("/models", model_routes);
app.use("/users", user_routes, follow_routes);
app.use("/admin", admin_routes);
app.use("/payments", payment_routes);
app.use("/catalog", catalog_routes);
app.use("/wishlist", wishlist_routes);
app.use("/analytics", analytics_routes);
app.use("/storage", storage_routes);
app.use("/orders", order_routes);
app.use("/posts", post_routes);
app.use("/reviews", review_routes);
app.use("/print", print_routes);
app.use("/purchases", purchase_routes);
app.use("/cart", cart_routes);
app.use("/notifications", notification_routes);
app.use("/collections", collection_routes);

// 404 Handler - Return JSON instead of HTML
app.use((req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.url} not found`,
        error: "Not Found"
    });
});

// Global Error Handler - Return JSON instead of HTML
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Global Error]:', err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err : "InternalServerError"
    });
});

export default app;
