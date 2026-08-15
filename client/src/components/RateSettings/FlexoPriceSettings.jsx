import { useEffect, useMemo, useState } from "react";
import { PriceSettingsIcon } from "../ui/Icons";
import { useToast } from "../ui/Toast";
import { useFlexoSettings } from "../../context/FlexoSettingsContext";
import {
  FLEXO_TABS,
  PRINTING_COL_KEYS,
  COMPANY_SCOPED_TAB_TYPES,
} from "./flexoSettingsConfig";
import TabBar from "./TabBar";
import MaterialPriceTable from "./MaterialPriceTable";
import RateLookupTable from "./RateLookupTable";
import RateMatrixTable from "./RateMatrixTable";
import ChargeRateTable from "./ChargeRateTable";
import CoverSizeTable from "./CoverSizeTable";
import FlexoCompaniesContainer from "./FlexoCompaniesContainer";
import FlexoCompanyTableRenderer from "./FlexoCompanyTableRenderer";

const NO_COMPANY_SELECTED = "";

/* ── Adapters: company cover-size docs → view models the shared table
   components already know how to render (same shape as the global settings
   objects) ─────────────────────────────────────────────────────────────── */

function buildCompanyPrintingRates(coverSizes) {
  const out = {};
  for (const cs of coverSizes) {
    const entry = {
      enabled: cs.enabled !== false,
      createdBy: cs.createdBy,
      createdAt: cs.createdAt,
    };
    for (const colorCount of PRINTING_COL_KEYS) {
      const cell = cs.printingColors?.[colorCount];
      entry[colorCount] = {
        history: [
          {
            rate: cell?.price ?? 0,
            changedBy: cs.modifiedBy ?? cs.createdBy,
            changedAt: cs.modifiedAt ?? cs.createdAt,
          },
        ],
      };
    }
    out[cs.coverSize] = entry;
  }
  return out;
}

function buildCompanyLookupRates(coverSizes, field) {
  const out = {};
  for (const cs of coverSizes) {
    const cell = cs[field];
    out[cs.coverSize] = {
      enabled: cs.enabled !== false,
      history: [
        {
          rate: cell?.price ?? 0,
          changedBy: cs.modifiedBy ?? cs.createdBy,
          changedAt: cs.modifiedAt ?? cs.createdAt,
        },
      ],
    };
  }
  return out;
}

function buildCompanyChargeSettings(company, chargeKey, label) {
  const charge = company?.charges?.[chargeKey];
  return {
    label,
    unit: "₹/unit",
    history: charge
      ? [
          {
            rate: charge.price ?? 0,
            changedBy: "—",
            changedAt: company.updatedAt,
          },
        ]
      : [],
  };
}

