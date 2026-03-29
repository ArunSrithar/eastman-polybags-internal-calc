import IOSToggle from "../../ui/IOSToggle";

/**
 * ItemRow — toggleable line item with optional qty + price inputs.
 *
 * Props:
 *   def       object   LINE_ITEMS entry ({ key, label, hasQty, defaultPrice })
 *   item      object   form state ({ enabled, qty?, price })
 *   onToggle  fn       toggle enabled state
 *   onChange  fn(field, val)  update a single field
 */
export default function ItemRow({ def, item, onToggle, onChange }) {
  const on = item.enabled;
  return (
    <div className="card-section">
      <div className="item-row-header">
        <span
          className={`item-row-label ${on ? "text-label" : "text-label-3"}`}
        >
          {def.label}
        </span>
        <IOSToggle on={on} onToggle={onToggle} />
      </div>
      <div
        className={`grid ${def.hasQty ? "grid-cols-2" : "grid-cols-1"} item-row-inputs ${on ? "" : "item-row-inputs-off"}`}
      >
        {def.hasQty ? (
          <div>
            <p className="field-label mb-1">Qty (kg)</p>
            <input
              type="number"
              min="0"
              value={item.qty}
              onChange={(e) => onChange("qty", e.target.value)}
              placeholder="0"
              className="input-base"
            />
          </div>
        ) : null}
        <div>
          <p className="field-label mb-1">
            {def.hasQty ? "Price (₹/kg)" : "Amount (₹)"}
          </p>
          <input
            type="number"
            min="0"
            value={item.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="0.00"
            className="input-base"
          />
        </div>
      </div>
    </div>
  );
}
