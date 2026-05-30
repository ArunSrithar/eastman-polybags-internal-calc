import { LINE_ITEMS, DROPDOWN_SEEDS } from "../../../constants/jobCost";

const FLAT_CHARGE_PRICE_KEYS = {
  packingCharges: "job-cost-packing-charge-price",
  transportCharge: "job-cost-transport-charge-price",
};

function getStoredFlatChargePrice(itemKey, fallback) {
  try {
    const storageKey = FLAT_CHARGE_PRICE_KEYS[itemKey];
    if (!storageKey) return fallback;
    const val = window.localStorage.getItem(storageKey);
    return val != null ? val : fallback;
  } catch {
    return fallback;
  }
}

export function storeFlatChargePrice(itemKey, value) {
  try {
    const storageKey = FLAT_CHARGE_PRICE_KEYS[itemKey];
    if (!storageKey) return;
    window.localStorage.setItem(storageKey, String(value ?? ""));
  } catch {
    // Ignore storage failures (private mode/quota)
  }
}

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
    const initialPrice = def.hasQty
      ? String(def.defaultPrice)
      : getStoredFlatChargePrice(def.key, String(def.defaultPrice));

    items[def.key] = {
      enabled: true,
      price: initialPrice,
      ...(def.hasQty ? { qty: "" } : {}),
    };
  }

  return {
    quoteName: "",
    jobCardNo: "",
    jobCardDate: "",
    dispatchDate: "",
    jobWorkCompany: "",
    billingNo: "",
    billingDate: "",
    billingRate: "",
    noOfBundles: "",
    film: "",
    micron: "",
    noOfColours: "",
    items,
    wastage: "",
    finishedWeight: "",
    dispatchWeight: "",
  };
}
