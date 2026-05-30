import { fmt, amountInWords } from "../../../utils/format";
import { MATERIAL_NAMES } from "../../../constants/gravureRates";
import PrintInvoice from "../../print/PrintInvoice";

/**
 * GravurePrintLayout — thin wrapper that maps Gravure result + form data
 * into the reusable PrintInvoice shell.
 *
 * For Flexo, follow the same pattern:
 *   1. Build `items`, `adjustments`, `metaRows`, `totalQty` from your result/form
 *   2. Render <PrintInvoice documentTitle="..." ... />
 */
export default function GravurePrintLayout({ result, form }) {
  if (!result) return null;

  const {
    materialLines,
    totalMaterialQty,
    printingRatePerKg,
    laminationRatePerKg,
    slittingRatePerKg,
    pouchRatePerKg,
    wastagePercent,
    wastageAmount,
    servicePercent,
    serviceAmount,
    adjustedTotal,
    pricePerKg,
  } = result;

  const roundedTotalAmount = Math.round(adjustedTotal || 0);
  const roundedPricePerKg = Math.round(pricePerKg || 0);
  const roundedTotalDisplay = roundedTotalAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const roundedPriceDisplay = roundedPricePerKg.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  /* ── Numbered line items ── */
  const items = [
    /* Materials (one row each) */
    ...materialLines.map((line) => {
      const micron = form.materials[line.key]?.micron;
      const baseName = MATERIAL_NAMES[line.key] ?? line.key;
      return {
        key: line.key,
        label: micron ? `${baseName} · ${micron}μ` : baseName,
        qty: line.qty,
        price: line.price,
        amount: line.amount,
      };
    }),
    /* Printing charges (single combined row) */
    printingRatePerKg > 0
      ? {
          key: "printing",
          label: "Printing Charges",
          qty: null,
          price: null,
          amount: printingRatePerKg,
        }
      : null,
    /* Lamination */
    laminationRatePerKg > 0
      ? {
          key: "lamination",
          label:
            form.lamination === "single"
              ? "Single Lamination"
              : "Double Lamination",
          qty: null,
          price: null,
          amount: laminationRatePerKg,
        }
      : null,
    /* Slitting */
    slittingRatePerKg > 0
      ? {
          key: "slitting",
          label: "Slitting",
          qty: null,
          price: null,
          amount: slittingRatePerKg,
        }
      : null,
    /* Pouch making */
    pouchRatePerKg > 0
      ? {
          key: "pouch",
          label: `Pouch Making (${form.pouchSize})`,
          qty: null,
          price: null,
          amount: pouchRatePerKg,
        }
      : null,
  ].filter(Boolean);

  /* ── Adjustment rows: wastage then service ── */
  const adjustments = [
    wastagePercent > 0
      ? {
          label: `Wastage @ ${wastagePercent}%`,
          amount: wastageAmount,
          bold: false,
        }
      : null,
    servicePercent > 0
      ? {
          label: `Service @ ${servicePercent}%`,
          amount: serviceAmount,
          bold: true,
        }
      : null,
  ].filter(Boolean);

  /* ── Meta rows for the parties panel ── */
  const laminationLabel =
    form.lamination === "single"
      ? "Single"
      : form.lamination === "double"
        ? "Double"
        : "None";

  const metaRows = [
    {
      label: "Normal Colors",
      value: form.normalColors || "0",
      label2: "Metallic Colors",
      value2: form.metallicColors || "0",
    },
    {
      label: "Matt Finish",
      value: form.mattFinish ? "Yes" : "No",
      label2: "Lamination",
      value2: laminationLabel,
    },
    {
      label: "Slitting",
      value: form.slitting ? "Yes" : "No",
      label2: "Pouch Size",
      value2: form.pouchSize || "—",
    },
    {
      label: "Total Qty",
      value: `${fmt(totalMaterialQty)} Kgs`,
      label2: "Price / Kg",
      value2: `₹ ${roundedPriceDisplay}`,
    },
  ];

  return (
    <PrintInvoice
      documentTitle="Gravure Quote"
      documentNo={null}
      documentDate={null}
      customer={form.quoteName?.trim()}
      metaRows={metaRows}
      items={items}
      adjustments={adjustments}
      totalQty={totalMaterialQty}
      totalAmount={roundedTotalAmount}
      totalAmountDisplay={roundedTotalDisplay}
      amountWords={amountInWords(roundedTotalAmount)}
      pricePerKg={roundedPricePerKg}
      pricePerKgDisplay={roundedPriceDisplay}
      pricePerKgWords={amountInWords(roundedPricePerKg)}
    />
  );
}
