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
 *   pricePerKg       — optional number (Gravure / Flexo only)
 *   pricePerKgWords  — optional words string for per-kg amount (Gravure / Flexo only)
 */
export default function PrintTotals({
  amountWords,
  pricePerKg,
  pricePerKgWords,
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
              fontSize: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: P.muted,
              fontWeight: "700",
            }}
          >
            Rate per Kg
          </div>
          <div
            style={{
              fontWeight: "800",
              fontSize: "15px",
              color: P.text,
              whiteSpace: "nowrap",
              letterSpacing: "0.3px",
            }}
          >
            ₹ {fmt(pricePerKg)} / Kg
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
          <div style={{ fontWeight: "700", fontSize: "10px", color: P.text }}>
            {amountWords}
          </div>

          {/* Per-kg amount in words (Gravure / Flexo only) */}
          {pricePerKgWords ? (
            <>
              <div
                style={{
                  fontSize: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: P.muted,
                  marginTop: "6px",
                  marginBottom: "3px",
                }}
              >
                Amount Required to Produce a Kg (in words)
              </div>
              <div
                style={{ fontWeight: "700", fontSize: "10px", color: P.text }}
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
