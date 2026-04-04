import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  fetchFlexoSettings,
  updateFlexoMaterialPrice as apiUpdateMaterialPrice,
  updateFlexoConversionRate as apiUpdateConversion,
  updateFlexoPrintingRate as apiUpdatePrinting,
  updateFlexoGussetRate as apiUpdateGusset,
  updateFlexoCuttingRate as apiUpdateCutting,
  updateFlexoChargeRate as apiUpdateCharge,
  addFlexoPrintingRow as apiAddPrintingRow,
  deleteFlexoPrintingRow as apiDeletePrintingRow,
  toggleFlexoPrintingRow as apiTogglePrintingRow,
  updateFlexoRollSizeRate as apiUpdateRollSizeRate,
  addFlexoRollSizeRow as apiAddRollSizeRow,
  deleteFlexoRollSizeRow as apiDeleteRollSizeRow,
  toggleFlexoRollSizeEnabled as apiToggleRollSizeEnabled,
} from "../utils/settingsApi";
import {
  CONVERSION_RATES,
  PRINTING_RATES,
  GUSSET_RATES,
  CUTTING_SIZE_RATES,
  PUNCHING_RATE,
  OPACK_RATE,
} from "../constants/flexoRateCalc";

const FlexoSettingsContext = createContext(null);

// ── Helpers — derive current rate from history[0] ──────────────────────────
export function getCurrentRate(rateObj) {
  return rateObj?.history?.[0]?.rate ?? 0;
}

// ── Fallback settings from constants (used when API unreachable) ───────────
function buildFallbackSettings() {
  const now = new Date().toISOString();
  const entry = (r) => ({
    history: [{ rate: r, changedBy: "System", changedAt: now }],
  });

  const conversionRates = {};
  for (const [mat, sizes] of Object.entries(CONVERSION_RATES)) {
    const rates = {};
    for (const [size, rate] of Object.entries(sizes)) {
      rates[size] = entry(rate);
    }
    conversionRates[mat] = { label: mat, rates };
  }

  const printingRates = {};
  for (const [cover, colors] of Object.entries(PRINTING_RATES)) {
    printingRates[cover] = {};
    for (const [c, rate] of Object.entries(colors)) {
      printingRates[cover][String(c)] = entry(rate);
    }
  }

  const gussetRates = {};
  for (const [cover, rate] of Object.entries(GUSSET_RATES)) {
    gussetRates[cover] = entry(rate);
  }

  const cuttingRates = {};
  for (const [size, rate] of Object.entries(CUTTING_SIZE_RATES)) {
    cuttingRates[String(size)] = entry(rate);
  }

  return {
    conversionRates,
    printingRates,
    gussetRates,
    cuttingRates,
    punchingRate: {
      label: "Punching",
      unit: "₹/unit",
      history: [{ rate: PUNCHING_RATE, changedBy: "System", changedAt: now }],
    },
    opackRate: {
      label: "Opack",
      unit: "₹/unit",
      history: [{ rate: OPACK_RATE, changedBy: "System", changedAt: now }],
    },
  };
}

// ── Build rates object for calculateFlexoRate ─────────────────────────────
export function buildFlexoRatesFromSettings(settings) {
  const conversionRates = {};
  for (const [mat, { rates }] of Object.entries(settings.conversionRates)) {
    conversionRates[mat] = {};
    for (const [size, cell] of Object.entries(rates)) {
      conversionRates[mat][size] = getCurrentRate(cell);
    }
  }

  const printingRates = {};
  for (const [cover, colors] of Object.entries(settings.printingRates)) {
    printingRates[cover] = {};
    for (const [c, cell] of Object.entries(colors)) {
      if (c === "enabled") continue;
      printingRates[cover][Number(c)] = getCurrentRate(cell);
    }
  }

  const gussetRates = {};
  for (const [cover, cell] of Object.entries(settings.gussetRates)) {
    gussetRates[cover] = getCurrentRate(cell);
  }

  const cuttingRates = {};
  for (const [size, cell] of Object.entries(settings.cuttingRates)) {
    cuttingRates[Number(size)] = getCurrentRate(cell);
  }

  const rollSizeRates = {};
  for (const [mat, sizes] of Object.entries(settings.rollSizeRates ?? {})) {
    rollSizeRates[mat] = {};
    for (const [size, cell] of Object.entries(sizes)) {
      rollSizeRates[mat][size] = getCurrentRate(cell);
    }
  }

  return {
    conversionRates,
    printingRates,
    gussetRates,
    cuttingRates,
    rollSizeRates,
    punchingRate: getCurrentRate(settings.punchingRate),
    opackRate: getCurrentRate(settings.opackRate),
  };
}

