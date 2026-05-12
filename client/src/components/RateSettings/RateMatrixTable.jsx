import { useState, useRef, useEffect } from "react";
import { fmt, formatDate } from "../../utils/format";
import { CheckIcon, XMarkIcon, PlusIcon, TrashIcon } from "../ui/Icons";
import IOSToggle from "../ui/IOSToggle";
import { formatDimension, sortDimensionKeys } from "../../utils/dimensionUtils";

/**
 * RateMatrixTable — 2D editable grid for rates keyed by row × column.
 * Used for: Printing rates (cover size × color count).
 *
 * Props:
 *   data       — nested object: { [rowKey]: { [colKey]: { history: [...] } } }
 *   rowKeys    — ordered array of row dimension keys (derived from data keys)
 *   colKeys    — ordered array of column dimension keys
 *   rowLabel   — header label for the row dimension (e.g., "Cover Size")
 *   colLabel   — header label prefix for columns (e.g., "Colors")
 *   onUpdate   — async (rowKey, colKey, rate) => void
 *   onAddRow   — optional async (rowKey) => void — enables add-row inline form
 *   onDeleteRow — optional async (rowKey) => void — enables delete button per row
 */

export default function RateMatrixTable({
  data,
  rowKeys,
  colKeys,
  rowLabel,
  colLabel,
  onUpdate,
  onAddRow,
  onDeleteRow,
  onToggleRow,
}) {
  const [editingCell, setEditingCell] = useState(null); // "rowKey|colKey"
  const [editValue, setEditValue] = useState("");
  const [addingRow, setAddingRow] = useState(false);
  const [newLength, setNewLength] = useState("");
  const [newBreadth, setNewBreadth] = useState("");
  const cellInputRef = useRef(null);
  const lengthInputRef = useRef(null);

  useEffect(() => {
    if (editingCell) cellInputRef.current?.focus();
  }, [editingCell]);

  useEffect(() => {
    if (addingRow) lengthInputRef.current?.focus();
  }, [addingRow]);

  const sortedRowKeys = sortDimensionKeys(rowKeys);

  function cellKey(r, c) {
    return `${r}|${c}`;
  }

  function startEdit(r, c, currentRate) {
    setEditingCell(cellKey(r, c));
    setEditValue(String(currentRate));
  }

  function cancelEdit() {
    setEditingCell(null);
    setEditValue("");
  }

  async function confirmEdit(r, c) {
    const num = parseFloat(editValue);
    if (isNaN(num) || num < 0) return;
    await onUpdate(r, c, num);
    cancelEdit();
  }

  function handleCellKeyDown(e, r, c) {
    if (e.key === "Enter") confirmEdit(r, c);
    if (e.key === "Escape") cancelEdit();
  }

  function cancelAddRow() {
    setAddingRow(false);
    setNewLength("");
    setNewBreadth("");
  }

  async function confirmAddRow() {
    const l = newLength.trim();
    const b = newBreadth.trim();
    if (!l || !b) return;
    await onAddRow(`${l}x${b}`);
    cancelAddRow();
  }

  function handleAddKeyDown(e) {
    if (e.key === "Enter") confirmAddRow();
    if (e.key === "Escape") cancelAddRow();
  }

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-base font-semibold text-label">
          {rowLabel} × {colLabel} Rates
        </p>
        {onAddRow && !addingRow ? (
          <button
            type="button"
            onClick={() => setAddingRow(true)}
            className="flex items-center gap-1 text-sm text-tint hover:text-tint/80 transition-colors"
          >
            <PlusIcon className="size-3.5" />
            <span>Add Cover Size</span>
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr>
              <th className="table-header-cell rounded-l-full w-10 text-center">
                #
              </th>
              <th className="table-header-cell w-64">{rowLabel}</th>
              {colKeys.map((c, i) => (
                <th
                  key={c}
                  className={`table-header-cell text-center ${!onDeleteRow && !onToggleRow && i === colKeys.length - 1 ? "rounded-r-full" : ""}`}
                >
                  {colLabel} {c}
                </th>
              ))}
              {onToggleRow ? (
                <th className="table-header-cell w-20 text-center">Enabled</th>
              ) : null}
              {onDeleteRow ? (
                <th className="table-header-cell rounded-r-full w-16" />
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-separator">
            {sortedRowKeys.map((r, idx) => {
              const isEnabled = data?.[r]?.enabled !== false;
              return (
                <tr key={r} className={isEnabled ? "" : "opacity-40"}>
                  <td className="table-cell text-center text-label-3 text-xs">
                    {idx + 1}
                  </td>
                  <td className="table-cell text-label font-medium">
                    {formatDimension(r)}
                  </td>
                  {colKeys.map((c) => {
                    const cell = data?.[r]?.[c];
                    const current = cell?.history?.[0];
                    const rate = current?.rate ?? 0;
                    const isEditing = editingCell === cellKey(r, c);

                    return (
                      <td key={c} className="table-cell p-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1 px-2 py-3 bg-tint/5">
                            <input
                              ref={cellInputRef}
                              type="number"
                              min="0"
                              step="any"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleCellKeyDown(e, r, c)}
                              className="input-base input-no-spinner py-1 text-sm w-20"
                            />
                            <button
                              type="button"
                              onClick={() => confirmEdit(r, c)}
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
                          <button
                            type="button"
                            onClick={() => startEdit(r, c, rate)}
                            className="w-full text-center px-4 py-3 text-label hover:bg-tint/5 transition-colors cursor-pointer"
                            title={
                              current?.changedAt
                                ? `₹${fmt(rate)} — ${current.changedBy}, ${formatDate(current.changedAt)}`
                                : `₹${fmt(rate)}`
                            }
                            aria-label={`Edit ${rowLabel} ${r}, ${colLabel} ${c}: ₹${fmt(rate)}`}
                          >
                            {rate === 0 ? (
                              <span className="text-label-2">—</span>
                            ) : (
                              `₹${fmt(rate)}`
                            )}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  {onToggleRow ? (
                    <td>
                      <div className="flex items-center justify-center py-3">
                        <IOSToggle
                          on={isEnabled}
                          onToggle={() => onToggleRow(r, !isEnabled)}
                        />
                      </div>
                    </td>
                  ) : null}
                  {onDeleteRow ? (
                    <td>
                      <div className="flex items-center justify-center py-3">
                        <button
                          type="button"
                          onClick={() => onDeleteRow(r)}
                          className="table-action-btn text-red-500 hover:bg-red-500/10"
                          aria-label={`Delete ${r}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}

            {/* Inline add-row form — shown when addingRow is true */}
            {onAddRow && addingRow ? (
              <tr className="bg-tint/5">
                <td className="table-cell-compact text-center text-label-3 text-xs">
                  {sortedRowKeys.length + 1}
                </td>
                <td className="table-cell-compact">
                  <div className="flex items-center gap-1">
                    <input
                      ref={lengthInputRef}
                      type="text"
                      value={newLength}
                      onChange={(e) => setNewLength(e.target.value)}
                      onKeyDown={handleAddKeyDown}
                      placeholder="W"
                      className="input-base py-1.5 text-sm w-24 text-right"
                    />
                    <span className="text-label-3 text-xs">×</span>
                    <input
                      type="text"
                      value={newBreadth}
                      onChange={(e) => setNewBreadth(e.target.value)}
                      onKeyDown={handleAddKeyDown}
                      placeholder="H"
                      className="input-base py-1.5 text-sm w-24 text-left"
                    />
                  </div>
                </td>
                <td
                  className="table-cell-compact text-label-3 italic text-xs"
                  colSpan={colKeys.length - 1}
                >
                  Rates default to ₹0 — edit after adding
                </td>
                <td
                  className="table-cell-compact"
                  colSpan={(onToggleRow ? 1 : 0) + (onDeleteRow ? 1 : 0) + 1}
                >
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
