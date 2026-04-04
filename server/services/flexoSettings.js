import { readJson, writeJson } from "../utils/fileStore.js";
import { FLEXO_SETTINGS_PATH } from "../config/paths.js";

/* ── Data access ────────────────────────────────────────────────────────── */

function load() {
  return readJson(FLEXO_SETTINGS_PATH);
}

function save(data) {
  writeJson(FLEXO_SETTINGS_PATH, data);
}

/* ── Settings ───────────────────────────────────────────────────────────── */

export function getSettings() {
  return load();
}
/* ── Material prices (PP / HM / LD) ─────────────────────────────────────── */

export function addMaterialPrice(material, price) {
  const data = load();
  data.materials[material].priceHistory.unshift({
    price,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data.materials[material];
}
/* ── Conversion rates (material × rollSize) ─────────────────────────────── */

export function updateConversionRate(material, rollSize, rate) {
  const data = load();
  data.conversionRates[material].rates[rollSize].history.unshift({
    rate,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data.conversionRates[material];
}

/* ── Printing rates (coverSize × colorCount) ────────────────────────────── */

export function updatePrintingRate(coverSize, colorCount, rate) {
  const data = load();
  if (!data.printingRates[coverSize]) {
    const err = new Error(`Cover size "${coverSize}" not found`);
    err.status = 404;
    throw err;
  }
  data.printingRates[coverSize][colorCount].history.unshift({
    rate,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data.printingRates[coverSize];
}

export function addPrintingCoverSize(coverSize) {
  const data = load();
  if (data.printingRates[coverSize]) {
    const err = new Error(`Cover size "${coverSize}" already exists`);
    err.status = 400;
    throw err;
  }
  const now = new Date().toISOString();
  data.printingRates[coverSize] = { enabled: true };
  for (const c of ["1", "2", "3", "4", "5", "6", "7", "8"]) {
    data.printingRates[coverSize][c] = {
      history: [{ rate: 0, changedBy: "Admin", changedAt: now }],
    };
  }
  if (!data.gussetRates[coverSize]) {
    data.gussetRates[coverSize] = {
      enabled: true,
      history: [{ rate: 0, changedBy: "Admin", changedAt: now }],
    };
  }
  save(data);
  return { printingRates: data.printingRates, gussetRates: data.gussetRates };
}

export function togglePrintingCoverSize(coverSize, enabled) {
  const data = load();
  if (!data.printingRates[coverSize]) {
    const err = new Error(`Cover size "${coverSize}" not found`);
    err.status = 404;
    throw err;
  }
  data.printingRates[coverSize].enabled = !!enabled;
  if (data.gussetRates[coverSize]) {
    data.gussetRates[coverSize].enabled = !!enabled;
  }
  save(data);
  return { printingRates: data.printingRates, gussetRates: data.gussetRates };
}

export function deletePrintingCoverSize(coverSize) {
  const data = load();
  if (!data.printingRates[coverSize]) {
    const err = new Error(`Cover size "${coverSize}" not found`);
    err.status = 404;
    throw err;
  }
  delete data.printingRates[coverSize];
  delete data.gussetRates[coverSize];
  save(data);
  return { printingRates: data.printingRates, gussetRates: data.gussetRates };
}

/* ── Gusset rates (coverSize) ───────────────────────────────────────────── */

export function updateGussetRate(coverSize, rate) {
  const data = load();
  data.gussetRates[coverSize].history.unshift({
    rate,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data.gussetRates;
}

/* ── Cutting rates (size) ───────────────────────────────────────────────── */

export function updateCuttingRate(size, rate) {
  const data = load();
  data.cuttingRates[size].history.unshift({
    rate,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data.cuttingRates;
}

/* ── Charge rates (punchingRate / opackRate) ─────────────────────────────── */

export function updateChargeRate(rateKey, rate) {
  const data = load();
  data[rateKey].history.unshift({
    rate,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data[rateKey];
}

/* ── Roll size rates (material × rollSize) ──────────────────────────────── */

export function updateRollSizeRate(material, rollSize, rate) {
  const data = load();
  if (!data.rollSizeRates?.[material]?.[rollSize]) {
    const err = new Error(`Roll size "${rollSize}" not found for ${material}`);
    err.status = 404;
    throw err;
  }
  data.rollSizeRates[material][rollSize].history.unshift({
    rate,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data.rollSizeRates[material];
}

export function addRollSizeRow(material, rollSize) {
  const data = load();
  if (!data.rollSizeRates[material]) {
    const err = new Error(`Unknown material: ${material}`);
    err.status = 400;
    throw err;
  }
  if (data.rollSizeRates[material][rollSize]) {
    const err = new Error(
      `Roll size "${rollSize}" already exists for ${material}`,
    );
    err.status = 400;
    throw err;
  }
  data.rollSizeRates[material][rollSize] = {
    enabled: true,
    history: [
      { rate: 0, changedBy: "Admin", changedAt: new Date().toISOString() },
    ],
  };
  save(data);
  return data.rollSizeRates[material];
}

export function toggleRollSizeEnabled(material, rollSize, enabled) {
  const data = load();
  if (!data.rollSizeRates?.[material]?.[rollSize]) {
    const err = new Error(`Roll size "${rollSize}" not found for ${material}`);
    err.status = 404;
    throw err;
  }
  data.rollSizeRates[material][rollSize].enabled = !!enabled;
  save(data);
  return data.rollSizeRates[material];
}

export function deleteRollSizeRow(material, rollSize) {
  const data = load();
  if (!data.rollSizeRates?.[material]?.[rollSize]) {
    const err = new Error(`Roll size "${rollSize}" not found for ${material}`);
    err.status = 404;
    throw err;
  }
  delete data.rollSizeRates[material][rollSize];
  save(data);
  return data.rollSizeRates[material];
}
