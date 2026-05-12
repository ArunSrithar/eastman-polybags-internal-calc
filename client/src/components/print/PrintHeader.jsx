import { COMPANY } from "../../constants/companyInfo";
import { P } from "./printTokens";

/**
 * PrintHeader — top section of every print invoice.
 *
 * Layout:
 *   [4px black top stripe]
 *   [Company name + address + GSTIN]   [DOCUMENT TITLE large + No. + Date]
 *   [1px black separator rule]
 *
 * Props:
 *   documentTitle  — e.g. "Job Cost Sheet" | "Gravure Quote" | "Flexo Quote"
 *   documentNo     — invoice / quote number string
 *   documentDate   — pre-formatted date string (use formatPrintDate before passing)
 */
export default function PrintHeader({
  documentTitle,
  documentNo,
  documentDate,
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      {/* ── 4px top accent stripe ── */}
      <div
        style={{
          height: "4px",
          backgroundColor: P.ruleStrong,
          marginBottom: "18px",
        }}
      />

      {/* ── Company (left) · Wordmark (right) ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        {/* Company block */}
        <div style={{ maxWidth: "55%" }}>
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "17px",
              fontWeight: "700",
              color: P.text,
              marginBottom: "5px",
              lineHeight: "1.2",
            }}
          >
            {COMPANY.name}
          </div>
          {COMPANY.address.map((line, i) => (
            <div
              key={i}
              style={{ fontSize: "9px", color: P.muted, lineHeight: "1.7" }}
            >
              {line}
            </div>
          ))}
          <div style={{ fontSize: "9px", color: P.muted, marginTop: "3px" }}>
            GSTIN: {COMPANY.gstin}
          </div>
          <div style={{ fontSize: "9px", color: P.muted }}>
            State: {COMPANY.state}
          </div>
        </div>

        {/* Document wordmark */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "24px",
              fontWeight: "800",
              color: P.text,
              letterSpacing: "3px",
              lineHeight: "1",
            }}
          >
            {documentTitle.toUpperCase()}
          </div>
          {documentNo ? (
            <div style={{ fontSize: "10px", color: P.muted, marginTop: "7px" }}>
              <span
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  fontSize: "8px",
                }}
              >
                No.
              </span>{" "}
              {documentNo}
            </div>
          ) : null}
          {documentDate ? (
            <div style={{ fontSize: "10px", color: P.muted, marginTop: "2px" }}>
              <span
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  fontSize: "8px",
                }}
              >
                Date.
              </span>{" "}
              {documentDate}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── 1px strong separator ── */}
      <div style={{ height: "1px", backgroundColor: P.ruleStrong }} />
    </div>
  );
}
