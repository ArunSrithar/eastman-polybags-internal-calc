import { fmt } from "../../../utils/format";
import { FlexoIcon } from "../../ui/Icons";
import InvoiceHeader from "../../invoice/InvoiceHeader";
import InvoiceFooter from "../../invoice/InvoiceFooter";
import InvoiceEmpty from "../../invoice/InvoiceEmpty";
import TableHeader from "../../invoice/TableHeader";
import ItemRow from "../../invoice/ItemRow";
import SectionLabel from "../../invoice/SectionLabel";
import SectionSubtotal from "../../invoice/SectionSubtotal";
import WastageRow from "../../invoice/WastageRow";
import { SECTION_COLORS } from "../../../constants/invoiceColors";

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function FlexoResult({ result, form, status, date }) {
  if (!result) {
    return (
      <InvoiceEmpty
        message="No breakdown yet"
        hint="Enter a material price to see the rate breakdown."
      />
    );
  }

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
    subtotal,
    wastagePercent,
    wastageAmount,
    totalRate,
  } = result;

  const materialSubtotal = materialPrice + conversionRate + rollSizeRate;
  const hasPrinting = printingRate > 0;
  const additionalTotal =
    gussetRate + punchingRate + opackRate + cuttingSizeRate;
  const hasAdditional = additionalTotal > 0;
  const hasWastage = wastagePercent > 0;

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="h-0.5 bg-tint shrink-0" />

      <InvoiceHeader
        icon={<FlexoIcon className="size-4.5 text-tint" />}
        title="Eastman Colour Printers"
        subtitle="Flexo Rate Estimate"
        customer={form.quoteName?.trim()}
        status={status}
        date={date}
      />

      <TableHeader />

      {/* ── Material & Conversion ──────────────────────────────────────── */}
      <SectionLabel
        color={SECTION_COLORS.blue}
        label="Material &amp; Conversion"
      />
      <ItemRow label="Material Price" amount={materialPrice} />
      {conversionRate > 0 ? (
        <ItemRow
          label={
            <>
              Conversion
              <span className="text-label-3 italic">
                {" "}
                · {conversionMaterial} / {rollSize}
              </span>
            </>
          }
          amount={conversionRate}
        />
      ) : null}
      {rollSizeRate > 0 ? (
        <ItemRow
          label={
            <>
              Roll Size Rate
              <span className="text-label-3 italic">
                {" "}
                · {conversionMaterial} / {rollSize}
              </span>
            </>
          }
          amount={rollSizeRate}
        />
      ) : null}
      <SectionSubtotal label="Material subtotal" amount={materialSubtotal} />

      {/* ── Printing ───────────────────────────────────────────────────── */}
      {hasPrinting ? (
        <>
          <SectionLabel color={SECTION_COLORS.green} label="Printing" />
          <ItemRow
            label={
              <>
                Printing
                <span className="text-label-3 italic">
                  {" "}
                  · {coverSize} × {printingColors} clr
                </span>
              </>
            }
            amount={printingRate}
          />
          <SectionSubtotal label="Printing subtotal" amount={printingRate} />
        </>
      ) : null}

      {/* ── Additional Charges ─────────────────────────────────────────── */}
      {hasAdditional ? (
        <>
          <SectionLabel
            color={SECTION_COLORS.purple}
            label="Additional Charges"
          />
          {gussetRate > 0 ? (
            <ItemRow
              label={
                <>
                  Gusset
                  <span className="text-label-3 italic"> · {coverSize}</span>
                </>
              }
              amount={gussetRate}
            />
          ) : null}
          {cuttingSizeRate > 0 ? (
            <ItemRow
              label={
                <>
                  Cutting
                  <span className="text-label-3 italic"> · {coverSize}</span>
                </>
              }
              amount={cuttingSizeRate}
            />
          ) : null}
          {punchingRate > 0 ? (
            <ItemRow label="Punching" amount={punchingRate} />
          ) : null}
          {opackRate > 0 ? <ItemRow label="Opack" amount={opackRate} /> : null}
          <SectionSubtotal
            label="Additional subtotal"
            amount={additionalTotal}
          />
        </>
      ) : null}

      {/* ── Adjustments ────────────────────────────────────────────────── */}
      {hasWastage ? (
        <>
          <SectionLabel color={SECTION_COLORS.orange} label="Adjustments" />
          <WastageRow
            percent={wastagePercent}
            base={subtotal}
            amount={wastageAmount}
          />
        </>
      ) : null}

      <InvoiceFooter
        total={totalRate}
        highlight={totalRate}
        highlightLabel="Total Rate"
        highlightUnit=""
        annotation={`₹${fmt(subtotal)} subtotal + ₹${fmt(wastageAmount)} wastage`}
      />
    </div>
  );
}
