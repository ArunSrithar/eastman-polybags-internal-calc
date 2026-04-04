import { useState } from "react";
import { PriceSettingsIcon, PlusIcon } from "../ui/Icons";
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
      showToast(`Updated ${activeTab.label} price to ₹${price}`);
      setAdding(false);
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleAddPouch(length, breadth, rate) {
    try {
      await addPouch(length, breadth, rate);
      showToast(`Added pouch size ${length}×${breadth}`);
      setAdding(false);
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleEditPouch(id, fields) {
    try {
      await editPouch(id, fields);
      if (!("enabled" in fields)) showToast("Pouch size updated");
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleDeletePouch(id) {
    try {
      await removePouch(id);
      showToast("Pouch size deleted");
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleAddChargeRate(rate) {
    try {
      await updateChargeRate(activeTab.id, rate);
      showToast(`Updated ${activeTab.label} rate to ₹${rate}`);
      setAdding(false);
    } catch (err) {
      showToast(err.message);
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
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={adding}
          className="btn-primary btn-pill disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PlusIcon className="size-4" />
          <span>Add New</span>
        </button>
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
