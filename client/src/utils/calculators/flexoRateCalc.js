import {
  CONVERSION_RATES,
  PRINTING_RATES,
  GUSSET_RATES,
  PUNCHING_RATE,
  OPACK_RATE,
  CUTTING_SIZE_RATES,
} from "../../constants/flexoRateCalc";

/**
 * calculateFlexoRate(form)
 *
 * Formula:
 *   Total Rate = Subtotal × (1 + wastage% / 100)
 *
 * Where Subtotal = materialPrice + conversionRate + printingRate
 *                + gussetRate + punchingRate + opackRate + cuttingSizeRate
 *
 * Lookups:
 *   conversionRate = CONVERSION_RATES[conversionMaterial][rollSize]
 *   printingRate   = PRINTING_RATES[coverSize][printingColors]
 *   gussetRate     = GUSSET_RATES[coverSize]  (only when gusset toggle is on)
 *
 * Returns null if materialPrice is 0 or empty.
 */
export function calculateFlexoRate(form) {
  const materialPrice = parseFloat(form.materialPrice) || 0;
  if (materialPrice === 0) return null;

  const conversionRate =
    CONVERSION_RATES[form.conversionMaterial]?.[form.rollSize] ?? 0;
  const printingRate =
    PRINTING_RATES[form.coverSize]?.[form.printingColors] ?? 0;
  const gussetRate = form.gusset ? (GUSSET_RATES[form.coverSize] ?? 0) : 0;
  const punchingRate = form.punching ? PUNCHING_RATE : 0;
  const opackRate = form.opack ? OPACK_RATE : 0;
  const cuttingSizeRate = CUTTING_SIZE_RATES[form.cuttingSize] ?? 0;

  const subtotal =
    materialPrice +
    conversionRate +
    printingRate +
    gussetRate +
    punchingRate +
    opackRate +
    cuttingSizeRate;

  const wastagePercent = parseFloat(form.wastage) || 0;
  const wastageAmount = subtotal * (wastagePercent / 100);
  const totalRate = subtotal + wastageAmount;

  return {
    materialPrice,
    conversionMaterial: form.conversionMaterial,
    conversionRate,
    rollSize: form.rollSize,
    coverSize: form.coverSize,
    printingColors: form.printingColors,
    printingRate,
    gussetRate,
    punchingRate,
    opackRate,
    cuttingSize: form.cuttingSize,
    cuttingSizeRate,
    subtotal,
    wastagePercent,
    wastageAmount,
    totalRate,
  };
}
