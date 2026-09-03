import CreatableSelect from "../../ui/CreatableSelect";
import ChargeQtyInput from "./ChargeQtyInput";
import { chargeRowGrid } from "./chargeRowGrid";

export default function ProcessCountCompanyRow({
  label,
  value,
  onValueChange,
  companyValue,
  onCompanyChange,
  companyOptions,
  renderCompanyOption,
  companyDisabled,
  price,
  onPriceChange,
  priceUnit,
  connector = "from",
  qty,
  onQtyChange,
}) {
  const hasPrice = typeof onPriceChange === "function";
  const hasQty = typeof onQtyChange === "function";

  function handleCountChange(rawValue) {
    if (rawValue === "") {
      onValueChange("");
      return;
    }

    const parsed = parseInt(rawValue, 10);
    if (!Number.isFinite(parsed)) {
      onValueChange("0");
      return;
    }

    const clamped = Math.max(0, Math.min(12, parsed));
    onValueChange(String(clamped));
  }

  return (
    <div className="card-section">
      <div
        className={`grid items-center gap-2 min-w-0 ${chargeRowGrid(Boolean(connector), hasPrice, hasQty)}`}
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-sm font-medium text-label shrink-0">{label}</span>
          <input
            type="number"
            min={0}
            max={12}
            step={1}
            value={value}
            onChange={(e) => handleCountChange(e.target.value)}
            className="input-base w-24 text-center input-no-spinner"
          />
        </div>
        {connector ? (
          <span className="text-xs text-label-3 text-center">{connector}</span>
        ) : null}
        {hasQty ? <ChargeQtyInput qty={qty} onQtyChange={onQtyChange} /> : null}
        <div className={`flex-1 min-w-0 ${companyDisabled ? "opacity-60" : ""}`}>
          <CreatableSelect
            value={companyValue}
            onChange={onCompanyChange}
            defaultOptions={companyOptions}
            renderOption={renderCompanyOption}
            placeholder="Select company"
            creatable={false}
            disabled={companyDisabled}
            persistOptions={false}
            emptyMessage="No companies found"
          />
        </div>
        {hasPrice ? (
          <div className="flex items-center input-base p-0 overflow-hidden shrink-0">
            <span className="px-2 text-label-3 text-sm border-r border-separator shrink-0">
              ₹
            </span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0.00"
              className="w-full min-w-0 bg-transparent px-2 py-2 text-sm outline-none input-no-spinner"
            />
            {priceUnit ? (
              <span className="px-2 text-label-3 text-xs shrink-0">{priceUnit}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
