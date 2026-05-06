import { LINE_ITEMS, DROPDOWN_SEEDS } from "../../../constants/jobCost";

/* ─── Re-exports for use in form ──────────────────────────────────────────── */
export { LINE_ITEMS, DROPDOWN_SEEDS };

/* ─── Derived item groups ─────────────────────────────────────────────────── */
export const MATERIAL_ITEMS = LINE_ITEMS.filter((i) => i.hasQty).slice(0, 4);
export const CHARGE_ITEMS = LINE_ITEMS.filter((i) => i.hasQty).slice(4, 8);
export const FLAT_ITEMS = LINE_ITEMS.filter((i) => !i.hasQty);

/* ─── Form state factory ─────────────────────────────────────────────────── */
export function makeInitialForm() {
  const items = {};
  for (const def of LINE_ITEMS) {
    items[def.key] = {
      enabled: true,
      price: String(def.defaultPrice),
      ...(def.hasQty ? { qty: "" } : {}),
    };
  }

  return {
    quoteName: "",
    jobCardNo: "",
    jobCardDate: "",
    jobWorkCompany: "",
    billingNo: "",
    billingDate: "",
    billingRate: "",
    noOfBundles: "",
    film: "",
    micron: "",
    noOfColours: "",
    items,
    wastage: "2",
    finishedWeight: "",
    dispatchWeight: "",
  };
}
