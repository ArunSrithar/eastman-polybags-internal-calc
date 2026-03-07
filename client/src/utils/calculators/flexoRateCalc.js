import {
  GUSSET_RATE,
  PUNCHING_RATE,
  OPACK_RATE,
  ROLL_SIZE_RATES,
  CUTTING_SIZE_RATES,
} from "../../constants/flexoRateCalc";

/**
 * calculateFlexoRate(form)
 *
 * Formula:
 *   Total Rate = Subtotal × (1 + wastage% / 100)
 *
 * Where Subtotal = materialPrice + rollSizeRate + printingRate
 *                + gussetRate + punchingRate + opackRate + cuttingSizeRate
 *
 * Returns null if materialPrice is 0 or empty.
 */
export function calculateFlexoRate(form) {
  const materialPrice = parseFloat(form.materialPrice) || 0;
  if (materialPrice === 0) return null;

  const rollSizeRate = ROLL_SIZE_RATES[form.rollSize] ?? 0;
  const printingRate = parseFloat(form.printingRate) || 0;
  const gussetRate = form.gusset ? GUSSET_RATE : 0;
  const punchingRate = form.punching ? PUNCHING_RATE : 0;
  const opackRate = form.opack ? OPACK_RATE : 0;
  const cuttingSizeRate = CUTTING_SIZE_RATES[form.cuttingSize] ?? 0;

  const subtotal =
    materialPrice +
    rollSizeRate +
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
    rollSize: form.rollSize,
    rollSizeRate,
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
