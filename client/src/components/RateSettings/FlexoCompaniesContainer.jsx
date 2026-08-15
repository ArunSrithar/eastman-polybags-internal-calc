import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFlexoSettings } from "../../context/FlexoSettingsContext";
import { useToast } from "../ui/Toast";

/**
 * FlexoCompaniesContainer — Business logic for flexo company management (no UI rendering)
 *
 * Mirrors CompaniesContainer.jsx (gravure) but wired to FlexoSettingsContext and
 * operating on `charges` (punching/opack) instead of `processes`.
 */
export default function FlexoCompaniesContainer({ renderer: Renderer }) {
    const { canEditPrices } = useAuth();
    const {
        companies,
        companiesLoading,
        createCompany: contextCreateCompany,
        updateCompanyCharge: contextUpdateCompanyCharge,
        deleteCompany: contextDeleteCompany,
        restoreCompany: contextRestoreCompany,
        permanentDeleteCompany: contextPermanentDeleteCompany,
    } = useFlexoSettings();

    const [toast, showToast] = useToast();
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

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

    const handleUpdateCharge = useCallback(
        async (companyId, chargeKey, price, isAvailable, chargeLabel, companyName) => {
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

                await contextUpdateCompanyCharge(companyId, chargeKey, {
                    price: numPrice,
                    isAvailable,
                });

                showToast(
                    "Price Updated",
                    `${chargeLabel || "Charge"} for ${companyName || "company"} is now ₹${numPrice}`,
                );
            } catch (err) {
                showToast(
                    "Price Update Failed",
                    err.message || "Could not save charge price",
                    "error",
                );
            }
        },
        [contextUpdateCompanyCharge, showToast],
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

    const handleToggleCharge = useCallback(
        async (companyId, chargeKey, isAvailable) => {
            try {
                await contextUpdateCompanyCharge(companyId, chargeKey, {
                    isAvailable,
                });
            } catch (err) {
                showToast(
                    "Toggle Failed",
                    err.message || "Could not update charge",
                    "error",
                );
            }
        },
        [contextUpdateCompanyCharge, showToast],
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
        onUpdate: handleUpdateCharge,
        onDelete: handleDeleteCompany,
        onToggle: handleToggleCharge,
        onRestore: handleRestoreCompany,
        onPermanentDelete: handlePermanentDeleteCompany,
    };

    const canEdit = canEditPrices("flexo");

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
