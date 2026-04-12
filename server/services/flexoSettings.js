import FlexoMaterial from "../models/FlexoMaterial.js";
import FlexoConversionRate from "../models/FlexoConversionRate.js";
import FlexoPrintingRate from "../models/FlexoPrintingRate.js";
import FlexoGussetRate from "../models/FlexoGussetRate.js";
import FlexoCuttingRate from "../models/FlexoCuttingRate.js";
import FlexoChargeRate from "../models/FlexoChargeRate.js";
import FlexoRollSizeRate from "../models/FlexoRollSizeRate.js";

const CHANGED_BY = "Admin";
const COLOR_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8"];

function makeNotFoundError(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function makeBadRequestError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function makeRateEntry(rate) {
  return {
    rate,
    changedBy: CHANGED_BY,
    changedAt: new Date(),
  };
}

function toMaterialResponse(doc) {
  if (!doc) return null;
  return {
    label: doc.label,
    priceHistory: doc.priceHistory ?? [],
  };
}

function toChargeRateResponse(doc) {
  if (!doc) return null;
  return {
    label: doc.label,
    unit: doc.unit,
    history: doc.history ?? [],
  };
}

function toPrintingRateResponse(doc) {
  if (!doc) return null;

  const response = { enabled: !!doc.enabled };
  for (const colorCount of COLOR_COUNTS) {
    response[colorCount] = doc.colors?.[colorCount] ?? { history: [] };
  }

  return response;
}

function buildMaterials(docs) {
  const materials = {};
  for (const doc of docs) {
    materials[doc._id] = toMaterialResponse(doc);
  }
  return materials;
}

function buildConversionRates(docs) {
  const conversionRates = {};

  for (const doc of docs) {
    if (!conversionRates[doc.material]) {
      conversionRates[doc.material] = {
        label: doc.label,
        rates: {},
      };
    }

    conversionRates[doc.material].rates[doc.rollSize] = {
      history: doc.history ?? [],
    };
  }

  return conversionRates;
}

function buildPrintingRates(docs) {
  const printingRates = {};
  for (const doc of docs) {
    printingRates[doc._id] = toPrintingRateResponse(doc);
  }
  return printingRates;
}

function buildGussetRates(docs) {
  const gussetRates = {};
  for (const doc of docs) {
    gussetRates[doc._id] = {
      enabled: !!doc.enabled,
      history: doc.history ?? [],
    };
  }
  return gussetRates;
}

function buildCuttingRates(docs) {
  const cuttingRates = {};
  for (const doc of docs) {
    cuttingRates[doc._id] = {
      history: doc.history ?? [],
    };
  }
  return cuttingRates;
}

function buildChargeRates(docs) {
  const chargeRates = {};
  for (const doc of docs) {
    chargeRates[doc._id] = toChargeRateResponse(doc);
  }
  return chargeRates;
}

function buildRollSizeRates(docs) {
  const rollSizeRates = {};

  for (const doc of docs) {
    if (!rollSizeRates[doc.material]) {
      rollSizeRates[doc.material] = {};
    }

    rollSizeRates[doc.material][doc.rollSize] = {
      enabled: !!doc.enabled,
      history: doc.history ?? [],
    };
  }

  return rollSizeRates;
}

async function getPrintingAndGussetSettings() {
  const [printingDocs, gussetDocs] = await Promise.all([
    FlexoPrintingRate.find().sort({ _id: 1 }).lean(),
    FlexoGussetRate.find().sort({ _id: 1 }).lean(),
  ]);

  return {
    printingRates: buildPrintingRates(printingDocs),
    gussetRates: buildGussetRates(gussetDocs),
  };
}

async function getConversionRatesForMaterial(material) {
  const docs = await FlexoConversionRate.find({ material }).sort({ _id: 1 }).lean();
  if (!docs.length) {
    const materialExists = await FlexoMaterial.exists({ _id: material });
    if (!materialExists) {
      throw makeNotFoundError(`Material ${material} not found`);
    }

    return { label: material, rates: {} };
  }

  const grouped = buildConversionRates(docs);
  return grouped[material];
}

async function getRollSizeRatesForMaterial(material) {
  const docs = await FlexoRollSizeRate.find({ material }).sort({ _id: 1 }).lean();
  if (!docs.length) {
    const materialExists = await FlexoMaterial.exists({ _id: material });
    if (!materialExists) {
      throw makeNotFoundError(`Material ${material} not found`);
    }

    return {};
  }

  const grouped = buildRollSizeRates(docs);
  return grouped[material] ?? {};
}

async function getAllGussetRates() {
  const docs = await FlexoGussetRate.find().sort({ _id: 1 }).lean();
  return buildGussetRates(docs);
}

async function getAllCuttingRates() {
  const docs = await FlexoCuttingRate.find().sort({ _id: 1 }).lean();
  return buildCuttingRates(docs);
}

function makeDefaultPrintingColors() {
  const colors = {};
  for (const colorCount of COLOR_COUNTS) {
    colors[colorCount] = { history: [makeRateEntry(0)] };
  }
  return colors;
}

/* ── Settings ───────────────────────────────────────────────────────────── */

export async function getSettings() {
  const [
    materialDocs,
    conversionRateDocs,
    printingRateDocs,
    gussetRateDocs,
    cuttingRateDocs,
    chargeRateDocs,
    rollSizeRateDocs,
  ] = await Promise.all([
    FlexoMaterial.find().sort({ _id: 1 }).lean(),
    FlexoConversionRate.find().sort({ _id: 1 }).lean(),
    FlexoPrintingRate.find().sort({ _id: 1 }).lean(),
    FlexoGussetRate.find().sort({ _id: 1 }).lean(),
    FlexoCuttingRate.find().sort({ _id: 1 }).lean(),
    FlexoChargeRate.find().sort({ _id: 1 }).lean(),
    FlexoRollSizeRate.find().sort({ _id: 1 }).lean(),
  ]);

  return {
    materials: buildMaterials(materialDocs),
    conversionRates: buildConversionRates(conversionRateDocs),
    printingRates: buildPrintingRates(printingRateDocs),
    gussetRates: buildGussetRates(gussetRateDocs),
    cuttingRates: buildCuttingRates(cuttingRateDocs),
    ...buildChargeRates(chargeRateDocs),
    rollSizeRates: buildRollSizeRates(rollSizeRateDocs),
  };
}

/* ── Material prices (PP / HM / LD) ─────────────────────────────────────── */

export async function addMaterialPrice(material, price) {
  const updated = await FlexoMaterial.findByIdAndUpdate(
    material,
    {
      $push: {
        priceHistory: {
          $each: [
            {
              price,
              changedBy: CHANGED_BY,
              changedAt: new Date(),
            },
          ],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Material ${material} not found`);
  }

  return toMaterialResponse(updated);
}

/* ── Conversion rates (material × rollSize) ─────────────────────────────── */

export async function updateConversionRate(material, rollSize, rate) {
  const id = `${material}:${rollSize}`;
  const updated = await FlexoConversionRate.findByIdAndUpdate(
    id,
    {
      $push: {
        history: {
          $each: [makeRateEntry(rate)],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(
      `Conversion rate for material ${material} and roll size ${rollSize} not found`,
    );
  }

  return getConversionRatesForMaterial(material);
}

/* ── Printing rates (coverSize × colorCount) ────────────────────────────── */

export async function updatePrintingRate(coverSize, colorCount, rate) {
  const updated = await FlexoPrintingRate.findByIdAndUpdate(
    coverSize,
    {
      $push: {
        [`colors.${colorCount}.history`]: {
          $each: [makeRateEntry(rate)],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Cover size "${coverSize}" not found`);
  }

  return toPrintingRateResponse(updated);
}

export async function addPrintingCoverSize(coverSize) {
  const existing = await FlexoPrintingRate.exists({ _id: coverSize });
  if (existing) {
    throw makeBadRequestError(`Cover size "${coverSize}" already exists`);
  }

  await FlexoPrintingRate.create({
    _id: coverSize,
    enabled: true,
    colors: makeDefaultPrintingColors(),
  });

  const gussetExists = await FlexoGussetRate.exists({ _id: coverSize });
  if (!gussetExists) {
    await FlexoGussetRate.create({
      _id: coverSize,
      enabled: true,
      history: [makeRateEntry(0)],
    });
  }

  return getPrintingAndGussetSettings();
}

export async function togglePrintingCoverSize(coverSize, enabled) {
  const updated = await FlexoPrintingRate.findByIdAndUpdate(
    coverSize,
    {
      enabled: !!enabled,
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Cover size "${coverSize}" not found`);
  }

  await FlexoGussetRate.findByIdAndUpdate(coverSize, { enabled: !!enabled });

  return getPrintingAndGussetSettings();
}

export async function deletePrintingCoverSize(coverSize) {
  const deleted = await FlexoPrintingRate.findByIdAndDelete(coverSize);
  if (!deleted) {
    throw makeNotFoundError(`Cover size "${coverSize}" not found`);
  }

  await FlexoGussetRate.findByIdAndDelete(coverSize);

  return getPrintingAndGussetSettings();
}

/* ── Gusset rates (coverSize) ───────────────────────────────────────────── */

export async function updateGussetRate(coverSize, rate) {
  const updated = await FlexoGussetRate.findByIdAndUpdate(
    coverSize,
    {
      $push: {
        history: {
          $each: [makeRateEntry(rate)],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Cover size "${coverSize}" not found`);
  }

  return getAllGussetRates();
}

/* ── Cutting rates (size) ───────────────────────────────────────────────── */

export async function updateCuttingRate(size, rate) {
  const updated = await FlexoCuttingRate.findByIdAndUpdate(
    size,
    {
      $push: {
        history: {
          $each: [makeRateEntry(rate)],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Cutting size "${size}" not found`);
  }

  return getAllCuttingRates();
}

/* ── Charge rates (punchingRate / opackRate) ─────────────────────────────── */

export async function updateChargeRate(rateKey, rate) {
  const updated = await FlexoChargeRate.findByIdAndUpdate(
    rateKey,
    {
      $push: {
        history: {
          $each: [makeRateEntry(rate)],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Charge rate "${rateKey}" not found`);
  }

  return toChargeRateResponse(updated);
}

/* ── Roll size rates (material × rollSize) ──────────────────────────────── */

export async function updateRollSizeRate(material, rollSize, rate) {
  const id = `${material}:${rollSize}`;
  const updated = await FlexoRollSizeRate.findByIdAndUpdate(
    id,
    {
      $push: {
        history: {
          $each: [makeRateEntry(rate)],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Roll size "${rollSize}" not found for ${material}`);
  }

  return getRollSizeRatesForMaterial(material);
}

export async function addRollSizeRow(material, rollSize) {
  const materialExists = await FlexoMaterial.exists({ _id: material });
  if (!materialExists) {
    throw makeBadRequestError(`Unknown material: ${material}`);
  }

  const id = `${material}:${rollSize}`;
  const existing = await FlexoRollSizeRate.exists({ _id: id });
  if (existing) {
    throw makeBadRequestError(
      `Roll size "${rollSize}" already exists for ${material}`,
    );
  }

  await FlexoRollSizeRate.create({
    _id: id,
    material,
    rollSize,
    enabled: true,
    history: [makeRateEntry(0)],
  });

  return getRollSizeRatesForMaterial(material);
}

export async function toggleRollSizeEnabled(material, rollSize, enabled) {
  const id = `${material}:${rollSize}`;
  const updated = await FlexoRollSizeRate.findByIdAndUpdate(
    id,
    { enabled: !!enabled },
    { new: true, lean: true },
  );

  if (!updated) {
    throw makeNotFoundError(`Roll size "${rollSize}" not found for ${material}`);
  }

  return getRollSizeRatesForMaterial(material);
}

export async function deleteRollSizeRow(material, rollSize) {
  const id = `${material}:${rollSize}`;
  const deleted = await FlexoRollSizeRate.findByIdAndDelete(id);
  if (!deleted) {
    throw makeNotFoundError(`Roll size "${rollSize}" not found for ${material}`);
  }

  return getRollSizeRatesForMaterial(material);
}
