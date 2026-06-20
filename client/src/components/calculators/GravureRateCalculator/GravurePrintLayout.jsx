import { fmt, amountInWords } from "../../../utils/format";
import { MATERIAL_NAMES } from "../../../constants/gravureRates";
import PrintInvoice from "../../print/PrintInvoice";
import { CompanyIcon } from "../../ui/Icons";
import { isOwnGravureCompany, visibleCompanyName } from "./companyDisplay";

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
    laminationRatePerKg,
    slittingRatePerKg,
    pouchRatePerKg,
    wastagePercent,
    wastageAmount,
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
      label: "Print Co.",
      value: companyMetaValue(selectedCompanies?.normalColor),
      label2: "Pouch Size",
      value2: form.pouchSize || "—",
    },
    {
      label: "Lam / Slit Co.",
      value:
        form.lamination === "single"
          ? companyMetaValue(selectedCompanies?.singleLamination)
          : form.lamination === "double"
            ? companyMetaValue(selectedCompanies?.doubleLamination)
            : companyMetaValue(selectedCompanies?.slitting),
      label2: "Slitting",
      value2: form.slitting ? "Yes" : "No",
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
      footerShowBoxes={false}
    />
  );
}
