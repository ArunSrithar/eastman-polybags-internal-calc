import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGravureSettings } from "../../context/GravureSettingsContext";
import { useToast } from "../ui/Toast";

/**
 * CompaniesContainer — Business logic for company management (no UI rendering)
 *
 * Encapsulates:
 * - Companies state (from context)
 * - Add/edit/delete handlers with validation
 * - Toast messages
 * - Loading/error states
 *
 * Accepts a `renderer` prop (React component) that receives:
 * {
 *   companies: array of company objects
 *   handlers: { onAdd, onUpdate, onDelete, onToggle }
 *   adding: boolean (show add form)
 *   editingId: string | null (which company is being edited)
 *   loading: boolean (initial load)
 * }
 *
 * To swap UI: pass a different renderer component. No logic changes needed.
 */
export default function CompaniesContainer({ renderer: Renderer }) {
    const { canEditPrices } = useAuth();
    const {
        companies,
        companiesLoading,
        createCompany: contextCreateCompany,
        updateCompanyProcess: contextUpdateCompanyProcess,
        deleteCompany: contextDeleteCompany,
        restoreCompany: contextRestoreCompany,
        permanentDeleteCompany: contextPermanentDeleteCompany,
    } = useGravureSettings();

    const [toast, showToast] = useToast();
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    /* ── Handlers — thin wrappers around context methods ────────────────── */

    const handleAddCompany = useCallback(
        async (name) => {
            try {
                if (!name || name.trim().length === 0) {
                    showToast("Validation Error", "Company name is required", "error");
                    return;
                }

                await contextCreateCompany(name.trim());
                showToast("Company Created", `"${name}" added successfully`);
                setAdding(false);
            } catch (err) {
                showToast(
                    "Failed to Add",
                    err.message || "Could not create company",
                    "error",
                );
            }
        },
        [contextCreateCompany, showToast],
    );

    const handleUpdateProcess = useCallback(
        async (companyId, processKey, price, isAvailable, processLabel, companyName) => {
            try {
                const numPrice = Number(price);
                if (Number.isNaN(numPrice) || numPrice < 0) {
                    showToast(
                        "Validation Error",
                        "Price must be a non-negative number",
                        "error",
                    );
                    return;
                }

                await contextUpdateCompanyProcess(companyId, processKey, {
                    price: numPrice,
                    isAvailable,
                });

                showToast(
                    "Price Updated",
                    `${processLabel || "Process"} for ${companyName || "company"} is now ₹${numPrice}`,
                );
            } catch (err) {
                showToast(
                    "Price Update Failed",
                    err.message || "Could not save process price",
                    "error",
                );
            }
        },
        [contextUpdateCompanyProcess, showToast],
    );

    const handleDeleteCompany = useCallback(
        async (companyId, companyName) => {
            try {
                if (companyName === "Eastman Color Printers") {
                    showToast(
                        "Cannot Delete",
                        "The default company cannot be deleted",
                        "error",
                    );
                    return;
                }

                if (!window.confirm(`Delete company "${companyName}"?`)) {
                    return;
                }

                await contextDeleteCompany(companyId);
                showToast("Deleted", `"${companyName}" has been archived`);
            } catch (err) {
                showToast(
                    "Delete Failed",
                    err.message || "Could not delete company",
                    "error",
                );
            }
        },
        [contextDeleteCompany, showToast],
    );

    const handleToggleProcess = useCallback(
        async (companyId, processKey, isAvailable) => {
            try {
                await contextUpdateCompanyProcess(companyId, processKey, {
                    isAvailable,
                });
            } catch (err) {
                showToast(
                    "Toggle Failed",
                    err.message || "Could not update process",
                    "error",
                );
            }
        },
        [contextUpdateCompanyProcess, showToast],
    );

    const handleRestoreCompany = useCallback(
        async (companyId, companyName) => {
            try {
                await contextRestoreCompany(companyId);
                showToast("Restored", `"${companyName}" is active again`);
            } catch (err) {
                showToast(
                    "Restore Failed",
                    err.message || "Could not restore company",
                    "error",
                );
            }
        },
        [contextRestoreCompany, showToast],
    );

    const handlePermanentDeleteCompany = useCallback(
        async (companyId, companyName) => {
            try {
                if (
                    !window.confirm(
                        `Permanently delete "${companyName}"? This cannot be undone.`,
                    )
                ) {
                    return;
                }
                await contextPermanentDeleteCompany(companyId);
                showToast("Deleted", `"${companyName}" has been permanently removed`);
            } catch (err) {
                showToast(
                    "Delete Failed",
                    err.message || "Could not delete company",
                    "error",
                );
            }
        },
        [contextPermanentDeleteCompany, showToast],
    );

    const handlers = {
        onAdd: handleAddCompany,
        onUpdate: handleUpdateProcess,
        onDelete: handleDeleteCompany,
        onToggle: handleToggleProcess,
        onRestore: handleRestoreCompany,
        onPermanentDelete: handlePermanentDeleteCompany,
    };

    // Determine if user can edit
    const canEdit = canEditPrices("gravure");

    return (
        <>
            {toast}
            <Renderer
                companies={companies}
                handlers={handlers}
                adding={adding}
                onAddStart={() => setAdding(true)}
                onCancelAdd={() => setAdding(false)}
                editingId={editingId}
                onSetEditing={setEditingId}
                loading={companiesLoading}
                canEdit={canEdit}
            />
        </>
    );
}
