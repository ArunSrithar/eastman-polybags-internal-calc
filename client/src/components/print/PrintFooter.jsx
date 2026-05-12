import { COMPANY } from "../../constants/companyInfo";
import { P } from "./printTokens";

/**
 * PrintFooter — 3-column footer used on all print invoices.
 *
 * Columns:
 *   1. Company's Bank Details
 *   2. Declaration
 *   3. "for {COMPANY.name}" + signature gap + "Authorised Signatory"
 *
 * Followed by:
 *   "This is a Computer Generated Invoice" caption
 */

const BANK_ROWS = [
  ["Bank Name", COMPANY.bank.name],
  ["A/c No.", COMPANY.bank.account],
  ["Branch & IFS Code", COMPANY.bank.ifsc],
];

export default function PrintFooter() {
  return (
    <>
      <div
        style={{
          marginTop: "14px",
          borderRadius: "8px",
          overflow: "hidden",
          border: `1px solid ${P.rule}`,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              {/* ── Bank Details ── */}
              <td
                style={{
                  width: "33%",
                  padding: "10px 12px",
                  verticalAlign: "top",
                  borderRight: `1px solid ${P.rule}`,
                }}
              >
                <div
                  style={{
                    fontSize: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    color: P.muted,
                    marginBottom: "7px",
                    fontWeight: "700",
                  }}
                >
                  Company&apos;s Bank Details
                </div>
                {BANK_ROWS.map(([lbl, val]) => (
                  <div
                    key={lbl}
                    style={{ display: "flex", gap: "4px", marginBottom: "3px" }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        color: P.muted,
                        minWidth: "96px",
                        flexShrink: 0,
                      }}
                    >
                      {lbl}
                    </span>
                    <span style={{ fontSize: "9px", color: P.text }}>
                      : {val}
                    </span>
                  </div>
                ))}
              </td>

              {/* ── Declaration ── */}
              <td
                style={{
                  width: "40%",
                  padding: "10px 12px",
                  verticalAlign: "top",
                  borderRight: `1px solid ${P.rule}`,
                }}
              >
                <div
                  style={{
                    fontSize: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    color: P.muted,
                    marginBottom: "7px",
                    fontWeight: "700",
                  }}
                >
                  Declaration
                </div>
                <div
                  style={{ fontSize: "9px", color: P.muted, lineHeight: "1.7" }}
                >
                  {COMPANY.declaration}
                </div>
              </td>

              {/* ── Signatory ── */}
              <td
                style={{
                  width: "27%",
                  padding: "10px 12px",
                  verticalAlign: "top",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    color: P.muted,
                    textAlign: "right",
                  }}
                >
                  for{" "}
                  <strong style={{ color: P.text, fontWeight: "700" }}>
                    {COMPANY.name}
                  </strong>
                </div>
                {/* Signature gap */}
                <div style={{ height: "38px" }} />
                <div
                  style={{
                    fontSize: "9px",
                    color: P.muted,
                    textAlign: "right",
                    borderTop: `1px solid ${P.rule}`,
                    paddingTop: "4px",
                  }}
                >
                  Authorised Signatory
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Bottom caption ── */}
      <div
        style={{
          textAlign: "center",
          fontSize: "8px",
          color: P.soft,
          marginTop: "8px",
          letterSpacing: "0.3px",
        }}
      >
        This is a Computer Generated Invoice
      </div>
    </>
  );
}
