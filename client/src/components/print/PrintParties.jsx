import { P } from "./printTokens";

/**
 * PrintParties — grey customer panel + metadata grid.
 *
 * Layout (full-width grey background):
 *   [Left 38%: Bill To / Ship To — customer name bold]
 *   [Right 62%: 4-col meta grid — label | value | label | value per row]
 *
 * Props:
 *   customer   — customer / quote name string
 *   metaRows   — Array<{ label, value, label2?, value2? }>
 *                Each entry renders one row in the meta grid.
 *                Pass in document order — max ~6 rows fits cleanly.
 */
export default function PrintParties({ customer, metaRows = [] }) {
  return (
    <div
      style={{ borderRadius: "8px", overflow: "hidden", marginBottom: "14px" }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            {/* ── Bill To / Ship To — grey panel ── */}
            <td
              style={{
                width: "38%",
                backgroundColor: P.panel,
                padding: "12px 14px",
                verticalAlign: "top",
                borderRight: `1px solid ${P.rule}`,
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                  color: P.muted,
                  marginBottom: "4px",
                }}
              >
                Bill To / Consignee
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: P.text,
                  marginBottom: "12px",
                }}
              >
                {customer || "—"}
              </div>
              <div
                style={{
                  height: "1px",
                  backgroundColor: P.rule,
                  marginBottom: "10px",
                }}
              />
              <div
                style={{
                  fontSize: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                  color: P.muted,
                  marginBottom: "4px",
                }}
              >
                Ship To / Buyer
              </div>
              <div
                style={{ fontSize: "13px", fontWeight: "700", color: P.text }}
              >
                {customer || "—"}
              </div>
            </td>

            {/* ── Meta grid ── */}
            <td
              style={{
                width: "62%",
                backgroundColor: P.panel,
                padding: "0",
                verticalAlign: "top",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {metaRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${P.rule}` }}>
                      <td
                        style={{
                          padding: "6px 10px",
                          fontSize: "8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: P.muted,
                          width: "22%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          fontSize: "10px",
                          fontWeight: "600",
                          color: P.text,
                          width: "28%",
                          borderRight: `1px solid ${P.rule}`,
                        }}
                      >
                        {row.value || ""}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          fontSize: "8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: P.muted,
                          width: "22%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.label2 || ""}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          fontSize: "10px",
                          fontWeight: "600",
                          color: P.text,
                          width: "28%",
                        }}
                      >
                        {row.value2 || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
