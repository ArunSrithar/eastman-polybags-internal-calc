import IOSToggle from "../../ui/IOSToggle";
import CreatableSelect from "../../ui/CreatableSelect";

/**
 * MaterialRow — single material row with toggle + price/micron/qty fields.
 *
 * Props:
 *   name      string         display name (e.g. "Polyester")
 *   material  object         { enabled, price, micron, qty }
 *   onToggle  fn             toggle enabled state
 *   onChange  fn(field, val)  update a single field
 */
export default function MaterialRow({ name, material: m, onToggle, onChange }) {
  return (
    <div className="card-section">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`font-medium text-sm ${m.enabled ? "text-label" : "text-label-3"}`}
        >
          {name}
        </span>
        <IOSToggle on={m.enabled} onToggle={onToggle} />
      </div>
      <div
        className={`grid grid-cols-3 gap-2 transition-opacity duration-200 ${m.enabled ? "opacity-100" : "opacity-30 pointer-events-none"}`}
      >
        <div>
          <p className="field-label mb-1">Price (₹/kg)</p>
          <input
            type="number"
            min="0"
            value={m.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="0.00"
            className="input-base"
          />
        </div>
        <div>
          <p className="field-label mb-1">Micron</p>
          <CreatableSelect
            storageKey="gravure-microns"
            defaultOptions={["12", "15", "20", "25", "30", "40", "50"]}
            value={m.micron}
            onChange={(v) => onChange("micron", v)}
            placeholder="e.g. 12"
          />
        </div>
        <div>
          <p className="field-label mb-1">Qty (kg)</p>
          <CreatableSelect
            storageKey="gravure-qty"
            defaultOptions={["0.5", "1", "1.5", "2", "2.5", "3", "5", "10"]}
            value={m.qty}
            onChange={(v) => onChange("qty", v)}
            placeholder="0.000"
          />
        </div>
      </div>
    </div>
  );
}
