import { fmt } from "../../utils/format";

/**
 * ItemRow — single data row in the 4-column invoice grid.
 *
 * @param {ReactNode} label  — item name (supports JSX for inline annotations)
 * @param {number}    [rate] — per-unit rate (₹)
 * @param {number}    [qty]  — quantity
 * @param {string}    [unit] — quantity unit label (default: "kg")
 * @param {number}    amount — line total (₹)
 */
export default function ItemRow({ label, rate, qty, unit = "kg", amount }) {
  const hasQty = qty != null && qty !== "";
  const qtyNumber = Number(qty);
  const formattedQty =
    hasQty && Number.isFinite(qtyNumber)
      ? unit === "clr"
        ? String(Math.trunc(qtyNumber))
        : fmt(qtyNumber)
      : "";

  return (
    <div className="invoice-grid items-baseline px-6 py-1.5">
      <div className="min-w-0">
        <span className="text-sm text-label truncate block">{label}</span>
      </div>
      <span className="invoice-col-rate text-right text-xs text-label-2 tabular-nums">
        {rate ? `₹${fmt(rate)}` : ""}
      </span>
      <span className="invoice-col-qty text-right text-xs text-label-2 tabular-nums">
        {formattedQty ? `${formattedQty} ${unit}` : ""}
      </span>
      <span className="invoice-col-amount text-right text-sm font-medium text-label tabular-nums">
        ₹{fmt(amount)}
      </span>
    </div>
  );
}
