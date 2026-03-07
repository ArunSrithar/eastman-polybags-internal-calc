import { createPortal } from "react-dom";
import { useEffect } from "react";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import { fmt, formatDate } from "../../../utils/format";
import { CloseIcon, TrashIcon } from "../../ui/Icons";

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
        {sub ? <p className="text-xs text-label-3 mt-0.5">{sub}</p> : null}
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

export default function FlexoRateCalcQuoteModal({ quote, onClose, onDelete }) {
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

  const result = quote.form ? calculateFlexoRate(quote.form) : null;
  const form = quote.form ?? {};

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto card rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top action buttons ────────────────────────────────────────── */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {onDelete ? (
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
          ) : null}
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
            Rate Quote
          </p>
          <p className="text-xl font-bold text-label leading-tight">
            {quote.quoteName || "Untitled"}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
            {quote.savedBy ? (
              <p className="text-xs text-label-3">
                Saved by{" "}
                <span className="text-label-2 font-medium">
                  {quote.savedBy}
                </span>
              </p>
            ) : null}
            <p className="text-xs text-label-3">{formatDate(quote.savedAt)}</p>
            {quote.coverSize ? (
              <p className="text-xs text-label-3">
                Cover{" "}
                <span className="text-label-2 font-medium">
                  {quote.coverSize}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        {!result ? (
          /* ── Fallback for sample quotes with no form data ─────────────── */
          <>
            <div className="divider mx-4" />
            <div className="card-section flex flex-col items-center py-8 gap-2">
              <p className="text-xs text-label-3">
                Detailed breakdown not available for this quote.
              </p>
              <p className="text-2xl font-bold text-tint mt-2">
                ₹{fmt(quote.totalRate)}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* ── Rate line items ────────────────────────────────────────── */}
            <div className="divider mx-4" />
            <div className="card-section">
              <SectionLabel>Rate Breakdown</SectionLabel>
              <InvoiceRow
                label="Material Price"
                right={`₹${fmt(result.materialPrice)}`}
              />
              {result.rollSizeRate > 0 ? (
                <InvoiceRow
                  label="Roll Size Rate"
                  sub={form.rollSize ? `Size: ${form.rollSize}` : undefined}
                  right={`₹${fmt(result.rollSizeRate)}`}
                />
              ) : null}
              {result.printingRate > 0 ? (
                <InvoiceRow
                  label="Printing Rate"
                  right={`₹${fmt(result.printingRate)}`}
                />
              ) : null}
            </div>

            {/* ── Additional charges ─────────────────────────────────────── */}
            {result.gussetRate > 0 ||
            result.punchingRate > 0 ||
            result.opackRate > 0 ? (
              <>
                <div className="divider mx-4" />
                <div className="card-section">
                  <SectionLabel>Additional Charges</SectionLabel>
                  {result.gussetRate > 0 ? (
                    <InvoiceRow
                      label="Gusset"
                      right={`₹${fmt(result.gussetRate)}`}
                    />
                  ) : null}
                  {result.punchingRate > 0 ? (
                    <InvoiceRow
                      label="Punching"
                      right={`₹${fmt(result.punchingRate)}`}
                    />
                  ) : null}
                  {result.opackRate > 0 ? (
                    <InvoiceRow
                      label="Opack"
                      right={`₹${fmt(result.opackRate)}`}
                    />
                  ) : null}
                </div>
              </>
            ) : null}

            {/* ── Cutting size ───────────────────────────────────────────── */}
            {result.cuttingSizeRate > 0 ? (
              <>
                <div className="divider mx-4" />
                <div className="card-section">
                  <SectionLabel>Size Charges</SectionLabel>
                  <InvoiceRow
                    label="Cutting Size Rate"
                    sub={
                      form.cuttingSize ? `Size: ${form.cuttingSize}` : undefined
                    }
                    right={`₹${fmt(result.cuttingSizeRate)}`}
                  />
                </div>
              </>
            ) : null}

            {/* ── Subtotal + Wastage ─────────────────────────────────────── */}
            <div className="divider mx-4" />
            <div className="card-section">
              <InvoiceRow
                label="Subtotal"
                right={`₹${fmt(result.subtotal)}`}
                bold
              />
              {result.wastagePercent > 0 ? (
                <InvoiceRow
                  label={`Wastage (${result.wastagePercent}%)`}
                  right={`+ ₹${fmt(result.wastageAmount)}`}
                  muted
                />
              ) : null}
            </div>

            {/* ── Total Rate — invoice footer ────────────────────────────── */}
            <div className="divider mx-4" />
            <div className="card-section">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-label">Total Rate</p>
                <span className="text-2xl font-bold text-tint tracking-tight">
                  ₹{fmt(result.totalRate)}
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
