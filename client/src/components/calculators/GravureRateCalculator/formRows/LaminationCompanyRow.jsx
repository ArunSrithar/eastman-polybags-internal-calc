import CreatableSelect from "../../../ui/CreatableSelect";

export default function LaminationCompanyRow({
  lamination,
  onLaminationChange,
  laminationOptions,
  companyValue,
  onCompanyChange,
  companyOptions,
  renderCompanyOption,
}) {
  return (
    <div className="card-section">
      <div className="grid grid-cols-[16rem_4.5rem_minmax(0,1fr)] items-center gap-2 min-w-0">
        <div className="min-w-0">
          <select
            value={lamination}
            onChange={(e) => onLaminationChange(e.target.value)}
            className="input-base appearance-none w-48 max-w-full"
          >
            {laminationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-label-3 text-center">from</span>
        <div className={`flex-1 min-w-0 ${lamination === "none" ? "opacity-60" : ""}`}>
          <CreatableSelect
            value={companyValue}
            onChange={onCompanyChange}
            defaultOptions={companyOptions}
            renderOption={renderCompanyOption}
            placeholder="Select company"
            creatable={false}
            disabled={lamination === "none"}
            persistOptions={false}
          />
        </div>
      </div>
    </div>
  );
}
