import { MATERIAL_NAMES } from "../../../constants/gravureRates";
import { fmt } from "../../../utils/format";
import { GravureIcon, CompanyIcon } from "../../ui/Icons";
import InvoiceHeader from "../../invoice/InvoiceHeader";
import InvoiceFooter from "../../invoice/InvoiceFooter";
import InvoiceEmpty from "../../invoice/InvoiceEmpty";
import TableHeader from "../../invoice/TableHeader";
import ItemRow from "../../invoice/ItemRow";
import SectionLabel from "../../invoice/SectionLabel";
import SectionSubtotal from "../../invoice/SectionSubtotal";
import WastageRow from "../../invoice/WastageRow";
import { SECTION_COLORS } from "../../../constants/invoiceColors";
import { visibleCompanyName } from "./companyDisplay";
import { getPouchTypeLabel } from "../../../constants/pouchTypes";

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
    slittingCharge,
    pouchCharge,
    totalCost,
    wastagePercent,
    wastageAmount,
    preServiceTotal,
    basePricePerKg,
    servicePercent,
    serviceAmount,
    pricePerKg,
    selectedRates,
    selectedCompanies,
    selectedPouchType,
  } = result;

  const normalColorRate = selectedRates?.normalColorRate ?? 0;
  const metallicColorRate = selectedRates?.metallicColorRate ?? 0;
  const mattFinishRate = selectedRates?.mattFinishRate ?? 0;

  const normalColors = parseInt(form.normalColors) || 0;
  const metallicColorsEnabled =
    typeof form.metallicColorsEnabled === "boolean"
      ? form.metallicColorsEnabled
      : (parseInt(form.metallicColors) || 0) > 0;
  const hasMattFinish = form.mattFinish;
  const laminationType =
    form.lamination === "single"
      ? "Single"
      : form.lamination === "double"
        ? "Double"
        : null;

  const hasPrinting = printingRatePerKg > 0;
  const slittingAmount = slittingCharge ?? slittingRatePerKg;
  const pouchAmount = pouchCharge ?? pouchRatePerKg;
  const otherChargesTotal = laminationRatePerKg + slittingAmount + pouchAmount;
  const hasOtherCharges = otherChargesTotal > 0;
  const hasWastage = wastagePercent > 0;
  const hasService = servicePercent > 0;

  function companySuffix(name) {
    const visibleName = visibleCompanyName(name);
    if (!visibleName) return null;

    return (
      <span className="inline-flex items-center gap-1 text-label-3 ml-1.5 align-middle">
        <CompanyIcon className="size-3.5" />
        <span>{visibleName}</span>
      </span>
    );
  }

  function companyLabel(baseLabel, companyName) {
    const suffix = companySuffix(companyName);
    if (!suffix) return baseLabel;

    return (
      <>
        {baseLabel}
        {suffix}
      </>
    );
  }

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
              label={companyLabel("Normal Colors", selectedCompanies?.normalColor)}
              rate={normalColorRate}
              qty={normalColors}
              unit="clr"
              amount={normalColors * normalColorRate}
            />
          ) : null}
          {metallicColorsEnabled ? (
            <ItemRow
              label={companyLabel("Metallic Colors", selectedCompanies?.metallicColor)}
              amount={metallicColorRate}
            />
          ) : null}
          {hasMattFinish ? (
            <ItemRow
              label={companyLabel("Matt Finish", selectedCompanies?.mattFinish)}
              amount={mattFinishRate}
            />
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
              label={companyLabel(
                `${laminationType} Lamination`,
                laminationType === "Single"
                  ? selectedCompanies?.singleLamination
                  : selectedCompanies?.doubleLamination,
              )}
              amount={laminationRatePerKg}
            />
          ) : null}
          {slittingAmount > 0 ? (
            <ItemRow
              label={companyLabel("Slitting", selectedCompanies?.slitting)}
              rate={slittingRatePerKg}
              qty={totalMaterialQty}
              amount={slittingAmount}
            />
          ) : null}
          {pouchAmount > 0 ? (
            <ItemRow
              label={companyLabel(
                `Pouch Making (${form.pouchSize}${form.pouchType ? ` · ${getPouchTypeLabel(selectedPouchType)}` : ""})`,
                selectedCompanies?.pouch,
              )}
              rate={pouchRatePerKg}
              qty={totalMaterialQty}
              amount={pouchAmount}
            />
          ) : null}
          <SectionSubtotal
            label="Other charges subtotal"
            amount={otherChargesTotal}
          />
        </>
      ) : null}

      {/* ── Adjustments ────────────────────────────────────────────────── */}
      {hasWastage || hasService ? (
        <SectionLabel color={SECTION_COLORS.orange} label="Adjustments" />
      ) : null}
      {hasWastage ? (
        <WastageRow
          percent={wastagePercent}
          base={totalCost}
          amount={wastageAmount}
        />
      ) : null}
      <div className="flex items-baseline justify-between px-6 py-1.5">
        <span className="text-sm text-label">
          Base Price/Kg
          <span className="text-xs text-label-3 ml-1.5">
            from ₹{fmt(preServiceTotal)} / {fmt(totalMaterialQty)} kg
          </span>
        </span>
        <span className="text-sm font-medium text-label tabular-nums">
          ₹{fmt(basePricePerKg)}
        </span>
      </div>
      <div className="divider mx-3 mt-1" />
      {hasService ? (
        <WastageRow
          percent={servicePercent}
          base={basePricePerKg}
          amount={serviceAmount}
          label="Service/Kg"
        />
      ) : null}

      <InvoiceFooter
        total={preServiceTotal}
        highlight={pricePerKg}
        highlightLabel="Price per Kg"
        highlightUnit="/kg"
        annotation={`Base ₹${fmt(basePricePerKg)}/kg + Service ₹${fmt(serviceAmount)}/kg`}
        showTotal={false}
      />
    </div>
  );
}
