import express from "express";
import cors from "cors";
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

// Initialize Backend
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/health", health_routes);
app.use("/docs", swagger_ui.serve, swagger_ui.setup(swagger_spec));
app.use("/auth", auth_routes);
app.use("/models", model_routes);
app.use("/users", user_routes);
app.use("/admin", admin_routes);
app.use("/payments", payment_routes);
app.use("/catalog", catalog_routes);
app.use("/wishlist", wishlist_routes);
app.use("/analytics", analytics_routes);
app.use("/storage", storage_routes);

export default app;
