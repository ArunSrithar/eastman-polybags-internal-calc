import { fmt } from "../../utils/format";
import { P } from "./printTokens";

/**
 * PrintItemsTable — the line-items table used on all print invoices.
 *
 * Design:
 *   - Column headers: 9px uppercase tracked, 2px strong rule top + bottom, no fill
 *   - Data rows: hairline horizontal rules only (no vertical grid), optional zebra stripe
 *   - Adjustment rows (wastage, packing, transport, service): no SI number,
 *     italic muted label spanning 4 cols, right-aligned amount
 *   - tfoot total row: P.panel grey background, 2px strong top rule
 *
 * Props:
 *   items        — Array<{ key, label, qty, price, per, amount }>
 *                  qty/price null for flat-amount items
 *   adjustments  — Array<{ label, amount }> rendered after blank rows
 *   totalQty     — number shown in TOTAL row qty cell (0 = blank)
 *   totalAmount  — number shown in TOTAL row amount cell
 *   minRows      — minimum visible rows (padded with blank rows), default 8
 */

const MIN_ROWS = 8;

function hCell(align, width) {
  return {
    padding: "8px 10px",
    textAlign: align,
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: P.text,
    fontWeight: "700",
    ...(width ? { width } : {}),
  };
}

function dCell(align, color) {
  return {
    padding: "5px 10px",
    textAlign: align,
    fontSize: "10px",
    color: color || P.text,
    verticalAlign: "middle",
  };
}

export default function PrintItemsTable({
  items = [],
  adjustments = [],
  totalQty,
  totalAmount,
  minRows = MIN_ROWS,
}) {
  const blankRows = Math.max(0, minRows - items.length);

  return (
    <div
      style={{
        border: `1px solid ${P.rule}`,
        borderRadius: "8px 8px 0 0",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {/* ── Header ── */}
        <thead>
          <tr style={{ borderBottom: `2px solid ${P.ruleStrong}` }}>
            <th style={hCell("center", "46px")}>SI No.</th>
            <th style={hCell("left")}>Description of Goods</th>
            <th style={hCell("center", "80px")}>Quantity</th>
            <th style={hCell("right", "70px")}>Rate / Kg</th>
            <th style={hCell("right", "96px")}>Amount</th>
          </tr>
        </thead>

        {/* ── Data rows ── */}
        <tbody>
          {items.map((row, idx) => (
            <tr
              key={row.key || idx}
              style={{
                borderBottom: `1px solid ${P.rule}`,
                backgroundColor: idx % 2 === 1 ? P.stripe : P.white,
              }}
            >
              <td style={dCell("center", P.muted)}>{idx + 1}</td>
              <td style={{ ...dCell("left"), fontWeight: "600" }}>
                {row.label.toUpperCase()}
              </td>
              <td style={dCell("center")}>
                {row.qty != null ? `${fmt(row.qty)} Kgs` : ""}
              </td>
              <td style={dCell("right")}>
                {row.price != null ? fmt(row.price) : ""}
              </td>
              <td
                style={{
                  ...dCell("right"),
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmt(row.amount)}
              </td>
            </tr>
          ))}

          {/* ── Blank padding rows ── */}
          {Array.from({ length: blankRows }).map((_, i) => (
            <tr
              key={`blank-${i}`}
              style={{ height: "22px", borderBottom: `1px solid ${P.rule}` }}
            >
              <td />
              <td />
              <td />
              <td />
              <td />
            </tr>
          ))}

          {/* ── Adjustment rows (wastage, packing, transport, service) ── */}
          {adjustments.map((row, i) => (
            <tr key={`adj-${i}`}>
              <td style={{ borderRight: `1px solid ${P.rule}` }} />
              <td
                colSpan={3}
                style={{
                  padding: "5px 10px",
                  textAlign: "right",
                  fontStyle: row.bold ? "normal" : "italic",
                  fontWeight: row.bold ? "700" : "400",
                  color: P.muted,
                  fontSize: "10px",
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  padding: "5px 10px",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: row.bold ? "700" : "400",
                  fontSize: "10px",
                }}
              >
                {fmt(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>

        {/* ── Total row ── */}
        <tfoot>
          <tr
            style={{
              backgroundColor: P.panel,
              borderTop: `2px solid ${P.ruleStrong}`,
            }}
          >
            <td />
            <td
              style={{
                padding: "9px 10px",
                fontWeight: "700",
                fontSize: "11px",
                textAlign: "left",
                color: P.text,
              }}
            >
              TOTAL
            </td>
            <td
              style={{
                padding: "9px 10px",
                fontWeight: "600",
                textAlign: "center",
                color: P.text,
              }}
            >
              {totalQty > 0 ? `${fmt(totalQty)} Kgs` : ""}
            </td>
            <td />
            <td
              style={{
                padding: "9px 10px",
                fontWeight: "800",
                fontSize: "14px",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                width: "110px",
                color: P.text,
              }}
            >
              ₹ {fmt(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
