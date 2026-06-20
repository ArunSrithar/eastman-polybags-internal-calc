import IOSToggle from "../../../ui/IOSToggle";
import CreatableSelect from "../../../ui/CreatableSelect";

export default function ToggleCompanyRow({
  label,
  on,
  onToggle,
  companyValue,
  onCompanyChange,
  companyOptions,
  renderCompanyOption,
}) {
  return (
    <div className="card-section">
      <div className="grid grid-cols-[16rem_4.5rem_minmax(0,1fr)] items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <IOSToggle on={on} onToggle={onToggle} />
          <span className="text-sm font-medium text-label shrink-0">{label}</span>
        </div>
        <span className="text-xs text-label-3 text-center">from</span>
        <div className={`flex-1 min-w-0 ${on ? "" : "opacity-60"}`}>
          <CreatableSelect
            value={companyValue}
            onChange={onCompanyChange}
            defaultOptions={companyOptions}
            renderOption={renderCompanyOption}
            placeholder="Select company"
            creatable={false}
            disabled={!on}
            persistOptions={false}
          />
        </div>
      </div>
    </div>
  );
}
