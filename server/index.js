import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import gravureSettingsRouter from "./routes/gravureSettings.js";
import flexoSettingsRouter from "./routes/flexoSettings.js";
import { connectDB } from "./config/db.js";
import { getServerConfig, makeCorsOriginChecker } from "./config/env.js";
import { createMutationRateLimiter } from "./middleware/rateLimit.js";

dotenv.config();

const app = express();
const { port, clientOrigins, mutationRateLimitMax, trustProxy } = getServerConfig();
const mutationRateLimiter = createMutationRateLimiter(mutationRateLimitMax);

app.set("trust proxy", trustProxy);

app.use(helmet());
app.use(
  cors({
    origin: makeCorsOriginChecker(clientOrigins),
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use("/api", mutationRateLimiter);

// Routes
app.use("/api/gravure", gravureSettingsRouter);
app.use("/api/flexo", flexoSettingsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, _req, res, _next) => {
  const status = err.status || 500;

  if (status >= 500) {
    console.error(err.stack);
  }

  res
    .status(status)
    .json({ error: status >= 500 ? "Internal server error" : err.message });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();
