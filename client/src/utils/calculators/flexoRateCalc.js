import {
  CONVERSION_RATES as DEFAULT_CONVERSION_RATES,
  PRINTING_RATES as DEFAULT_PRINTING_RATES,
  GUSSET_RATES as DEFAULT_GUSSET_RATES,
  PUNCHING_RATE as DEFAULT_PUNCHING_RATE,
  OPACK_RATE as DEFAULT_OPACK_RATE,
  CUTTING_SIZE_RATES as DEFAULT_CUTTING_SIZE_RATES,
} from "../../constants/flexoRateCalc";

/**
 * calculateFlexoRate(form, rates?)
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
 * If `rates` is provided (from FlexoSettingsContext), uses those values.
 * Otherwise falls back to hardcoded constants for backward compatibility.
 *
 * Returns null if materialPrice is 0 or empty.
 */
export function calculateFlexoRate(form, rates) {
  const CONVERSION_RATES = rates?.conversionRates ?? DEFAULT_CONVERSION_RATES;
  const PRINTING_RATES = rates?.printingRates ?? DEFAULT_PRINTING_RATES;
  const GUSSET_RATES = rates?.gussetRates ?? DEFAULT_GUSSET_RATES;
  const PUNCHING_RATE = rates?.punchingRate ?? DEFAULT_PUNCHING_RATE;
  const OPACK_RATE = rates?.opackRate ?? DEFAULT_OPACK_RATE;
  const CUTTING_SIZE_RATES = rates?.cuttingRates ?? DEFAULT_CUTTING_SIZE_RATES;
  const ROLL_SIZE_RATES = rates?.rollSizeRates ?? {};
  const materialPrice = parseFloat(form.materialPrice) || 0;
  if (materialPrice === 0) return null;

  const conversionRate =
    CONVERSION_RATES[form.conversionMaterial]?.[form.rollSize] ?? 0;
  const rollSizeRate =
    ROLL_SIZE_RATES[form.conversionMaterial]?.[form.rollSize] ?? 0;
  const printingRate =
    PRINTING_RATES[form.coverSize]?.[form.printingColors] ?? 0;
  const gussetRate = form.gusset ? (GUSSET_RATES[form.coverSize] ?? 0) : 0;
  const punchingRate = form.punching ? PUNCHING_RATE : 0;
  const opackRate = form.opack ? OPACK_RATE : 0;
  const cuttingSizeRate = CUTTING_SIZE_RATES[form.cuttingSize] ?? 0;

  const subtotal =
    materialPrice +
    conversionRate +
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
    conversionMaterial: form.conversionMaterial,
    conversionRate,
    rollSize: form.rollSize,
    rollSizeRate,
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
