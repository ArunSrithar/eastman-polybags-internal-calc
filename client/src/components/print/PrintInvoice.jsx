import { P } from "./printTokens";
import PrintHeader from "./PrintHeader";
import PrintParties from "./PrintParties";
import PrintItemsTable from "./PrintItemsTable";
import PrintTotals from "./PrintTotals";
import PrintFooter from "./PrintFooter";

/**
 * PrintInvoice — generic print invoice shell.
 *
 * Composes the 5 primitives into a complete A4 print layout.
 * Hidden on screen (`hidden print:block`), visible only during @media print.
 * All styling is inline — no Tailwind classes inside — for print reliability.
 *
 * Reused by:
 *   JobCostPrintLayout   → documentTitle = "Job Cost Sheet"
 *   GravurePrintLayout   → documentTitle = "Gravure Quote"   (future)
 *   FlexoPrintLayout     → documentTitle = "Flexo Quote"     (future)
 *
 * Props:
 *   documentTitle  — e.g. "Job Cost Sheet"
 *   documentNo     — invoice / quote number string
 *   documentDate   — pre-formatted date string (DD-Mon-YY)
 *   customer       — customer / quote name
 *   metaRows       — Array<{ label, value, label2?, value2? }>
 *   items          — Array<{ key, label, qty, price, per, amount }>
 *   adjustments    — Array<{ label, amount }> (wastage, packing, transport, service …)
 *   totalQty       — grand total quantity (0 = blank cell)
 *   totalAmount    — grand total amount number
 *   amountWords    — INR amount in words string
 *   pricePerKg     — optional; renders Rate per Kg badge in PrintTotals (Gravure/Flexo only)
 *   pricePerKgWords — optional; renders per-kg amount in words in PrintTotals (Gravure/Flexo only)
 */
export default function PrintInvoice({
  documentTitle,
  documentNo,
  documentDate,
  customer,
  metaRows,
  items,
  adjustments,
  totalQty,
  totalAmount,
  amountWords,
  pricePerKg,
  pricePerKgWords,
}) {
  return (
    <div
      className="hidden print:block"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        color: P.text,
        backgroundColor: P.white,
        padding: "0 10mm 10mm",
      }}
    >
      <PrintHeader
        documentTitle={documentTitle}
        documentNo={documentNo}
        documentDate={documentDate}
      />
      <PrintParties customer={customer} metaRows={metaRows} />
      <PrintItemsTable
        items={items}
        adjustments={adjustments}
        totalQty={totalQty}
        totalAmount={totalAmount}
      />
      <PrintTotals
        amountWords={amountWords}
        pricePerKg={pricePerKg}
        pricePerKgWords={pricePerKgWords}
      />
      <PrintFooter />
    </div>
  );
}
