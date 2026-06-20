/* Tab definitions for the Gravure Price Settings page */

export const MATERIAL_TABS = [
  { id: "polyester", label: "Polyester", type: "material" },
  { id: "silverPet", label: "Silver PET", type: "material" },
  { id: "ldRoll", label: "L.D. Roll", type: "material" },
  { id: "bopp", label: "B.O.P.P.", type: "material" },
];

export const POUCH_TAB = { id: "pouches", label: "Pouches", type: "pouch" };

export const RATE_TABS = [
  { id: "normalColorRate", label: "Normal Color", type: "rate" },
  { id: "metallicColorRate", label: "Metallic Color", type: "rate" },
  { id: "mattFinishRate", label: "Matt Finish", type: "rate" },
  { id: "singleLamRate", label: "Single Lamination", type: "rate" },
  { id: "doubleLamRate", label: "Double Lamination", type: "rate" },
  { id: "slittingRate", label: "Slitting", type: "rate" },
];

export const COMPANIES_TAB = {
  id: "companies",
  label: "Companies & Charges",
  type: "companies",
};

export const ALL_TABS = [...MATERIAL_TABS, POUCH_TAB, COMPANIES_TAB];

/* Pouch table column definitions */
export const POUCH_COLUMNS = [
  { key: "sno", label: "S.No", className: "w-14" },
  { key: "size", label: "Size (W × H)", className: "w-36" },
  { key: "rate", label: "Rate (₹/kg)" },
  { key: "createdBy", label: "Created By" },
  { key: "createdAt", label: "Created At" },
  { key: "modifiedBy", label: "Modified By" },
  { key: "modifiedAt", label: "Modified At" },
  { key: "enabled", label: "Enabled", className: "w-20" },
  { key: "actions", label: "", className: "w-24" },
];

/* History table column factory (shared by material + charge rate tables) */
export function makeHistoryColumns(valueLabel) {
  return [
    { key: "sno", label: "S.No", className: "w-16" },
    { key: "changedBy", label: "Changed By" },
    { key: "value", label: valueLabel },
    { key: "date", label: "Date" },
    { key: "actions", label: "", className: "w-24" },
  ];
}

/* Company table column definitions */
export const COMPANY_COLUMNS = [
  { key: "sno", label: "#", className: "w-8" },
  { key: "name", label: "Company", className: "w-40" },
  { key: "normalColor", label: "Normal Color (₹/kg)", className: "w-32" },
  { key: "metallicColor", label: "Metallic Color (₹/kg)", className: "w-32" },
  { key: "mattFinish", label: "Matt Finish (₹/kg)", className: "w-28" },
  { key: "singleLam", label: "Single Lam (₹/kg)", className: "w-28" },
  { key: "doubleLam", label: "Double Lam (₹/kg)", className: "w-28" },
  { key: "slitting", label: "Slitting (₹/kg)", className: "w-24" },
  { key: "actions", label: "", className: "w-20" },
];
