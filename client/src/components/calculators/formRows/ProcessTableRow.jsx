import IOSToggle from "../../ui/IOSToggle";
import { PROCESS_TABLE_GRID, PROCESS_TABLE_GRID_NO_RATE } from "./chargeRowGrid";

/**
 * ProcessTableRow — one charge as a row in a processing table: toggle+name |
 * detail | supplier | (optional) rate. `detail` and `supplier` are
 * pre-rendered controls from the parent (a CreatableSelect, typically) so
 * this component stays layout-only; either slot renders blank when the charge
 * genuinely has none (Roll Size has no supplier, Gusset/Cutting/Opack/
 * Punching have no detail).
 *
 * `onToggle` and `onPriceChange` are optional — some rows (Cover Size in Flexo
 * Job Cost; Roll Size/Printing/Cover Size in the Flexo Rate Calculator) use
 * this same row shape but aren't themselves a toggleable charge. Their toggle
 * renders locked on and disabled rather than disappearing, so every row in
 * the table keeps the same left edge.
 *
 * `showRate` (default true) drops the Rate cell and column entirely — for
 * screens where the calc resolves every rate itself and a column of em-dashes
 * wouldn't be worth the width (the Flexo Rate Calculator). Pass `grid` to
 * override the track directly if neither built-in track fits.
 */
export default function ProcessTableRow({
  label,
  on,
  onToggle,
  detail,
  supplier,
  price,
  onPriceChange,
  showRate = true,
  grid,
}) {
  const hasToggle = typeof onToggle === "function";
  const hasPrice = typeof onPriceChange === "function";
  const active = hasToggle ? on : true;
  const track = grid ?? (showRate ? PROCESS_TABLE_GRID : PROCESS_TABLE_GRID_NO_RATE);

  return (
    <div className="card-section">
      <div
        className={`grid items-center gap-2.5 min-w-0 ${track} ${active ? "" : "opacity-50"}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <IOSToggle on={active} onToggle={onToggle} disabled={!hasToggle} />
          <span className="text-sm font-medium text-label truncate">{label}</span>
        </div>
        <div className="min-w-0">{detail}</div>
        <div className={`min-w-0 ${active ? "" : "pointer-events-none"}`}>
          {supplier}
        </div>
        {showRate && hasPrice ? (
          <div
            className={`flex items-center input-base p-0 overflow-hidden shrink-0 ${active ? "" : "pointer-events-none"}`}
          >
            <span className="px-2 text-label-3 text-sm border-r border-separator shrink-0">
              ₹
            </span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0.00"
              className="w-full min-w-0 bg-transparent px-2 py-2 text-sm outline-none input-no-spinner"
            />
          </div>
        ) : showRate ? (
          <div />
        ) : null}
      </div>
    </div>
  );
}
