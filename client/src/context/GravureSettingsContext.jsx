import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  fetchGravureSettings,
  updateMaterialPrice as apiUpdateMaterialPrice,
  addMaterialOption as apiAddMaterialOption,
  addPouch as apiAddPouch,
  updatePouch as apiUpdatePouch,
  deletePouch as apiDeletePouch,
  updateChargeRate as apiUpdateChargeRate,
} from "../utils/settingsApi";
import {
  NORMAL_COLOR_RATE,
  METALLIC_COLOR_RATE,
  MATT_FINISH_RATE,
  SINGLE_LAM_RATE,
  DOUBLE_LAM_RATE,
  SLITTING_RATE,
  POUCH_RATE_BY_SIZE,
  MATERIAL_NAMES,
} from "../constants/gravureRates";

const GravureSettingsContext = createContext(null);

// ── Helpers — derive current value from history[0] ─────────────────────────
export function getCurrentPrice(material) {
  return material?.priceHistory?.[0]?.price ?? 0;
}

export function getCurrentRate(rateObj) {
  return rateObj?.history?.[0]?.rate ?? 0;
}

// ── Fallback settings from constants (used when API unreachable) ───────────
function buildFallbackSettings() {
  const now = new Date().toISOString();
  const makeMat = (key) => ({
    label: MATERIAL_NAMES[key],
    priceHistory: [],
    micronOptions: [],
    qtyOptions: [],
  });
  return {
    materials: {
      polyester: makeMat("polyester"),
      silverPet: makeMat("silverPet"),
      ldRoll: makeMat("ldRoll"),
      bopp: makeMat("bopp"),
    },
    pouches: Object.entries(POUCH_RATE_BY_SIZE).map(([size, rate], i) => {
      const [length, breadth] = size.split(" x ");
      return {
        id: `fallback-${i}`,
        length,
        breadth,
        rate,
        enabled: true,
        createdBy: "System",
        createdAt: now,
        modifiedBy: null,
        modifiedAt: null,
      };
    }),
    normalColorRate: {
      label: "Normal Color Rate",
      unit: "₹/color",
      history: [
        { rate: NORMAL_COLOR_RATE, changedBy: "System", changedAt: now },
      ],
    },
    metallicColorRate: {
      label: "Metallic Color Rate",
      unit: "₹/color",
      history: [
        { rate: METALLIC_COLOR_RATE, changedBy: "System", changedAt: now },
      ],
    },
    mattFinishRate: {
      label: "Matt Finish Rate",
      unit: "₹/kg",
      history: [
        { rate: MATT_FINISH_RATE, changedBy: "System", changedAt: now },
      ],
    },
    singleLamRate: {
      label: "Single Lamination",
      unit: "₹/kg",
      history: [{ rate: SINGLE_LAM_RATE, changedBy: "System", changedAt: now }],
    },
    doubleLamRate: {
      label: "Double Lamination",
      unit: "₹/kg",
      history: [{ rate: DOUBLE_LAM_RATE, changedBy: "System", changedAt: now }],
    },
    slittingRate: {
      label: "Slitting Charges",
      unit: "₹/kg",
      history: [{ rate: SLITTING_RATE, changedBy: "System", changedAt: now }],
    },
  };
}

// ── Build rates object for calculateGravureRate ───────────────────────────
export function buildRatesFromSettings(settings) {
  const pouchRates = {};
  for (const p of settings.pouches) {
    if (p.enabled === false) continue;
    pouchRates[`${p.length} x ${p.breadth}`] = p.rate;
  }
  return {
    normalColorRate: getCurrentRate(settings.normalColorRate),
    metallicColorRate: getCurrentRate(settings.metallicColorRate),
    mattFinishRate: getCurrentRate(settings.mattFinishRate),
    singleLamRate: getCurrentRate(settings.singleLamRate),
    doubleLamRate: getCurrentRate(settings.doubleLamRate),
    slittingRate: getCurrentRate(settings.slittingRate),
    pouchRates,
  };
}

// ── Provider ───────────────────────────────────────────────────────────────
export function GravureSettingsProvider({ children, skip = false }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (skip) return;
    try {
      const data = await fetchGravureSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch gravure settings:", err);
      setError(err.message);
      setSettings((prev) => prev ?? buildFallbackSettings());
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    if (!skip) refresh();
  }, [refresh, skip]);

  const updateMaterialPrice = useCallback(async (materialKey, price) => {
    const updated = await apiUpdateMaterialPrice(materialKey, price);
    setSettings((prev) => ({
      ...prev,
      materials: { ...prev.materials, [materialKey]: updated },
    }));
  }, []);

  const addMaterialOption = useCallback(async (materialKey, type, value) => {
    const updated = await apiAddMaterialOption(materialKey, type, value);
    setSettings((prev) => ({
      ...prev,
      materials: { ...prev.materials, [materialKey]: updated },
    }));
  }, []);

  const addPouch = useCallback(
    async (length, breadth, rate) => {
      await apiAddPouch(length, breadth, rate);
      await refresh();
    },
    [refresh],
  );

  const editPouch = useCallback(
    async (id, fields) => {
      await apiUpdatePouch(id, fields);
      await refresh();
    },
    [refresh],
  );

  const removePouch = useCallback(
    async (id) => {
      await apiDeletePouch(id);
      await refresh();
    },
    [refresh],
  );

  const updateChargeRate = useCallback(async (rateKey, rate) => {
    const updated = await apiUpdateChargeRate(rateKey, rate);
    setSettings((prev) => ({ ...prev, [rateKey]: updated }));
  }, []);

  const value = {
    settings,
    loading,
    error,
    refresh,
    updateMaterialPrice,
    addMaterialOption,
    addPouch,
    editPouch,
    removePouch,
    updateChargeRate,
  };

  return (
    <GravureSettingsContext.Provider value={value}>
      {children}
    </GravureSettingsContext.Provider>
  );
}

export function useGravureSettings() {
  const ctx = useContext(GravureSettingsContext);
  if (!ctx) {
    throw new Error(
      "useGravureSettings must be used within GravureSettingsProvider",
    );
  }
  return ctx;
}
