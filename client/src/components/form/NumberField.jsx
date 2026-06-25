/**
 * NumberField — inline row with label + compact number input.
 *
 * Props:
 *   label     string
 *   value     string
 *   onChange  fn(value)
 *   onBlur    fn(event) (optional)
 *   onKeyDown fn(event) (optional)
 *   min       number    (optional)
 *   max       number    (optional)
 *   width     string    Tailwind width class (default "w-20")
 *   unit      string    trailing unit badge inside the field, e.g. "kg" (optional)
 */
export default function NumberField({
  label,
  value,
  onChange,
  onBlur,
  onKeyDown,
  min,
  max,
  width = "w-20",
  unit,
  disabled,
  placeholder,
}) {
  const input = unit ? (
    <div
      className={`flex items-center input-base p-0 overflow-hidden ${width} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {unit === "₹" ? (
        <span className="px-3 text-label-3 text-sm border-r border-separator shrink-0">
          ₹
        </span>
      ) : null}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2 text-sm text-center outline-none input-no-spinner w-0"
      />
      {unit !== "₹" ? (
        <span className="px-2 text-label-3 text-xs shrink-0">{unit}</span>
      ) : null}
    </div>
  ) : (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className={`input-base ${width} text-center input-no-spinner ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    />
  );

  return (
    <div className="card-section">
      <div className="form-row">
        <p className="form-row-label">{label}</p>
        {input}
      </div>
    </div>
  );
}
