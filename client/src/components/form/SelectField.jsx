import CreatableSelect from "../ui/CreatableSelect";

export default function SelectField({
  label,
  placeholder,
  value,
  onChange,
  storageKey,
  defaultOptions,
  inline = false,
  width = "w-20",
  unit,
  formatLabel,
  renderOption,
  creatable = true,
  native = false,
  options,
}) {
  const nativeSelect = (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-base appearance-none ${inline ? width : ""}`}
    >
      <option value="" disabled>
        {placeholder ?? "Select…"}
      </option>
      {(options ?? defaultOptions ?? []).map((opt) => (
        <option key={opt} value={opt}>
          {formatLabel ? formatLabel(opt) : opt}
        </option>
      ))}
    </select>
  );

  const select = native ? (
    nativeSelect
  ) : (
    <CreatableSelect
      storageKey={storageKey}
      defaultOptions={defaultOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={inline ? width : ""}
      formatLabel={formatLabel}
      renderOption={renderOption}
      creatable={creatable}
    />
  );

  if (inline) {
    return (
      <div className="card-section">
        <div className="form-row">
          <p className="form-row-label">{label}</p>
          {unit ? (
            <div className="flex items-center gap-2">
              {select}
              <span className="px-1.5 text-label-3 text-sm shrink-0">
                {unit}
              </span>
            </div>
          ) : (
            select
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-section">
      <p className="field-label mb-1.5">{label}</p>
      {select}
    </div>
  );
}
