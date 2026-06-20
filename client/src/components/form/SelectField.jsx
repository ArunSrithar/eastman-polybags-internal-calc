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
  disabled = false,
  helperText,
}) {
  const selectOptions = options ?? defaultOptions ?? [];

  const nativeSelect = (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`input-base appearance-none ${inline ? width : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <option value="" disabled>
        {placeholder ?? "Select…"}
      </option>
      {selectOptions.map((opt) => {
        const optionValue = typeof opt === "string" ? opt : opt.value;
        const optionLabel =
          typeof opt === "string"
            ? formatLabel
              ? formatLabel(opt)
              : opt
            : opt.label ??
            (formatLabel ? formatLabel(opt.value) : opt.value);

        return (
          <option
            key={optionValue}
            value={optionValue}
            disabled={typeof opt === "object" && opt.disabled === true}
          >
            {optionLabel}
          </option>
        );
      })}
    </select>
  );

  const select = native ? (
    nativeSelect
  ) : (
    <CreatableSelect
      storageKey={storageKey}
      defaultOptions={selectOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={inline ? width : ""}
      formatLabel={formatLabel}
      renderOption={renderOption}
      creatable={creatable}
      disabled={disabled}
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
        {helperText ? <p className="text-xs text-label-3 mt-1.5">{helperText}</p> : null}
      </div>
    );
  }

  return (
    <div className="card-section">
      <p className="field-label mb-1.5">{label}</p>
      {select}
      {helperText ? <p className="text-xs text-label-3 mt-1.5">{helperText}</p> : null}
    </div>
  );
}
