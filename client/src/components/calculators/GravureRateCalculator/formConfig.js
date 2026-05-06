import { MATERIAL_NAMES } from "../../../constants/gravureRates";

/* ─── Materials list derived from constants ───────────────────────────────── */
export const MATERIALS = Object.entries(MATERIAL_NAMES).map(([key, name]) => ({
  key,
  name,
}));

/* ─── localStorage helpers for material prices ───────────────────────────── */
const MATERIAL_STORAGE_KEY = "gravure-material-values";

function getStoredMaterials() {
  try {
    return JSON.parse(localStorage.getItem(MATERIAL_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

export function storeMaterialField(materialKey, field, value) {
  const current = getStoredMaterials();
  const mat = current[materialKey] ?? {};
  if (value) mat[field] = value;
  else delete mat[field];
  localStorage.setItem(
    MATERIAL_STORAGE_KEY,
    JSON.stringify({ ...current, [materialKey]: mat }),
  );
}

export function calculateLdRollQtyFromMicron(micron) {
  const micronValue = parseFloat(micron);
  if (Number.isNaN(micronValue) || micronValue <= 0) return "";
  const qty = (0.94 * micronValue) / 16.8;
  return qty.toFixed(2);
}

export function calculateBoppQtyFromMicron(micron) {
  const micronValue = parseFloat(micron);
  if (Number.isNaN(micronValue) || micronValue <= 0) return "";
  const qty = (0.91 * micronValue) / 16.8;
  return qty.toFixed(2);
}

/* ─── Form state factories ────────────────────────────────────────────────── */
function makeMaterial(enabled = false, price = "", micron = "", qty = "") {
  return { enabled, price, micron, qty };
}

export function makeInitialForm() {
  const saved = getStoredMaterials();
  const s = (key, field) => saved[key]?.[field] ?? "";
  const ldRollMicron = s("ldRoll", "micron");
  const boppMicron = s("bopp", "micron");
  return {
    quoteName: "",
    pouchSize: "",
    materials: {
      polyester: makeMaterial(
        true,
        s("polyester", "price"),
        s("polyester", "micron"),
        s("polyester", "qty"),
      ),
      silverPet: makeMaterial(
        false,
        s("silverPet", "price"),
        s("silverPet", "micron"),
        s("silverPet", "qty"),
      ),
      ldRoll: makeMaterial(
        false,
        s("ldRoll", "price"),
        ldRollMicron,
        calculateLdRollQtyFromMicron(ldRollMicron),
      ),
      bopp: makeMaterial(
        false,
        s("bopp", "price"),
        boppMicron,
        calculateBoppQtyFromMicron(boppMicron),
      ),
    },
    normalColors: "0",
    metallicColors: "0",
    mattFinish: false,
    lamination: "none",
    slitting: false,
    wastage: "0",
  };
}
