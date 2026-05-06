import dotenv from "dotenv";
import mongoose from "mongoose";
import { timingSafeEqual } from "crypto";
import { connectDB } from "../config/db.js";
import GravureMaterial from "../models/GravureMaterial.js";
import GravureChargeRate from "../models/GravureChargeRate.js";
import GravurePouch from "../models/GravurePouch.js";
import FlexoMaterial from "../models/FlexoMaterial.js";
import FlexoConversionRate from "../models/FlexoConversionRate.js";
import FlexoPrintingRate from "../models/FlexoPrintingRate.js";
import FlexoGussetRate from "../models/FlexoGussetRate.js";
import FlexoCuttingRate from "../models/FlexoCuttingRate.js";
import FlexoChargeRate from "../models/FlexoChargeRate.js";
import FlexoRollSizeRate from "../models/FlexoRollSizeRate.js";
import Quote from "../models/Quote.js";
import RefreshToken from "../models/RefreshToken.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

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
    throw new Error(
      "Reset DB is blocked: only local MongoDB URIs are allowed.",
    );
  }

  const expectedKey = process.env.DEV_RESET_DB_KEY || "";
  const providedKey = getArgValue("--key") || process.env.RESET_DB_KEY || "";

  if (!expectedKey) {
    throw new Error(
      "Reset DB is disabled. Set DEV_RESET_DB_KEY in your local env.",
    );
  }

  if (!providedKey || !secureEquals(providedKey, expectedKey)) {
    throw new Error("Unauthorized reset request.");
  }
}

async function resetAll() {
  const results = await Promise.all([
    // Gravure
    GravureMaterial.deleteMany({}),
    GravureChargeRate.deleteMany({}),
    GravurePouch.deleteMany({}),
    // Flexo
    FlexoMaterial.deleteMany({}),
    FlexoConversionRate.deleteMany({}),
    FlexoPrintingRate.deleteMany({}),
    FlexoGussetRate.deleteMany({}),
    FlexoCuttingRate.deleteMany({}),
    FlexoChargeRate.deleteMany({}),
    FlexoRollSizeRate.deleteMany({}),
    // App data
    Quote.deleteMany({}),
    RefreshToken.deleteMany({}),
    Role.deleteMany({}),
    User.deleteMany({}),
  ]);

  const labels = [
    "gravureMaterials",
    "gravureChargeRates",
    "gravurePouches",
    "flexoMaterials",
    "flexoConversionRates",
    "flexoPrintingRates",
    "flexoGussetRates",
    "flexoCuttingRates",
    "flexoChargeRates",
    "flexoRollSizeRates",
    "quotes",
    "refreshTokens",
    "roles",
    "users",
  ];

  return Object.fromEntries(labels.map((l, i) => [l, results[i].deletedCount]));
}

async function main() {
  try {
    assertDeveloperAuthorization();
    await connectDB();

    const result = await resetAll();
    const summary = Object.entries(result)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");
    console.log(`Reset complete: ${summary}`);
  } catch (err) {
    console.error("Failed to reset DB", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();
