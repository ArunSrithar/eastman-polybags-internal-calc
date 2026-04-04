import { useState } from "react";
import { PriceSettingsIcon } from "../ui/Icons";
import { useToast } from "../ui/Toast";
import { useGravureSettings } from "../../context/GravureSettingsContext";
import { ALL_TABS } from "./settingsConfig";
import TabBar from "./TabBar";
import MaterialPriceTable from "./MaterialPriceTable";
import PouchTable from "./PouchTable";
import ChargeRateTable from "./ChargeRateTable";

export default function GravurePriceSettings() {
  const {
    settings,
    loading,
    updateMaterialPrice,
    addPouch,
    editPouch,
    removePouch,
    updateChargeRate,
  } = useGravureSettings();
  const [toast, showToast] = useToast();
  const [activeTab, setActiveTab] = useState(ALL_TABS[0]);
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

  async function handleAddPouch(length, breadth, rate) {
    try {
      await addPouch(length, breadth, rate);
      showToast(
        "Pouch Added",
        `New size ${length}×${breadth} added at ₹${rate} per bag`,
      );
      setAdding(false);
    } catch (err) {
      showToast("Failed to Add", err.message, "error");
    }
  }

  async function handleEditPouch(id, fields) {
    try {
      await editPouch(id, fields);
      if (!("enabled" in fields))
        showToast("Pouch Updated", "Size and rate saved successfully");
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function handleDeletePouch(id) {
    try {
      await removePouch(id);
      showToast("Pouch Deleted", "Pouch size removed from settings");
    } catch (err) {
      showToast("Delete Failed", err.message, "error");
    }
  }

  async function handleAddChargeRate(rate) {
    try {
      await updateChargeRate(activeTab.id, rate);
      showToast(
        "Rate Updated",
        `${activeTab.label} charge rate set to ₹${rate}`,
      );
      setAdding(false);
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
      case "pouch":
        return (
          <PouchTable
            settings={settings}
            onEdit={handleEditPouch}
            onDelete={handleDeletePouch}
            adding={adding}
            onAdd={handleAddPouch}
            onCancelAdd={() => setAdding(false)}
            onAddStart={() => setAdding(true)}
          />
        );
      case "rate":
        return (
          <ChargeRateTable
            rateKey={activeTab.id}
            settings={settings}
            adding={adding}
            onAdd={handleAddChargeRate}
            onCancelAdd={() => setAdding(false)}
            title={activeTab.label}
            onAddStart={() => setAdding(true)}
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
              Gravure — Price Settings
            </h1>
            <p className="text-xs text-label-2 mt-0.5 truncate">
              Manage material prices, pouch rates & charge rates
            </p>
          </div>
        </div>
      </div>

      {/* Glass container — tabs + table */}
      <div className="flex-1 min-h-0 flex flex-col glass-panel p-4 overflow-hidden">
        <div className="mb-4">
          <TabBar
            tabs={ALL_TABS}
            activeTab={activeTab}
            onSelect={handleTabSelect}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-auto">{renderTable()}</div>
      </div>
    </div>
  );
}
