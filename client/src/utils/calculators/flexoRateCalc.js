import {
  CONVERSION_RATES as DEFAULT_CONVERSION_RATES,
  PRINTING_RATES as DEFAULT_PRINTING_RATES,
  GUSSET_RATES as DEFAULT_GUSSET_RATES,
  PUNCHING_RATE as DEFAULT_PUNCHING_RATE,
  OPACK_RATE as DEFAULT_OPACK_RATE,
  CUTTING_RATES as DEFAULT_CUTTING_RATES,
} from "../../constants/flexoRateCalc";

/* ── Company-scoped rate resolution ────────────────────────────────────── */

function findCompany(companies, name) {
  if (!name) return null;
  return (companies ?? []).find((c) => c.name === name) ?? null;
}

function findCompanyCoverSize(companyCoverSizes, companyId, coverSize) {
  if (!companyId) return null;
  return (
    (companyCoverSizes?.[companyId] ?? []).find(
      (cs) => cs.coverSize === coverSize,
    ) ?? null
  );
}

/**
 * calculateFlexoRate(form, rates?, companies?, companyCoverSizes?)
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
 * If a per-charge company is selected on the form (form.printingCompany,
 * form.gussetCompany, form.cuttingCompany, form.punchingCompany,
 * form.opackCompany), that company's own rates (from `companies` +
 * `companyCoverSizes`) are used instead of the global `rates`. A charge with
 * no company selected falls back to the global rate.
 *
 * If `rates` is provided (from FlexoSettingsContext), uses those values.
 * Otherwise falls back to hardcoded constants for backward compatibility.
 *
 * Returns null if materialPrice is 0 or empty.
 */
export function calculateFlexoRate(form, rates, companies, companyCoverSizes) {
  const CONVERSION_RATES = rates?.conversionRates ?? DEFAULT_CONVERSION_RATES;
  const PRINTING_RATES = rates?.printingRates ?? DEFAULT_PRINTING_RATES;
  const GUSSET_RATES = rates?.gussetRates ?? DEFAULT_GUSSET_RATES;
  const PUNCHING_RATE = rates?.punchingRate ?? DEFAULT_PUNCHING_RATE;
  const OPACK_RATE = rates?.opackRate ?? DEFAULT_OPACK_RATE;
  const CUTTING_RATES = rates?.cuttingRates ?? DEFAULT_CUTTING_RATES;
  const ROLL_SIZE_RATES = rates?.rollSizeRates ?? {};
  const materialPrice = parseFloat(form.materialPrice) || 0;
  if (materialPrice === 0) return null;

  const conversionRate =
    CONVERSION_RATES[form.conversionMaterial]?.[form.rollSize] ?? 0;
  const rollSizeRate =
    ROLL_SIZE_RATES[form.conversionMaterial]?.[form.rollSize] ?? 0;

  const printingCompany = findCompany(companies, form.printingCompany);
  const printingCoverSizeDoc = printingCompany
    ? findCompanyCoverSize(companyCoverSizes, printingCompany.id, form.coverSize)
    : null;
  const printingRate = printingCompany
    ? (printingCoverSizeDoc?.printingColors?.[form.printingColors]?.price ?? 0)
    : (PRINTING_RATES[form.coverSize]?.[form.printingColors] ?? 0);

  const gussetCompany = findCompany(companies, form.gussetCompany);
  const gussetCoverSizeDoc = gussetCompany
    ? findCompanyCoverSize(companyCoverSizes, gussetCompany.id, form.coverSize)
    : null;
  const gussetRate = form.gusset
    ? gussetCompany
      ? (gussetCoverSizeDoc?.gussetRate?.price ?? 0)
      : (GUSSET_RATES[form.coverSize] ?? 0)
    : 0;

  const cuttingCompany = findCompany(companies, form.cuttingCompany);
  const cuttingCoverSizeDoc = cuttingCompany
    ? findCompanyCoverSize(companyCoverSizes, cuttingCompany.id, form.coverSize)
    : null;
  const cuttingSizeRate = form.cutting
    ? cuttingCompany
      ? (cuttingCoverSizeDoc?.cuttingRate?.price ?? 0)
      : (CUTTING_RATES[form.coverSize] ?? 0)
    : 0;

  const punchingCompany = findCompany(companies, form.punchingCompany);
  const punchingRate = form.punching
    ? punchingCompany
      ? (punchingCompany.charges?.punching?.price ?? 0)
      : PUNCHING_RATE
    : 0;

  const opackCompany = findCompany(companies, form.opackCompany);
  const opackRate = form.opack
    ? opackCompany
      ? (opackCompany.charges?.opack?.price ?? 0)
      : OPACK_RATE
    : 0;

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
  const preServiceTotal = subtotal + wastageAmount;

  const servicePercent = parseFloat(form.service) || 0;
  const serviceAmount = preServiceTotal * (servicePercent / 100);
  const totalRate = preServiceTotal + serviceAmount;

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
    cuttingSizeRate,
    subtotal,
    wastagePercent,
    wastageAmount,
    preServiceTotal,
    servicePercent,
    serviceAmount,
    totalRate,
    selectedCompanies: {
      printing: printingCompany?.name ?? null,
      gusset: gussetCompany?.name ?? null,
      cutting: cuttingCompany?.name ?? null,
      punching: punchingCompany?.name ?? null,
      opack: opackCompany?.name ?? null,
    },
  };
}
