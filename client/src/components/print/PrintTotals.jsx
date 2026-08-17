import { fmt } from "../../utils/format";
import { P } from "./printTokens";

/**
 * PrintTotals — strips attached directly below PrintItemsTable.
 *
 * When pricePerKg is provided (Gravure / Flexo), renders TWO stacked strips:
 *   1. Rate per Kg strip       — prominent ₹ X.XX / Kg (panel background)
 *   2. Amount in words strip   — total + per-kg words stacked (rounded bottom)
 *
 * When pricePerKg is omitted (Job Cost), renders only the amount-in-words strip.
 *
 * Props:
 *   amountWords      — total amount in words string
 *   showAmountWords  — optional; show/hide total amount words block
 *   pricePerKg       — optional number (Gravure / Flexo only)
 *   pricePerKgLabel   — optional label override for per-kg strip
 *   pricePerKgDisplay — optional value string override for per-kg strip
 *   pricePerKgProminent — optional; renders per-kg value with stronger emphasis
 *   pricePerKgUnitSuffix — optional; unit suffix for per-kg value
 *   pricePerKgLabelIndent — optional; left indent for per-kg label
 *   pricePerKgWords  — optional words string for per-kg amount (Gravure / Flexo only)
 *   pricePerKgWordsProminent — optional; stronger typography for per-kg words block
 *   taxPercent       — optional; tax rate backed out of the total (Gravure / Flexo only). Omit/0 hides the strip.
 *   taxAmount        — optional; tax portion (₹)
 *   exclusiveAmount  — optional; total with tax excluded (₹)
 *   exclusiveLabel   — optional; label override for the exclusive-of-tax line
 */
export default function PrintTotals({
  amountWords,
  showAmountWords = true,
  pricePerKg,
  pricePerKgLabel = "Rate per Kg",
  pricePerKgDisplay,
  pricePerKgProminent = false,
  pricePerKgUnitSuffix = " / Kg",
  pricePerKgLabelIndent = 0,
  pricePerKgWords,
  pricePerKgWordsProminent = false,
  taxPercent,
  taxAmount,
  exclusiveAmount,
  exclusiveLabel = "Exclusive of Tax",
}) {
  const hasTax = taxPercent > 0;

  return (
    <>
      {/* ── Rate per Kg strip (Gravure / Flexo only) ── */}
      {pricePerKg != null ? (
        <div
          style={{
            border: `1px solid ${P.rule}`,
            borderTop: "none",
            borderRadius: "0",
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: P.panel,
          }}
        >
          <div
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: P.text,
              fontWeight: "700",
              fontSize: "11px",
              marginLeft: `${pricePerKgLabelIndent}px`,
              paddingLeft: "56px",
            }}
          >
            {pricePerKgLabel}
          </div>
          <div
            style={{
              fontWeight: "800",
              fontSize: pricePerKgProminent ? "22px" : "15px",
              lineHeight: pricePerKgProminent ? "1.1" : undefined,
              color: P.text,
              whiteSpace: "nowrap",
              letterSpacing: "0.3px",
            }}
          >
            ₹ {pricePerKgDisplay ?? fmt(pricePerKg)}{pricePerKgUnitSuffix}
          </div>
        </div>
      ) : null}

      {/* ── Exclusive of Tax strip ── */}
      {hasTax ? (
        <div
          style={{
            border: `1px solid ${P.rule}`,
            borderTop: "none",
            padding: "6px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: P.white,
          }}
        >
          <div
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: P.muted,
              fontWeight: "600",
              fontSize: "9.5px",
              paddingLeft: "56px",
            }}
          >
            Tax @ {taxPercent}%
            <span style={{ marginLeft: "8px", color: P.text, fontWeight: "700" }}>
              ₹ {fmt(taxAmount)}
            </span>
          </div>
          <div
            style={{
              fontWeight: "700",
              fontSize: "12px",
              color: P.text,
              whiteSpace: "nowrap",
            }}
          >
            {exclusiveLabel}
            <span style={{ marginLeft: "8px" }}>₹ {fmt(exclusiveAmount)}</span>
          </div>
        </div>
      ) : null}

      {/* ── Amount in words strip ── */}
      <div
        style={{
          border: `1px solid ${P.rule}`,
          borderTop: `1px solid ${P.ruleStrong}`,
          borderRadius: "0 0 8px 8px",
          padding: "9px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          backgroundColor: P.stripe,
        }}
      >
        <div style={{ flex: 1 }}>
          {showAmountWords ? (
            <>
              {/* Total amount in words */}
              <div
                style={{
                  fontSize: "8.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: P.muted,
                  marginBottom: "3px",
                  fontWeight: "600",
                }}
              >
                Amount Chargeable (in words)
              </div>
              <div
                style={{ fontWeight: "700", fontSize: "11px", color: P.text }}
              >
                {amountWords}
              </div>
            </>
          ) : null}

          {/* Per-kg amount in words (Gravure / Flexo only) */}
          {pricePerKgWords ? (
            <>
              <div
                style={{
                  fontSize: pricePerKgWordsProminent ? "9px" : "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: P.muted,
                  marginTop: showAmountWords ? "6px" : "0",
                  marginBottom: "3px",
                  fontWeight: pricePerKgWordsProminent ? "700" : "400",
                }}
              >
                AMOUNT CHARGEABLE (IN WORDS)
              </div>
              <div
                style={{
                  fontWeight: pricePerKgWordsProminent ? "800" : "700",
                  fontSize: pricePerKgWordsProminent ? "14px" : "10px",
                  color: P.text,
                  lineHeight: pricePerKgWordsProminent ? "1.2" : undefined,
                }}
              >
                {pricePerKgWords}
              </div>
            </>
          ) : null}
        </div>
        <div
          style={{
            fontSize: "8px",
            color: P.soft,
            whiteSpace: "nowrap",
            paddingTop: "2px",
            paddingLeft: "12px",
          }}
        >
          E. &amp; O.E
        </div>
      </div>
    </>
  );
}
