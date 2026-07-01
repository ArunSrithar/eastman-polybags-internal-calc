import { LINE_ITEMS, DROPDOWN_SEEDS } from "../../../constants/flexoJobCost";

/* ─── Re-exports ──────────────────────────────────────────────────────────── */
export { LINE_ITEMS, DROPDOWN_SEEDS };

/* ─── Derived item groups ─────────────────────────────────────────────────── */
export const PROCESSING_ITEMS = LINE_ITEMS.filter(
  (i) => i.hasQty && i.key !== "material",
);
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
    invNo: "",
    jobCardNo: "",
    jobCardDate: "",
    dispatchDate: "",
    billingRate: "",
    billingDate: "",
    noOfBundles: "",
    jobWorkPlace: "",
    materialType: "PP",
    rollSizeSpec: "",
    micron: "",
    printColors: "",
    coverSize: "",
    items,
    finishedWeight: "",
    dispatchWeight: "",
  };
}