export default function FlexoPriceSettings() {
  const {
    settings,
    loading,
    updateMaterialPrice,
    updateRollSizeRate,
    addRollSizeRow,
    deleteRollSizeRow,
    toggleRollSizeEnabled,
    companies,
    companiesLoading,
    companyCoverSizes,
    fetchCompanyCoverSizes,
    addCompanyCoverSize,
    deleteCompanyCoverSize,
    toggleCompanyCoverSize,
    updateCompanyCoverSizeRate,
    updateCompanyCharge,
  } = useFlexoSettings();
  const [toast, showToast] = useToast();
  const [activeTab, setActiveTab] = useState(FLEXO_TABS[0]);
  const [adding, setAdding] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(NO_COMPANY_SELECTED);

  const activeCompanies = useMemo(
    () => companies.filter((c) => c.isActive !== false),
    [companies],
  );

  // Default to the first active company once companies load, without
  // storing state in an effect — derive it until the user picks explicitly.
  const effectiveCompanyId = selectedCompanyId || activeCompanies[0]?.id || "";

  const isCompanyScopedTab = COMPANY_SCOPED_TAB_TYPES.includes(activeTab.type);

  useEffect(() => {
    if (isCompanyScopedTab && effectiveCompanyId) {
      fetchCompanyCoverSizes(effectiveCompanyId);
    }
  }, [isCompanyScopedTab, effectiveCompanyId, fetchCompanyCoverSizes]);

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

  const selectedCompany = companies.find((c) => c.id === effectiveCompanyId);
  const coverSizesForCompany = effectiveCompanyId
    ? (companyCoverSizes[effectiveCompanyId] ?? [])
    : [];

  function findCoverSizeId(coverSize) {
    return coverSizesForCompany.find((cs) => cs.coverSize === coverSize)?.id;
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
      showToast("Roll Size Deleted", `${rollSize} removed from ${activeTab.label}`);
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

  /* ── Company-scoped handlers ──────────────────────────────────────────── */

  async function handleAddCoverSize(coverSize) {
    try {
      await addCompanyCoverSize(effectiveCompanyId, coverSize);
      showToast("Cover Size Added", `"${coverSize}" added for ${selectedCompany?.name}`);
    } catch (err) {
      showToast("Failed to Add", err.message, "error");
    }
  }

  async function handleDeleteCoverSize(coverSize) {
    try {
      const id = findCoverSizeId(coverSize);
      if (!id) return;
      await deleteCompanyCoverSize(effectiveCompanyId, id);
      showToast("Cover Size Deleted", `"${coverSize}" removed`);
    } catch (err) {
      showToast("Delete Failed", err.message, "error");
    }
  }

  async function handleToggleCoverSize(coverSize, enabled) {
    try {
      const id = findCoverSizeId(coverSize);
      if (!id) return;
      await toggleCompanyCoverSize(effectiveCompanyId, id, enabled);
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function handleUpdatePrinting(coverSize, colorCount, rate) {
    try {
      const id = findCoverSizeId(coverSize);
      if (!id) return;
      await updateCompanyCoverSizeRate(effectiveCompanyId, id, {
        category: "printing",
        colorCount,
        price: rate,
      });
      showToast(
        "Rate Updated",
        `${coverSize} × ${colorCount} colors set to ₹${rate}`,
      );
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function handleUpdateGusset(coverSize, rate) {
    try {
      const id = findCoverSizeId(coverSize);
      if (!id) return;
      await updateCompanyCoverSizeRate(effectiveCompanyId, id, {
        category: "gusset",
        price: rate,
      });
      showToast("Rate Updated", `Gusset ${coverSize} rate set to ₹${rate}`);
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function handleUpdateCutting(coverSize, rate) {
    try {
      const id = findCoverSizeId(coverSize);
      if (!id) return;
      await updateCompanyCoverSizeRate(effectiveCompanyId, id, {
        category: "cutting",
        price: rate,
      });
      showToast("Rate Updated", `Cutting ${coverSize} rate set to ₹${rate}`);
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function handleUpdateCharge(rate) {
    try {
      await updateCompanyCharge(effectiveCompanyId, activeTab.chargeKey, {
        price: rate,
      });
      showToast("Rate Updated", `${activeTab.label} set to ₹${rate}`);
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
      case "companies":
        return <FlexoCompaniesContainer renderer={FlexoCompanyTableRenderer} />;
      case "coverSizes":
        return (
          <CoverSizeTable
            printingRates={buildCompanyPrintingRates(coverSizesForCompany)}
            onAdd={handleAddCoverSize}
            onDelete={handleDeleteCoverSize}
            onToggle={handleToggleCoverSize}
          />
        );
      case "matrix":
        return (
          <RateMatrixTable
            data={buildCompanyPrintingRates(coverSizesForCompany)}
            rowKeys={coverSizesForCompany.map((cs) => cs.coverSize)}
            colKeys={PRINTING_COL_KEYS}
            rowLabel="Cover Size"
            colLabel="Colors"
            onUpdate={handleUpdatePrinting}
          />
        );
      case "lookup":
        return (
          <RateLookupTable
            entries={buildCompanyLookupRates(
              coverSizesForCompany,
              activeTab.id === "gusset" ? "gussetRate" : "cuttingRate",
            )}
            dimensionLabel={activeTab.dimensionLabel}
            onUpdate={
              activeTab.id === "gusset" ? handleUpdateGusset : handleUpdateCutting
            }
          />
        );
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
      case "charge":
        return (
          <ChargeRateTable
            rateKey={activeTab.id}
            settings={{
              [activeTab.id]: buildCompanyChargeSettings(
                selectedCompany,
                activeTab.chargeKey,
                activeTab.label,
              ),
            }}
            adding={adding}
            onAddStart={() => setAdding(true)}
            onAdd={handleUpdateCharge}
            onCancelAdd={() => setAdding(false)}
            title={activeTab.label}
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

        {isCompanyScopedTab ? (
          <div className="mb-4 flex items-center gap-2">
            <label className="text-xs text-label-3 shrink-0">Company</label>
            <select
              className="input-base w-64"
              value={effectiveCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              disabled={companiesLoading}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id} disabled={c.isActive === false}>
                  {c.name}
                  {c.isActive === false ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex-1 min-h-0 overflow-auto">
          {isCompanyScopedTab && !effectiveCompanyId ? (
            <div className="flex items-center justify-center py-8 text-label-3 text-sm">
              Select a company to view its rates.
            </div>
          ) : (
            renderTable()
          )}
        </div>
      </div>
    </div>
  );
}
