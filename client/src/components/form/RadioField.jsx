/**
 * RadioField — horizontal radio group with pill-style buttons.
 *
 * Props:
 *   name      string                   radio group name
 *   options   { value, label }[]       choices
 *   value     string                   currently selected value
 *   onChange  fn(value)                selection callback
 */
export default function RadioField({
  name,
  label,
  options,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div
      className={`card-section ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {label ? <p className="field-label mb-2">{label}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`radio-pill ${
              value === opt.value ? "radio-pill-active" : "radio-pill-inactive"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
