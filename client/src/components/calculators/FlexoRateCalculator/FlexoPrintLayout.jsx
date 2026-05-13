import { amountInWords } from "../../../utils/format";
import PrintInvoice from "../../print/PrintInvoice";

/**
 * FlexoPrintLayout — thin wrapper that maps Flexo result + form data
 * into the reusable PrintInvoice shell.
 *
 * For Job Cost and Gravure equivalents, see:
 *   JobCostPrintLayout.jsx / GravurePrintLayout.jsx
 */
export default function FlexoPrintLayout({ result, form }) {
  if (!result) return null;

  const {
    materialPrice,
    conversionMaterial,
    conversionRate,
    rollSize,
    rollSizeRate,
    coverSize,
    printingColors,
    printingRate,
    gussetRate,
    punchingRate,
    opackRate,
    cuttingSizeRate,
    wastagePercent,
    wastageAmount,
    servicePercent,
    serviceAmount,
    totalRate,
  } = result;

  /* ── Numbered line items ── */
  const items = [
    /* Material base price */
    {
      key: "material",
      label: "Material Price",
      qty: null,
      price: null,
      amount: materialPrice,
    },

    /* Conversion */
    conversionRate > 0
      ? {
          key: "conversion",
          label: conversionMaterial
            ? `Conversion — ${conversionMaterial}${rollSize ? ` (${rollSize})` : ""}`
            : "Conversion",
          qty: null,
          price: null,
          amount: conversionRate,
        }
      : null,

    /* Roll size surcharge */
    rollSizeRate > 0
      ? {
          key: "rollSize",
          label: `Roll Size (${rollSize || "—"})`,
          qty: null,
          price: null,
          amount: rollSizeRate,
        }
      : null,

    /* Printing */
    printingRate > 0
      ? {
          key: "printing",
          label: `Printing — ${printingColors} Colour${parseInt(printingColors) !== 1 ? "s" : ""}${coverSize ? ` (${coverSize})` : ""}`,
          qty: null,
          price: null,
          amount: printingRate,
        }
      : null,

    /* Gusset */
    gussetRate > 0
      ? {
          key: "gusset",
          label: "Gusset",
          qty: null,
          price: null,
          amount: gussetRate,
        }
      : null,

    /* Punching */
    punchingRate > 0
      ? {
          key: "punching",
          label: "Punching",
          qty: null,
          price: null,
          amount: punchingRate,
        }
      : null,

    /* O-Pack */
    opackRate > 0
      ? {
          key: "opack",
          label: "O-Pack",
          qty: null,
          price: null,
          amount: opackRate,
        }
      : null,

    /* Cutting */
    cuttingSizeRate > 0
      ? {
          key: "cutting",
          label: `Cutting${coverSize ? ` (${coverSize})` : ""}`,
          qty: null,
          price: null,
          amount: cuttingSizeRate,
        }
      : null,
  ].filter(Boolean);

  /* ── Adjustment rows: wastage (italic) then service (bold) ── */
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
  const metaRows = [
    {
      label: "Material",
      value: conversionMaterial || "—",
      label2: "Cover Size",
      value2: coverSize || "—",
    },
    {
      label: "Roll Size",
      value: rollSize || "—",
      label2: "Print Colours",
      value2: printingColors || "—",
    },
    {
      label: "Gusset",
      value: form.gusset ? "Yes" : "No",
      label2: "Punching",
      value2: form.punching ? "Yes" : "No",
    },
    {
      label: "O-Pack",
      value: form.opack ? "Yes" : "No",
      label2: "Cutting",
      value2: form.cutting ? "Yes" : "No",
    },
  ];

  return (
    <PrintInvoice
      documentTitle="Flexo Quote"
      documentNo={null}
      documentDate={null}
      customer={form.quoteName?.trim()}
      metaRows={metaRows}
      items={items}
      adjustments={adjustments}
      totalQty={0}
      totalAmount={totalRate}
      amountWords={amountInWords(totalRate)}
    />
  );
}
