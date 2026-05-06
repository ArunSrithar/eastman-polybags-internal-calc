import CreatableSelect from "../ui/CreatableSelect";

/**
 * SelectField — labeled CreatableSelect inside a card-section.
 *
 * Two layouts:
 *   - Default: label on top, full-width dropdown below
 *   - Inline:  form-row with label left, compact dropdown right (pass `inline` + `width`)
 *
 * Props:
 *   label           string
 *   placeholder     string
 *   value           string
 *   onChange         fn(value)
 *   storageKey       string        localStorage key for persisted options
 *   defaultOptions   string[]      seed options
 *   inline          boolean       use form-row layout (default false)
 *   width           string        Tailwind width class for inline mode (default "w-20")
 *   unit            string        suffix label, e.g. "%" (optional, inline only)
 */
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
}) {
  const select = (
    <CreatableSelect
      storageKey={storageKey}
      defaultOptions={defaultOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={inline ? width : ""}
      formatLabel={formatLabel}
      renderOption={renderOption}
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
