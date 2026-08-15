import { useState } from "react";
import { PriceSettingsIcon } from "../ui/Icons";
import { useToast } from "../ui/Toast";
import { useFlexoSettings } from "../../context/FlexoSettingsContext";
import { FLEXO_TABS } from "./flexoSettingsConfig";
import TabBar from "./TabBar";
import MaterialPriceTable from "./MaterialPriceTable";
import RateLookupTable from "./RateLookupTable";
import FlexoCoverSizeTable from "./FlexoCoverSizeTable";
import FlexoCompaniesContainer from "./FlexoCompaniesContainer";
import FlexoCompanyTableRenderer from "./FlexoCompanyTableRenderer";

export default function FlexoPriceSettings() {
  const {
    settings,
    loading,
    updateMaterialPrice,
    updateRollSizeRate,
    addRollSizeRow,
    deleteRollSizeRow,
    toggleRollSizeEnabled,
  } = useFlexoSettings();
  const [toast, showToast] = useToast();
  const [activeTab, setActiveTab] = useState(FLEXO_TABS[0]);
  const [adding, setAdding] = useState(false);

  function handleTabSelect(tab) {
    setAdding(false);
    setActiveTab(tab);
  }

  if (loading || !settings) {
    return (
      <div className="calc-shell items-center justify-center">
        <p className="text-label-2">Loading settings…</p>
      </div>
    );
  }

  /* ── Handlers (thin wrappers → context methods + toast) ─────────────── */
  async function handleAddMaterialPrice(price) {
    try {
      await updateMaterialPrice(activeTab.id, price);
      showToast(
        "Price Updated",
        `${activeTab.label} material price set to ₹${price}`,
      );
      setAdding(false);
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function handleUpdateRollSize(rollSize, rate) {
    try {
      await updateRollSizeRate(activeTab.material, rollSize, rate);
      showToast(
        "Rate Updated",
        `${activeTab.label} ${rollSize} set to ₹${rate}`,
      );
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function handleAddRollSizeRow(rollSize) {
    try {
      await addRollSizeRow(activeTab.material, rollSize);
      showToast("Roll Size Added", `${rollSize} added to ${activeTab.label}`);
    } catch (err) {
      showToast("Failed to Add", err.message, "error");
    }
  }

  async function handleDeleteRollSizeRow(rollSize) {
    try {
      await deleteRollSizeRow(activeTab.material, rollSize);
      showToast(
        "Roll Size Deleted",
        `${rollSize} removed from ${activeTab.label}`,
      );
    } catch (err) {
      showToast("Delete Failed", err.message, "error");
    }
  }

  async function handleToggleRollSize(rollSize, enabled) {
    try {
      await toggleRollSizeEnabled(activeTab.material, rollSize, enabled);
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  /* ── Active table by tab type ───────────────────────────────────────── */

  function renderTable() {
    switch (activeTab.type) {
      case "material":
        return (
          <MaterialPriceTable
            materialKey={activeTab.id}
            settings={settings}
            adding={adding}
            onAdd={handleAddMaterialPrice}
            onCancelAdd={() => setAdding(false)}
            onAddStart={() => setAdding(true)}
          />
        );
      case "companies":
        return <FlexoCompaniesContainer renderer={FlexoCompanyTableRenderer} />;
      case "coverSizeRates":
        return <FlexoCoverSizeTable />;
      case "rollSizeLookup":
        return (
          <RateLookupTable
            entries={settings.rollSizeRates?.[activeTab.material] ?? {}}
            dimensionLabel="Roll Size"
            onUpdate={handleUpdateRollSize}
            onAddRow={handleAddRollSizeRow}
            onDeleteRow={handleDeleteRollSizeRow}
            onToggle={handleToggleRollSize}
            showCreated
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="calc-shell">
      {toast}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 size-10 flex items-center justify-center rounded-xl bg-grouped-background-2 text-tint">
            <PriceSettingsIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-label leading-tight truncate">
              Flexo — Price Settings
            </h1>
            <p className="text-xs text-label-2 mt-0.5 truncate">
              Manage material prices, printing, gusset, cutting &amp; charge
              rates
            </p>
          </div>
        </div>
      </div>

      {/* Glass container — tabs + table */}
      <div className="flex-1 min-h-0 flex flex-col glass-panel p-4 overflow-hidden">
        <div className="mb-4">
          <TabBar
            tabs={FLEXO_TABS}
            activeTab={activeTab}
            onSelect={handleTabSelect}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-auto">{renderTable()}</div>
      </div>
    </div>
  );
}
