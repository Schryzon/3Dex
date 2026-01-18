import express from "express";
import cors from "cors";

// Import Routes
import health_routes from "./routes/health"
import auth_routes from "./routes/auth";
import model_routes from "./routes/models";

// Initialize Backend
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/health", health_routes);
app.use("/auth", auth_routes);
app.use("/models", model_routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on :${PORT}`);
});

export default app;
