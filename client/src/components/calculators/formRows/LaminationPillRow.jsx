import CreatableSelect from "../../ui/CreatableSelect";
import { chargeRowGrid } from "./chargeRowGrid";
import { LAMINATION_OPTIONS } from "../../../constants/lamination";

/**
 * LaminationPillRow — lamination type as an exclusive pill group, alongside its
 * supplier and (where the screen has one) its rate, on the same track as the
 * other charge rows.
 *
 * "None" is the off state: there is no separate enable toggle, because picking
 * a type and turning the charge on were always the same decision.
 *
 * The rate column renders only when `onPriceChange` is supplied — the Rate
 * Calculator resolves rates from the price list rather than from form state.
 */
export default function LaminationPillRow({
  value,
  onChange,
  options = LAMINATION_OPTIONS,
  companyValue,
  onCompanyChange,
  companyOptions,
  renderCompanyOption,
  price,
  onPriceChange,
}) {
  const off = value === "none";
  const hasPrice = typeof onPriceChange === "function";

  return (
    <div className="card-section">
      <div className={`grid items-center gap-2 min-w-0 ${chargeRowGrid(false, hasPrice)}`}>
        <div className="radio-track min-w-0">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`radio-pill ${
                value === opt.value ? "radio-pill-active" : "radio-pill-inactive"
              }`}
            >
              <input
                type="radio"
                name="laminationType"
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <div className={`flex-1 min-w-0 ${off ? "opacity-60" : ""}`}>
          <CreatableSelect
            value={companyValue}
            onChange={onCompanyChange}
            defaultOptions={companyOptions}
            renderOption={renderCompanyOption}
            placeholder="Select company"
            creatable={false}
            disabled={off}
            persistOptions={false}
            emptyMessage="No companies found"
          />
        </div>
        {hasPrice ? (
          <div
            className={`flex items-center input-base p-0 overflow-hidden shrink-0 ${off ? "opacity-60 pointer-events-none" : ""}`}
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
            <span className="px-2 text-label-3 text-xs shrink-0">/kg</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
