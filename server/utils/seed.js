import GravureMaterial from "../models/GravureMaterial.js";
import GravurePouch from "../models/GravurePouch.js";
import GravureChargeRate from "../models/GravureChargeRate.js";
import FlexoMaterial from "../models/FlexoMaterial.js";
import FlexoConversionRate from "../models/FlexoConversionRate.js";
import FlexoPrintingRate from "../models/FlexoPrintingRate.js";
import FlexoGussetRate from "../models/FlexoGussetRate.js";
import FlexoCuttingRate from "../models/FlexoCuttingRate.js";
import FlexoChargeRate from "../models/FlexoChargeRate.js";
import FlexoRollSizeRate from "../models/FlexoRollSizeRate.js";

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
    priceHistory: price
      ? [{ price, changedBy: "Admin", changedAt: asIso(now) }]
      : [],
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

  const pouchDocs = [];

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

function buildFlexoDefaults(now) {
  const defaults = buildDefaultFlexoSettings(now);

  const materialDocs = Object.entries(defaults.materials).map(
    ([key, value]) => ({
      _id: key,
      ...value,
    }),
  );

  const conversionRateDocs = [];
  for (const [material, materialData] of Object.entries(
    defaults.conversionRates,
  )) {
    for (const [rollSize, rateData] of Object.entries(materialData.rates)) {
      conversionRateDocs.push({
        _id: `${material}:${rollSize}`,
        material,
        rollSize,
        label: materialData.label,
        history: rateData.history,
      });
    }
  }

  const printingRateDocs = Object.entries(defaults.printingRates).map(
    ([coverSize, rateData]) => {
      const { enabled, ...colors } = rateData;
      return {
        _id: coverSize,
        enabled: !!enabled,
        colors,
      };
    },
  );

  const gussetRateDocs = Object.entries(defaults.gussetRates).map(
    ([coverSize, value]) => ({
      _id: coverSize,
      ...value,
    }),
  );

  const cuttingRateDocs = Object.entries(defaults.cuttingRates).map(
    ([coverSize, value]) => ({
      _id: coverSize,
      ...value,
    }),
  );

  const chargeRateDocs = ["punchingRate", "opackRate"].map((key) => ({
    _id: key,
    ...defaults[key],
  }));

  const rollSizeRateDocs = [];
  for (const [material, rateByRollSize] of Object.entries(
    defaults.rollSizeRates,
  )) {
    for (const [rollSize, value] of Object.entries(rateByRollSize)) {
      rollSizeRateDocs.push({
        _id: `${material}:${rollSize}`,
        material,
        rollSize,
        ...value,
      });
    }
  }

  return {
    materialDocs,
    conversionRateDocs,
    printingRateDocs,
    gussetRateDocs,
    cuttingRateDocs,
    chargeRateDocs,
    rollSizeRateDocs,
  };
}

export async function seedIfMissing() {
  const gravureCount = await GravureMaterial.countDocuments();
  if (gravureCount === 0) {
    const now = new Date();
    const { materialDocs, pouchDocs, chargeRateDocs } =
      buildGravureDefaults(now);

    await GravureMaterial.insertMany(materialDocs);
    if (pouchDocs.length > 0) {
      await GravurePouch.insertMany(pouchDocs);
    }
    await GravureChargeRate.insertMany(chargeRateDocs);

    console.log("Seeded Gravure MongoDB defaults");
  }

  const flexoCount = await FlexoMaterial.countDocuments();
  if (flexoCount === 0) {
    const now = new Date();
    const {
      materialDocs,
      conversionRateDocs,
      printingRateDocs,
      gussetRateDocs,
      cuttingRateDocs,
      chargeRateDocs,
      rollSizeRateDocs,
    } = buildFlexoDefaults(now);

    await FlexoMaterial.insertMany(materialDocs);
    await FlexoConversionRate.insertMany(conversionRateDocs);
    await FlexoPrintingRate.insertMany(printingRateDocs);
    await FlexoGussetRate.insertMany(gussetRateDocs);
    await FlexoCuttingRate.insertMany(cuttingRateDocs);
    await FlexoChargeRate.insertMany(chargeRateDocs);
    await FlexoRollSizeRate.insertMany(rollSizeRateDocs);

    console.log("Seeded Flexo MongoDB defaults");
  }
}

/* ── Structural seed (auto-run on startup) ──────────────────────────────
 * Creates empty material + charge rate documents whose IDs the UI expects.
 * Each doc has an empty history so the user can add the first value via UI.
 * Does NOT seed sample values, dynamic rows (pouches, printing/gusset/etc.).
 */

