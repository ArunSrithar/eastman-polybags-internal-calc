import { useEffect, useMemo, useState } from "react";
import { makeDefaultPouchTypes } from "../../constants/pouchTypes";
import PouchCompanyColumn from "./pouch/PouchCompanyColumn";
import PouchSizesColumn from "./pouch/PouchSizesColumn";
import PouchTypeRatesColumn from "./pouch/PouchTypeRatesColumn";
import sizeLabel from "./pouch/sizeLabel";

const DEFAULT_COMPANY = "Eastman Color Printers";

export default function PouchTable({
  companies,
  pouches,
  onAdd,
  onUpdate,
  onDelete,
  canEdit,
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedPouchId, setSelectedPouchId] = useState(null);
  const [addingSize, setAddingSize] = useState(false);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [rateDrafts, setRateDrafts] = useState({});

  const activeCompanies = useMemo(
    () =>
      (companies ?? [])
        .filter((company) => company.isActive !== false)
        .sort((a, b) => {
          if (a.name === DEFAULT_COMPANY) return -1;
          if (b.name === DEFAULT_COMPANY) return 1;
          return a.name.localeCompare(b.name);
        }),
    [companies],
  );

  const selectedCompany = useMemo(() => {
    if (!activeCompanies.length) return null;
    if (!selectedCompanyId) return activeCompanies[0];
    return (
      activeCompanies.find((company) => company.id === selectedCompanyId) ??
      activeCompanies[0]
    );
  }, [activeCompanies, selectedCompanyId]);

  const selectedCompanyPouches = useMemo(() => {
    if (!selectedCompany) return [];
    return (pouches ?? [])
      .filter((pouch) => pouch.companyId === selectedCompany.id)
      .sort((a, b) => sizeLabel(a).localeCompare(sizeLabel(b)));
  }, [pouches, selectedCompany]);

  const selectedPouch = useMemo(() => {
    if (!selectedCompanyPouches.length) return null;
    if (!selectedPouchId) return selectedCompanyPouches[0];
    return (
      selectedCompanyPouches.find((pouch) => pouch.id === selectedPouchId) ??
      selectedCompanyPouches[0]
    );
  }, [selectedCompanyPouches, selectedPouchId]);

  useEffect(() => {
    if (!selectedPouch) {
      setRateDrafts({});
      return;
    }

    const nextDrafts = {};
    for (const [typeKey, typeConfig] of Object.entries(selectedPouch?.types ?? {})) {
      nextDrafts[typeKey] = String(typeConfig?.price ?? 0);
    }
    setRateDrafts(nextDrafts);
  }, [selectedPouch]);

  async function handleAddSize() {
    if (!selectedCompany || !canEdit) return;
    const length = widthInput.trim();
    const breadth = heightInput.trim();
    if (!length || !breadth) return;

    await onAdd(selectedCompany.id, length, breadth, makeDefaultPouchTypes());
    setWidthInput("");
    setHeightInput("");
    setAddingSize(false);
  }

  function handleSizeInputKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSize();
      return;
    }
    if (event.key === "Escape") {
      setAddingSize(false);
      setWidthInput("");
      setHeightInput("");
    }
  }

  async function handleUpdateType(typeKey, patch) {
    if (!selectedCompany || !selectedPouch || !canEdit) return;
    await onUpdate(selectedCompany.id, selectedPouch.id, {
      types: {
        [typeKey]: patch,
      },
    });
  }

  async function handleDeleteSize(pouchId) {
    if (!selectedCompany || !canEdit) return;
    await onDelete(selectedCompany.id, pouchId);
  }

  function handleDraftChange(typeKey, value) {
    setRateDrafts((prev) => ({
      ...prev,
      [typeKey]: value,
    }));
  }

  async function handleDraftCommit(typeKey, rawValue) {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 0) return;
    await handleUpdateType(typeKey, { price: value });
  }

  async function handleTypeToggle(typeKey, isAvailable) {
    await handleUpdateType(typeKey, { isAvailable });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-0">
      <PouchCompanyColumn
        companies={activeCompanies}
        selectedCompanyId={selectedCompany?.id ?? null}
        onSelectCompany={(companyId) => {
          setSelectedCompanyId(companyId);
          setSelectedPouchId(null);
        }}
      />

      <PouchSizesColumn
        canEdit={canEdit}
        selectedCompany={selectedCompany}
        pouches={selectedCompanyPouches}
        selectedPouchId={selectedPouch?.id ?? null}
        onSelectPouch={setSelectedPouchId}
        onDeletePouch={handleDeleteSize}
        addingSize={addingSize}
        onStartAdd={() => setAddingSize(true)}
        widthInput={widthInput}
        heightInput={heightInput}
        onWidthChange={setWidthInput}
        onHeightChange={setHeightInput}
        onSizeInputKeyDown={handleSizeInputKeyDown}
        onConfirmAdd={handleAddSize}
      />

      <PouchTypeRatesColumn
        selectedPouch={selectedPouch}
        canEdit={canEdit}
        rateDrafts={rateDrafts}
        onChangeDraft={handleDraftChange}
        onCommitDraft={handleDraftCommit}
        onToggleType={handleTypeToggle}
      />
    </div>
  );
}
