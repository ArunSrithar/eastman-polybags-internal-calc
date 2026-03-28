/**
 * TextField — labeled text input inside a card-section.
 *
 * Props:
 *   label        string
 *   placeholder  string
 *   value        string
 *   onChange      fn(value)
 *   error        string|null   validation error shown below input
 */
export default function TextField({
  label,
  placeholder,
  value,
  onChange,
  error = null,
}) {
  return (
    <div className="card-section">
      <p className="field-label mb-1.5">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-base ${error ? "ring-1 ring-red-500" : ""}`}
      />
      {error ? (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      ) : null}
    </div>
  );
}
