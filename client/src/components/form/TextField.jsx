/**
 * TextField — labeled text input inside a card-section.
 *
 * Props:
 *   label        string
 *   placeholder  string
 *   value        string
 *   onChange      fn(value)
 */
export default function TextField({ label, placeholder, value, onChange }) {
  return (
    <div className="card-section">
      <p className="field-label mb-1.5">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base"
      />
    </div>
  );
}
