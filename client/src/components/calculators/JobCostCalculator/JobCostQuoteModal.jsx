import { createPortal } from "react-dom";
import { useEffect } from "react";
import { calculateJobCost } from "../../../utils/calculators/jobCost";
import { fmt, formatDate } from "../../../utils/format";
import { CloseIcon, TrashIcon } from "../../ui/Icons";

function InvoiceRow({ label, sub, right, muted, bold }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${muted ? "opacity-50" : ""}`}
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

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-label-3">{label}</span>
      <span className="text-xs text-label-2 font-medium">{value}</span>
    </div>
  );
}

export default function JobCostQuoteModal({ quote, onClose, onDelete }) {
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

  const result = quote.form ? calculateJobCost(quote.form) : null;
  const form = quote.form ?? {};

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto card rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Action buttons ────────────────────────────────────────── */}
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

        {/* ── Invoice header ────────────────────────────────────────── */}
        <div className="card-section pb-4 pr-12">
          <p className="text-[10px] font-semibold text-label-3 uppercase tracking-widest mb-1">
            Job Cost Quote
          </p>
          <p className="text-xl font-bold text-label leading-tight">
            {quote.quoteName || "Untitled"}
          </p>
          <p className="text-xs text-label-3 mt-1">
            {formatDate(quote.savedAt)}
          </p>
        </div>

        {/* ── Job Metadata ──────────────────────────────────────────── */}
        {form.jobCardNo ||
        form.billingNo ||
        form.jobWorkCompany ||
        form.transport ||
        form.micron ||
        form.colour ||
        form.noOfBundles ||
        form.billingRate ? (
          <>
            <div className="divider mx-4" />
            <div className="card-section">
              <SectionLabel>Job Details</SectionLabel>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0">
                <MetaRow label="Job Card No." value={form.jobCardNo} />
                <MetaRow label="Billing No." value={form.billingNo} />
                <MetaRow label="Job Card Date" value={form.jobCardDate} />
                <MetaRow label="Billing Date" value={form.billingDate} />
                <MetaRow label="Job Work Company" value={form.jobWorkCompany} />
                <MetaRow label="Transport" value={form.transport} />
                <MetaRow label="No. of Bundles" value={form.noOfBundles} />
                <MetaRow label="Micron" value={form.micron} />
                <MetaRow label="Colour" value={form.colour} />
                <MetaRow
                  label="Billing Rate"
                  value={form.billingRate ? `₹${fmt(form.billingRate)}` : null}
                />
              </div>
            </div>
          </>
        ) : null}

        {result ? (
          <>
            {/* ── Line Items ────────────────────────────────────────── */}
            <div className="divider mx-4" />
            <div className="card-section">
              <SectionLabel>Line Items</SectionLabel>

              {/* Column headers */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-label-3 flex-1">Item</span>
                <div className="flex gap-3 shrink-0 text-[10px] text-label-3">
                  <span className="w-14 text-right">Qty / Rate</span>
                  <span className="w-20 text-right">Amount</span>
                </div>
              </div>
              <div className="h-px bg-separator mb-1" />

              {result.lineItems.map((item) => (
                <InvoiceRow
                  key={item.key}
                  label={item.label}
                  sub={
                    item.enabled && item.hasQty && item.qty > 0
                      ? `${fmt(item.qty)} kg × ₹${fmt(item.price)}`
                      : item.enabled && !item.hasQty && item.price > 0
                        ? `flat ₹${fmt(item.price)}`
                        : item.enabled
                          ? null
                          : "disabled"
                  }
                  right={item.enabled ? `₹${fmt(item.amount)}` : "—"}
                  muted={!item.enabled}
                />
              ))}
            </div>

            {/* ── Summary ───────────────────────────────────────────── */}
            <div className="divider mx-4" />
            <div className="card-section">
              <SectionLabel>Summary</SectionLabel>
              {result.finishedWeight > 0 ? (
                <InvoiceRow
                  label="Finished Weight"
                  right={`${fmt(result.finishedWeight)} kg`}
                />
              ) : null}
              <InvoiceRow
                label="Dispatch Weight"
                right={`${fmt(result.dispatchWeight)} kg`}
              />
              <InvoiceRow
                label="Total Amount"
                right={`₹${fmt(result.totalAmount)}`}
                bold
              />
              <div className="h-px bg-separator my-1" />
              <InvoiceRow
                label="Cost of Job"
                sub={`₹${fmt(result.totalAmount)} ÷ ${fmt(result.dispatchWeight)} kg`}
                right={`₹${fmt(result.costOfJob)} / kg`}
                bold
              />
            </div>
          </>
        ) : (
          /* Fallback for sample quotes with no form data */
          <>
            <div className="divider mx-4" />
            <div className="card-section flex flex-col items-center py-8 gap-2">
              <p className="text-xs text-label-3">
                Detailed breakdown not available for this quote.
              </p>
              <p className="text-2xl font-bold text-tint mt-2">
                ₹{fmt(quote.costOfJob)}{" "}
                <span className="text-base font-medium text-label-2">/ kg</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
