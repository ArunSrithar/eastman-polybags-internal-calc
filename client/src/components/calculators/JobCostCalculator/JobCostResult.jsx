import { fmt } from "../../../utils/format";
import { JobCostIcon } from "../../ui/Icons";
import InvoiceHeader from "../../invoice/InvoiceHeader";
import InvoiceFooter from "../../invoice/InvoiceFooter";
import InvoiceEmpty from "../../invoice/InvoiceEmpty";
import TableHeader from "../../invoice/TableHeader";
import ItemRow from "../../invoice/ItemRow";
import SectionLabel from "../../invoice/SectionLabel";
import SectionSubtotal from "../../invoice/SectionSubtotal";
import { SECTION_COLORS } from "../../../constants/invoiceColors";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const MATERIAL_KEYS = new Set([
  "polyster",
  "silverPolyster",
  "boppSilver",
  "ldnLdop",
]);
const CHARGE_KEYS = new Set([
  "printingCharges",
  "laminationCharges",
  "slittingCharges",
  "pouchMakingCharges",
]);

function sumSection(items) {
  return items.reduce((s, i) => s + i.amount, 0);
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function JobCostResult({ result, form, status, date }) {
  if (!result) {
    return (
      <InvoiceEmpty
        message="No breakdown yet"
        hint="Enter item quantities and despatch weight to see the cost breakdown."
      />
    );
  }

  const {
    enabledItems,
    totalAmount,
    finishedWeight,
    dispatchWeight,
    costOfJob,
  } = result;

  const materials = enabledItems.filter((i) => MATERIAL_KEYS.has(i.key));
  const charges = enabledItems.filter((i) => CHARGE_KEYS.has(i.key));
  const other = enabledItems.filter(
    (i) => !MATERIAL_KEYS.has(i.key) && !CHARGE_KEYS.has(i.key),
  );

  const materialTotal = sumSection(materials);
  const chargeTotal = sumSection(charges);
  const otherTotal = sumSection(other);

  const meta = [
    form.jobCardNo ? { label: "Job Card", value: form.jobCardNo } : null,
    form.jobWorkCompany
      ? { label: "Company", value: form.jobWorkCompany }
      : null,
    form.film ? { label: "Film", value: form.film } : null,
    form.micron ? { label: "Micron", value: `${form.micron}μ` } : null,
    form.noOfColours ? { label: "Colours", value: form.noOfColours } : null,
  ].filter(Boolean);

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="h-0.5 bg-tint shrink-0" />

      <InvoiceHeader
        icon={<JobCostIcon className="size-4.5 text-tint" />}
        title="Eastman Colour Printers"
        subtitle="Job Cost Estimate"
        customer={form.quoteName?.trim()}
        status={status}
        date={date}
        meta={meta}
      />

      <TableHeader />

      {/* ── Materials ──────────────────────────────────────────────────── */}
      {materials.length > 0 ? (
        <>
          <SectionLabel color={SECTION_COLORS.blue} label="Materials" />
          {materials.map((item) => (
            <ItemRow
              key={item.key}
              label={item.label}
              rate={item.price}
              qty={item.qty}
              amount={item.amount}
            />
          ))}
          <SectionSubtotal label="Materials subtotal" amount={materialTotal} />
        </>
      ) : null}

      {/* ── Charges ────────────────────────────────────────────────────── */}
      {charges.length > 0 ? (
        <>
          <SectionLabel color={SECTION_COLORS.green} label="Charges" />
          {charges.map((item) => (
            <ItemRow
              key={item.key}
              label={item.label}
              rate={item.price}
              qty={item.qty}
              amount={item.amount}
            />
          ))}
          <SectionSubtotal label="Charges subtotal" amount={chargeTotal} />
        </>
      ) : null}

      {/* ── Other (flat charges) ───────────────────────────────────────── */}
      {other.length > 0 ? (
        <>
          <SectionLabel color={SECTION_COLORS.orange} label="Other" />
          {other.map((item) => (
            <ItemRow key={item.key} label={item.label} amount={item.amount} />
          ))}
          <SectionSubtotal label="Other subtotal" amount={otherTotal} />
        </>
      ) : null}

      <InvoiceFooter
        total={totalAmount}
        highlight={costOfJob}
        highlightLabel="Cost of Job"
        highlightUnit="/kg"
        annotation={`₹${fmt(totalAmount)} total ÷ ${fmt(dispatchWeight)} kg despatch${finishedWeight > 0 ? ` · ${fmt(finishedWeight)} kg finished` : ""}`}
      />
    </div>
  );
}
