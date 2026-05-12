import { useState, useRef, useEffect } from "react";
import { formatDate } from "../../utils/format";
import { TrashIcon, PlusIcon, CheckIcon, XMarkIcon } from "../ui/Icons";
import IOSToggle from "../ui/IOSToggle";
import TableShell from "./TableShell";

const COLUMNS = [
  { key: "sno", label: "S.No", className: "w-14" },
  { key: "size", label: "Size (W × H)", className: "w-64" },
  { key: "createdBy", label: "Created By" },
  { key: "createdAt", label: "Created At" },
  { key: "enabled", label: "Enabled", className: "w-20" },
  { key: "actions", label: "", className: "w-24" },
];

/* ── New Cover Size row (add mode) ───────────────────────────────────────── */
function NewCoverSizeRow({ onConfirm, onCancel }) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleConfirm() {
    const w = width.trim();
    const h = height.trim();
    if (!w || !h) return;
    onConfirm(`${w}x${h}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  }

  return (
    <tr className="bg-tint/5">
      <td className="table-cell-compact text-label-3">—</td>
      <td className="table-cell-compact">
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="W"
            className="input-base py-1.5 text-sm w-24 text-right"
          />
          <span className="text-label-3">×</span>
          <input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="H"
            className="input-base py-1.5 text-sm w-24 text-left"
          />
        </div>
      </td>
      <td className="table-cell-compact text-label-2">Admin</td>
      <td className="table-cell-compact text-label-3 italic">Now</td>
      <td className="table-cell-compact">
        <IOSToggle on={true} onToggle={() => {}} />
      </td>
      <td className="table-cell-compact">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleConfirm}
            className="table-action-btn text-tint hover:bg-tint/10"
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="table-action-btn text-label-3 hover:bg-fill-3"
          >
            <XMarkIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Display row ─────────────────────────────────────────────────────────── */
function CoverSizeRow({ coverSize, entry, index, onDelete, onToggle }) {
  const isEnabled = entry?.enabled !== false;
  const [w, h] = coverSize.split("x");

  const sizeDisplay = (
    <span className="inline-flex items-center gap-1">
      <span>{w}</span>
      <span className="text-label-3">×</span>
      <span>{h}</span>
    </span>
  );

  return (
    <tr className={isEnabled ? "" : "opacity-40"}>
      <td className="table-cell text-label-3">{index + 1}</td>
      <td className="table-cell text-label font-medium">{sizeDisplay}</td>
      <td className="table-cell text-label">{entry?.createdBy ?? "—"}</td>
      <td className="table-cell text-label-2">
        {entry?.createdAt ? formatDate(entry.createdAt) : "—"}
      </td>
      <td className="table-cell !opacity-100">
        <IOSToggle
          on={isEnabled}
          onToggle={() => onToggle?.(coverSize, !isEnabled)}
        />
      </td>
      <td className="table-cell !opacity-100">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onDelete?.(coverSize)}
            className="table-action-btn text-red-500 hover:bg-red-500/10"
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Container ───────────────────────────────────────────────────────────── */
export default function CoverSizeTable({
  printingRates = {},
  onAdd,
  onDelete,
  onToggle,
}) {
  const [adding, setAdding] = useState(false);

  function handleConfirm(coverSize) {
    onAdd?.(coverSize);
    setAdding(false);
  }

  function handleCancel() {
    setAdding(false);
  }

  const sortedSizes = Object.keys(printingRates).sort(
    (a, b) => parseFloat(a) - parseFloat(b),
  );

  const addAction = !adding ? (
    <button
      type="button"
      onClick={() => setAdding(true)}
      className="flex items-center gap-1 text-sm text-tint hover:text-tint/80 transition-colors"
    >
      <PlusIcon className="size-3.5" />
      <span>Add Cover Size</span>
    </button>
  ) : null;

  return (
    <TableShell title="Cover Sizes" action={addAction} columns={COLUMNS}>
      {adding ? (
        <NewCoverSizeRow onConfirm={handleConfirm} onCancel={handleCancel} />
      ) : null}

      {sortedSizes.length === 0 && !adding ? (
        <tr>
          <td
            colSpan={COLUMNS.length}
            className="px-4 py-8 text-center text-label-3"
          >
            No cover sizes yet. Add one to get started.
          </td>
        </tr>
      ) : null}

      {sortedSizes.map((coverSize, idx) => (
        <CoverSizeRow
          key={coverSize}
          coverSize={coverSize}
          entry={printingRates[coverSize]}
          index={idx}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </TableShell>
  );
}
