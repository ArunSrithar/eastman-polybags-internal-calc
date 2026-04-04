import { useState } from "react";
import { CheckIcon, XMarkIcon, EditIcon, TrashIcon } from "../ui/Icons";
import IOSToggle from "../ui/IOSToggle";
import { fmt, formatDate } from "../../utils/format";

/**
 * PouchRow — a single pouch row with display + inline edit modes.
 * Size is read-only even in edit mode; only rate is editable.
 */
export default function PouchRow({ pouch, index, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [rate, setRate] = useState(String(pouch.rate));

  function handleSave() {
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum < 0) return;
    onEdit(pouch.id, { rate: rateNum });
    setEditing(false);
  }

  function handleCancel() {
    setRate(String(pouch.rate));
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  }

  const isEnabled = pouch.enabled !== false;

  const sizeDisplay = (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block w-8 text-right">{pouch.length}</span>
      <span className="text-label-3">×</span>
      <span className="inline-block w-8 text-left">{pouch.breadth}</span>
    </span>
  );

  if (editing) {
    return (
      <tr className="bg-tint/5">
        <td className="table-cell-compact text-label-3">{index + 1}</td>
        <td className="table-cell-compact text-label font-medium">
          {sizeDisplay}
        </td>
        <td className="table-cell-compact">
          <input
            type="number"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-base input-no-spinner py-1.5 text-sm w-24"
          />
        </td>
        <td className="table-cell-compact text-label-2">{pouch.createdBy}</td>
        <td className="table-cell-compact text-label-2">
          {formatDate(pouch.createdAt)}
        </td>
        <td className="table-cell-compact text-label-2">
          {pouch.modifiedBy ?? "—"}
        </td>
        <td className="table-cell-compact text-label-2">
          {pouch.modifiedAt ? formatDate(pouch.modifiedAt) : "—"}
        </td>
        <td className="table-cell-compact">
          <IOSToggle
            on={isEnabled}
            onToggle={() => onEdit(pouch.id, { enabled: !isEnabled })}
          />
        </td>
        <td className="table-cell-compact">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleSave}
              className="table-action-btn text-tint hover:bg-tint/10"
            >
              <CheckIcon />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="table-action-btn text-label-3 hover:bg-fill-3"
            >
              <XMarkIcon />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={isEnabled ? "" : "opacity-40"}>
      <td className="table-cell text-label-3">{index + 1}</td>
      <td className="table-cell text-label font-medium">{sizeDisplay}</td>
      <td className="table-cell text-label">₹{fmt(pouch.rate)}</td>
      <td className="table-cell text-label">{pouch.createdBy}</td>
      <td className="table-cell text-label-2">{formatDate(pouch.createdAt)}</td>
      <td className="table-cell text-label-2">{pouch.modifiedBy ?? "—"}</td>
      <td className="table-cell text-label-2">
        {pouch.modifiedAt ? formatDate(pouch.modifiedAt) : "—"}
      </td>
      <td className="table-cell !opacity-100">
        <IOSToggle
          on={isEnabled}
          onToggle={() => onEdit(pouch.id, { enabled: !isEnabled })}
        />
      </td>
      <td className="table-cell !opacity-100">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="table-action-btn text-tint hover:bg-tint/10"
          >
            <EditIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(pouch.id)}
            className="table-action-btn text-red-500 hover:bg-red-500/10"
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}
