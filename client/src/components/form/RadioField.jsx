/**
 * RadioField — horizontal radio group with pill-style buttons.
 *
 * Props:
 *   name      string                   radio group name
 *   options   { value, label }[]       choices
 *   value     string                   currently selected value
 *   onChange  fn(value)                selection callback
 */
export default function RadioField({ name, options, value, onChange }) {
  return (
    <div className="card-section flex items-center gap-3">
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
      ))}
    </div>
  );
}
