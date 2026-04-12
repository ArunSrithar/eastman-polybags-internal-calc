import dotenv from "dotenv";
import mongoose from "mongoose";
import { timingSafeEqual } from "crypto";
import { connectDB } from "../config/db.js";
import GravureMaterial from "../models/GravureMaterial.js";
import GravureChargeRate from "../models/GravureChargeRate.js";
import FlexoMaterial from "../models/FlexoMaterial.js";
import FlexoConversionRate from "../models/FlexoConversionRate.js";
import FlexoPrintingRate from "../models/FlexoPrintingRate.js";
import FlexoGussetRate from "../models/FlexoGussetRate.js";
import FlexoCuttingRate from "../models/FlexoCuttingRate.js";
import FlexoChargeRate from "../models/FlexoChargeRate.js";
import FlexoRollSizeRate from "../models/FlexoRollSizeRate.js";

dotenv.config();

const RESET_SCOPES = {
  gravure: "gravure",
  flexo: "flexo",
  all: "all",
};

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
  return /^mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?(?:127\.0\.0\.1|localhost)/i.test(uri);
}

function assertDeveloperAuthorization() {
  const mongoUri = process.env.MONGODB_URI || "";
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required.");
  }

  if (!isLocalMongoUri(mongoUri)) {
    throw new Error("Reset DB is blocked: only local MongoDB URIs are allowed.");
  }

  const expectedKey = process.env.DEV_RESET_DB_KEY || "";
  const providedKey =
    getArgValue("--key") || process.env.RESET_DB_KEY || "";

  if (!expectedKey) {
    throw new Error(
      "Reset DB is disabled. Set DEV_RESET_DB_KEY in your local env.",
    );
  }

  if (!providedKey || !secureEquals(providedKey, expectedKey)) {
    throw new Error("Unauthorized reset request.");
  }
}

function getResetScope() {
  const rawScope =
    getArgValue("--scope") ||
    getArgValue("--target") ||
    process.env.RESET_DB_SCOPE ||
    RESET_SCOPES.all;

  const scope = String(rawScope).toLowerCase().trim();
  if (!Object.values(RESET_SCOPES).includes(scope)) {
    throw new Error(
      `Invalid reset scope: ${rawScope}. Use one of: gravure, flexo, all.`,
    );
  }

  return scope;
}

async function resetGravureHistories() {
  const [materialResult, rateResult, materialDocs, rateDocs] = await Promise.all([
    GravureMaterial.updateMany({}, { $set: { priceHistory: [] } }),
    GravureChargeRate.updateMany({}, { $set: { history: [] } }),
    GravureMaterial.countDocuments(),
    GravureChargeRate.countDocuments(),
  ]);

  return {
    materialDocs,
    materialUpdated: materialResult.modifiedCount,
    rateDocs,
    ratesUpdated: rateResult.modifiedCount,
  };
}

async function resetFlexoHistories() {
  const [
    materialsResult,
    conversionResult,
    chargeResult,
    printingDeleteResult,
    gussetDeleteResult,
    cuttingDeleteResult,
    rollDeleteResult,
    materialDocs,
    conversionDocs,
    chargeDocs,
  ] = await Promise.all([
    FlexoMaterial.updateMany({}, { $set: { priceHistory: [] } }),
    FlexoConversionRate.updateMany({}, { $set: { history: [] } }),
    FlexoChargeRate.updateMany({}, { $set: { history: [] } }),
    FlexoPrintingRate.deleteMany({}),
    FlexoGussetRate.deleteMany({}),
    FlexoCuttingRate.deleteMany({}),
    FlexoRollSizeRate.deleteMany({}),
    FlexoMaterial.countDocuments(),
    FlexoConversionRate.countDocuments(),
    FlexoChargeRate.countDocuments(),
  ]);

  return {
    materials: { docs: materialDocs, updated: materialsResult.modifiedCount },
    conversionRates: {
      docs: conversionDocs,
      updated: conversionResult.modifiedCount,
    },
    printingRates: { deleted: printingDeleteResult.deletedCount },
    gussetRates: { deleted: gussetDeleteResult.deletedCount },
    cuttingRates: { deleted: cuttingDeleteResult.deletedCount },
    chargeRates: { docs: chargeDocs, updated: chargeResult.modifiedCount },
    rollSizeRates: { deleted: rollDeleteResult.deletedCount },
  };
}

async function main() {
  try {
    assertDeveloperAuthorization();
    const scope = getResetScope();
    await connectDB();

    const summary = [];

    if (scope === RESET_SCOPES.gravure || scope === RESET_SCOPES.all) {
      const result = await resetGravureHistories();
      summary.push(
        `gravure materials ${result.materialUpdated}/${result.materialDocs}, gravure charge rates ${result.ratesUpdated}/${result.rateDocs}`,
      );
    }

    if (scope === RESET_SCOPES.flexo || scope === RESET_SCOPES.all) {
      const result = await resetFlexoHistories();
      summary.push(
        [
          `flexo materials ${result.materials.updated}/${result.materials.docs}`,
          `conversion rates ${result.conversionRates.updated}/${result.conversionRates.docs}`,
          `printing rates deleted ${result.printingRates.deleted}`,
          `gusset rates deleted ${result.gussetRates.deleted}`,
          `cutting rates deleted ${result.cuttingRates.deleted}`,
          `charge rates ${result.chargeRates.updated}/${result.chargeRates.docs}`,
          `roll-size rates deleted ${result.rollSizeRates.deleted}`,
        ].join(", "),
      );
    }

    console.log(`Reset complete [scope=${scope}]: ${summary.join(" | ")}`);
  } catch (err) {
    console.error("Failed to reset DB histories", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();
