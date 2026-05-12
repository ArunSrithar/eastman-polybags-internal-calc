/**
 * B&W print design tokens — single source of truth for all print layouts.
 * No colour values — designed for monochrome laser/inkjet printers.
 *
 * Used by: PrintHeader, PrintParties, PrintItemsTable, PrintTotals, PrintFooter
 * Consumed by: JobCostPrintLayout (and future GravurePrintLayout, FlexoPrintLayout)
 */
export const P = {
  text: "#1a1a1a", // primary body text
  muted: "#666666", // labels, captions, secondary text
  soft: "#999999", // tertiary / footer notes
  panel: "#f3f3f3", // grey fill — Bill To block, tfoot total row
  stripe: "#f7f7f7", // subtle alternating table row tint
  rule: "#d4d4d4", // hairline dividers between rows/sections
  ruleStrong: "#1a1a1a", // heavy rule — top accent stripe, table header underline
  white: "#ffffff",
};

/** Format YYYY-MM-DD → DD-Mon-YY (e.g. "26-May-26") */
export function formatPrintDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return (
    String(d.getDate()).padStart(2, "0") +
    "-" +
    d.toLocaleString("en-IN", { month: "short" }) +
    "-" +
    String(d.getFullYear()).slice(2)
  );
}
