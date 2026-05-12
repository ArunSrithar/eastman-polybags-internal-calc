import { P } from "./printTokens";

/**
 * PrintTotals — "Amount Chargeable (in words)" strip, attached directly
 * below PrintItemsTable (borderTop: none so it merges visually).
 *
 * Props:
 *   amountWords — pre-computed INR amount in words string
 *                 (use amountInWords() from utils/format.js)
 */
export default function PrintTotals({ amountWords }) {
  return (
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
      <div>
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
      </div>
      <div
        style={{
          fontSize: "8px",
          color: P.soft,
          whiteSpace: "nowrap",
          paddingTop: "2px",
        }}
      >
        E. &amp; O.E
      </div>
    </div>
  );
}
