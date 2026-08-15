/* Tab definitions for the Flexo Price Settings page */

export const CONVERSION_TABS = [
  { id: "PP", label: "P.P.", type: "material" },
  { id: "HM", label: "H.M.", type: "material" },
  { id: "LD", label: "L.D.", type: "material" },
];

export const ROLL_SIZE_TABS = [
  {
    id: "PP-rolls",
    label: "P.P. Roll Sizes",
    type: "rollSizeLookup",
    material: "PP",
  },
  {
    id: "HM-rolls",
    label: "H.M. Roll Sizes",
    type: "rollSizeLookup",
    material: "HM",
  },
  {
    id: "LD-rolls",
    label: "L.D. Roll Sizes",
    type: "rollSizeLookup",
    material: "LD",
  },
];

export const COMPANIES_TAB = {
  id: "companies",
  label: "Companies",
  type: "companies",
};

// Cover sizes plus every rate they carry (printing colours, gusset, cutting)
// are edited together on one company-scoped 3-column screen.
export const COVER_SIZE_RATES_TAB = {
  id: "coverSizeRates",
  label: "Cover Sizes",
  type: "coverSizeRates",
};

export const FLEXO_TABS = [
  ...CONVERSION_TABS,
  ...ROLL_SIZE_TABS,
  COMPANIES_TAB,
  COVER_SIZE_RATES_TAB,
];

/* Column definitions for the roll size lookup table */
export const LOOKUP_COLUMNS = [
  { key: "sno", label: "S.No", className: "w-14" },
  { key: "dimension", label: "Dimension" },
  { key: "rate", label: "Rate (₹)" },
  { key: "changedBy", label: "Modified By" },
  { key: "date", label: "Modified At" },
  { key: "actions", label: "", className: "w-24" },
];

/* Printing colour counts a cover size carries a rate for */
export const PRINTING_COL_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];
