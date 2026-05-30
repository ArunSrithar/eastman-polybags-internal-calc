import {
  NORMAL_COLOR_RATE,
  METALLIC_COLOR_RATE,
  MATT_FINISH_RATE,
  SINGLE_LAM_RATE,
  DOUBLE_LAM_RATE,
  SLITTING_RATE,
  POUCH_RATE_BY_SIZE,
  DEFAULT_POUCH_RATE,
} from "../../constants/gravureRates";

/** Fallback rates derived from hardcoded constants */
const FALLBACK_RATES = {
  normalColorRate: NORMAL_COLOR_RATE,
  metallicColorRate: METALLIC_COLOR_RATE,
  mattFinishRate: MATT_FINISH_RATE,
  singleLamRate: SINGLE_LAM_RATE,
  doubleLamRate: DOUBLE_LAM_RATE,
  slittingRate: SLITTING_RATE,
  pouchRates: POUCH_RATE_BY_SIZE,
};

/**
 * calculateGravureRate(form, rates?)
 *
 * Formula:
 *   Price per kg = (Total Cost × (1 + wastage%)) / Total Material Qty
 *
 * Where Total Cost = material cost + printing + lamination + slitting + pouch charges
 * (non-material charges are per-kg rates × total material qty)
 *
 * @param {object} form  — form state from GravureForm
 * @param {object} [rates] — { normalColorRate, metallicColorRate, mattFinishRate,
 *                             singleLamRate, doubleLamRate, slittingRate,
 *                             pouchRates: { "4x6": 15, ... } }
 * Returns null if no materials are enabled or total qty is 0.
 */
export function calculateGravureRate(form, rates) {
  const r = rates ?? FALLBACK_RATES;
  const MATERIAL_KEYS = ["polyester", "silverPet", "ldRoll", "bopp"];

  // ── Materials ────────────────────────────────────────────────────────────
  const materialLines = MATERIAL_KEYS.map((key) => {
    const m = form.materials[key];
    const price = parseFloat(m.price) || 0;
    const qty = parseFloat(m.qty) || 0;
    return {
      key,
      enabled: m.enabled,
      price,
      qty,
      amount: m.enabled ? price * qty : 0,
    };
  }).filter((m) => m.enabled);

  const totalMaterialQty = materialLines.reduce((s, m) => s + m.qty, 0);
  const totalMaterialCost = materialLines.reduce((s, m) => s + m.amount, 0);

  if (totalMaterialQty === 0) return null;

  // ── Per-kg charge rates ──────────────────────────────────────────────────
  const normalColors = parseInt(form.normalColors) || 0;
  const metallicColors = parseInt(form.metallicColors) || 0;
  const printingRatePerKg =
    normalColors * r.normalColorRate +
    metallicColors * r.metallicColorRate +
    (form.mattFinish ? r.mattFinishRate : 0);

  const laminationRatePerKg =
    form.lamination === "single"
      ? r.singleLamRate
      : form.lamination === "double"
        ? r.doubleLamRate
        : 0;

  const slittingRatePerKg = form.slitting ? r.slittingRate : 0;

  const pouchRatePerKg = form.pouchSize
    ? (r.pouchRates[form.pouchSize] ?? DEFAULT_POUCH_RATE)
    : 0;

  // ── Per-kg charge sums (NOT multiplied by qty) ──────────────────────────
  // The formula: (materialCost + chargesPerKg + wastage) / qty = pricePerKg
  const totalChargesPerKg =
    printingRatePerKg +
    laminationRatePerKg +
    slittingRatePerKg +
    pouchRatePerKg;

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalCost = totalMaterialCost + totalChargesPerKg;

  const wastagePercent = parseFloat(form.wastage) || 0;
  const wastageAmount = totalCost * (wastagePercent / 100);
  const preServiceTotal = totalCost + wastageAmount;

  const servicePercent = parseFloat(form.service) || 0;
  const serviceAmount = preServiceTotal * (servicePercent / 100);
  const adjustedTotal = preServiceTotal + serviceAmount;
  const pricePerKg = adjustedTotal / totalMaterialQty;

  return {
    materialLines,
    totalMaterialQty,
    totalMaterialCost,
    printingRatePerKg,
    laminationRatePerKg,
    slittingRatePerKg,
    pouchRatePerKg,
    totalChargesPerKg,
    totalCost,
    wastagePercent,
    wastageAmount,
    preServiceTotal,
    servicePercent,
    serviceAmount,
    adjustedTotal,
    pricePerKg,
  };
}