const GRAVURE_MATERIAL_STRUCTURE = [
  { _id: "polyester", label: "Polyester" },
  { _id: "silverPet", label: "Silver PET" },
  { _id: "ldRoll", label: "L.D. Roll" },
  { _id: "bopp", label: "B.O.P.P." },
];

const GRAVURE_CHARGE_RATE_STRUCTURE = [
  { _id: "normalColorRate", label: "Normal Color Rate", unit: "₹/color" },
  { _id: "metallicColorRate", label: "Metallic Color Rate", unit: "₹/color" },
  { _id: "mattFinishRate", label: "Matt Finish Rate", unit: "₹/kg" },
  { _id: "singleLamRate", label: "Single Lamination", unit: "₹/kg" },
  { _id: "doubleLamRate", label: "Double Lamination", unit: "₹/kg" },
  { _id: "slittingRate", label: "Slitting Charges", unit: "₹/kg" },
];

const FLEXO_MATERIAL_STRUCTURE = [
  { _id: "PP", label: "P.P." },
  { _id: "HM", label: "H.M." },
  { _id: "LD", label: "L.D." },
];

const FLEXO_CHARGE_RATE_STRUCTURE = [
  { _id: "punchingRate", label: "Punching", unit: "₹/unit" },
  { _id: "opackRate", label: "Opack", unit: "₹/unit" },
];

async function ensureMaterialStubs(Model, structure, withOptions = false) {
  const existingIds = new Set(
    (await Model.find({}, { _id: 1 }).lean()).map((d) => d._id),
  );

  const missing = structure
    .filter((row) => !existingIds.has(row._id))
    .map((row) => ({
      _id: row._id,
      label: row.label,
      priceHistory: [],
      ...(withOptions ? { micronOptions: [], qtyOptions: [] } : {}),
    }));

  if (missing.length > 0) {
    await Model.insertMany(missing);
  }
  return missing.length;
}

async function ensureChargeRateStubs(Model, structure) {
  const existingIds = new Set(
    (await Model.find({}, { _id: 1 }).lean()).map((d) => d._id),
  );

  const missing = structure
    .filter((row) => !existingIds.has(row._id))
    .map((row) => ({
      _id: row._id,
      label: row.label,
      unit: row.unit,
      history: [],
    }));

  if (missing.length > 0) {
    await Model.insertMany(missing);
  }
  return missing.length;
}

export async function seedStructureIfMissing() {
  const [gravureMaterials, gravureCharges, flexoMaterials, flexoCharges] =
    await Promise.all([
      ensureMaterialStubs(GravureMaterial, GRAVURE_MATERIAL_STRUCTURE, true),
      ensureChargeRateStubs(GravureChargeRate, GRAVURE_CHARGE_RATE_STRUCTURE),
      ensureMaterialStubs(FlexoMaterial, FLEXO_MATERIAL_STRUCTURE, false),
      ensureChargeRateStubs(FlexoChargeRate, FLEXO_CHARGE_RATE_STRUCTURE),
    ]);

  const total =
    gravureMaterials + gravureCharges + flexoMaterials + flexoCharges;
  if (total > 0) {
    console.log(
      `Seeded structural stubs: ${gravureMaterials} gravure materials, ${gravureCharges} gravure charges, ${flexoMaterials} flexo materials, ${flexoCharges} flexo charges`,
    );
  }
}

/* ── Flexo defaults — built from client/src/constants/flexoRateCalc.js ──── */

function makeConversionMaterial(
  label,
  ratesByRollSize,
  now = DEFAULT_SEED_DATE,
) {
  const rates = {};
  for (const [rollSize, rate] of Object.entries(ratesByRollSize)) {
    rates[rollSize] = makeHistoryCell(rate, now);
  }
  return { label, rates };
}

