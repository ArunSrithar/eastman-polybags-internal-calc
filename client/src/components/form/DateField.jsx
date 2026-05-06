import { CalendarIcon } from "../ui/Icons";

/**
 * DateField — inline row with label + themed date input.
 *
 * Props:
 *   label     string
 *   value     string   ISO date string (YYYY-MM-DD)
 *   onChange  fn(value)
 */
export default function DateField({ label, value, onChange }) {
  return (
    <div className="card-section">
      <div className="form-row">
        <p className="form-row-label">{label}</p>
        <label className="flex items-center input-base p-0 overflow-hidden cursor-pointer w-48 shrink-0">
          <span className="px-3 text-label-3 border-r border-separator shrink-0">
            <CalendarIcon />
          </span>
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-label outline-none [color-scheme:dark]"
          />
        </label>
      </div>
    </div>
  );
}
