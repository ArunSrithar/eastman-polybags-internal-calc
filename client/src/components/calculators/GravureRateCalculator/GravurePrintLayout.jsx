import { fmt, amountInWords } from "../../../utils/format";
import { MATERIAL_NAMES } from "../../../constants/gravureRates";
import PrintInvoice from "../../print/PrintInvoice";
import { CompanyIcon } from "../../ui/Icons";
import { isOwnGravureCompany, visibleCompanyName } from "./companyDisplay";
import { useAuth } from "../../../context/AuthContext";

/**
 * GravurePrintLayout — thin wrapper that maps Gravure result + form data
 * into the reusable PrintInvoice shell.
 *
 * For Flexo, follow the same pattern:
 *   1. Build `items`, `adjustments`, `metaRows`, `totalQty` from your result/form
 *   2. Render <PrintInvoice documentTitle="..." ... />
 */
export default function GravurePrintLayout({ result, form }) {
  const { user } = useAuth();

  if (!result) return null;

  const {
    materialLines,
    totalMaterialQty,
    laminationRatePerKg,
    slittingRatePerKg,
    pouchRatePerKg,
    wastagePercent,
    wastageAmount,
    preServiceTotal,
    basePricePerKg,
    servicePercent,
    serviceAmount,
    adjustedTotal,
    pricePerKg,
    selectedCompanies,
    selectedRates,
  } = result;

  const normalColors = Number(form.normalColors || 0);
  const metallicColors = Number(form.metallicColors || 0);
  const normalColorRate = Number(selectedRates?.normalColorRate ?? 0);
  const metallicColorRate = Number(selectedRates?.metallicColorRate ?? 0);
  const mattFinishRate = Number(selectedRates?.mattFinishRate ?? 0);

  function companySubtitle(name) {
    const visibleName = visibleCompanyName(name);
    if (!visibleName) return undefined;

    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <CompanyIcon className="w-3 h-3" />
        <span>{visibleName}</span>
      </span>
    );
  }

  function companyMetaValue(name) {
    if (!name) return "—";
    if (isOwnGravureCompany(name)) return "Own";
    return name;
  }

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
  const generatedBy = user?.username?.trim() || "System";
  const documentDateTime = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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
    /* Printing charges */
    normalColors > 0
      ? {
        key: "printing-normal",
        label: "Normal Colors",
        subtitle: companySubtitle(selectedCompanies?.normalColor),
        qty: normalColors,
        price: normalColorRate,
        amount: normalColors * normalColorRate,
      }
      : null,
    metallicColors > 0
      ? {
        key: "printing-metallic",
        label: "Metallic Colors",
        subtitle: companySubtitle(selectedCompanies?.metallicColor),
        qty: metallicColors,
        price: metallicColorRate,
        amount: metallicColors * metallicColorRate,
      }
      : null,
    form.mattFinish
      ? {
        key: "printing-matt",
        label: "Matt Finish",
        subtitle: companySubtitle(selectedCompanies?.mattFinish),
        qty: null,
        price: null,
        amount: mattFinishRate,
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
        subtitle:
          form.lamination === "single"
            ? companySubtitle(selectedCompanies?.singleLamination)
            : companySubtitle(selectedCompanies?.doubleLamination),
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
        subtitle: companySubtitle(selectedCompanies?.slitting),
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
    {
      label: "Total Cost",
      amount: preServiceTotal,
      bold: true,
    },
    {
      type: "divider",
    },
    {
      label: `Base Price / Kg @ ${fmt(totalMaterialQty)} Kgs`,
      amount: basePricePerKg,
      bold: false,
    },
    servicePercent > 0
      ? {
        label: `Service/Kg @ ${servicePercent}%`,
        amount: serviceAmount,
        bold: true,
      }
      : null,
  ].filter(Boolean);

  /* ── Processed metadata: only info not in line items or requiring summary ── */
  const laminationLabel =
    form.lamination === "single"
      ? "Single"
      : form.lamination === "double"
        ? "Double"
        : "None";

  const slittingLabel = form.slitting ? "Yes" : "No";
  const pouchLabel = form.pouchSize || "—";

  /* Only show: lamination decision, company assignments, and price/kg result */
  const metaRows = [
    {
      label: "Lamination",
      value: laminationLabel,
      label2: "Print Co.",
      value2: companyMetaValue(selectedCompanies?.normalColor),
    },
    {
      label: "Slitting",
      value: slittingLabel,
      label2: "Lam Co.",
      value2:
        form.lamination === "single"
          ? companyMetaValue(selectedCompanies?.singleLamination)
          : form.lamination === "double"
            ? companyMetaValue(selectedCompanies?.doubleLamination)
            : "—",
    },
    {
      label: "Pouch",
      value: pouchLabel,
      label2: "Slit Co.",
      value2: companyMetaValue(selectedCompanies?.slitting),
    },
    {
      label: "Total Weight",
      value: `${fmt(totalMaterialQty)} Kgs`,
      label2: "Price / Kg",
      value2: `₹ ${roundedPriceDisplay}`,
    },
  ];

  return (
    <PrintInvoice
      documentTitle="Gravure Quote"
      documentNo={null}
      documentDate={documentDateTime}
      customer={form.quoteName?.trim()}
      partyPrimaryLabel="CUSTOMER"
      partyPrimaryValue={form.quoteName?.trim()}
      partySecondaryLabel="PREPARED BY"
      partySecondaryValue={generatedBy}
      metaRows={metaRows}
      items={items}
      adjustments={adjustments}
      totalQty={totalMaterialQty}
      totalAmount={roundedTotalAmount}
      showTotalRow={false}
      showAmountWords={false}
      totalAmountDisplay={roundedTotalDisplay}
      amountWords={amountInWords(roundedTotalAmount)}
      pricePerKg={roundedPricePerKg}
      pricePerKgDisplay={roundedPriceDisplay}
      pricePerKgWords={amountInWords(roundedPricePerKg)}
      footerShowBoxes={false}
    />
  );
}
