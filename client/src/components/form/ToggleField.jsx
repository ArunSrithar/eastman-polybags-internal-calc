import IOSToggle from "../ui/IOSToggle";

/**
 * ToggleField — inline row with label + IOSToggle.
 *
 * Props:
 *   label     string
 *   on        boolean
 *   onToggle  fn()
 */
export default function ToggleField({ label, on, onToggle, disabled = false }) {
  return (
    <div className={`card-section ${disabled ? "opacity-50" : ""}`}>
      <div className="form-row">
        <p className="form-row-label">{label}</p>
        <IOSToggle on={on} onToggle={onToggle} disabled={disabled} />
      </div>
    </div>
  );
}
