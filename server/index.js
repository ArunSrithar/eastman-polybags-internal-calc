import express from "express";
import cors from "cors";
import gravureSettingsRouter from "./routes/gravureSettings.js";
import flexoSettingsRouter from "./routes/flexoSettings.js";
import { seedIfMissing } from "./utils/seed.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:8000" }));
app.use(express.json());

// Routes
app.use("/api/gravure", gravureSettingsRouter);
app.use("/api/flexo", flexoSettingsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

// Seed data files if missing, then start
seedIfMissing();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
