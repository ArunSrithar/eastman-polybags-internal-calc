import { fmt, amountInWords } from "../../../utils/format";
import { formatPrintDate } from "../../print/printTokens";
import PrintInvoice from "../../print/PrintInvoice";

const FLAT_KEYS = new Set(["packingCharges", "transportCharge"]);

/**
 * JobCostPrintLayout — thin wrapper that maps Job Cost result + form data
 * into the reusable PrintInvoice shell.
 *
 * For Gravure and Flexo print layouts, follow the same pattern:
 *   1. Build `items`, `adjustments`, `metaRows`, `totalQty` from your result/form
 *   2. Render <PrintInvoice documentTitle="..." ... />
 */
export default function JobCostPrintLayout({ result, form }) {
  if (!result) return null;

  const {
    enabledItems,
    wastagePercent,
    wastageAmount,
    totalAmount,
    dispatchWeight,
    finishedWeight,
  } = result;

  /* ── Numbered line items (exclude flat-charge keys) ── */
  const items = enabledItems
    .filter((item) => !FLAT_KEYS.has(item.key))
    .map((item) => ({
      key: item.key,
      label: item.label,
      qty: item.hasQty && item.qty > 0 ? item.qty : null,
      price: item.hasQty ? item.price : null,
      amount: item.amount,
    }));

  /* ── Flat charges (packing, transport) ── */
  const flatItems = enabledItems.filter((item) => FLAT_KEYS.has(item.key));

  /* ── Adjustment rows: wastage first, then flat charges ── */
  const adjustments = [
    wastagePercent > 0
      ? { label: `Wastage @ ${wastagePercent}%`, amount: wastageAmount }
      : null,
    ...flatItems.map((r) => ({ label: r.label, amount: r.amount, bold: true })),
  ].filter(Boolean);

  const totalQty = enabledItems
    .filter((i) => i.hasQty && i.qty)
    .reduce((s, i) => s + i.qty, 0);

  /* ── Meta rows for the parties panel ── */
  const metaRows = [
    {
      label: "Invoice No.",
      value: form.billingNo,
      label2: "Dated",
      value2: formatPrintDate(form.billingDate),
    },
    {
      label: "Job Card No.",
      value: form.jobCardNo,
      label2: "Job Card Date",
      value2: formatPrintDate(form.jobCardDate),
    },
    {
      label: "Total Bundles",
      value: form.noOfBundles,
      label2: "Dispatched through",
      value2: form.jobWorkCompany,
    },
    {
      label: "Film",
      value: form.film,
      label2: "Micron",
      value2: form.micron ? `${form.micron}μ` : "",
    },
    {
      label: "No. of Colours",
      value: form.noOfColours,
      label2: "Billing Rate",
      value2: form.billingRate ? `₹ ${fmt(form.billingRate)}` : "",
    },
    {
      label: "Despatch Weight",
      value: dispatchWeight > 0 ? `${fmt(dispatchWeight)} Kgs` : "",
      label2: "Finished Weight",
      value2: finishedWeight > 0 ? `${fmt(finishedWeight)} Kgs` : "",
    },
  ];

  return (
    <PrintInvoice
      documentTitle="Job Cost Sheet"
      documentNo={form.billingNo}
      documentDate={formatPrintDate(form.billingDate)}
      customer={form.quoteName?.trim()}
      metaRows={metaRows}
      items={items}
      adjustments={adjustments}
      totalQty={totalQty}
      totalAmount={totalAmount}
      amountWords={amountInWords(totalAmount)}
    />
  );
}
