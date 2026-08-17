import { fmt } from "../../utils/format";

/**
 * InvoiceFooter — Total row + highlighted price-per-kg strip.
 *
 * @param {number} total       — grand total (₹)
 * @param {number} highlight   — hero number (e.g. price per kg)
 * @param {string} highlightLabel — label for the hero number
 * @param {string} highlightUnit  — unit suffix (e.g. "/kg")
 * @param {string} [annotation]   — small text below hero (e.g. "₹625.90 total / 40.00 kg")
 * @param {number} [taxPercent]      — tax rate applied to the highlight (e.g. 18). Omit/0 hides the tax rows.
 * @param {number} [taxAmount]       — tax portion backed out of the highlight (₹)
 * @param {number} [exclusiveAmount] — highlight value with tax excluded (₹)
 * @param {string} [exclusiveLabel]  — label for the exclusive-of-tax row
 */
export default function InvoiceFooter({
  total,
  highlight,
  highlightLabel,
  highlightUnit = "",
  annotation,
  showTotal = true,
  taxPercent,
  taxAmount,
  exclusiveAmount,
  exclusiveLabel = "Exclusive of Tax",
}) {
  const hasTax = taxPercent > 0;
  return (
    <>
      {/* ── Total row ──────────────────────────────────────────────────── */}
      {showTotal ? (
        <div className="bg-fill-4 px-6 py-3 mt-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-label">Total</span>
            <span className="text-lg font-bold text-label tabular-nums">
              ₹{fmt(total)}
            </span>
          </div>
        </div>
      ) : null}

      {/* ── Highlight strip ────────────────────────────────────────────── */}
      <div className="bg-tint/5 border-t border-tint/15 px-6 py-4 rounded-b-2xl">
        {highlight != null ? (
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-tint">
              {highlightLabel}
            </span>
            <span className="text-2xl font-bold text-tint tabular-nums">
              ₹{fmt(highlight)}
              {highlightUnit ? (
                <span className="text-sm font-medium">{highlightUnit}</span>
              ) : null}
            </span>
          </div>
        ) : null}
        {annotation ? (
          <p className="text-[11px] text-label-3 mt-1 text-right">
            {annotation}
          </p>
        ) : null}
        {hasTax ? (
          <>
            <div className="divider mt-2" />
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm text-label-2">
                Tax ({fmt(taxPercent)}%)
              </span>
              <span className="text-sm text-label-2 tabular-nums">
                ₹{fmt(taxAmount)}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-semibold text-label">
                {exclusiveLabel}
              </span>
              <span className="text-sm font-semibold text-label tabular-nums">
                ₹{fmt(exclusiveAmount)}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
