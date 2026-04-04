import { readJson, writeJson } from "../utils/fileStore.js";
import { GRAVURE_SETTINGS_PATH } from "../config/paths.js";
import { randomBytes } from "crypto";

/* ── Data access ────────────────────────────────────────────────────────── */

function load() {
  return readJson(GRAVURE_SETTINGS_PATH);
}

function save(data) {
  writeJson(GRAVURE_SETTINGS_PATH, data);
}

/* ── Settings ───────────────────────────────────────────────────────────── */

export function getSettings() {
  return load();
}

/* ── Material prices ────────────────────────────────────────────────────── */

export function addMaterialPrice(materialKey, price) {
  const data = load();
  data.materials[materialKey].priceHistory.unshift({
    price,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data.materials[materialKey];
}

/* ── Material options (micron / qty) ────────────────────────────────────── */

export function addMaterialOption(materialKey, type, value) {
  const data = load();
  const arrKey = type === "micron" ? "micronOptions" : "qtyOptions";
  const existing = data.materials[materialKey][arrKey];

  if (existing.some((o) => o.value === value)) {
    return data.materials[materialKey];
  }

  existing.push({ value, createdAt: new Date().toISOString() });
  save(data);
  return data.materials[materialKey];
}

/* ── Pouches ────────────────────────────────────────────────────────────── */

export function createPouch(length, breadth, rate) {
  const data = load();
  const now = new Date().toISOString();
  const newPouch = {
    id: "ps-" + randomBytes(4).toString("hex"),
    length,
    breadth,
    rate,
    enabled: true,
    createdBy: "Admin",
    createdAt: now,
    modifiedBy: null,
    modifiedAt: null,
  };
  data.pouches.push(newPouch);
  save(data);
  return newPouch;
}

export function updatePouch(id, fields) {
  const data = load();
  const pouch = data.pouches.find((p) => p.id === id);
  if (!pouch) return null;

  if (fields.length !== undefined) pouch.length = fields.length;
  if (fields.breadth !== undefined) pouch.breadth = fields.breadth;
  if (fields.rate !== undefined) pouch.rate = fields.rate;
  if (fields.enabled !== undefined) pouch.enabled = !!fields.enabled;

  pouch.modifiedBy = "Admin";
  pouch.modifiedAt = new Date().toISOString();
  save(data);
  return pouch;
}

export function deletePouch(id) {
  const data = load();
  const idx = data.pouches.findIndex((p) => p.id === id);
  if (idx === -1) return false;

  data.pouches.splice(idx, 1);
  save(data);
  return true;
}

/* ── Charge rates ───────────────────────────────────────────────────────── */

export function addChargeRate(rateKey, rate) {
  const data = load();
  data[rateKey].history.unshift({
    rate,
    changedBy: "Admin",
    changedAt: new Date().toISOString(),
  });
  save(data);
  return data[rateKey];
}
