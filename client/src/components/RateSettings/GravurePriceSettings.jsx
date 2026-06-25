import { useState } from "react";
import { PriceSettingsIcon } from "../ui/Icons";
import { useToast } from "../ui/Toast";
import { useGravureSettings } from "../../context/GravureSettingsContext";
import { ALL_TABS } from "./settingsConfig";
import TabBar from "./TabBar";
import MaterialPriceTable from "./MaterialPriceTable";
import PouchTable from "./PouchTable";
import CompaniesContainer from "./CompaniesContainer";
import CompanyTableRenderer from "./CompanyTableRenderer";
import { useAuth } from "../../context/AuthContext";

export default function GravurePriceSettings() {
  const {
    settings,
    companies,
    loading,
    updateMaterialPrice,
    addPouch,
    editPouch,
    removePouch,
  } = useGravureSettings();
  const [toast, showToast] = useToast();
  const { canEditPrices } = useAuth();
  const canEdit = canEditPrices("gravure");
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

  async function handleAddPouch(companyId, length, breadth, types) {
    try {
      await addPouch(companyId, length, breadth, types);
      showToast(
        "Pouch Added",
        `New size ${length}×${breadth} added`,
      );
      setAdding(false);
    } catch (err) {
      showToast("Failed to Add", err.message, "error");
    }
  }

  async function handleEditPouch(companyId, id, fields) {
    try {
      await editPouch(companyId, id, fields);
      showToast("Pouch Updated", "Pouch type rate saved successfully");
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function handleDeletePouch(companyId, id) {
    try {
      await removePouch(companyId, id);
      showToast("Pouch Deleted", "Pouch size removed from settings");
    } catch (err) {
      showToast("Delete Failed", err.message, "error");
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
            companies={companies}
            pouches={settings.pouches ?? []}
            onUpdate={handleEditPouch}
            onDelete={handleDeletePouch}
            onAdd={handleAddPouch}
            canEdit={canEdit}
          />
        );
      case "companies":
        return (
          <CompaniesContainer
            renderer={CompanyTableRenderer}
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
