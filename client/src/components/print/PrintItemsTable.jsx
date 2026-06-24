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
 *   items        — Array<{ key, label, subtitle?, qty, price, per, amount }>
 *                  qty/price null for flat-amount items
 *   adjustments  — Array<{ label, amount }> rendered after blank rows
 *   totalQty     — number shown in TOTAL row qty cell (0 = blank)
 *   totalAmount  — number shown in TOTAL row amount cell
 *   totalAmountDisplay — optional string override for TOTAL row amount
 *   totalRowProminent — optional; toggles stronger TOTAL row styling
 *   showTotalRow — optional; controls TOTAL row visibility
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
  totalAmountDisplay,
  totalRowProminent = true,
  showTotalRow = true,
  minRows = MIN_ROWS,
}) {
  const blankRows = Math.max(0, minRows - items.length);
  const hasAdjustmentRows = adjustments.some((row) => row.type !== "divider");

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
                <div>{row.label.toUpperCase()}</div>
                {row.subtitle ? (
                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "9px",
                      fontWeight: "400",
                      color: P.muted,
                      textTransform: "none",
                    }}
                  >
                    {row.subtitle}
                  </div>
                ) : null}
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

          {hasAdjustmentRows ? (
            <tr>
              <td style={{ borderRight: `1px solid ${P.rule}` }} />
              <td
                colSpan={4}
                style={{
                  padding: "6px 10px 4px",
                  textAlign: "right",
                  fontSize: "8px",
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  color: P.soft,
                  fontWeight: "500",
                  borderTop: `1px solid ${P.rule}`,
                }}
              >
                Rate Derivation
              </td>
            </tr>
          ) : null}

          {/* ── Adjustment rows (wastage, packing, transport, service) ── */}
          {adjustments.map((row, i) => {
            if (row.type === "divider") {
              return (
                <tr key={`adj-${i}`}>
                  <td style={{ borderRight: `1px solid ${P.rule}` }} />
                  <td
                    colSpan={4}
                    style={{
                      padding: 0,
                      borderTop: `1px solid ${P.rule}`,
                      height: "4px",
                    }}
                  />
                </tr>
              );
            }

            return (
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
            );
          })}
        </tbody>

        {/* ── Total row ── */}
        {showTotalRow ? (
          <tfoot>
            <tr
              style={{
                backgroundColor: totalRowProminent ? P.panel : P.white,
                borderTop: totalRowProminent
                  ? `2px solid ${P.ruleStrong}`
                  : `1px solid ${P.rule}`,
              }}
            >
              <td />
              <td
                style={{
                  padding: "9px 10px",
                  fontWeight: totalRowProminent ? "700" : "600",
                  fontSize: totalRowProminent ? "11px" : "10px",
                  textAlign: "left",
                  color: P.text,
                }}
              >
                TOTAL
              </td>
              <td
                style={{
                  padding: "9px 10px",
                  fontWeight: totalRowProminent ? "600" : "500",
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
                  fontWeight: totalRowProminent ? "800" : "700",
                  fontSize: totalRowProminent ? "14px" : "11px",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                  width: "110px",
                  color: P.text,
                }}
              >
                ₹ {totalAmountDisplay ?? fmt(totalAmount)}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
