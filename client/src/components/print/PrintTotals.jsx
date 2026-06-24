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
}) {
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

      {/* ── Amount in words strip ── */}
      <div
        style={{
          border: `1px solid ${P.rule}`,
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          padding: "8px 10px",
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
                  fontSize: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: P.muted,
                  marginBottom: "3px",
                }}
              >
                Amount Chargeable (in words)
              </div>
              <div
                style={{ fontWeight: "700", fontSize: "10px", color: P.text }}
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
