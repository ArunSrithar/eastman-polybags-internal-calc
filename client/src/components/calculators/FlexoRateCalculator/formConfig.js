import {
  CONVERSION_RATES,
  COVER_SIZE_OPTIONS,
  WASTAGE_OPTIONS,
  CONVERSION_MATERIAL_TYPES,
  PRINTING_COLORS_OPTIONS,
} from "../../../constants/flexoRateCalc";
import { DEFAULT_FLEXO_COMPANY_NAME } from "./companyDisplay";

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
    printingCompany: DEFAULT_FLEXO_COMPANY_NAME,
    gusset: false,
    gussetCompany: DEFAULT_FLEXO_COMPANY_NAME,
    cutting: false,
    cuttingCompany: DEFAULT_FLEXO_COMPANY_NAME,
    punching: false,
    punchingCompany: DEFAULT_FLEXO_COMPANY_NAME,
    opack: false,
    opackCompany: DEFAULT_FLEXO_COMPANY_NAME,
    wastage: "0",
    service: "0",
    tax: "18",
  };
}
