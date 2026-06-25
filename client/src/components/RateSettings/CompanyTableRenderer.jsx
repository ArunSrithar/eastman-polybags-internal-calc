import { useEffect, useMemo, useRef, useState } from "react";
import { PlusIcon, TrashIcon, CloseIcon } from "../ui/Icons";
import IOSToggle from "../ui/IOSToggle";

const DEFAULT_COMPANY = "Eastman Color Printers";

const PROCESS_PAIRS = [
    [
        { key: "normalColor", label: "Normal Color", unit: "₹/color" },
        { key: "metallicColor", label: "Metallic Color", unit: "" },
    ],
    [
        { key: "singleLamination", label: "Single Lamination", unit: "₹/kg" },
        { key: "doubleLamination", label: "Double Lamination", unit: "₹/kg" },
    ],
    [
        { key: "mattFinish", label: "Matt Finish", unit: "₹/kg" },
        { key: "slitting", label: "Slitting", unit: "₹/kg" },
    ],
];

function ProcessCell({ company, processDef, handlers, canEdit, readOnly }) {
    const process = company?.processes?.[processDef.key] ?? {
        price: 0,
        isAvailable: true,
    };
    const isAvailable = process.isAvailable !== false;
    const [price, setPrice] = useState(String(process.price ?? 0));
    const unitSuffix = processDef.unit.startsWith("₹/")
        ? `per ${processDef.unit.slice(2)}`
        : processDef.unit;

    function commit() {
        const next = Number(price);
        if (Number.isNaN(next) || next < 0 || !canEdit || readOnly) return;

        const current = Number(process.price ?? 0);
        if (Math.abs(next - current) < 0.000001) return;

        handlers.onUpdate(
            company.id,
            processDef.key,
            next,
            process.isAvailable,
            processDef.label,
            company.name,
        );
    }

    return (
        <div className="py-3 px-4">
            <div className="flex items-center gap-2 min-w-0">
                <IOSToggle
                    on={isAvailable}
                    onToggle={() =>
                        handlers.onToggle(company.id, processDef.key, !isAvailable)
                    }
                    disabled={!canEdit || readOnly}
                />

                <div className="min-w-0 flex items-center gap-1.5 flex-1">
                    <span className="text-sm font-medium text-label leading-none truncate">
                        {processDef.label}
                    </span>
                </div>

                <div
                    className={`flex items-center input-base p-0 overflow-hidden w-48 shrink-0 ${!isAvailable || !canEdit || readOnly ? "opacity-50" : ""
                        }`}
                >
                    <span className="px-2.5 text-label-3 text-sm border-r border-separator shrink-0 select-none">
                        ₹
                    </span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onBlur={commit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                        }}
                        disabled={!canEdit || readOnly || !isAvailable}
                        className="flex-1 bg-transparent px-2 py-2 text-sm text-left outline-none input-no-spinner w-0 tabular-nums"
                    />
                    {unitSuffix ? (
                        <span className="px-2 text-label-3 text-xs shrink-0">{unitSuffix}</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function ProcessPairCard({ company, pair, handlers, canEdit, readOnly }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-separator/60 bg-background/40 overflow-hidden">
                <ProcessCell
                    company={company}
                    processDef={pair[0]}
                    handlers={handlers}
                    canEdit={canEdit}
                    readOnly={readOnly}
                />
            </div>
            <div className="rounded-xl border border-separator/60 bg-background/40 overflow-hidden">
                <ProcessCell
                    company={company}
                    processDef={pair[1]}
                    handlers={handlers}
                    canEdit={canEdit}
                    readOnly={readOnly}
                />
            </div>
        </div>
    );
}

export default function CompanyTableRenderer({
    companies,
    handlers,
    adding,
    onAddStart,
    onCancelAdd,
    editingId,
    onSetEditing,
    loading,
    canEdit,
}) {
    const [search, setSearch] = useState("");
    const [newCompanyName, setNewCompanyName] = useState("");
    const newInputRef = useRef(null);

    const normalizedSearch = search.trim().toLowerCase();

    const sorted = useMemo(() => {
        return [...companies].sort((a, b) => {
            if (a.name === DEFAULT_COMPANY) return -1;
            if (b.name === DEFAULT_COMPANY) return 1;
            if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    }, [companies]);

    const filtered = useMemo(() => {
        if (!normalizedSearch) return sorted;
        return sorted.filter((c) =>
            c.name.toLowerCase().includes(normalizedSearch),
        );
    }, [sorted, normalizedSearch]);

    const activeCompanies = filtered.filter((c) => c.isActive !== false);
    const archivedCompanies = filtered.filter((c) => c.isActive === false);

    useEffect(() => {
        if (editingId && filtered.some((c) => c.id === editingId)) return;
        const next = activeCompanies[0]?.id ?? archivedCompanies[0]?.id ?? null;
        onSetEditing(next);
    }, [editingId, filtered, activeCompanies, archivedCompanies, onSetEditing]);

    useEffect(() => {
        if (adding) newInputRef.current?.focus();
    }, [adding]);

    const selectedCompany =
        filtered.find((c) => c.id === editingId) ??
        activeCompanies[0] ??
        archivedCompanies[0] ??
        null;

    const isDefaultCompany = selectedCompany?.name === DEFAULT_COMPANY;
    const isArchived = selectedCompany?.isActive === false;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-label-2">Loading companies…</p>
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[22rem_minmax(0,1fr)] gap-4">
            <aside className="card overflow-hidden flex flex-col min-h-[18rem]">
                <div className="card-section border-b border-separator flex items-center justify-between gap-2">
                    <div>
                        <p className="text-sm font-semibold text-label">Companies</p>
                        <p className="text-xs text-label-3">
                            {activeCompanies.length} active · {archivedCompanies.length} archived
                        </p>
                    </div>
                    {canEdit ? (
                        <button
                            type="button"
                            onClick={onAddStart}
                            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                            <PlusIcon className="size-3.5" />
                            Add
                        </button>
                    ) : null}
                </div>

                <div className="card-section border-b border-separator">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search company..."
                        className="input-base"
                    />
                </div>

                {adding ? (
                    <div className="card-section border-b border-separator bg-background-2/60">
                        <div className="flex items-center gap-2">
                            <input
                                ref={newInputRef}
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                placeholder="New company name"
                                className="input-base flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && newCompanyName.trim()) {
                                        handlers.onAdd(newCompanyName.trim());
                                        setNewCompanyName("");
                                    }
                                    if (e.key === "Escape") {
                                        setNewCompanyName("");
                                        onCancelAdd();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                aria-label="Cancel"
                                onClick={() => {
                                    setNewCompanyName("");
                                    onCancelAdd();
                                }}
                                className="btn-icon shrink-0"
                            >
                                <CloseIcon className="size-3.5" />
                            </button>
                        </div>
                        <p className="text-[11px] text-label-3 mt-1.5">Press Enter to save</p>
                    </div>
                ) : null}

                <div className="flex-1 min-h-0 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="card-section py-8 text-center text-label-3 text-sm">
                            No companies found
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filtered.map((company) => {
                                const selected = selectedCompany?.id === company.id;
                                const archived = company.isActive === false;
                                const isDefault = company.name === DEFAULT_COMPANY;
                                return (
                                    <button
                                        key={company.id}
                                        type="button"
                                        onClick={() => onSetEditing(company.id)}
                                        className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${selected ? "bg-tint/10 text-tint" : "hover:bg-fill text-label"
                                            } ${archived ? "opacity-55" : ""}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="text-sm font-medium truncate">{company.name}</span>
                                                {isDefault ? (
                                                    <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-tint/15 text-tint font-semibold">
                                                        OWN
                                                    </span>
                                                ) : null}
                                            </div>
                                            <span
                                                className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${archived
                                                    ? "border-separator text-label-3"
                                                    : "border-tint/30 text-tint"
                                                    }`}
                                            >
                                                {archived ? "Archived" : "Active"}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>

            <section className="card overflow-hidden min-h-[18rem] flex flex-col">
                {!selectedCompany ? (
                    <div className="h-full flex items-center justify-center text-label-3 text-sm">
                        Select a company to edit process pricing.
                    </div>
                ) : (
                    <>
                        <div className="card-section border-b border-separator flex items-center justify-between gap-3">
                            <div>
                                <p className="text-base font-semibold text-label">{selectedCompany.name}</p>
                                <p className="text-xs text-label-3">
                                    {isArchived
                                        ? "Archived - read-only view"
                                        : "Process-level pricing and availability controls"}
                                </p>
                            </div>

                            {canEdit ? (
                                <div className="flex items-center gap-2 shrink-0">
                                    {!isDefaultCompany && !isArchived ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn-secondary text-xs px-3 py-1.5"
                                                onClick={() =>
                                                    handlers.onDelete(selectedCompany.id, selectedCompany.name)
                                                }
                                            >
                                                Archive
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
                                                onClick={() =>
                                                    handlers.onPermanentDelete(selectedCompany.id, selectedCompany.name)
                                                }
                                            >
                                                <TrashIcon className="size-3.5" />
                                                Delete
                                            </button>
                                        </>
                                    ) : null}

                                    {isArchived ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn-secondary text-xs px-3 py-1.5"
                                                onClick={() =>
                                                    handlers.onRestore(selectedCompany.id, selectedCompany.name)
                                                }
                                            >
                                                Unarchive
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
                                                onClick={() =>
                                                    handlers.onPermanentDelete(selectedCompany.id, selectedCompany.name)
                                                }
                                            >
                                                <TrashIcon className="size-3.5" />
                                                Delete forever
                                            </button>
                                        </>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        <div className="card-section flex-1 min-h-0 overflow-y-auto space-y-4">
                            {PROCESS_PAIRS.map((pair) => (
                                <ProcessPairCard
                                    key={`${selectedCompany.id}-${pair[0].key}`}
                                    company={selectedCompany}
                                    pair={pair}
                                    handlers={handlers}
                                    canEdit={canEdit}
                                    readOnly={isArchived}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
