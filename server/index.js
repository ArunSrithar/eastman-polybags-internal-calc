import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import gravureSettingsRouter from "./routes/gravureSettings.js";
import flexoSettingsRouter from "./routes/flexoSettings.js";
import quotesRouter from "./routes/quotes.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import rolesRouter from "./routes/roles.js";
import { connectDB } from "./config/db.js";
import { getServerConfig, makeCorsOriginChecker } from "./config/env.js";
import { createMutationRateLimiter } from "./middleware/rateLimit.js";
import { seedStructureIfMissing } from "./utils/seed.js";
import { requireAuth } from "./middleware/auth.js";
import User from "./models/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, "../client/dist");

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
app.use("/api/roles", requireAuth, rolesRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve React build (production)
app.use(express.static(clientDist));

// SPA fallback — all non-API routes return index.html
app.get("*", (_req, res, next) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next(err);
  });
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
  const passwordHash = await User.hashPassword("admin");
  const admin = new User({
    username: "admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
    mustChangePassword: true,
    roles: [],
    permissions: User.allPermissions(),
  });
  await admin.save();
  console.log(
    "Default admin account created — username: admin, password: admin",
  );
  console.log("⚠️  Log in and change the password immediately.");
}

async function ensureUserEmailSparseUniqueIndex() {
  let indexes;

  try {
    indexes = await User.collection.indexes();
  } catch (err) {
    if (err?.code === 26 || err?.codeName === "NamespaceNotFound") {
      return;
    }
    throw err;
  }

  const emailIndex = indexes.find((idx) => idx.name === "email_1");

  // Old deployments may have a non-sparse unique email index,
  // which rejects multiple users with empty/undefined email.
  if (emailIndex && !emailIndex.sparse) {
    await User.collection.dropIndex("email_1");
    await User.collection.createIndex(
      { email: 1 },
      { name: "email_1", unique: true, sparse: true, background: true },
    );
    console.log("Updated users.email index to unique+sparse");
  }
}

async function startServer() {
  try {
    await connectDB();
    await seedStructureIfMissing();
    await seedAdminIfEmpty();
    await ensureUserEmailSparseUniqueIndex();

    app.listen(port, () => {
      console.log(`Server running on ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();
