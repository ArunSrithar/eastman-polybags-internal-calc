import IOSToggle from "../../ui/IOSToggle";
import CreatableSelect from "../../ui/CreatableSelect";

/**
 * LabeledSelectRow — [toggle? + label | connector | select] row.
 *
 * Same grid track as the Gravure/Flexo rate calculators' ToggleCompanyRow, so
 * rows line up across screens. Two differences:
 *   - `onToggle` is optional. Omit it where the section's toggle already lives
 *     in the charge header row above; a toggle-sized spacer keeps the label at
 *     the same x-offset.
 *   - `connector` defaults to "from" and can be nulled for selects that aren't
 *     sourced *from* a company.
 */
export default function LabeledSelectRow({
  label,
  on = true,
  onToggle,
  connector = "from",
  value,
  onChange,
  options,
  renderOption,
  formatLabel,
  placeholder = "Select company",
  emptyMessage = "No companies found",
  disabled = false,
}) {
  const inactive = disabled || !on;

  return (
    <div className="card-section">
      <div className="grid grid-cols-[16rem_4.5rem_minmax(0,1fr)] items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {onToggle ? (
            <IOSToggle on={on} onToggle={onToggle} />
          ) : (
            <span className="w-10 shrink-0" aria-hidden="true" />
          )}
          <span className="text-sm font-medium text-label shrink-0">{label}</span>
        </div>
        <span className="text-xs text-label-3 text-center">{connector}</span>
        <div className={`flex-1 min-w-0 ${inactive ? "opacity-60" : ""}`}>
          <CreatableSelect
            value={value}
            onChange={onChange}
            defaultOptions={options}
            renderOption={renderOption}
            formatLabel={formatLabel}
            placeholder={placeholder}
            creatable={false}
            disabled={inactive}
            persistOptions={false}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </div>
  );
}
