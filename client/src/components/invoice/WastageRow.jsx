import { fmt } from "../../utils/format";

/**
 * WastageRow — inline wastage adjustment line.
 *
 * @param {number} percent  — wastage percentage
 * @param {number} base     — base amount the percentage applies to (subtotal)
 * @param {number} amount   — calculated wastage amount (₹)
 */
export default function WastageRow({
  percent,
  base,
  amount,
  label = "Wastage",
}) {
  return (
    <>
      <div className="flex items-baseline justify-between px-6 py-1.5">
        <span className="text-sm text-label">
          {label} ({percent}%)
          <span className="text-xs text-label-3 ml-1.5">on ₹{fmt(base)}</span>
        </span>
        <span className="text-sm font-medium text-label tabular-nums">
          ₹{fmt(amount)}
        </span>
      </div>
      <div className="divider mx-3 mt-1" />
    </>
  );
}
