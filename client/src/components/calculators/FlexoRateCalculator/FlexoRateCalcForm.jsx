import { useState } from "react";
import CreatableCombobox from "../../ui/CreatableCombobox";
import IOSToggle from "../../ui/IOSToggle";
import {
  ROLL_SIZE_RATES,
  COVER_SIZE_OPTIONS,
  CUTTING_SIZE_RATES,
  WASTAGE_OPTIONS,
  GUSSET_RATE,
  PUNCHING_RATE,
  OPACK_RATE,
} from "../../../constants/flexoRateCalc";
import { fmt } from "../../../utils/format";

/* ─── localStorage helpers ───────────────────────────────────────────────── */
const FIELD_STORAGE_KEY = "flexo-rate-calc-field-values";

function getStoredFields() {
  try {
    return JSON.parse(localStorage.getItem(FIELD_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function storeField(key, value) {
  const current = getStoredFields();
  if (value) current[key] = value;
  else delete current[key];
  localStorage.setItem(FIELD_STORAGE_KEY, JSON.stringify(current));
}

/* ─── Initial form state ─────────────────────────────────────────────────── */
function makeInitialForm() {
  const saved = getStoredFields();
  return {
    quoteName: "",
    materialPrice: saved.materialPrice ?? "",
    coverSize: "",
    rollSize: "",
    printingRate: saved.printingRate ?? "",
    gusset: false,
    punching: false,
    opack: false,
    cuttingSize: "",
    wastage: "0",
  };
}

/* ─── ToggleRow sub-component ────────────────────────────────────────────── */
function ToggleRow({ label, rate, on, onToggle }) {
  return (
    <div className="card-section">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-label">{label}</p>
          <p className="text-xs text-label-3 mt-0.5">₹{fmt(rate)}</p>
        </div>
        <IOSToggle on={on} onToggle={onToggle} />
      </div>
    </div>
  );
}

/* ─── RateCalcForm ───────────────────────────────────────────────────────── */
export default function FlexoRateCalcForm({
  onProceed,
  onSave,
  result,
  saveError,
}) {
  const [form, setForm] = useState(() => makeInitialForm());

  // Compute next form, update state, and notify parent in one event handler
  // (rerender-move-effect-to-event: callbacks belong in handlers, not effects)
  function setField(key, val) {
    const next = { ...form, [key]: val };
    setForm(next);
    onProceed?.(next);
  }

  function setPersistedField(key, val) {
    storeField(key, val);
    setField(key, val);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ─── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Quote Name */}
          <div className="card">
            <div className="card-section">
              <p className="field-label mb-1.5">Quote Name</p>
              <input
                type="text"
                value={form.quoteName}
                onChange={(e) => setField("quoteName", e.target.value)}
                placeholder="e.g. Customer A"
                className={`input-base ${
                  saveError &&
                  (saveError.includes("name") || saveError.includes("named"))
                    ? "ring-1 ring-red-500 border-red-500"
                    : ""
                }`}
              />
              {saveError ? (
                <p className="text-xs text-red-500 mt-1.5">{saveError}</p>
              ) : null}
            </div>
          </div>

          {/* Material Price */}
          <div className="card">
            <div className="card-section">
              <p className="field-label mb-1.5">Material Price</p>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.materialPrice}
                  onChange={(e) =>
                    setPersistedField("materialPrice", e.target.value)
                  }
                  placeholder="0.00"
                  className="input-base pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-label-3">
                  ₹
                </span>
              </div>
            </div>
          </div>

          {/* Cover Size */}
          <div className="card">
            <div className="card-section">
              <div className="flex items-center justify-between mb-1.5">
                <p className="field-label">Cover Size</p>
                <p className="text-xs text-label-3">Informational only</p>
              </div>
              <CreatableCombobox
                storageKey="flexo-rate-calc-cover-sizes"
                defaultOptions={COVER_SIZE_OPTIONS}
                value={form.coverSize}
                onChange={(v) => setField("coverSize", v)}
                placeholder="e.g. 10x12"
              />
            </div>
          </div>

          {/* Roll Size */}
          <div className="card">
            <div className="card-section">
              <div className="flex items-center justify-between mb-1.5">
                <p className="field-label">Roll Size</p>
                <p className="text-xs text-label-3">
                  {form.rollSize
                    ? `Rate: ₹${fmt(ROLL_SIZE_RATES[form.rollSize] ?? 0)}`
                    : "Rate from lookup"}
                </p>
              </div>
              <CreatableCombobox
                storageKey="flexo-rate-calc-roll-sizes"
                defaultOptions={Object.keys(ROLL_SIZE_RATES)}
                value={form.rollSize}
                onChange={(v) => setField("rollSize", v)}
                placeholder="e.g. 8x6"
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Printing Rate */}
          <div className="card">
            <div className="card-section">
              <p className="field-label mb-1.5">Printing Rate</p>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.printingRate}
                  onChange={(e) =>
                    setPersistedField("printingRate", e.target.value)
                  }
                  placeholder="0.00"
                  className="input-base pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-label-3">
                  ₹
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Charges */}
          <div className="card">
            <div className="card-section pb-2">
              <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
                Additional Charges
              </p>
            </div>
            <div className="divider mx-4" />
            <ToggleRow
              label="Gusset"
              rate={GUSSET_RATE}
              on={form.gusset}
              onToggle={() => setField("gusset", !form.gusset)}
            />
            <div className="divider mx-4" />
            <ToggleRow
              label="Punching"
              rate={PUNCHING_RATE}
              on={form.punching}
              onToggle={() => setField("punching", !form.punching)}
            />
            <div className="divider mx-4" />
            <ToggleRow
              label="Opack"
              rate={OPACK_RATE}
              on={form.opack}
              onToggle={() => setField("opack", !form.opack)}
            />
          </div>

          {/* Cutting Size */}
          <div className="card">
            <div className="card-section">
              <div className="flex items-center justify-between mb-1.5">
                <p className="field-label">Cutting Size</p>
                <p className="text-xs text-label-3">
                  {form.cuttingSize
                    ? `Rate: ₹${fmt(CUTTING_SIZE_RATES[form.cuttingSize] ?? 0)}`
                    : "Rate from lookup"}
                </p>
              </div>
              <CreatableCombobox
                storageKey="flexo-rate-calc-cutting-sizes"
                defaultOptions={Object.keys(CUTTING_SIZE_RATES)}
                value={form.cuttingSize}
                onChange={(v) => setField("cuttingSize", v)}
                placeholder="e.g. 8"
              />
            </div>
          </div>

          {/* Wastage */}
          <div className="card">
            <div className="card-section">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-label">Wastage</p>
                <div className="flex items-center gap-2">
                  <CreatableCombobox
                    storageKey="flexo-rate-calc-wastage"
                    defaultOptions={WASTAGE_OPTIONS}
                    value={form.wastage}
                    onChange={(v) => setField("wastage", v)}
                    placeholder="0"
                    className="w-20"
                  />
                  <span className="text-sm font-medium text-label-2">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-section flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-label">Total Rate</p>
            <p className="text-xs text-label-3 mt-0.5">
              Updates as you fill in values
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-grouped-background-3 text-label font-semibold text-base px-5 py-2 rounded-xl tracking-tight">
              {result ? `₹${fmt(result.totalRate)}` : "—"}
            </span>
            <button
              type="button"
              onClick={() => onSave?.(form)}
              className="btn-primary"
            >
              Save Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
