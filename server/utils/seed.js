import { existsSync } from "fs";
import { writeJson } from "./fileStore.js";
import { FLEXO_SETTINGS_PATH } from "../config/paths.js";
import GravureMaterial from "../models/GravureMaterial.js";
import GravurePouch from "../models/GravurePouch.js";
import GravureChargeRate from "../models/GravureChargeRate.js";

const DEFAULT_SEED_DATE = new Date();

function asIso(now = DEFAULT_SEED_DATE) {
  return now.toISOString();
}

function makeRateEntry(rate, now = DEFAULT_SEED_DATE) {
  return { rate, changedBy: "Admin", changedAt: now.toISOString() };
}

function makeHistoryCell(rate, now = DEFAULT_SEED_DATE) {
  return { history: [makeRateEntry(rate, now)] };
}

function makeMaterial(label, price, microns, qtys, now = DEFAULT_SEED_DATE) {
  return {
    label,
    priceHistory: price ? [{ price, changedBy: "Admin", changedAt: asIso(now) }] : [],
    micronOptions: microns.map((v) => ({ value: v, createdAt: asIso(now) })),
    qtyOptions: qtys.map((v) => ({ value: v, createdAt: asIso(now) })),
  };
}

function buildGravureDefaults(now) {
  const materials = {
    polyester: makeMaterial(
      "Polyester",
      220,
      ["12", "15", "20", "25"],
      ["0.5", "1", "1.5", "2", "2.5", "3"],
      now,
    ),
    silverPet: makeMaterial(
      "Silver PET",
      260,
      ["12", "15", "20"],
      ["0.5", "1", "1.5", "2"],
      now,
    ),
    ldRoll: makeMaterial(
      "L.D. Roll",
      158,
      ["25", "30", "40", "50"],
      ["0.5", "1", "1.5", "2"],
      now,
    ),
    bopp: makeMaterial(
      "B.O.P.P.",
      0,
      ["20", "25", "30"],
      ["0.5", "1", "1.5"],
      now,
    ),
  };

  const materialDocs = Object.entries(materials).map(([key, value]) => ({
    _id: key,
    ...value,
  }));

  const pouchDocs = [
    {
      _id: "ps-1",
      length: "4",
      breadth: "6",
      rate: 15,
      enabled: true,
      createdBy: "Admin",
      createdAt: asIso(now),
      modifiedBy: null,
      modifiedAt: null,
    },
    {
      _id: "ps-2",
      length: "5",
      breadth: "7",
      rate: 18,
      enabled: true,
      createdBy: "Admin",
      createdAt: asIso(now),
      modifiedBy: null,
      modifiedAt: null,
    },
    {
      _id: "ps-3",
      length: "6",
      breadth: "8",
      rate: 20,
      enabled: true,
      createdBy: "Admin",
      createdAt: asIso(now),
      modifiedBy: null,
      modifiedAt: null,
    },
    {
      _id: "ps-4",
      length: "7",
      breadth: "10",
      rate: 25,
      enabled: true,
      createdBy: "Admin",
      createdAt: asIso(now),
      modifiedBy: null,
      modifiedAt: null,
    },
  ];

  const chargeRateDocs = [
    {
      _id: "normalColorRate",
      label: "Normal Color Rate",
      unit: "₹/color",
      history: [makeRateEntry(5, now)],
    },
    {
      _id: "metallicColorRate",
      label: "Metallic Color Rate",
      unit: "₹/color",
      history: [makeRateEntry(8, now)],
    },
    {
      _id: "mattFinishRate",
      label: "Matt Finish Rate",
      unit: "₹/kg",
      history: [makeRateEntry(3, now)],
    },
    {
      _id: "singleLamRate",
      label: "Single Lamination",
      unit: "₹/kg",
      history: [makeRateEntry(12, now)],
    },
    {
      _id: "doubleLamRate",
      label: "Double Lamination",
      unit: "₹/kg",
      history: [makeRateEntry(20, now)],
    },
    {
      _id: "slittingRate",
      label: "Slitting Charges",
      unit: "₹/kg",
      history: [makeRateEntry(4, now)],
    },
  ];

  return { materialDocs, pouchDocs, chargeRateDocs };
}

export async function seedIfMissing() {
  const gravureCount = await GravureMaterial.countDocuments();
  if (gravureCount === 0) {
    const now = new Date();
    const { materialDocs, pouchDocs, chargeRateDocs } = buildGravureDefaults(now);

    await GravureMaterial.insertMany(materialDocs);
    await GravurePouch.insertMany(pouchDocs);
    await GravureChargeRate.insertMany(chargeRateDocs);

    console.log("Seeded Gravure MongoDB defaults");
  }

  if (!existsSync(FLEXO_SETTINGS_PATH)) {
    writeJson(FLEXO_SETTINGS_PATH, DEFAULT_FLEXO_SETTINGS);
    console.log("Seeded flexo-settings.json with defaults");
  }
}

/* ── Flexo defaults — built from client/src/constants/flexoRateCalc.js ──── */

