import { fmt } from "../../utils/format";

/**
 * SectionSubtotal — bordered pill row with optional qty + amount.
 * Followed by a separator divider.
 *
 * @param {string} label  — subtotal label text
 * @param {number} amount — subtotal value (₹)
 * @param {number} [qty]  — optional quantity (shown in kg)
 */
export default function SectionSubtotal({ label, amount, qty }) {
  return (
    <>
      <div className="invoice-grid items-baseline mx-3 mt-1.5 mb-1 px-3 py-1.5 border border-separator rounded-full">
        <span className="text-xs font-semibold text-label-2 uppercase tracking-wide">
          {label}
        </span>
        <span className="invoice-col-rate" />
        <span className="invoice-col-qty text-right text-xs font-semibold text-label-2 tabular-nums">
          {qty ? `${fmt(qty)} kg` : ""}
        </span>
        <span className="invoice-col-amount text-right text-sm font-bold text-label tabular-nums">
          ₹{fmt(amount)}
        </span>
      </div>
      <div className="divider mx-3 mt-1" />
    </>
  );
}
