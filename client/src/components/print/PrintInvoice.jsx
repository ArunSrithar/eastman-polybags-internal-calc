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
 *   GravurePrintLayout   → documentTitle = "Gravure Quote"
 *   FlexoPrintLayout     → documentTitle = "Flexo Quote"
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
 *   showTotalRow   — optional; controls TOTAL row visibility in items table
 *   amountWords    — INR amount in words string
 *   showAmountWords — optional; toggles total amount words block
 *   totalRowProminent — optional; toggles stronger TOTAL row styling
 *   pricePerKg     — optional; renders Rate per Kg badge in PrintTotals (Gravure/Flexo only)
 *   pricePerKgLabel — optional; label override for per-kg strip
 *   pricePerKgDisplay — optional; value string override for per-kg strip
 *   pricePerKgProminent — optional; renders per-kg value with stronger emphasis
 *   pricePerKgUnitSuffix — optional; unit suffix for per-kg value
 *   pricePerKgLabelIndent — optional; left indent for per-kg label
 *   pricePerKgWords — optional; renders per-kg amount in words in PrintTotals (Gravure/Flexo only)
 *   pricePerKgWordsProminent — optional; stronger typography for per-kg words block
 *   taxPercent          — optional; tax rate backed out of the total (Gravure/Flexo only). Omit/0 hides the strip.
 *   taxAmount           — optional; tax portion (₹)
 *   exclusiveAmount     — optional; total with tax excluded (₹)
 *   exclusiveLabel      — optional; label override for the exclusive-of-tax line
 *   footerShowBoxes     — optional; toggles footer 3-box panel
 *   footerShowCaption   — optional; toggles bottom caption
 *   totalAmountDisplay — optional; value string override for TOTAL row amount
 *   partyPrimaryLabel   — optional; defaults to Bill To / Consignee
 *   partyPrimaryValue   — optional; defaults to customer
 *   partySecondaryLabel — optional; defaults to Ship To / Buyer
 *   partySecondaryValue — optional; defaults to customer
 *   footerShowBoxes     — optional; toggles footer 3-box panel
 *   footerShowCaption   — optional; toggles bottom caption
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
  showTotalRow = true,
  amountWords,
  showAmountWords = true,
  totalRowProminent = true,
  pricePerKg,
  pricePerKgLabel,
  pricePerKgDisplay,
  pricePerKgProminent = false,
  pricePerKgUnitSuffix,
  pricePerKgLabelIndent,
  pricePerKgWords,
  pricePerKgWordsProminent = false,
  taxPercent,
  taxAmount,
  exclusiveAmount,
  exclusiveLabel,
  totalAmountDisplay,
  partyPrimaryLabel,
  partyPrimaryValue,
  partySecondaryLabel,
  partySecondaryValue,
  footerShowBoxes = true,
  footerShowCaption = true,
}) {
  return (
    <div
      className="hidden print:block"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        color: P.text,
        backgroundColor: P.white,
        padding: "0 6mm 10mm",
      }}
    >
      <PrintHeader
        documentTitle={documentTitle}
        documentNo={documentNo}
        documentDate={documentDate}
      />
      <PrintParties
        customer={customer}
        partyPrimaryLabel={partyPrimaryLabel}
        partyPrimaryValue={partyPrimaryValue}
        partySecondaryLabel={partySecondaryLabel}
        partySecondaryValue={partySecondaryValue}
        metaRows={metaRows}
      />
      <PrintItemsTable
        items={items}
        adjustments={adjustments}
        totalQty={totalQty}
        totalAmount={totalAmount}
        showTotalRow={showTotalRow}
        totalAmountDisplay={totalAmountDisplay}
        totalRowProminent={totalRowProminent}
      />
      <PrintTotals
        amountWords={amountWords}
        showAmountWords={showAmountWords}
        pricePerKg={pricePerKg}
        pricePerKgLabel={pricePerKgLabel}
        pricePerKgDisplay={pricePerKgDisplay}
        pricePerKgProminent={pricePerKgProminent}
        pricePerKgUnitSuffix={pricePerKgUnitSuffix}
        pricePerKgLabelIndent={pricePerKgLabelIndent}
        pricePerKgWords={pricePerKgWords}
        pricePerKgWordsProminent={pricePerKgWordsProminent}
        taxPercent={taxPercent}
        taxAmount={taxAmount}
        exclusiveAmount={exclusiveAmount}
        exclusiveLabel={exclusiveLabel}
      />
      <PrintFooter
        showBoxes={footerShowBoxes}
        showCaption={footerShowCaption}
      />
    </div>
  );
}
