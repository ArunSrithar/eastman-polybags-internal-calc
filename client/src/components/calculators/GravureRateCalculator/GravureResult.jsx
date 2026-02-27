import { useState } from "react";
import { fmt } from "../../../utils/format";
import { ChevronDownIcon } from "../../ui/Icons";
import { MATERIAL_NAMES } from "../../../constants/gravureRates";

function Row({ label, sub, right, highlight }) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${highlight ? "text-label font-medium" : "text-label-2"}`}
    >
      <div>
        <span className="text-sm">{label}</span>
        {sub && <p className="text-xs text-label-3 mt-0.5">{sub}</p>}
      </div>
      <span
        className={`text-sm font-mono ${highlight ? "text-label font-semibold" : ""}`}
      >
        {right}
      </span>
    </div>
  );
}

export default function GravureResult({ result, cardRef }) {
  const [open, setOpen] = useState(false);

  if (!result) return null;

  const {
    materialLines,
    totalMaterialQty,
    totalMaterialCost,
    printingCost,
    printingRatePerKg,
    laminationCost,
    laminationRatePerKg,
    slittingCost,
    slittingRatePerKg,
    pouchCost,
    pouchRatePerKg,
    totalCost,
    wastagePercent,
    wastageAmount,
    adjustedTotal,
    pricePerKg,
  } = result;

  return (
    <div ref={cardRef} className="card mt-4">
      {/* Header — toggles collapse */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="card-section flex items-center justify-between w-full cursor-pointer hover:bg-fill-3 transition-colors rounded-t-2xl"
      >
        <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
          Calculation Breakdown
        </p>
        <ChevronDownIcon
          className={`text-label-3 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* Collapsible body */}
      {open && (
        <>
          <div className="divider mx-4" />

          {/* Material lines */}
          <div className="card-section pt-0">
            <p className="text-xs font-semibold text-label-3 uppercase tracking-wide mb-1">
              Materials
            </p>
            {materialLines.map((m) => (
              <Row
                key={m.key}
                label={MATERIAL_NAMES[m.key]}
                sub={`${fmt(m.qty)} kg × ₹${fmt(m.price)}`}
                right={`₹${fmt(m.amount)}`}
              />
            ))}
            <div className="divider my-1" />
            <Row
              label="Total Material"
              sub={`${fmt(totalMaterialQty)} kg`}
              right={`₹${fmt(totalMaterialCost)}`}
              highlight
            />
          </div>

          {/* Charges */}
          {(printingCost > 0 ||
            laminationCost > 0 ||
            slittingCost > 0 ||
            pouchCost > 0) && (
            <>
              <div className="divider mx-4" />
              <div className="card-section">
                <p className="text-xs font-semibold text-label-3 uppercase tracking-wide mb-1">
                  Charges
                </p>
                {printingCost > 0 && (
                  <Row
                    label="Printing"
                    sub={`₹${fmt(printingRatePerKg)}/kg`}
                    right={`₹${fmt(printingCost)}`}
                  />
                )}
                {laminationCost > 0 && (
                  <Row
                    label="Lamination"
                    sub={`₹${fmt(laminationRatePerKg)}/kg`}
                    right={`₹${fmt(laminationCost)}`}
                  />
                )}
                {slittingCost > 0 && (
                  <Row
                    label="Slitting"
                    sub={`₹${fmt(slittingRatePerKg)}/kg`}
                    right={`₹${fmt(slittingCost)}`}
                  />
                )}
                {pouchCost > 0 && (
                  <Row
                    label="Pouch"
                    sub={`₹${fmt(pouchRatePerKg)}/kg`}
                    right={`₹${fmt(pouchCost)}`}
                  />
                )}
              </div>
            </>
          )}

          {/* Wastage */}
          {wastagePercent > 0 && (
            <>
              <div className="divider mx-4" />
              <div className="card-section">
                <Row label="Sub-total" right={`₹${fmt(totalCost)}`} highlight />
                <Row
                  label={`Wastage (${wastagePercent}%)`}
                  right={`+ ₹${fmt(wastageAmount)}`}
                />
              </div>
            </>
          )}

          {/* Price per kg — prominent */}
          <div className="divider mx-4" />
          <div className="card-section">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-label">Price per kg</p>
                <p className="text-xs text-label-3 mt-0.5">
                  ₹{fmt(adjustedTotal)} ÷ {fmt(totalMaterialQty)} kg
                </p>
              </div>
              <span className="text-2xl font-bold text-tint tracking-tight">
                ₹{fmt(pricePerKg)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
