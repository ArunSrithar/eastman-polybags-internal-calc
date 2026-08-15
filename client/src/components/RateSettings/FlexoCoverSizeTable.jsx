import { useEffect, useMemo, useState } from "react";
import { useFlexoSettings } from "../../context/FlexoSettingsContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";
import { compareDimensions } from "../../utils/dimensionUtils";
import { PRINTING_COL_KEYS } from "./flexoSettingsConfig";
import FlexoCompanyColumn from "./flexoCoverSize/FlexoCompanyColumn";
import FlexoSizeListColumn from "./flexoCoverSize/FlexoSizeListColumn";
import FlexoRatesColumn from "./flexoCoverSize/FlexoRatesColumn";

function buildDrafts(coverSize) {
  if (!coverSize) return {};
  const drafts = {
    gusset: String(coverSize.gussetRate?.price ?? 0),
    cutting: String(coverSize.cuttingRate?.price ?? 0),
  };
  for (const colorCount of PRINTING_COL_KEYS) {
    drafts[`printing:${colorCount}`] = String(
      coverSize.printingColors?.[colorCount]?.price ?? 0,
    );
  }
  return drafts;
}

export default function FlexoCoverSizeTable() {
  const {
    companies,
    companyCoverSizes,
    fetchCompanyCoverSizes,
    addCompanyCoverSize,
    deleteCompanyCoverSize,
    toggleCompanyCoverSize,
    updateCompanyCoverSizeRate,
  } = useFlexoSettings();
  const { canEditPrices } = useAuth();
  const canEdit = canEditPrices("flexo");
  const [toast, showToast] = useToast();

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCoverSizeId, setSelectedCoverSizeId] = useState(null);
  const [addingSize, setAddingSize] = useState(false);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [rateDrafts, setRateDrafts] = useState({});

  const activeCompanies = useMemo(
    () => (companies ?? []).filter((company) => company.isActive !== false),
    [companies],
  );

  const selectedCompany = useMemo(() => {
    if (!activeCompanies.length) return null;
    return (
      activeCompanies.find((company) => company.id === selectedCompanyId) ??
      activeCompanies[0]
    );
  }, [activeCompanies, selectedCompanyId]);

  useEffect(() => {
    if (selectedCompany) fetchCompanyCoverSizes(selectedCompany.id);
  }, [selectedCompany, fetchCompanyCoverSizes]);

  const coverSizes = useMemo(() => {
    if (!selectedCompany) return [];
    return [...(companyCoverSizes[selectedCompany.id] ?? [])].sort((a, b) =>
      compareDimensions(a.coverSize, b.coverSize),
    );
  }, [companyCoverSizes, selectedCompany]);

  const selectedCoverSize = useMemo(() => {
    if (!coverSizes.length) return null;
    return (
      coverSizes.find((cs) => cs.id === selectedCoverSizeId) ?? coverSizes[0]
    );
  }, [coverSizes, selectedCoverSizeId]);

  // Reseed the price inputs whenever the selected size (or its saved rates) change
  useEffect(() => {
    setRateDrafts(buildDrafts(selectedCoverSize));
  }, [selectedCoverSize]);

  function closeAddSize() {
    setAddingSize(false);
    setWidthInput("");
    setHeightInput("");
  }

  async function handleAddSize() {
    const width = widthInput.trim();
    const height = heightInput.trim();
    if (!selectedCompany || !canEdit || !width || !height) return;
    const coverSize = `${width}x${height}`;
    try {
      await addCompanyCoverSize(selectedCompany.id, coverSize);
      showToast(
        "Cover Size Added",
        `"${width} x ${height}" added for ${selectedCompany.name}`,
      );
      closeAddSize();
    } catch (err) {
      showToast("Failed to Add", err.message, "error");
    }
  }

  function handleSizeInputKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSize();
      return;
    }
    if (event.key === "Escape") {
      closeAddSize();
    }
  }

  async function handleDeleteSize(coverSizeId) {
    if (!selectedCompany || !canEdit) return;
    try {
      await deleteCompanyCoverSize(selectedCompany.id, coverSizeId);
      showToast("Cover Size Deleted", "Cover size removed");
    } catch (err) {
      showToast("Delete Failed", err.message, "error");
    }
  }

  async function handleToggleSize(coverSizeId, enabled) {
    if (!selectedCompany || !canEdit) return;
    try {
      await toggleCompanyCoverSize(selectedCompany.id, coverSizeId, enabled);
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  async function updateRate(patch) {
    if (!selectedCompany || !selectedCoverSize || !canEdit) return;
    try {
      await updateCompanyCoverSizeRate(
        selectedCompany.id,
        selectedCoverSize.id,
        patch,
      );
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    }
  }

  function handleChangeDraft(key, value) {
    setRateDrafts((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCommitDraft(key, patch, rawValue) {
    const price = Number(rawValue);
    if (!Number.isFinite(price) || price < 0) {
      setRateDrafts(buildDrafts(selectedCoverSize));
      return;
    }
    await updateRate({ ...patch, price });
  }

  async function handleToggleRate(key, patch, isAvailable) {
    await updateRate({ ...patch, isAvailable });
  }

  return (
    <>
      {toast}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-0">
        <FlexoCompanyColumn
          companies={activeCompanies}
          selectedCompanyId={selectedCompany?.id ?? null}
          onSelectCompany={(companyId) => {
            setSelectedCompanyId(companyId);
            setSelectedCoverSizeId(null);
          }}
        />

        <FlexoSizeListColumn
          canEdit={canEdit}
          selectedCompany={selectedCompany}
          coverSizes={coverSizes}
          selectedCoverSizeId={selectedCoverSize?.id ?? null}
          onSelectCoverSize={setSelectedCoverSizeId}
          onToggleCoverSize={handleToggleSize}
          onDeleteCoverSize={handleDeleteSize}
          addingSize={addingSize}
          onStartAdd={() => setAddingSize(true)}
          widthInput={widthInput}
          heightInput={heightInput}
          onWidthChange={setWidthInput}
          onHeightChange={setHeightInput}
          onSizeInputKeyDown={handleSizeInputKeyDown}
          onConfirmAdd={handleAddSize}
          onCancelAdd={closeAddSize}
        />

        <FlexoRatesColumn
          selectedCoverSize={selectedCoverSize}
          canEdit={canEdit}
          rateDrafts={rateDrafts}
          onChangeDraft={handleChangeDraft}
          onCommitDraft={handleCommitDraft}
          onToggleRate={handleToggleRate}
        />
      </div>
    </>
  );
}
