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

export const DEFAULT_GRAVURE_COMPANY_NAME = "Eastman Color Printers";

const PROCESS_RATE_KEYS = {
  normalColor: "normalColorRate",
  metallicColor: "metallicColorRate",
  mattFinish: "mattFinishRate",
  singleLamination: "singleLamRate",
  doubleLamination: "doubleLamRate",
  slitting: "slittingRate",
};

function findCompany(companies, companyName) {
  if (!companyName) return null;

  return (
    companies?.find(
      (company) =>
        company.name === companyName && company.isActive !== false,
    ) ?? null
  );
}

function resolveProcessRate({
  companies,
  companyName,
  processKey,
  fallbackRate,
}) {
  const company = findCompany(companies, companyName);
  const process = company?.processes?.[processKey];

  if (!process || process.isAvailable === false) {
    return fallbackRate;
  }

  return Number.isFinite(process.price) ? process.price : fallbackRate;
}

function resolveCompanyPricingSnapshot(form, rates, companies) {
  if (form.companyRateSnapshot) {
    return form.companyRateSnapshot;
  }

  const companiesByProcess = {
    normalColor: form.normalColorCompany || DEFAULT_GRAVURE_COMPANY_NAME,
    metallicColor: form.metallicColorCompany || DEFAULT_GRAVURE_COMPANY_NAME,
    mattFinish: form.mattFinishCompany || DEFAULT_GRAVURE_COMPANY_NAME,
    singleLamination:
      form.singleLaminationCompany || DEFAULT_GRAVURE_COMPANY_NAME,
    doubleLamination:
      form.doubleLaminationCompany || DEFAULT_GRAVURE_COMPANY_NAME,
    slitting: form.slittingCompany || DEFAULT_GRAVURE_COMPANY_NAME,
  };

  const resolvedRates = Object.entries(PROCESS_RATE_KEYS).reduce(
    (acc, [processKey, rateKey]) => {
      acc[rateKey] = resolveProcessRate({
        companies,
        companyName: companiesByProcess[processKey],
        processKey,
        fallbackRate: rates[rateKey],
      });
      return acc;
    },
    {},
  );

  return {
    companies: companiesByProcess,
    rates: resolvedRates,
  };
}

/**
 * calculateGravureRate(form, rates?)
 *
 * Formula:
 *   Total (with wastage) = Total Cost × (1 + wastage%)
 *   Base Price per kg    = Total (with wastage) / Total Material Qty
 *   Service per kg       = Base Price per kg × (service% / 100)
 *   Final Price per kg   = Base Price per kg + Service per kg
 *
 * Where Total Cost = material cost + printing + lamination + slitting + pouch charges
 *
 * @param {object} form  — form state from GravureForm
 * @param {object} [rates] — { normalColorRate, metallicColorRate, mattFinishRate,
 *                             singleLamRate, doubleLamRate, slittingRate,
 *                             pouchRates: { "4x6": 15, ... } }
 * Returns null if no materials are enabled or total qty is 0.
 */
export function calculateGravureRate(form, rates, companies) {
  const r = rates ?? FALLBACK_RATES;
  const MATERIAL_KEYS = ["polyester", "silverPet", "ldRoll", "bopp"];
  const companyPricingSnapshot = resolveCompanyPricingSnapshot(
    form,
    r,
    companies,
  );
  const effectiveRates = {
    ...r,
    ...companyPricingSnapshot.rates,
  };

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
  const metallicColorsEnabled =
    typeof form.metallicColorsEnabled === "boolean"
      ? form.metallicColorsEnabled
      : (parseInt(form.metallicColors) || 0) > 0;
  const printingRatePerKg =
    normalColors * effectiveRates.normalColorRate +
    (metallicColorsEnabled ? effectiveRates.metallicColorRate : 0) +
    (form.mattFinish ? effectiveRates.mattFinishRate : 0);

  const laminationRatePerKg =
    form.lamination === "single"
      ? effectiveRates.singleLamRate
      : form.lamination === "double"
        ? effectiveRates.doubleLamRate
        : 0;

  const slittingRatePerKg = form.slitting ? effectiveRates.slittingRate : 0;

  const pouchRatePerKg = form.pouchSize
    ? (effectiveRates.pouchRates[form.pouchSize] ?? DEFAULT_POUCH_RATE)
    : 0;

  // Slitting and pouch rates come from DB as per-kg rates, so convert to
  // total process charge based on the current total material quantity.
  const slittingCharge = slittingRatePerKg * totalMaterialQty;
  const pouchCharge = pouchRatePerKg * totalMaterialQty;

  const totalCharges =
    printingRatePerKg +
    laminationRatePerKg +
    slittingCharge +
    pouchCharge;

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalCost = totalMaterialCost + totalCharges;

  const wastagePercent = parseFloat(form.wastage) || 0;
  const wastageAmount = totalCost * (wastagePercent / 100);
  const preServiceTotal = totalCost + wastageAmount;

  const basePricePerKg = preServiceTotal / totalMaterialQty;

  const servicePercent = parseFloat(form.service) || 0;
  // Service is treated as a per-kg surcharge based on base price/kg.
  const serviceAmount = basePricePerKg * (servicePercent / 100);
  const pricePerKg = basePricePerKg + serviceAmount;
  const adjustedTotal = preServiceTotal + serviceAmount * totalMaterialQty;

  return {
    materialLines,
    totalMaterialQty,
    totalMaterialCost,
    printingRatePerKg,
    laminationRatePerKg,
    slittingRatePerKg,
    pouchRatePerKg,
    slittingCharge,
    pouchCharge,
    totalCharges,
    totalChargesPerKg: totalCharges,
    totalCost,
    wastagePercent,
    wastageAmount,
    preServiceTotal,
    basePricePerKg,
    servicePercent,
    serviceAmount,
    adjustedTotal,
    pricePerKg,
    selectedRates: companyPricingSnapshot.rates,
    selectedCompanies: companyPricingSnapshot.companies,
    companyRateSnapshot: companyPricingSnapshot,
  };
}
