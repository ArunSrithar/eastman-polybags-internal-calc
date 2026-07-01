import IOSToggle from "../ui/IOSToggle";

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

  // Flat amount items (no qty): single row — toggle · label · input
  if (!def.hasQty) {
    return (
      <div className="card-section">
        <div className="flex items-center gap-3">
          <IOSToggle on={on} onToggle={onToggle} />
          <span
            className={`flex-1 text-sm font-semibold ${on ? "text-label" : "text-label-3"}`}
          >
            {def.label}
          </span>
          <div
            className={`flex items-center input-base p-0 overflow-hidden w-48 shrink-0 ${on ? "" : "opacity-40 pointer-events-none"}`}
          >
            <span className="px-3 text-label-3 text-sm border-r border-separator shrink-0">
              ₹
            </span>
            <input
              type="number"
              min="0"
              value={item.price}
              onChange={(e) => onChange("price", e.target.value)}
              placeholder="0.00"
              disabled={!on}
              className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm outline-none input-no-spinner"
            />
            <span className="px-2 text-label-3 text-xs shrink-0">per kg</span>
          </div>
        </div>
      </div>
    );
  }

  // Qty-based items: single row — toggle · title · qty field · price field
  return (
    <div className="card-section">
      <div className={`flex items-center gap-2 ${on ? "" : "opacity-50"}`}>
        <IOSToggle on={on} onToggle={onToggle} />
        <span
          className={`flex-1 text-sm font-semibold ${on ? "text-label" : "text-label-3"}`}
        >
          {def.label}
        </span>
        <div
          className={`flex items-center input-base p-0 overflow-hidden w-32 shrink-0 ${on ? "" : "pointer-events-none"}`}
        >
          <input
            type="number"
            min="0"
            value={item.qty}
            onChange={(e) => onChange("qty", e.target.value)}
            placeholder="0"
            className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm outline-none input-no-spinner"
          />
          <span className="px-2 text-label-3 text-xs shrink-0">kg</span>
        </div>
        <div
          className={`flex items-center input-base p-0 overflow-hidden w-48 shrink-0 ${on ? "" : "pointer-events-none"}`}
        >
          <span className="px-3 text-label-3 text-sm border-r border-separator shrink-0">
            ₹
          </span>
          <input
            type="number"
            min="0"
            value={item.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="0.00"
            className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm outline-none input-no-spinner"
          />
          <span className="px-2 text-label-3 text-xs shrink-0">per kg</span>
        </div>
      </div>
    </div>
  );
}
