/**
 * NumberField — inline row with label + compact number input.
 *
 * Props:
 *   label     string
 *   value     string
 *   onChange  fn(value)
 *   min       number    (optional)
 *   max       number    (optional)
 *   width     string    Tailwind width class (default "w-20")
 *   unit      string    suffix label, e.g. "%" (optional)
 */
export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  width = "w-20",
  unit,
}) {
  const input = (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-base ${width} text-center`}
    />
  );

  return (
    <div className="card-section">
      <div className="form-row">
        <p className="form-row-label">{label}</p>
        {unit ? (
          <div className="flex items-center gap-2">
            {input}
            <span className="text-sm font-medium text-label-2">{unit}</span>
          </div>
        ) : (
          input
        )}
      </div>
    </div>
  );
}