function buildDefaultFlexoSettings(now = DEFAULT_SEED_DATE) {
  return {
    materials: {
      PP: { label: "P.P.", priceHistory: [] },
      HM: { label: "H.M.", priceHistory: [] },
      LD: { label: "L.D.", priceHistory: [] },
    },
    conversionRates: {
      PP: makeConversionMaterial(
        "PP",
        {
          "4x3": 10.0,
          "6x4": 14.0,
          "8x6": 18.0,
          "10x8": 24.0,
          "12x10": 30.0,
          "14x12": 36.0,
        },
        now,
      ),
      HM: makeConversionMaterial(
        "HM",
        {
          "4x3": 12.0,
          "6x4": 16.0,
          "8x6": 21.0,
          "10x8": 28.0,
          "12x10": 34.0,
          "14x12": 42.0,
        },
        now,
      ),
      LD: makeConversionMaterial(
        "LD",
        {
          "4x3": 14.0,
          "6x4": 19.0,
          "8x6": 25.0,
          "10x8": 32.0,
          "12x10": 40.0,
          "14x12": 48.0,
        },
        now,
      ),
    },
    printingRates: {
      "8x10": {
        enabled: true,
        1: makeHistoryCell(8, now),
        2: makeHistoryCell(14, now),
        3: makeHistoryCell(20, now),
        4: makeHistoryCell(26, now),
        5: makeHistoryCell(32, now),
        6: makeHistoryCell(38, now),
        7: makeHistoryCell(44, now),
        8: makeHistoryCell(50, now),
      },
      "10x12": {
        enabled: true,
        1: makeHistoryCell(10, now),
        2: makeHistoryCell(18, now),
        3: makeHistoryCell(25, now),
        4: makeHistoryCell(32, now),
        5: makeHistoryCell(39, now),
        6: makeHistoryCell(46, now),
        7: makeHistoryCell(53, now),
        8: makeHistoryCell(60, now),
      },
      "12x14": {
        enabled: true,
        1: makeHistoryCell(12, now),
        2: makeHistoryCell(22, now),
        3: makeHistoryCell(30, now),
        4: makeHistoryCell(38, now),
        5: makeHistoryCell(46, now),
        6: makeHistoryCell(54, now),
        7: makeHistoryCell(62, now),
        8: makeHistoryCell(70, now),
      },
      "14x16": {
        enabled: true,
        1: makeHistoryCell(14, now),
        2: makeHistoryCell(26, now),
        3: makeHistoryCell(35, now),
        4: makeHistoryCell(44, now),
        5: makeHistoryCell(53, now),
        6: makeHistoryCell(62, now),
        7: makeHistoryCell(71, now),
        8: makeHistoryCell(80, now),
      },
      "16x18": {
        enabled: true,
        1: makeHistoryCell(16, now),
        2: makeHistoryCell(30, now),
        3: makeHistoryCell(40, now),
        4: makeHistoryCell(50, now),
        5: makeHistoryCell(60, now),
        6: makeHistoryCell(70, now),
        7: makeHistoryCell(80, now),
        8: makeHistoryCell(90, now),
      },
      "18x20": {
        enabled: true,
        1: makeHistoryCell(18, now),
        2: makeHistoryCell(34, now),
        3: makeHistoryCell(45, now),
        4: makeHistoryCell(56, now),
        5: makeHistoryCell(67, now),
        6: makeHistoryCell(78, now),
        7: makeHistoryCell(89, now),
        8: makeHistoryCell(100, now),
      },
    },
    gussetRates: {
      "8x10": { enabled: true, ...makeHistoryCell(30, now) },
      "10x12": { enabled: true, ...makeHistoryCell(36, now) },
      "12x14": { enabled: true, ...makeHistoryCell(42, now) },
      "14x16": { enabled: true, ...makeHistoryCell(48, now) },
      "16x18": { enabled: true, ...makeHistoryCell(54, now) },
      "18x20": { enabled: true, ...makeHistoryCell(60, now) },
    },
    cuttingRates: {
      "8x10": { enabled: true, ...makeHistoryCell(0, now) },
      "10x12": { enabled: true, ...makeHistoryCell(0, now) },
      "12x14": { enabled: true, ...makeHistoryCell(0, now) },
      "14x16": { enabled: true, ...makeHistoryCell(0, now) },
      "16x18": { enabled: true, ...makeHistoryCell(0, now) },
      "18x20": { enabled: true, ...makeHistoryCell(0, now) },
    },
    punchingRate: {
      label: "Punching",
      unit: "₹/unit",
      history: [makeRateEntry(72.31, now)],
    },
    opackRate: {
      label: "Opack",
      unit: "₹/unit",
      history: [makeRateEntry(87.3, now)],
    },
    rollSizeRates: {
      PP: Object.fromEntries(
        ["4", "6", "8", "10", "12", "14"].map((s) => [
          s,
          { enabled: true, ...makeHistoryCell(0, now) },
        ]),
      ),
      HM: Object.fromEntries(
        ["4", "6", "8", "10", "12", "14"].map((s) => [
          s,
          { enabled: true, ...makeHistoryCell(0, now) },
        ]),
      ),
      LD: Object.fromEntries(
        ["4", "6", "8", "10", "12", "14"].map((s) => [
          s,
          { enabled: true, ...makeHistoryCell(0, now) },
        ]),
      ),
    },
  };
}
