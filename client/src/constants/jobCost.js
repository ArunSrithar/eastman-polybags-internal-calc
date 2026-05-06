/**
 * Constants for Job Cost Calculator.
 * Default prices are placeholders — update with real rates when available.
 * All monetary values are in ₹.
 */

// ── Line item definitions ─────────────────────────────────────────────────
export const LINE_ITEMS = [
  { key: "polyster", label: "Polyster", hasQty: true, defaultPrice: 200 },
  {
    key: "silverPolyster",
    label: "Silver Polyster",
    hasQty: true,
    defaultPrice: 250,
  },
  {
    key: "boppSilver",
    label: "B.O.P.P / Silver",
    hasQty: true,
    defaultPrice: 180,
  },
  {
    key: "ldnLdop",
    label: "L.D.N. / L.D.op.",
    hasQty: true,
    defaultPrice: 160,
  },
  {
    key: "printingCharges",
    label: "Printing Charges",
    hasQty: true,
    defaultPrice: 30,
  },
  {
    key: "laminationCharges",
    label: "Lamination Charges",
    hasQty: true,
    defaultPrice: 15,
  },
  {
    key: "slittingCharges",
    label: "Slitting Charges",
    hasQty: true,
    defaultPrice: 8,
  },
  {
    key: "pouchMakingCharges",
    label: "Pouch Making Charges",
    hasQty: true,
    defaultPrice: 20,
  },
  {
    key: "packingCharges",
    label: "Packing Charges",
    hasQty: false,
    defaultPrice: 0,
  },
  {
    key: "transportCharge",
    label: "Transport Charge",
    hasQty: false,
    defaultPrice: 500,
  },
];

// ── CreatableCombobox seed options ────────────────────────────────────────
export const DROPDOWN_SEEDS = {
  jobWorkCompanies: ["Company A", "Company B", "Company C"],
  transports: ["Transport Co 1", "Transport Co 2", "Transport Co 3"],
  microns: ["12", "15", "20", "25", "30", "40", "50"],
  colours: ["1 Colour", "2 Colour", "3 Colour", "4 Colour", "Multicolour"],
};
