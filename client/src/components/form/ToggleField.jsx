import IOSToggle from "../ui/IOSToggle";

/**
 * ToggleField — inline row with label + IOSToggle.
 *
 * Props:
 *   label     string
 *   on        boolean
 *   onToggle  fn()
 */
export default function ToggleField({ label, on, onToggle }) {
  return (
    <div className="card-section">
      <div className="form-row">
        <p className="form-row-label">{label}</p>
        <IOSToggle on={on} onToggle={onToggle} />
      </div>
    </div>
  );
}
