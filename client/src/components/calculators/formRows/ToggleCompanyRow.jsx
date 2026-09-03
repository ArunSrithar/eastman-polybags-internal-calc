import IOSToggle from "../../ui/IOSToggle";
import CreatableSelect from "../../ui/CreatableSelect";
import ChargeQtyInput from "./ChargeQtyInput";
import { chargeRowGrid } from "./chargeRowGrid";

export default function ToggleCompanyRow({
  label,
  on,
  onToggle,
  companyValue,
  onCompanyChange,
  companyOptions,
  renderCompanyOption,
  price,
  onPriceChange,
  priceUnit,
  connector = "from",
  qty,
  onQtyChange,
}) {
  const hasPrice = typeof onPriceChange === "function";
  const hasQty = typeof onQtyChange === "function";

  return (
    <div className="card-section">
      <div
        className={`grid items-center gap-2 min-w-0 ${chargeRowGrid(Boolean(connector), hasPrice, hasQty)}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <IOSToggle on={on} onToggle={onToggle} />
          <span className="text-sm font-medium text-label shrink-0">{label}</span>
        </div>
        {connector ? (
          <span className="text-xs text-label-3 text-center">{connector}</span>
        ) : null}
        {hasQty ? <ChargeQtyInput qty={qty} onQtyChange={onQtyChange} disabled={!on} /> : null}
        <div className={`flex-1 min-w-0 ${on ? "" : "opacity-60"}`}>
          <CreatableSelect
            value={companyValue}
            onChange={onCompanyChange}
            defaultOptions={companyOptions}
            renderOption={renderCompanyOption}
            placeholder="Select company"
            creatable={false}
            disabled={!on}
            persistOptions={false}
            emptyMessage="No companies found"
          />
        </div>
        {hasPrice ? (
          <div
            className={`flex items-center input-base p-0 overflow-hidden shrink-0 ${on ? "" : "opacity-60 pointer-events-none"}`}
          >
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
