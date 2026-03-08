import { useState, useRef } from "react";
import { LINE_ITEMS, DROPDOWN_SEEDS } from "../../../constants/jobCost";
import { calculateJobCost } from "../../../utils/calculators/jobCost";
import { fmt } from "../../../utils/format";
import IOSToggle from "../../ui/IOSToggle";
import CreatableCombobox from "../../ui/CreatableCombobox";

// ── localStorage persistence for item prices / qty / toggles ─────────────
const FIELD_STORAGE_KEY = "job-cost-field-values";

function loadStoredFields() {
  try {
    return JSON.parse(localStorage.getItem(FIELD_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveFields(items) {
  try {
    localStorage.setItem(FIELD_STORAGE_KEY, JSON.stringify({ items }));
  } catch {
    // ignore storage errors
  }
}

// ── Build initial form state ──────────────────────────────────────────────
function makeInitialForm() {
  const today = new Date().toISOString().split("T")[0];
  const stored = loadStoredFields();

  const items = {};
  LINE_ITEMS.forEach((def) => {
    items[def.key] = {
      enabled: stored?.items?.[def.key]?.enabled ?? true,
      qty: stored?.items?.[def.key]?.qty ?? "",
      price: stored?.items?.[def.key]?.price ?? String(def.defaultPrice),
    };
  });

  return {
    quoteName: "",
    jobCardNo: "",
    billingNo: "",
    jobCardDate: today,
    billingDate: today,
    jobWorkCompany: "",
    transport: "",
    noOfBundles: "",
    micron: "",
    colour: "",
    billingRate: "",
    items,
    finishedWeight: "",
    dispatchWeight: "",
  };
}

// ── Line item row (qty + price) ───────────────────────────────────────────
function LineItemRow({ def, item, onToggle, onQtyChange, onPriceChange }) {
  const amount = item.enabled
    ? def.hasQty
      ? (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0)
      : parseFloat(item.price) || 0
    : 0;

  return (
    <div
      className={`flex items-center gap-3 py-2.5 transition-opacity ${item.enabled ? "opacity-100" : "opacity-40"}`}
    >
      {/* Toggle */}
      <IOSToggle on={item.enabled} onToggle={onToggle} />

      {/* Label */}
      <span className="text-sm text-label flex-1 min-w-0 truncate">
        {def.label}
      </span>

      {/* Qty (items 1–8 only) */}
      {def.hasQty ? (
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <input
            type="number"
            min="0"
            step="any"
            value={item.qty}
            onChange={(e) => onQtyChange(e.target.value)}
            disabled={!item.enabled}
            placeholder="qty"
            className="input-base w-20 text-right text-sm py-1.5 disabled:opacity-40"
          />
          <span className="text-[10px] text-label-3">kg</span>
        </div>
      ) : (
        <div className="w-20 shrink-0" />
      )}

      {/* Price */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-label-3 pointer-events-none">
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={item.price}
            onChange={(e) => onPriceChange(e.target.value)}
            disabled={!item.enabled}
            placeholder={def.hasQty ? "rate/kg" : "flat ₹"}
            className="input-base w-24 text-right pl-6 text-sm py-1.5 disabled:opacity-40"
          />
        </div>
        <span className="text-[10px] text-label-3">
          {def.hasQty ? "₹/kg" : "flat ₹"}
        </span>
      </div>

      {/* Amount */}
      <div className="flex flex-col items-end gap-0.5 shrink-0 w-24">
        <span className="text-sm font-mono text-label">
          {item.enabled && amount > 0 ? `₹${fmt(amount)}` : "—"}
        </span>
        <span className="text-[10px] text-label-3">amount</span>
      </div>
    </div>
  );
}

// ── Main form component ───────────────────────────────────────────────────
const REQUIRED_KEYS = [
  "quoteName",
  "jobCardNo",
  "billingNo",
  "jobWorkCompany",
  "transport",
  "noOfBundles",
  "micron",
  "colour",
  "billingRate",
];

function isEmpty(val) {
  return !String(val ?? "").trim();
}

export default function JobCostForm({ onProceed, onSave, result, saveError }) {
  const [form, setForm] = useState(() => makeInitialForm());
  const [submitted, setSubmitted] = useState(false);
  const fieldRefMap = useRef({});

  function fe(key) {
    return submitted && isEmpty(form[key]);
  }

  function fieldRef(key) {
    return (el) => {
      fieldRefMap.current[key] = el;
    };
  }

  function handleSaveClick() {
    setSubmitted(true);
    const firstInvalid = REQUIRED_KEYS.find((k) => isEmpty(form[k]));
    if (firstInvalid) {
      fieldRefMap.current[firstInvalid]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    onSave?.(form);
  }

  function setField(key, value) {
    const next = { ...form, [key]: value };
    setForm(next);
    onProceed?.(next);
  }

  function setItemField(itemKey, field, value) {
    const nextItems = {
      ...form.items,
      [itemKey]: { ...form.items[itemKey], [field]: value },
    };
    const next = { ...form, items: nextItems };
    setForm(next);
    saveFields(nextItems);
    onProceed?.(next);
  }

  function toggleItem(itemKey) {
    const current = form.items[itemKey];
    const nextItems = {
      ...form.items,
      [itemKey]: { ...current, enabled: !current.enabled },
    };
    const next = { ...form, items: nextItems };
    setForm(next);
    saveFields(nextItems);
    onProceed?.(next);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Section 1: Job Metadata ──────────────────────────────────── */}
      <div className="card">
        <div className="card-section pb-2">
          <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
            Job Details
          </p>
        </div>
        <div className="divider mx-4" />
        <div className="card-section">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Customer / Quote name */}
            <div className="col-span-2" ref={fieldRef("quoteName")}>
              <label className="field-label block mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.quoteName}
                onChange={(e) => setField("quoteName", e.target.value)}
                placeholder="e.g. Rajesh Traders"
                className={`input-base ${fe("quoteName") ? "ring-2 ring-red-500" : ""}`}
              />
              {fe("quoteName") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>

            {/* Job Card No */}
            <div ref={fieldRef("jobCardNo")}>
              <label className="field-label block mb-1">
                Job Card No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.jobCardNo}
                onChange={(e) => setField("jobCardNo", e.target.value)}
                placeholder="e.g. JC-001"
                className={`input-base ${fe("jobCardNo") ? "ring-2 ring-red-500" : ""}`}
              />
              {fe("jobCardNo") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>

            {/* Billing No */}
            <div ref={fieldRef("billingNo")}>
              <label className="field-label block mb-1">
                Billing No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.billingNo}
                onChange={(e) => setField("billingNo", e.target.value)}
                placeholder="e.g. INV-045"
                className={`input-base ${fe("billingNo") ? "ring-2 ring-red-500" : ""}`}
              />
              {fe("billingNo") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>

            {/* Job Card Date */}
            <div>
              <label className="field-label block mb-1">Job Card Date</label>
              <input
                type="date"
                value={form.jobCardDate}
                onChange={(e) => setField("jobCardDate", e.target.value)}
                className="input-base"
              />
            </div>

            {/* Billing Date */}
            <div>
              <label className="field-label block mb-1">Billing Date</label>
              <input
                type="date"
                value={form.billingDate}
                onChange={(e) => setField("billingDate", e.target.value)}
                className="input-base"
              />
            </div>

            {/* Job Work Company */}
            <div ref={fieldRef("jobWorkCompany")}>
              <label className="field-label block mb-1">
                Job Work Company <span className="text-red-500">*</span>
              </label>
              <CreatableCombobox
                value={form.jobWorkCompany}
                onChange={(v) => setField("jobWorkCompany", v)}
                storageKey="job-cost-job-work-companies"
                seedOptions={DROPDOWN_SEEDS.jobWorkCompanies}
                placeholder="Select or type…"
                className={
                  fe("jobWorkCompany") ? "ring-2 ring-red-500 rounded-xl" : ""
                }
              />
              {fe("jobWorkCompany") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>

            {/* Transport */}
            <div ref={fieldRef("transport")}>
              <label className="field-label block mb-1">
                Transport <span className="text-red-500">*</span>
              </label>
              <CreatableCombobox
                value={form.transport}
                onChange={(v) => setField("transport", v)}
                storageKey="job-cost-transports"
                seedOptions={DROPDOWN_SEEDS.transports}
                placeholder="Select or type…"
                className={
                  fe("transport") ? "ring-2 ring-red-500 rounded-xl" : ""
                }
              />
              {fe("transport") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>

            {/* No of Bundles */}
            <div ref={fieldRef("noOfBundles")}>
              <label className="field-label block mb-1">
                No. of Bundles <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.noOfBundles}
                onChange={(e) => setField("noOfBundles", e.target.value)}
                placeholder="e.g. 20"
                className={`input-base ${fe("noOfBundles") ? "ring-2 ring-red-500" : ""}`}
              />
              {fe("noOfBundles") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>

            {/* Micron */}
            <div ref={fieldRef("micron")}>
              <label className="field-label block mb-1">
                Micron <span className="text-red-500">*</span>
              </label>
              <CreatableCombobox
                value={form.micron}
                onChange={(v) => setField("micron", v)}
                storageKey="job-cost-microns"
                seedOptions={DROPDOWN_SEEDS.microns}
                placeholder="Select or type…"
                className={fe("micron") ? "ring-2 ring-red-500 rounded-xl" : ""}
              />
              {fe("micron") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>

            {/* Colour */}
            <div ref={fieldRef("colour")}>
              <label className="field-label block mb-1">
                Colour <span className="text-red-500">*</span>
              </label>
              <CreatableCombobox
                value={form.colour}
                onChange={(v) => setField("colour", v)}
                storageKey="job-cost-colours"
                seedOptions={DROPDOWN_SEEDS.colours}
                placeholder="Select or type…"
                className={fe("colour") ? "ring-2 ring-red-500 rounded-xl" : ""}
              />
              {fe("colour") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>

            {/* Billing Rate */}
            <div ref={fieldRef("billingRate")}>
              <label className="field-label block mb-1">
                Billing Rate (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.billingRate}
                onChange={(e) => setField("billingRate", e.target.value)}
                placeholder="e.g. 250"
                className={`input-base ${fe("billingRate") ? "ring-2 ring-red-500" : ""}`}
              />
              {fe("billingRate") ? (
                <p className="text-xs text-red-500 mt-1">Required</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Line Items ────────────────────────────────────── */}
      <div className="card">
        <div className="card-section pb-2">
          <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
            Line Items
          </p>
        </div>
        <div className="divider mx-4" />

        {/* Column headers */}
        <div className="px-4 pt-2 flex items-center gap-3">
          <div className="w-9 shrink-0" />
          <span className="text-[10px] text-label-3 flex-1">Item</span>
          <span className="text-[10px] text-label-3 w-20 text-right shrink-0">
            Qty (kg)
          </span>
          <span className="text-[10px] text-label-3 w-24 text-right shrink-0">
            Price
          </span>
          <span className="text-[10px] text-label-3 w-24 text-right shrink-0">
            Amount
          </span>
        </div>

        <div className="px-4 flex flex-col">
          {LINE_ITEMS.map((def, i) => (
            <div key={def.key}>
              <LineItemRow
                def={def}
                item={form.items[def.key]}
                onToggle={() => toggleItem(def.key)}
                onQtyChange={(v) => setItemField(def.key, "qty", v)}
                onPriceChange={(v) => setItemField(def.key, "price", v)}
              />
              {i < LINE_ITEMS.length - 1 && (
                <div className="h-px bg-separator" />
              )}
            </div>
          ))}
        </div>

        {/* Total row */}
        <div className="divider mx-4" />
        <div className="card-section flex items-center justify-between">
          <span className="text-sm font-semibold text-label">Total Amount</span>
          <span className="text-sm font-semibold font-mono text-label">
            {result ? `₹${fmt(result.totalAmount)}` : "—"}
          </span>
        </div>
      </div>

      {/* ── Section 3: Weights + Save ────────────────────────────────── */}
      <div className="card">
        <div className="card-section pb-2">
          <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
            Weights & Output
          </p>
        </div>
        <div className="divider mx-4" />
        <div className="card-section grid grid-cols-2 gap-4">
          {/* Finished Weight */}
          <div>
            <label className="field-label block mb-1">
              Finished Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.finishedWeight}
              onChange={(e) => setField("finishedWeight", e.target.value)}
              placeholder="e.g. 65"
              className="input-base"
            />
            <p className="text-[10px] text-label-3 mt-1">Informational only</p>
          </div>

          {/* Dispatch Weight */}
          <div>
            <label className="field-label block mb-1">
              Dispatch Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.dispatchWeight}
              onChange={(e) => setField("dispatchWeight", e.target.value)}
              placeholder="e.g. 60"
              className="input-base"
            />
            <p className="text-[10px] text-label-3 mt-1">Used in formula</p>
          </div>
        </div>

        {/* Cost of Job Result */}
        {result ? (
          <div className="card-section border-t border-separator pt-3 mt-0 flex items-center justify-between">
            <div>
              <p className="text-xs text-label-3">Cost of Job</p>
              <p className="text-[10px] text-label-3 mt-0.5">
                ₹{fmt(result.totalAmount)} ÷ {fmt(result.dispatchWeight)} kg
              </p>
            </div>
            <p className="text-2xl font-bold text-tint font-mono">
              ₹{fmt(result.costOfJob)}
              <span className="text-sm font-medium text-label-2 ml-1">
                / kg
              </span>
            </p>
          </div>
        ) : null}

        <div className="divider mx-4" />

        {/* Error + Save button */}
        <div className="card-section pt-3 flex flex-col gap-3">
          {saveError ? (
            <p className="text-sm text-red-500">{saveError}</p>
          ) : null}
          <button
            type="button"
            onClick={handleSaveClick}
            className="btn-primary w-full"
          >
            Save Quote
          </button>
        </div>
      </div>
    </div>
  );
}