function makeConversionMaterial(label, ratesByRollSize) {
  const rates = {};
  for (const [rollSize, rate] of Object.entries(ratesByRollSize)) {
    rates[rollSize] = makeHistoryCell(rate);
  }
  return { label, rates };
}

const DEFAULT_FLEXO_SETTINGS = {
  materials: {
    PP: { label: "P.P.", priceHistory: [] },
    HM: { label: "H.M.", priceHistory: [] },
    LD: { label: "L.D.", priceHistory: [] },
  },
  conversionRates: {
    PP: makeConversionMaterial("PP", {
      "4x3": 10.0,
      "6x4": 14.0,
      "8x6": 18.0,
      "10x8": 24.0,
      "12x10": 30.0,
      "14x12": 36.0,
    }),
    HM: makeConversionMaterial("HM", {
      "4x3": 12.0,
      "6x4": 16.0,
      "8x6": 21.0,
      "10x8": 28.0,
      "12x10": 34.0,
      "14x12": 42.0,
    }),
    LD: makeConversionMaterial("LD", {
      "4x3": 14.0,
      "6x4": 19.0,
      "8x6": 25.0,
      "10x8": 32.0,
      "12x10": 40.0,
      "14x12": 48.0,
    }),
  },
  printingRates: {
    "8x10": {
      enabled: true,
      1: makeHistoryCell(8),
      2: makeHistoryCell(14),
      3: makeHistoryCell(20),
      4: makeHistoryCell(26),
      5: makeHistoryCell(32),
      6: makeHistoryCell(38),
      7: makeHistoryCell(44),
      8: makeHistoryCell(50),
    },
    "10x12": {
      enabled: true,
      1: makeHistoryCell(10),
      2: makeHistoryCell(18),
      3: makeHistoryCell(25),
      4: makeHistoryCell(32),
      5: makeHistoryCell(39),
      6: makeHistoryCell(46),
      7: makeHistoryCell(53),
      8: makeHistoryCell(60),
    },
    "12x14": {
      enabled: true,
      1: makeHistoryCell(12),
      2: makeHistoryCell(22),
      3: makeHistoryCell(30),
      4: makeHistoryCell(38),
      5: makeHistoryCell(46),
      6: makeHistoryCell(54),
      7: makeHistoryCell(62),
      8: makeHistoryCell(70),
    },
    "14x16": {
      enabled: true,
      1: makeHistoryCell(14),
      2: makeHistoryCell(26),
      3: makeHistoryCell(35),
      4: makeHistoryCell(44),
      5: makeHistoryCell(53),
      6: makeHistoryCell(62),
      7: makeHistoryCell(71),
      8: makeHistoryCell(80),
    },
    "16x18": {
      enabled: true,
      1: makeHistoryCell(16),
      2: makeHistoryCell(30),
      3: makeHistoryCell(40),
      4: makeHistoryCell(50),
      5: makeHistoryCell(60),
      6: makeHistoryCell(70),
      7: makeHistoryCell(80),
      8: makeHistoryCell(90),
    },
    "18x20": {
      enabled: true,
      1: makeHistoryCell(18),
      2: makeHistoryCell(34),
      3: makeHistoryCell(45),
      4: makeHistoryCell(56),
      5: makeHistoryCell(67),
      6: makeHistoryCell(78),
      7: makeHistoryCell(89),
      8: makeHistoryCell(100),
    },
  },
  gussetRates: {
    "8x10": { enabled: true, ...makeHistoryCell(30) },
    "10x12": { enabled: true, ...makeHistoryCell(36) },
    "12x14": { enabled: true, ...makeHistoryCell(42) },
    "14x16": { enabled: true, ...makeHistoryCell(48) },
    "16x18": { enabled: true, ...makeHistoryCell(54) },
    "18x20": { enabled: true, ...makeHistoryCell(60) },
  },
  cuttingRates: {
    4: makeHistoryCell(5),
    5: makeHistoryCell(6.5),
    6: makeHistoryCell(8),
    7: makeHistoryCell(9.5),
    8: makeHistoryCell(11),
    9: makeHistoryCell(12.5),
    10: makeHistoryCell(14),
    11: makeHistoryCell(15.5),
    12: makeHistoryCell(17),
    14: makeHistoryCell(20),
  },
  punchingRate: {
    label: "Punching",
    unit: "₹/unit",
    history: [makeRateEntry(72.31)],
  },
  opackRate: {
    label: "Opack",
    unit: "₹/unit",
    history: [makeRateEntry(87.3)],
  },
  rollSizeRates: {
    PP: Object.fromEntries(
      ["4", "6", "8", "10", "12", "14"].map((s) => [
        s,
        { enabled: true, ...makeHistoryCell(0) },
      ]),
    ),
    HM: Object.fromEntries(
      ["4", "6", "8", "10", "12", "14"].map((s) => [
        s,
        { enabled: true, ...makeHistoryCell(0) },
      ]),
    ),
    LD: Object.fromEntries(
      ["4", "6", "8", "10", "12", "14"].map((s) => [
        s,
        { enabled: true, ...makeHistoryCell(0) },
      ]),
    ),
  },
};
