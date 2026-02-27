import { createPortal } from "react-dom";
import { useEffect } from "react";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";
import { fmt, formatDate } from "../../../utils/format";
import { CloseIcon, TrashIcon } from "../../ui/Icons";
import { MATERIAL_NAMES } from "../../../constants/gravureRates";

function InvoiceRow({ label, sub, right, muted, bold }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${muted ? "opacity-60" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <span
          className={`text-sm text-label ${bold ? "font-semibold" : "font-normal"}`}
        >
          {label}
        </span>
        {sub && <p className="text-xs text-label-3 mt-0.5">{sub}</p>}
      </div>
      <span
        className={`text-sm font-mono ml-4 shrink-0 ${bold ? "font-semibold text-label" : "text-label-2"}`}
      >
        {right}
      </span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold text-label-3 uppercase tracking-widest mb-2 mt-1">
      {children}
    </p>
  );
}

export default function GravureQuoteModal({ quote, onClose, onDelete }) {
  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const result = quote.form ? calculateGravureRate(quote.form) : null;
  const form = quote.form ?? {};

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card — stop propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto card rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top action buttons ────────────────────────────────────────── */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(quote.id);
                onClose();
              }}
              className="flex items-center justify-center size-7 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
              title="Delete quote"
            >
              <TrashIcon />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded-full bg-fill-3 text-label-2 hover:bg-fill-2 transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Invoice header ────────────────────────────────────────────── */}
        <div className="card-section pb-4 pr-12">
          <p className="text-[10px] font-semibold text-label-3 uppercase tracking-widest mb-1">
            Gravure Rate Quote
          </p>
          <p className="text-xl font-bold text-label leading-tight">
            {quote.quoteName || "Untitled"}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
            {quote.savedBy && (
              <p className="text-xs text-label-3">
                Saved by{" "}
                <span className="text-label-2 font-medium">
                  {quote.savedBy}
                </span>
              </p>
            )}
            <p className="text-xs text-label-3">{formatDate(quote.savedAt)}</p>
            {quote.pouchSize && (
              <p className="text-xs text-label-3">
                Pouch{" "}
                <span className="text-label-2 font-medium">
                  {quote.pouchSize}
                </span>
              </p>
            )}
          </div>
        </div>

        {!result ? (
          /* ── Fallback: no form data (sample quotes) ─────────────────── */
          <>
            <div className="divider mx-4" />
            <div className="card-section flex flex-col items-center py-8 gap-2">
              <p className="text-xs text-label-3">
                Detailed breakdown not available for this quote.
              </p>
              <p className="text-2xl font-bold text-tint mt-2">
                ₹{fmt(quote.pricePerKg)}{" "}
                <span className="text-base font-medium text-label-2">/ kg</span>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* ── Materials ──────────────────────────────────────────────── */}
            <div className="divider mx-4" />
            <div className="card-section">
              <SectionLabel>Materials</SectionLabel>

              {/* Table header */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-label-3 flex-1">
                  Material
                </span>
                <div className="flex gap-3 shrink-0 text-[10px] text-label-3">
                  <span className="w-10 text-right">Micron</span>
                  <span className="w-16 text-right">Price/kg</span>
                  <span className="w-14 text-right">Qty (kg)</span>
                  <span className="w-16 text-right">Amount</span>
                </div>
              </div>
              <div className="divider mb-2" />

              {result.materialLines.map((m) => {
                const micron = quote.form?.materials?.[m.key]?.micron;
                return (
                  <div
                    key={m.key}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-label flex-1">
                      {MATERIAL_NAMES[m.key]}
                    </span>
                    <div className="flex gap-3 shrink-0 text-sm font-mono text-label-2">
                      <span className="w-10 text-right">
                        {micron ? `${micron}µ` : "—"}
                      </span>
                      <span className="w-16 text-right">₹{fmt(m.price)}</span>
                      <span className="w-14 text-right">{fmt(m.qty)}</span>
                      <span className="w-16 text-right text-label">
                        ₹{fmt(m.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="divider my-1.5" />
              <InvoiceRow
                label="Total Material"
                sub={`${fmt(result.totalMaterialQty)} kg`}
                right={`₹${fmt(result.totalMaterialCost)}`}
                bold
              />
            </div>

            {/* ── Printing charges ───────────────────────────────────────── */}
            {result.printingCost > 0 && (
              <>
                <div className="divider mx-4" />
                <div className="card-section">
                  <SectionLabel>Printing</SectionLabel>
                  {(parseInt(form.normalColors) || 0) > 0 && (
                    <InvoiceRow
                      label={`Normal Colors — ${form.normalColors}`}
                      sub={`${form.normalColors} × ₹5/color/kg`}
                      right={`₹${fmt((parseInt(form.normalColors) || 0) * 5 * result.totalMaterialQty)}`}
                    />
                  )}
                  {(parseInt(form.metallicColors) || 0) > 0 && (
                    <InvoiceRow
                      label={`Metallic Colors — ${form.metallicColors}`}
                      sub={`${form.metallicColors} × ₹8/color/kg`}
                      right={`₹${fmt((parseInt(form.metallicColors) || 0) * 8 * result.totalMaterialQty)}`}
                    />
                  )}
                  {form.mattFinish && (
                    <InvoiceRow
                      label="Matt Finish"
                      sub="₹3/kg"
                      right={`₹${fmt(3 * result.totalMaterialQty)}`}
                    />
                  )}
                  <div className="divider my-1.5" />
                  <InvoiceRow
                    label="Printing Total"
                    sub={`₹${fmt(result.printingRatePerKg)}/kg`}
                    right={`₹${fmt(result.printingCost)}`}
                    bold
                  />
                </div>
              </>
            )}

            {/* ── Other charges ──────────────────────────────────────────── */}
            {(result.laminationCost > 0 ||
              result.slittingCost > 0 ||
              result.pouchCost > 0) && (
              <>
                <div className="divider mx-4" />
                <div className="card-section">
                  <SectionLabel>Other Charges</SectionLabel>
                  {result.laminationCost > 0 && (
                    <InvoiceRow
                      label={
                        form.lamination === "double"
                          ? "Lamination — Double"
                          : "Lamination — Single"
                      }
                      sub={`₹${fmt(result.laminationRatePerKg)}/kg`}
                      right={`₹${fmt(result.laminationCost)}`}
                    />
                  )}
                  {result.slittingCost > 0 && (
                    <InvoiceRow
                      label="Slitting"
                      sub="₹4/kg"
                      right={`₹${fmt(result.slittingCost)}`}
                    />
                  )}
                  {result.pouchCost > 0 && (
                    <InvoiceRow
                      label={`Pouch${form.pouchSize ? ` — ${form.pouchSize}` : ""}`}
                      sub={`₹${fmt(result.pouchRatePerKg)}/kg`}
                      right={`₹${fmt(result.pouchCost)}`}
                    />
                  )}
                </div>
              </>
            )}

            {/* ── Sub-total + Wastage ────────────────────────────────────── */}
            <div className="divider mx-4" />
            <div className="card-section">
              <InvoiceRow
                label="Sub-total"
                right={`₹${fmt(result.totalCost)}`}
                bold
              />
              {result.wastagePercent > 0 && (
                <InvoiceRow
                  label={`Wastage (${result.wastagePercent}%)`}
                  right={`+ ₹${fmt(result.wastageAmount)}`}
                  muted
                />
              )}
            </div>

            {/* ── Price per kg — invoice footer ─────────────────────────── */}
            <div className="divider mx-4" />
            <div className="card-section">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-label">
                    Price per kg
                  </p>
                  <p className="text-xs text-label-3 mt-0.5">
                    ₹{fmt(result.adjustedTotal)} ÷{" "}
                    {fmt(result.totalMaterialQty)} kg
                  </p>
                </div>
                <span className="text-2xl font-bold text-tint tracking-tight">
                  ₹{fmt(result.pricePerKg)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