// ── Provider ───────────────────────────────────────────────────────────────
export function FlexoSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchFlexoSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch flexo settings:", err);
      setError(err.message);
      if (!settings) {
        setSettings(buildFallbackSettings());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateMaterialPrice = useCallback(async (material, price) => {
    const updated = await apiUpdateMaterialPrice(material, price);
    setSettings((prev) => ({
      ...prev,
      materials: { ...prev.materials, [material]: updated },
    }));
  }, []);

  const updateConversionRate = useCallback(async (material, rollSize, rate) => {
    const updated = await apiUpdateConversion(material, rollSize, rate);
    setSettings((prev) => ({
      ...prev,
      conversionRates: { ...prev.conversionRates, [material]: updated },
    }));
  }, []);

  const updatePrintingRate = useCallback(
    async (coverSize, colorCount, rate) => {
      const updated = await apiUpdatePrinting(coverSize, colorCount, rate);
      setSettings((prev) => ({
        ...prev,
        printingRates: { ...prev.printingRates, [coverSize]: updated },
      }));
    },
    [],
  );

  const updateGussetRate = useCallback(async (coverSize, rate) => {
    const updated = await apiUpdateGusset(coverSize, rate);
    setSettings((prev) => ({ ...prev, gussetRates: updated }));
  }, []);

  const updateCuttingRate = useCallback(async (size, rate) => {
    const updated = await apiUpdateCutting(size, rate);
    setSettings((prev) => ({ ...prev, cuttingRates: updated }));
  }, []);

  const updateChargeRate = useCallback(async (rateKey, rate) => {
    const updated = await apiUpdateCharge(rateKey, rate);
    setSettings((prev) => ({ ...prev, [rateKey]: updated }));
  }, []);

  const addPrintingCoverSize = useCallback(async (coverSize) => {
    const updated = await apiAddPrintingRow(coverSize);
    setSettings((prev) => ({
      ...prev,
      printingRates: updated.printingRates,
      gussetRates: updated.gussetRates,
    }));
  }, []);

  const deletePrintingCoverSize = useCallback(async (coverSize) => {
    const updated = await apiDeletePrintingRow(coverSize);
    setSettings((prev) => ({
      ...prev,
      printingRates: updated.printingRates,
      gussetRates: updated.gussetRates,
    }));
  }, []);

  const togglePrintingCoverSize = useCallback(async (coverSize, enabled) => {
    const updated = await apiTogglePrintingRow(coverSize, enabled);
    setSettings((prev) => ({
      ...prev,
      printingRates: updated.printingRates,
      gussetRates: updated.gussetRates,
    }));
  }, []);

  const updateRollSizeRate = useCallback(async (material, rollSize, rate) => {
    const updated = await apiUpdateRollSizeRate(material, rollSize, rate);
    setSettings((prev) => ({
      ...prev,
      rollSizeRates: { ...prev.rollSizeRates, [material]: updated },
    }));
  }, []);

  const addRollSizeRow = useCallback(async (material, rollSize) => {
    const updated = await apiAddRollSizeRow(material, rollSize);
    setSettings((prev) => ({
      ...prev,
      rollSizeRates: { ...prev.rollSizeRates, [material]: updated },
    }));
  }, []);

  const deleteRollSizeRow = useCallback(async (material, rollSize) => {
    const updated = await apiDeleteRollSizeRow(material, rollSize);
    setSettings((prev) => ({
      ...prev,
      rollSizeRates: { ...prev.rollSizeRates, [material]: updated },
    }));
  }, []);

  const toggleRollSizeEnabled = useCallback(
    async (material, rollSize, enabled) => {
      const updated = await apiToggleRollSizeEnabled(
        material,
        rollSize,
        enabled,
      );
      setSettings((prev) => ({
        ...prev,
        rollSizeRates: { ...prev.rollSizeRates, [material]: updated },
      }));
    },
    [],
  );

  const value = {
    settings,
    loading,
    error,
    refresh,
    updateMaterialPrice,
    updateConversionRate,
    updatePrintingRate,
    updateGussetRate,
    updateCuttingRate,
    updateChargeRate,
    addPrintingCoverSize,
    deletePrintingCoverSize,
    togglePrintingCoverSize,
    updateRollSizeRate,
    addRollSizeRow,
    deleteRollSizeRow,
    toggleRollSizeEnabled,
  };

  return (
    <FlexoSettingsContext.Provider value={value}>
      {children}
    </FlexoSettingsContext.Provider>
  );
}

export function useFlexoSettings() {
  const ctx = useContext(FlexoSettingsContext);
  if (!ctx) {
    throw new Error(
      "useFlexoSettings must be used within FlexoSettingsProvider",
    );
  }
  return ctx;
}
