import { P } from "./printTokens";

/**
 * PrintParties — grey customer panel + metadata grid.
 *
 * Layout (full-width grey background):
 *   [Left 38%: primary/secondary party info — customer/prepared-by etc.]
 *   [Right 62%: 4-col meta grid — label | value | label | value per row]
 *
 * Props:
 *   customer   — customer / quote name string
 *   partyPrimaryLabel   — left panel top label
 *   partyPrimaryValue   — left panel top value
 *   partySecondaryLabel — left panel bottom label
 *   partySecondaryValue — left panel bottom value
 *   metaRows   — Array<{ label, value, label2?, value2? }>
 *                Each entry renders one row in the meta grid.
 *                Pass in document order — max ~6 rows fits cleanly.
 */
export default function PrintParties({
  customer,
  partyPrimaryLabel = "Bill To / Consignee",
  partyPrimaryValue,
  partySecondaryLabel = "Ship To / Buyer",
  partySecondaryValue,
  metaRows = [],
}) {
  const firstPartyValue = partyPrimaryValue ?? customer;
  const secondPartyValue = partySecondaryValue ?? customer;
  const hasSecondary = Boolean(partySecondaryLabel || secondPartyValue);
  const cellPadY = "9px";
  const cellPadX = "12px";

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
                padding: "0",
                verticalAlign: "top",
                borderRight: `1px solid ${P.rule}`,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "absolute",
                  inset: 0,
                }}
              >
                <div
                  style={{
                    flex: hasSecondary ? 1 : "none",
                    padding: "10px 14px",
                    borderBottom: hasSecondary ? `1px solid ${P.rule}` : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                      color: P.muted,
                      marginBottom: "6px",
                    }}
                  >
                    {partyPrimaryLabel}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: P.text,
                    }}
                  >
                    {firstPartyValue || "—"}
                  </div>
                </div>
                {hasSecondary ? (
                  <div
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.7px",
                        color: P.muted,
                        marginBottom: "6px",
                      }}
                    >
                      {partySecondaryLabel}
                    </div>
                    <div
                      style={{ fontSize: "13px", fontWeight: "700", color: P.text }}
                    >
                      {secondPartyValue || "—"}
                    </div>
                  </div>
                ) : null}
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
                  {metaRows.map((row, i) => {
                    const isPriceRow =
                      String(row.label2 || "").toLowerCase() === "price / kg";

                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom:
                            i < metaRows.length - 1 ? `1px solid ${P.rule}` : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: `${cellPadY} ${cellPadX}`,
                            fontSize: "8px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: P.muted,
                            width: "25%",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.label}
                        </td>
                        <td
                          style={{
                            padding: `${cellPadY} ${cellPadX}`,
                            fontSize: "10px",
                            fontWeight: "600",
                            color: P.text,
                            width: "25%",
                            borderRight: `1px solid ${P.rule}`,
                          }}
                        >
                          {row.value || ""}
                        </td>
                        <td
                          style={{
                            padding: `${cellPadY} ${cellPadX}`,
                            fontSize: "8px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: isPriceRow ? P.text : P.muted,
                            fontWeight: isPriceRow ? "700" : "500",
                            width: "25%",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.label2 || ""}
                        </td>
                        <td
                          style={{
                            padding: `${cellPadY} ${cellPadX}`,
                            fontSize: isPriceRow ? "12px" : "10px",
                            fontWeight: isPriceRow ? "700" : "600",
                            color: P.text,
                            width: "25%",
                          }}
                        >
                          {row.value2 || ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
