/**
 * TextField — labeled text input inside a card-section.
 *
 * Props:
 *   label        string
 *   placeholder  string
 *   value        string
 *   onChange     fn(value)
 *   error        string|null   validation error shown below input
 *   inline       boolean       form-row layout: label left, input right (default false)
 */
export default function TextField({
  label,
  placeholder,
  value,
  onChange,
  error = null,
  inline = false,
}) {
  const inputClass = `input-base ${inline ? "flex-1" : ""} ${error ? "ring-1 ring-red-500" : ""}`;

  if (inline) {
    return (
      <div className="card-section">
        <div className="form-row">
          <p className="form-row-label">{label}</p>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
        </div>
        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="card-section">
      <p className="field-label mb-1.5">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      {error ? (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      ) : null}
    </div>
  );
}
