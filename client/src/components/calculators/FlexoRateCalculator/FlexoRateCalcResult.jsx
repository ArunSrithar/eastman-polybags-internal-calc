import { useState } from "react";
import { fmt } from "../../../utils/format";
import { ChevronDownIcon } from "../../ui/Icons";

function Row({ label, sub, right, highlight }) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${highlight ? "text-label font-medium" : "text-label-2"}`}
    >
      <div>
        <span className="text-sm">{label}</span>
        {sub ? <p className="text-xs text-label-3 mt-0.5">{sub}</p> : null}
      </div>
      <span
        className={`text-sm font-mono ${highlight ? "text-label font-semibold" : ""}`}
      >
        {right}
      </span>
    </div>
  );
}

export default function FlexoRateCalcResult({ result, cardRef }) {
  const [open, setOpen] = useState(false);

  if (!result) return null;

  const {
    materialPrice,
    rollSize,
    rollSizeRate,
    printingRate,
    gussetRate,
    punchingRate,
    opackRate,
    cuttingSize,
    cuttingSizeRate,
    subtotal,
    wastagePercent,
    wastageAmount,
    totalRate,
  } = result;

  const hasCharges =
    rollSizeRate > 0 ||
    printingRate > 0 ||
    gussetRate > 0 ||
    punchingRate > 0 ||
    opackRate > 0 ||
    cuttingSizeRate > 0;

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
      {open ? (
        <>
          <div className="divider mx-4" />

          {/* Base material */}
          <div className="card-section pt-0">
            <p className="text-xs font-semibold text-label-3 uppercase tracking-wide mb-1">
              Base
            </p>
            <Row
              label="Material Price"
              right={`₹${fmt(materialPrice)}`}
              highlight
            />
          </div>

          {/* Charges */}
          {hasCharges ? (
            <>
              <div className="divider mx-4" />
              <div className="card-section">
                <p className="text-xs font-semibold text-label-3 uppercase tracking-wide mb-1">
                  Charges
                </p>
                {rollSizeRate > 0 ? (
                  <Row
                    label="Roll Size"
                    sub={rollSize}
                    right={`₹${fmt(rollSizeRate)}`}
                  />
                ) : null}
                {printingRate > 0 ? (
                  <Row
                    label="Printing"
                    right={`₹${fmt(printingRate)}`}
                  />
                ) : null}
                {gussetRate > 0 ? (
                  <Row
                    label="Gusset"
                    right={`₹${fmt(gussetRate)}`}
                  />
                ) : null}
                {punchingRate > 0 ? (
                  <Row
                    label="Punching"
                    right={`₹${fmt(punchingRate)}`}
                  />
                ) : null}
                {opackRate > 0 ? (
                  <Row
                    label="O-Pack"
                    right={`₹${fmt(opackRate)}`}
                  />
                ) : null}
                {cuttingSizeRate > 0 ? (
                  <Row
                    label="Cutting Size"
                    sub={cuttingSize}
                    right={`₹${fmt(cuttingSizeRate)}`}
                  />
                ) : null}
              </div>
            </>
          ) : null}

          {/* Wastage */}
          {wastagePercent > 0 ? (
            <>
              <div className="divider mx-4" />
              <div className="card-section">
                <Row
                  label="Sub-total"
                  right={`₹${fmt(subtotal)}`}
                  highlight
                />
                <Row
                  label={`Wastage (${wastagePercent}%)`}
                  right={`+ ₹${fmt(wastageAmount)}`}
                />
              </div>
            </>
          ) : null}

          {/* Total Rate — prominent */}
          <div className="divider mx-4" />
          <div className="card-section">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-label">Total Rate</p>
              <span className="text-2xl font-bold text-tint tracking-tight">
                ₹{fmt(totalRate)}
              </span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
