import { useState, useRef, useEffect } from "react";
import { fmt, formatDate } from "../../utils/format";
import {
  CheckIcon,
  XMarkIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
} from "../ui/Icons";
import IOSToggle from "../ui/IOSToggle";
import TableShell from "./TableShell";
import { LOOKUP_COLUMNS } from "./flexoSettingsConfig";
import { formatDimension, sortDimensionKeys } from "../../utils/dimensionUtils";

/**
 * RateLookupTable — 1D key→rate table with inline edit and history display.
 * Used for: Gusset (by cover size), Cutting (by size), Roll Size rates.
 *
 * Props:
 *   entries        — object of dimension → { history: [{ rate, changedBy, changedAt }] }
 *   dimensionLabel — column header label (e.g., "Roll Size", "Cover Size")
 *   onUpdate       — async (dimensionKey, rate) => void
 *   onAddRow       — optional async (key) => void — enables inline add form
 *   onDeleteRow    — optional async (key) => void — enables delete button per row
 *   onToggle       — optional async (key, enabled) => void — enables IOSToggle per row
 */
export default function RateLookupTable({
  entries,
  dimensionLabel,
  onUpdate,
  onAddRow,
  onDeleteRow,
  onToggle,
  showCreated = false,
}) {
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [addingRow, setAddingRow] = useState(false);
  const [newKey, setNewKey] = useState("");
  const inputRef = useRef(null);
  const addInputRef = useRef(null);

  useEffect(() => {
    if (editingKey) inputRef.current?.focus();
  }, [editingKey]);

  useEffect(() => {
    if (addingRow) addInputRef.current?.focus();
  }, [addingRow]);

  function startEdit(key, currentRate) {
    setEditingKey(key);
    setEditValue(String(currentRate));
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditValue("");
  }

  function cancelAddRow() {
    setAddingRow(false);
    setNewKey("");
  }

  async function confirmAddRow() {
    const k = newKey.trim();
    if (!k) return;
    await onAddRow(k);
    cancelAddRow();
  }

  function handleAddKeyDown(e) {
    if (e.key === "Enter") confirmAddRow();
    if (e.key === "Escape") cancelAddRow();
  }

  async function confirmEdit(key) {
    const num = parseFloat(editValue);
    if (isNaN(num) || num < 0) return;
    await onUpdate(key, num);
    cancelEdit();
  }

  function handleKeyDown(e, key) {
    if (e.key === "Enter") confirmEdit(key);
    if (e.key === "Escape") cancelEdit();
  }

  const columns = LOOKUP_COLUMNS.map((c) =>
    c.key === "dimension" ? { ...c, label: dimensionLabel } : c,
  );

  // LOOKUP_COLUMNS order: S.No, Dimension, Rate, Modified By, Modified At, Actions
  // When showCreated, insert Created By + Created At before Modified By (index 3)
  const baseColumns = showCreated
    ? [
        ...columns.slice(0, 3),
        { key: "createdBy", label: "Created By" },
        { key: "createdAt", label: "Created At" },
        ...columns.slice(3),
      ]
    : columns;

  // Add toggle column before actions if onToggle provided
  const tableColumns = onToggle
    ? [
        ...baseColumns.slice(0, -1),
        { key: "toggle", label: "Enabled", className: "w-20" },
        baseColumns[baseColumns.length - 1],
      ]
    : baseColumns;

  // Add row button for title action
  const addAction =
    onAddRow && !addingRow ? (
      <button
        type="button"
        onClick={() => setAddingRow(true)}
        className="flex items-center gap-1 text-sm text-tint hover:text-tint/80 transition-colors"
      >
        <PlusIcon className="size-3.5" />
        <span>Add Roll Size</span>
      </button>
    ) : null;

  const sortedKeys = sortDimensionKeys(Object.keys(entries));

  return (
    <TableShell
      title={`${dimensionLabel} Rates`}
      action={addAction}
      columns={tableColumns}
    >
      {sortedKeys.length === 0 && !addingRow ? (
        <tr>
          <td
            colSpan={tableColumns.length}
            className="px-4 py-8 text-center text-label-3"
          >
            No rates configured
          </td>
        </tr>
      ) : null}
      {sortedKeys.map((key, i) => {
        const cell = entries[key];
        const isEnabled = cell.enabled !== false;
        const current = cell.history?.[0];
        const created = cell.history?.[cell.history.length - 1];
        const isEditing = editingKey === key;

        return (
          <tr
            key={key}
            className={`${isEditing ? "bg-tint/5" : ""} ${!isEnabled ? "opacity-40" : ""}`}
          >
            <td className="table-cell text-label-3">{i + 1}</td>
            <td className="table-cell text-label font-medium">
              {formatDimension(key)}
            </td>
            <td className="table-cell">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="number"
                  min="0"
                  step="any"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  className="input-base input-no-spinner py-1.5 text-sm w-28"
                />
              ) : (current?.rate ?? 0) === 0 ? (
                <span className="text-label-2 font-medium">—</span>
              ) : (
                <span className="text-label font-medium">
                  ₹{fmt(current.rate)}
                </span>
              )}
            </td>
            {showCreated ? (
              <td className="table-cell text-label-2">
                {created?.changedBy ?? "—"}
              </td>
            ) : null}
            {showCreated ? (
              <td className="table-cell text-label-2">
                {created?.changedAt ? formatDate(created.changedAt) : "—"}
              </td>
            ) : null}
            <td className="table-cell text-label-2">
              {current?.changedBy ?? "—"}
            </td>
            <td className="table-cell text-label-2">
              {current?.changedAt ? formatDate(current.changedAt) : "—"}
            </td>
            {onToggle ? (
              <td className="table-cell">
                <IOSToggle
                  on={isEnabled}
                  onToggle={() => onToggle(key, !isEnabled)}
                />
              </td>
            ) : null}
            <td className="table-cell">
              {isEditing ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => confirmEdit(key)}
                    className="table-action-btn text-tint hover:bg-tint/10"
                  >
                    <CheckIcon />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="table-action-btn text-label-3 hover:bg-fill-3"
                  >
                    <XMarkIcon />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => startEdit(key, current?.rate ?? 0)}
                    className="table-action-btn text-tint hover:bg-tint/10"
                    aria-label={`Edit rate for ${key}`}
                  >
                    <EditIcon />
                  </button>
                  {onDeleteRow ? (
                    <button
                      type="button"
                      onClick={() => onDeleteRow(key)}
                      className="table-action-btn text-red-500 hover:bg-red-500/10"
                      aria-label={`Delete ${key}`}
                    >
                      <TrashIcon />
                    </button>
                  ) : null}
                </div>
              )}
            </td>
          </tr>
        );
      })}

      {/* Inline add-row form */}
      {onAddRow && addingRow ? (
        <tr className="bg-tint/5">
          <td className="table-cell-compact text-center text-label-3 text-xs">
            {sortedKeys.length + 1}
          </td>
          <td className="table-cell-compact">
            <input
              ref={addInputRef}
              type="number"
              min="1"
              step="1"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="Width"
              className="input-base input-no-spinner py-1.5 text-sm w-20"
            />
          </td>
          <td
            className="table-cell-compact text-label-3 italic text-xs"
            colSpan={tableColumns.length - 4}
          >
            Rate defaults to ₹0 — edit after adding
          </td>
          <td className="table-cell-compact" colSpan={2}>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={confirmAddRow}
                className="table-action-btn text-tint hover:bg-tint/10"
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                onClick={cancelAddRow}
                className="table-action-btn text-label-3 hover:bg-fill-3"
              >
                <XMarkIcon />
              </button>
            </div>
          </td>
        </tr>
      ) : null}
    </TableShell>
  );
}
