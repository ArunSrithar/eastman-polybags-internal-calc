import IOSToggle from "../../ui/IOSToggle";
import CreatableSelect from "../../ui/CreatableSelect";

/**
 * MaterialRow — single material row with toggle + price/micron/qty fields.
 *
 * Props:
 *   name           string         display name (e.g. "Polyester")
 *   materialKey    string         form key (e.g. "polyester")
 *   material       object         { enabled, price, micron, qty }
 *   currentPrice   number         latest price from settings (shown as placeholder)
 *   micronOptions  string[]       server-backed micron dropdown options
 *   qtyOptions     string[]       server-backed qty dropdown options
 *   onToggle       fn             toggle enabled state
 *   onChange        fn(field, val) update a single field
 *   onNewOption    fn(key, type, value) persist new micron/qty to server
 */
export default function MaterialRow({
  name,
  materialKey,
  material: m,
  currentPrice = 0,
  priceOptions = [],
  micronOptions = [],
  qtyOptions = [],
  onToggle,
  onChange,
  onPriceChange,
  canEditPrice = false,
  priceSaving = false,
  onNewOption,
  qtyDisabled = false,
}) {
  function sanitizePriceInput(raw) {
    const cleaned = String(raw || "").replace(/[^\d.]/g, "");
    const [whole = "", ...fractionParts] = cleaned.split(".");
    if (fractionParts.length === 0) return whole;
    return `${whole}.${fractionParts.join("")}`;
  }

  function handleMicronChange(v) {
    onChange("micron", v);
    if (v && !micronOptions.includes(v) && onNewOption) {
      onNewOption(materialKey, "micron", v);
    }
  }

  function handleQtyChange(v) {
    onChange("qty", v);
    if (v && !qtyOptions.includes(v) && onNewOption) {
      onNewOption(materialKey, "qty", v);
    }
  }

  return (
    <div className="card-section">
      <div className="item-row-header">
        <span
          className={`item-row-label ${m.enabled ? "text-label" : "text-label-3"}`}
        >
          {name}
        </span>
        <IOSToggle on={m.enabled} onToggle={onToggle} />
      </div>
      <div
        className={`grid grid-cols-3 item-row-inputs ${m.enabled ? "" : "item-row-inputs-off"}`}
      >
        <div>
          <p className="field-label mb-1">Price</p>
          <CreatableSelect
            storageKey={`gravure-price-history-${materialKey}`}
            defaultOptions={priceOptions}
            value={currentPrice > 0 ? String(currentPrice) : ""}
            onChange={onPriceChange}
            placeholder="₹ price"
            disabled={!canEditPrice || priceSaving}
            persistOptions={false}
            sanitizeInput={sanitizePriceInput}
          />
        </div>
        <div>
          <p className="field-label mb-1">Micron</p>
          <CreatableSelect
            storageKey={`gravure-microns-${materialKey}`}
            defaultOptions={micronOptions}
            value={m.micron}
            onChange={handleMicronChange}
            placeholder="e.g. 12"
          />
        </div>
        <div>
          <p className="field-label mb-1">Qty (kg)</p>
          {qtyDisabled ? (
            <div className="flex items-center input-base p-0 overflow-hidden opacity-60 cursor-not-allowed">
              <input
                type="text"
                value={m.qty || ""}
                disabled
                placeholder="Auto"
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none w-0"
              />
            </div>
          ) : (
            <CreatableSelect
              storageKey={`gravure-qty-${materialKey}`}
              defaultOptions={qtyOptions}
              value={m.qty}
              onChange={handleQtyChange}
              placeholder="0.000"
            />
          )}
        </div>
      </div>
    </div>
  );
}
