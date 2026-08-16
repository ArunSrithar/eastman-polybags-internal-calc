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
  // Label is "Opack" to match the Flexo Rate Calculator and the underlying
  // opackCompany/opack settings fields — key stays "opaque" for saved quotes.
  { key: "opaque", label: "Opack", hasQty: true, defaultPrice: 15 },
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
// Roll sizes and print colours are no longer seeded here — they come from the
// live rate tables in price settings so the values always match the keys the
// rate lookups use.
export const DROPDOWN_SEEDS = {
  jobWorkPlaces: ["R.K. Power", "Company B", "Company C"],
};
