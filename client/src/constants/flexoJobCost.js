/**
 * Constants for Flexo Job Cost Calculator.
 * Default prices are from the client reference draft.
 * All monetary values are in ₹.
 */

// ── Line item definitions ─────────────────────────────────────────────────
export const LINE_ITEMS = [
  { key: "material", label: "Material", hasQty: true, defaultPrice: 200 },
  { key: "rollSize", label: "Roll Size", hasQty: true, defaultPrice: 14 },
  { key: "printing", label: "Printing", hasQty: true, defaultPrice: 48 },
  { key: "gusset", label: "Gusset", hasQty: true, defaultPrice: 20 },
  { key: "cutting", label: "Cutting", hasQty: true, defaultPrice: 10 },
  { key: "opaque", label: "Opaque", hasQty: true, defaultPrice: 15 },
  { key: "punching", label: "Punching", hasQty: true, defaultPrice: 10 },
  {
    key: "packingCharges",
    label: "Packing Charges",
    hasQty: false,
    defaultPrice: 0,
  },
  {
    key: "transportCharges",
    label: "Transport Charges",
    hasQty: false,
    defaultPrice: 0,
  },
];

// ── CreatableSelect seed options ──────────────────────────────────────────
export const DROPDOWN_SEEDS = {
  jobWorkPlaces: ["R.K. Power", "Company B", "Company C"],
  rollSizes: ['4"', '5"', '6"', '7"', '8"', '9"', '10"', '12"'],
  printColors: ["1 Colour", "2 Colour", "3 Colour", "4 Colour", "Multicolour"],
};
