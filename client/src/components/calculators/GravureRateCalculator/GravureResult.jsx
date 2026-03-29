import {
  MATERIAL_NAMES,
  NORMAL_COLOR_RATE,
  METALLIC_COLOR_RATE,
  MATT_FINISH_RATE,
} from "../../../constants/gravureRates";
import { fmt } from "../../../utils/format";
import { GravureIcon } from "../../ui/Icons";
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

export default function GravureResult({ result, form, status, date }) {
  if (!result) return <InvoiceEmpty />;

  const {
    materialLines,
    totalMaterialQty,
    totalMaterialCost,
    printingRatePerKg,
    laminationRatePerKg,
    slittingRatePerKg,
    pouchRatePerKg,
    totalCost,
    wastagePercent,
    wastageAmount,
    adjustedTotal,
    pricePerKg,
  } = result;

  const normalColors = parseInt(form.normalColors) || 0;
  const metallicColors = parseInt(form.metallicColors) || 0;
  const hasMattFinish = form.mattFinish;
  const laminationType =
    form.lamination === "single"
      ? "Single"
      : form.lamination === "double"
        ? "Double"
        : null;

  const hasPrinting = printingRatePerKg > 0;
  const otherChargesPerKg =
    laminationRatePerKg + slittingRatePerKg + pouchRatePerKg;
  const hasOtherCharges = otherChargesPerKg > 0;
  const hasWastage = wastagePercent > 0;

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="h-0.5 bg-tint shrink-0" />

      <InvoiceHeader
        icon={<GravureIcon className="size-4.5 text-tint" />}
        title="Eastman Colour Printers"
        subtitle="Gravure Rate Estimate"
        customer={form.quoteName?.trim()}
        status={status}
        date={date}
      />

      <TableHeader />

      {/* ── Materials ──────────────────────────────────────────────────── */}
      <SectionLabel color={SECTION_COLORS.blue} label="Materials" />
      {materialLines.map((line) => {
        const micron = form.materials[line.key]?.micron;
        const name = MATERIAL_NAMES[line.key] ?? line.key;
        const label = micron ? (
          <>
            {name}
            <span className="text-label-3 italic"> · {micron}μ</span>
          </>
        ) : (
          name
        );
        return (
          <ItemRow
            key={line.key}
            label={label}
            rate={line.price}
            qty={line.qty}
            amount={line.amount}
          />
        );
      })}
      <SectionSubtotal
        label="Materials subtotal"
        amount={totalMaterialCost}
        qty={totalMaterialQty}
      />

      {/* ── Printing ───────────────────────────────────────────────────── */}
      {hasPrinting ? (
        <>
          <SectionLabel color={SECTION_COLORS.green} label="Printing" />
          {normalColors > 0 ? (
            <ItemRow
              label="Normal Colors"
              rate={NORMAL_COLOR_RATE}
              qty={normalColors}
              unit="clr"
              amount={normalColors * NORMAL_COLOR_RATE}
            />
          ) : null}
          {metallicColors > 0 ? (
            <ItemRow
              label="Metallic Colors"
              rate={METALLIC_COLOR_RATE}
              qty={metallicColors}
              unit="clr"
              amount={metallicColors * METALLIC_COLOR_RATE}
            />
          ) : null}
          {hasMattFinish ? (
            <ItemRow label="Matt Finish" amount={MATT_FINISH_RATE} />
          ) : null}
          <SectionSubtotal
            label="Printing subtotal"
            amount={printingRatePerKg}
          />
        </>
      ) : null}

      {/* ── Other Charges ──────────────────────────────────────────────── */}
      {hasOtherCharges ? (
        <>
          <SectionLabel color={SECTION_COLORS.purple} label="Other Charges" />
          {laminationRatePerKg > 0 ? (
            <ItemRow
              label={`${laminationType} Lamination`}
              amount={laminationRatePerKg}
            />
          ) : null}
          {slittingRatePerKg > 0 ? (
            <ItemRow label="Slitting" amount={slittingRatePerKg} />
          ) : null}
          {pouchRatePerKg > 0 ? (
            <ItemRow
              label={`Pouch Making (${form.pouchSize})`}
              amount={pouchRatePerKg}
            />
          ) : null}
          <SectionSubtotal
            label="Other charges subtotal"
            amount={otherChargesPerKg}
          />
        </>
      ) : null}

      {/* ── Adjustments ────────────────────────────────────────────────── */}
      {hasWastage ? (
        <>
          <SectionLabel color={SECTION_COLORS.orange} label="Adjustments" />
          <WastageRow
            percent={wastagePercent}
            base={totalCost}
            amount={wastageAmount}
          />
        </>
      ) : null}

      <InvoiceFooter
        total={adjustedTotal}
        highlight={pricePerKg}
        highlightLabel="Price per kg"
        highlightUnit="/kg"
        annotation={`₹${fmt(adjustedTotal)} total / ${fmt(totalMaterialQty)} kg`}
      />
    </div>
  );
}
