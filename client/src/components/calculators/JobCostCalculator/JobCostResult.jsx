import { useState } from "react";
import { fmt } from "../../../utils/format";
import { ChevronDownIcon } from "../../ui/Icons";

function Row({ label, sub, right, highlight, muted }) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        muted
          ? "opacity-50"
          : highlight
            ? "text-label font-medium"
            : "text-label-2"
      }`}
    >
      <div className="min-w-0 flex-1">
        <span className="text-sm">{label}</span>
        {sub ? <p className="text-xs text-label-3 mt-0.5">{sub}</p> : null}
      </div>
      <span
        className={`text-sm font-mono ml-4 shrink-0 ${highlight ? "text-label font-semibold" : ""}`}
      >
        {right}
      </span>
    </div>
  );
}

export default function JobCostResult({ result }) {
  const [open, setOpen] = useState(false);

  if (!result) return null;

  const { lineItems, totalAmount, finishedWeight, dispatchWeight, costOfJob } =
    result;

  const materialItems = lineItems.filter((i) => i.hasQty);
  const flatItems = lineItems.filter((i) => !i.hasQty);

  return (
    <div className="card mt-4">
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

      {open ? (
        <>
          {/* ── Materials & Charges (items 1–8) ─────────────────────── */}
          <div className="divider mx-4" />
          <div className="card-section pt-0">
            <p className="text-xs font-semibold text-label-3 uppercase tracking-wide mb-1">
              Materials & Charges
            </p>
            {materialItems.map((item) => (
              <Row
                key={item.key}
                label={item.label}
                sub={
                  item.enabled && item.qty > 0
                    ? `${fmt(item.qty)} kg × ₹${fmt(item.price)}`
                    : item.enabled
                      ? null
                      : "disabled"
                }
                right={item.enabled ? `₹${fmt(item.amount)}` : "—"}
                muted={!item.enabled}
              />
            ))}
          </div>

          {/* ── Flat Charges (items 9–10) ────────────────────────────── */}
          <div className="divider mx-4" />
          <div className="card-section">
            <p className="text-xs font-semibold text-label-3 uppercase tracking-wide mb-1">
              Flat Charges
            </p>
            {flatItems.map((item) => (
              <Row
                key={item.key}
                label={item.label}
                sub={item.enabled ? null : "disabled"}
                right={item.enabled ? `₹${fmt(item.amount)}` : "—"}
                muted={!item.enabled}
              />
            ))}
          </div>

          {/* ── Totals ───────────────────────────────────────────────── */}
          <div className="divider mx-4" />
          <div className="card-section">
            <p className="text-xs font-semibold text-label-3 uppercase tracking-wide mb-1">
              Summary
            </p>
            <Row
              label="Total Amount"
              right={`₹${fmt(totalAmount)}`}
              highlight
            />
            {finishedWeight > 0 ? (
              <Row
                label="Finished Weight"
                right={`${fmt(finishedWeight)} kg`}
              />
            ) : null}
            <Row label="Dispatch Weight" right={`${fmt(dispatchWeight)} kg`} />
            <div className="h-px bg-separator my-1" />
            <Row
              label="Cost of Job"
              sub={`₹${fmt(totalAmount)} ÷ ${fmt(dispatchWeight)} kg`}
              right={`₹${fmt(costOfJob)} / kg`}
              highlight
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
