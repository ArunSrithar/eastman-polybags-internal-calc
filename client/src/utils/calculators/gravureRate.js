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

/**
 * calculateGravureRate(form)
 *
 * Formula:
 *   Price per kg = (Total Cost × (1 + wastage%)) / Total Material Qty
 *
 * Where Total Cost = material cost + printing + lamination + slitting + pouch charges
 * (non-material charges are per-kg rates × total material qty)
 *
 * Returns null if no materials are enabled or total qty is 0.
 */
export function calculateGravureRate(form) {
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
    normalColors * NORMAL_COLOR_RATE +
    metallicColors * METALLIC_COLOR_RATE +
    (form.mattFinish ? MATT_FINISH_RATE : 0);

  const laminationRatePerKg =
    form.lamination === "single"
      ? SINGLE_LAM_RATE
      : form.lamination === "double"
        ? DOUBLE_LAM_RATE
        : 0;

  const slittingRatePerKg = form.slitting ? SLITTING_RATE : 0;

  const pouchRatePerKg = form.pouchSize
    ? (POUCH_RATE_BY_SIZE[form.pouchSize] ?? DEFAULT_POUCH_RATE)
    : 0;

  // ── Charge amounts (rate × total qty) ───────────────────────────────────
  const printingCost = printingRatePerKg * totalMaterialQty;
  const laminationCost = laminationRatePerKg * totalMaterialQty;
  const slittingCost = slittingRatePerKg * totalMaterialQty;
  const pouchCost = pouchRatePerKg * totalMaterialQty;

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalCost =
    totalMaterialCost +
    printingCost +
    laminationCost +
    slittingCost +
    pouchCost;

  const wastagePercent = parseFloat(form.wastage) || 0;
  const wastageAmount = totalCost * (wastagePercent / 100);
  const adjustedTotal = totalCost + wastageAmount;

  const pricePerKg = adjustedTotal / totalMaterialQty;

  return {
    materialLines,
    totalMaterialQty,
    totalMaterialCost,
    printingRatePerKg,
    printingCost,
    laminationRatePerKg,
    laminationCost,
    slittingRatePerKg,
    slittingCost,
    pouchRatePerKg,
    pouchCost,
    totalCost,
    wastagePercent,
    wastageAmount,
    adjustedTotal,
    pricePerKg,
  };
}
