import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import gravureSettingsRouter from "./routes/gravureSettings.js";
import flexoSettingsRouter from "./routes/flexoSettings.js";
import quotesRouter from "./routes/quotes.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import { connectDB } from "./config/db.js";
import { getServerConfig, makeCorsOriginChecker } from "./config/env.js";
import { createMutationRateLimiter } from "./middleware/rateLimit.js";
import { seedStructureIfMissing } from "./utils/seed.js";
import { requireAuth } from "./middleware/auth.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const { port, clientOrigins, mutationRateLimitMax, trustProxy } =
  getServerConfig();
const mutationRateLimiter = createMutationRateLimiter(mutationRateLimitMax);

app.set("trust proxy", trustProxy);

app.use(helmet());
app.use(
  cors({
    origin: makeCorsOriginChecker(clientOrigins),
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use("/api", mutationRateLimiter);

// Public auth routes (must be before requireAuth)
app.use("/api/auth", authRouter);

// All routes below require a valid session
app.use("/api/gravure", requireAuth, gravureSettingsRouter);
app.use("/api/flexo", requireAuth, flexoSettingsRouter);
app.use("/api/quotes", requireAuth, quotesRouter);
app.use("/api/users", requireAuth, usersRouter);

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

async function seedAdminIfEmpty() {
  const count = await User.countDocuments();
  if (count > 0) return;

  const { adminEmail } = getServerConfig();
  const admin = new User({
    username: "admin",
    email: adminEmail,
    role: "admin",
    mustChangePassword: true,
    permissions: User.allPermissions(),
  });
  admin.password = "admin"; // virtual triggers bcrypt pre-save hook
  await admin.save();
  console.log(
    "Default admin account created — username: admin, password: admin",
  );
  console.log("⚠️  Log in and change the password immediately.");
}

async function startServer() {
  try {
    await connectDB();
    await seedStructureIfMissing();
    await seedAdminIfEmpty();

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();
