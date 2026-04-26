import dotenv from "dotenv";
import mongoose from "mongoose";
import { timingSafeEqual } from "crypto";
import { connectDB } from "../config/db.js";
import { seedIfMissing } from "../utils/seed.js";

dotenv.config();

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) {
    return "";
  }
  return process.argv[idx + 1] || "";
}

function secureEquals(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));

  if (aBuf.length !== bBuf.length) {
    return false;
  }

  return timingSafeEqual(aBuf, bBuf);
}

function isLocalMongoUri(uri) {
  return /^mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?(?:127\.0\.0\.1|localhost)/i.test(
    uri,
  );
}

function assertDeveloperAuthorization() {
  const mongoUri = process.env.MONGODB_URI || "";
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required.");
  }

  if (!isLocalMongoUri(mongoUri)) {
    throw new Error("Seed DB is blocked: only local MongoDB URIs are allowed.");
  }

  const expectedKey = process.env.DEV_RESET_DB_KEY || "";
  const providedKey = getArgValue("--key") || process.env.RESET_DB_KEY || "";

  if (!expectedKey) {
    throw new Error(
      "Seed DB is disabled. Set DEV_RESET_DB_KEY in your local env.",
    );
  }

  if (!providedKey || !secureEquals(providedKey, expectedKey)) {
    throw new Error("Unauthorized seed request.");
  }
}

async function main() {
  try {
    assertDeveloperAuthorization();
    await connectDB();
    await seedIfMissing();
    console.log("Seed complete.");
  } catch (err) {
    console.error("Failed to seed DB", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();
