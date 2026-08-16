import { chargeRowGrid } from "./chargeRowGrid";

/**
 * ChargeColumnHeader — labels the columns of a charge card once, so each row
 * beneath it doesn't have to spell out the relationship between its controls.
 * Shares the row grid track so the labels sit over the controls they name.
 */
export default function ChargeColumnHeader({ columns, grid }) {
  // Default track: a third label means the card has a Rate column, two means it
  // doesn't. `grid` overrides for cards on a different track (the process table).
  return (
    <div className="card-section py-1.5">
      <div
        className={`grid items-center gap-2.5 min-w-0 ${grid ?? chargeRowGrid(false, columns.length > 2)}`}
      >
        {columns.map((label) => (
          <span
            key={label}
            className="text-[10px] font-semibold uppercase tracking-wider text-label-3"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
