import {
  CONVERSION_RATES,
  COVER_SIZE_OPTIONS,
  CUTTING_SIZE_RATES,
  WASTAGE_OPTIONS,
  CONVERSION_MATERIAL_TYPES,
  PRINTING_COLORS_OPTIONS,
} from "../../../constants/flexoRateCalc";

/* ─── Option arrays derived from constant keys ───────────────────────────── */
export const ROLL_SIZE_OPTIONS = Object.keys(CONVERSION_RATES.PP);
export const CUTTING_SIZE_OPTIONS = Object.keys(CUTTING_SIZE_RATES);

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
    conversionMaterial: "PP",
    coverSize: "",
    rollSize: "",
    printingColors: "1",
    gusset: false,
    punching: false,
    opack: false,
    cuttingSize: "",
    wastage: "0",
  };
}
