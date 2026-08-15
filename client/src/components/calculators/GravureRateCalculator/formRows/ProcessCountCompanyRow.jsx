import CreatableSelect from "../../../ui/CreatableSelect";

export default function ProcessCountCompanyRow({
  label,
  value,
  onValueChange,
  companyValue,
  onCompanyChange,
  companyOptions,
  renderCompanyOption,
  companyDisabled,
}) {
  function handleCountChange(rawValue) {
    if (rawValue === "") {
      onValueChange("");
      return;
    }

    const parsed = parseInt(rawValue, 10);
    if (!Number.isFinite(parsed)) {
      onValueChange("0");
      return;
    }

    const clamped = Math.max(0, Math.min(12, parsed));
    onValueChange(String(clamped));
  }

  return (
    <div className="card-section">
      <div className="grid grid-cols-[16rem_4.5rem_minmax(0,1fr)] items-center gap-2 min-w-0">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-sm font-medium text-label shrink-0">{label}</span>
          <input
            type="number"
            min={0}
            max={12}
            step={1}
            value={value}
            onChange={(e) => handleCountChange(e.target.value)}
            className="input-base w-24 text-center input-no-spinner"
          />
        </div>
        <span className="text-xs text-label-3 text-center">from</span>
        <div className={`flex-1 min-w-0 ${companyDisabled ? "opacity-60" : ""}`}>
          <CreatableSelect
            value={companyValue}
            onChange={onCompanyChange}
            defaultOptions={companyOptions}
            renderOption={renderCompanyOption}
            placeholder="Select company"
            creatable={false}
            disabled={companyDisabled}
            persistOptions={false}
            emptyMessage="No companies found"
          />
        </div>
      </div>
    </div>
  );
}
