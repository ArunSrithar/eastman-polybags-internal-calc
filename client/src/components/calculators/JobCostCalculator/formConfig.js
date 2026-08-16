import { LINE_ITEMS, DROPDOWN_SEEDS } from "../../../constants/jobCost";
import {
  NORMAL_COLOR_RATE,
  METALLIC_COLOR_RATE,
  MATT_FINISH_RATE,
  SLITTING_RATE,
  DEFAULT_POUCH_RATE,
} from "../../../constants/gravureRates";

// Maps Job Cost material item keys → Gravure settings material keys
const MATERIAL_SETTINGS_KEY = {
  polyster: "polyester",
  silverPolyster: "silverPet",
  boppSilver: "bopp",
  ldnLdop: "ldRoll",
};

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

/**
 * makeInitialForm(rates?, settings?)
 *
 * @param {object|null} rates    — flat rates from buildRatesFromSettings()
 * @param {object|null} settings — raw gravure settings (for material prices)
 *
 * When rates/settings are provided (settings are loaded), material prices
 * and charge rates are pre-filled from the Gravure price settings.
 * Falls back to hardcoded defaults when null.
 */
export function makeInitialForm(rates = null, settings = null) {
  const items = {};

  for (const def of LINE_ITEMS) {
    if (MATERIAL_SETTINGS_KEY[def.key] !== undefined) {
      // Material item — price from Gravure material settings
      const settingsKey = MATERIAL_SETTINGS_KEY[def.key];
      const settingsPrice = settings?.materials?.[settingsKey]?.priceHistory?.[0]?.price;
      items[def.key] = {
        enabled: true,
        qty: "",
        price: String(settingsPrice ?? def.defaultPrice),
      };
      continue;
    }

    if (def.key === "printingCharges") {
      const normalColorRate = rates?.normalColorRate ?? NORMAL_COLOR_RATE;
      const metallicColorRate = rates?.metallicColorRate ?? METALLIC_COLOR_RATE;
      const mattFinishRate = rates?.mattFinishRate ?? MATT_FINISH_RATE;
      items[def.key] = {
        enabled: true,
        qty: "",
        // Aggregate rate used by the total-cost calc — derived from the three
        // per-row prices below, never edited directly.
        price: String(normalColorRate),
        normalColors: "1",
        normalColorCompany: "",
        normalColorPrice: String(normalColorRate),
        metallicEnabled: false,
        metallicColorCompany: "",
        metallicColorPrice: String(metallicColorRate),
        mattFinish: false,
        mattFinishCompany: "",
        mattFinishPrice: String(mattFinishRate),
      };
      continue;
    }

    if (def.key === "laminationCharges") {
      // "none" is the off state — see LAMINATION_OPTIONS — so a fresh quote
      // starts with no lamination charge until the user picks single/double.
      items[def.key] = {
        enabled: true,
        qty: "",
        price: "0",
        laminationType: "none",
        laminationCompany: "",
      };
      continue;
    }

    if (def.key === "slittingCharges") {
      const rate = rates?.slittingRate ?? SLITTING_RATE;
      items[def.key] = {
        enabled: true,
        qty: "",
        price: String(rate),
        slittingCompany: "",
      };
      continue;
    }

    if (def.key === "pouchMakingCharges") {
      items[def.key] = {
        enabled: true,
        qty: "",
        price: String(DEFAULT_POUCH_RATE),
        pouchCompany: "",
        pouchSize: "",
      };
      continue;
    }

    // Flat items (packingCharges, transportCharge)
    items[def.key] = {
      enabled: true,
      price: getStoredFlatChargePrice(def.key, String(def.defaultPrice)),
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
