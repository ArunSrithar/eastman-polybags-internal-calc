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

export const PRINTING_TAB = {
  id: "printing",
  label: "Printing",
  type: "matrix",
};

export const LOOKUP_TABS = [
  {
    id: "gusset",
    label: "Gusset",
    type: "lookup",
    dataKey: "gussetRates",
    dimensionLabel: "Cover Size",
  },
  {
    id: "cutting",
    label: "Cutting",
    type: "lookup",
    dataKey: "cuttingRates",
    dimensionLabel: "Cutting Size",
  },
];

export const CHARGE_TABS = [
  { id: "punchingRate", label: "Punching", type: "charge" },
  { id: "opackRate", label: "Opack", type: "charge" },
];

export const FLEXO_TABS = [
  ...CONVERSION_TABS,
  ...ROLL_SIZE_TABS,
  PRINTING_TAB,
  ...LOOKUP_TABS,
  ...CHARGE_TABS,
];

/* Column definitions for lookup/conversion tables */
export const LOOKUP_COLUMNS = [
  { key: "sno", label: "S.No", className: "w-14" },
  { key: "dimension", label: "Dimension" },
  { key: "rate", label: "Rate (₹)" },
  { key: "changedBy", label: "Modified By" },
  { key: "date", label: "Modified At" },
  { key: "actions", label: "", className: "w-24" },
];

/* Matrix labels for Printing tab */
export const PRINTING_ROW_KEYS = [
  "8x10",
  "10x12",
  "12x14",
  "14x16",
  "16x18",
  "18x20",
];
export const PRINTING_COL_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];
