import {
  CONVERSION_RATES,
  COVER_SIZE_OPTIONS,
  WASTAGE_OPTIONS,
  CONVERSION_MATERIAL_TYPES,
  PRINTING_COLORS_OPTIONS,
} from "../../../constants/flexoRateCalc";

/* ─── Option arrays derived from constant keys ───────────────────────────── */
export const ROLL_SIZE_OPTIONS = Object.keys(CONVERSION_RATES.PP);

/* ─── Re-exports for convenient form-level access ─────────────────────────── */
export {
  COVER_SIZE_OPTIONS,
  WASTAGE_OPTIONS,
  CONVERSION_MATERIAL_TYPES,
  PRINTING_COLORS_OPTIONS,
};

/* ─── Form state factory ──────────────────────────────────────────────────── */
export function makeInitialForm() {
  return {
    quoteName: "",
    materialPrice: "",
    conversionMaterial: "",
    coverSize: "",
    rollSize: "",
    printingColors: "1",
    printingCompany: "",
    gusset: false,
    gussetCompany: "",
    cutting: false,
    cuttingCompany: "",
    punching: false,
    punchingCompany: "",
    opack: false,
    opackCompany: "",
    wastage: "0",
    service: "0",
  };
}
