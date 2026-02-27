import { useState, useEffect } from "react";
import CreatableCombobox from "../../ui/CreatableCombobox";
import IOSToggle from "../../ui/IOSToggle";
import CheckBox from "../../ui/CheckBox";
import { MATERIAL_NAMES } from "../../../constants/gravureRates";

/* ─── Form config ────────────────────────────────────────────────────────── */
const MATERIALS = Object.entries(MATERIAL_NAMES).map(([key, name]) => ({
  key,
  name,
}));
const COLOR_COUNTS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
const WASTAGE_DEFAULTS = ["0", "1", "2", "3", "5", "7", "10"];

/* ─── localStorage helpers ───────────────────────────────────────────────── */
const MATERIAL_STORAGE_KEY = "gravure-material-values";

function getStoredMaterials() {
  try {
    return JSON.parse(localStorage.getItem(MATERIAL_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function storeMaterialField(materialKey, field, value) {
  const current = getStoredMaterials();
  const mat = current[materialKey] ?? {};
  if (value) mat[field] = value;
  else delete mat[field];
  localStorage.setItem(
    MATERIAL_STORAGE_KEY,
    JSON.stringify({ ...current, [materialKey]: mat }),
  );
}

/* ─── Initial form state ─────────────────────────────────────────────────── */
function makeMaterial(enabled = false, price = "", micron = "", qty = "") {
  return { enabled, price, micron, qty };
}

function makeInitialForm() {
  const saved = getStoredMaterials();
  const s = (key, field) => saved[key]?.[field] ?? "";
  return {
    quoteName: "",
    pouchSize: "",
    materials: {
      polyester: makeMaterial(
        true,
        s("polyester", "price"),
        s("polyester", "micron"),
        s("polyester", "qty"),
      ),
      silverPet: makeMaterial(
        false,
        s("silverPet", "price"),
        s("silverPet", "micron"),
        s("silverPet", "qty"),
      ),
      ldRoll: makeMaterial(
        false,
        s("ldRoll", "price"),
        s("ldRoll", "micron"),
        s("ldRoll", "qty"),
      ),
      bopp: makeMaterial(
        false,
        s("bopp", "price"),
        s("bopp", "micron"),
        s("bopp", "qty"),
      ),
    },
    normalColors: "0",
    metallicColors: "0",
    mattFinish: false,
    lamination: "none",
    slitting: false,
    wastage: "0",
  };
}

/* ─── MaterialRow ────────────────────────────────────────────────────────── */
function MaterialRow({ mat, m, onToggle, onChange }) {
  return (
    <div className="card-section">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`font-medium text-sm ${m.enabled ? "text-label" : "text-label-3"}`}
        >
          {mat.name}
        </span>
        <IOSToggle on={m.enabled} onToggle={onToggle} />
      </div>
      <div
        className={`grid grid-cols-3 gap-2 transition-opacity duration-200 ${m.enabled ? "opacity-100" : "opacity-30 pointer-events-none"}`}
      >
        <div>
          <p className="field-label mb-1">Price (₹/kg)</p>
          <input
            type="number"
            min="0"
            value={m.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="0.00"
            className="input-base"
          />
        </div>
        <div>
          <p className="field-label mb-1">Micron</p>
          <CreatableCombobox
            storageKey="gravure-microns"
            value={m.micron}
            onChange={(v) => onChange("micron", v)}
            placeholder="e.g. 12"
          />
        </div>
        <div>
          <p className="field-label mb-1">Qty (kg)</p>
          <input
            type="number"
            min="0"
            step="0.001"
            value={m.qty}
            onChange={(e) => onChange("qty", e.target.value)}
            placeholder="0.000"
            className="input-base"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── LaminationRow ──────────────────────────────────────────────────────── */
function LaminationRow({ label, checked, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full card-section flex items-center justify-between cursor-pointer hover:bg-fill-3 transition-colors"
    >
      <p className="text-sm font-medium text-label">{label}</p>
      <CheckBox checked={checked} />
    </button>
  );
}

/* ─── GravureForm ────────────────────────────────────────────────────────── */
export default function GravureForm({ onProceed, onSave, result }) {
  const [form, setForm] = useState(() => makeInitialForm());

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function setMaterial(key, field, val) {
    storeMaterialField(key, field, val);
    setForm((f) => ({
      ...f,
      materials: {
        ...f.materials,
        [key]: { ...f.materials[key], [field]: val },
      },
    }));
  }

  function toggleMaterial(key) {
    setForm((f) => ({
      ...f,
      materials: {
        ...f.materials,
        [key]: { ...f.materials[key], enabled: !f.materials[key].enabled },
      },
    }));
  }

  function handleLamination(val) {
    setField("lamination", form.lamination === val ? "none" : val);
  }

  useEffect(() => {
    onProceed?.(form);
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-section">
              <p className="field-label mb-1.5">Quote Name</p>
              <input
                type="text"
                value={form.quoteName}
                onChange={(e) => setField("quoteName", e.target.value)}
                placeholder="e.g. Customer A"
                className="input-base"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-section pb-2">
              <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
                Input Material Price
              </p>
            </div>
            {MATERIALS.map((mat, idx) => (
              <div key={mat.key}>
                {idx > 0 && <div className="divider mx-4" />}
                <MaterialRow
                  mat={mat}
                  m={form.materials[mat.key]}
                  onToggle={() => toggleMaterial(mat.key)}
                  onChange={(field, val) => setMaterial(mat.key, field, val)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-section">
              <div className="flex items-center justify-between mb-1.5">
                <p className="field-label">Pouch Size</p>
                <p className="text-xs text-label-3">
                  {form.pouchSize ? "Rate: — (DB pending)" : "Rate from DB"}
                </p>
              </div>
              <CreatableCombobox
                storageKey="gravure-pouch-sizes"
                value={form.pouchSize}
                onChange={(v) => setField("pouchSize", v)}
                placeholder="e.g. 4x6"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-section pb-2">
              <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
                Printing Charges
              </p>
            </div>
            <div className="divider mx-4" />
            <div className="card-section">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-label">
                    Normal Colors
                  </p>
                  <p className="text-xs text-label-3 mt-0.5">
                    Rate from back-end data
                  </p>
                </div>
                <CreatableCombobox
                  storageKey="gravure-normal-colors"
                  defaultOptions={COLOR_COUNTS}
                  value={form.normalColors}
                  onChange={(v) => setField("normalColors", v)}
                  placeholder="0"
                  className="w-24"
                />
              </div>
            </div>
            <div className="divider mx-4" />
            <div className="card-section">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-label">
                    Metallic Colors
                  </p>
                  <p className="text-xs text-label-3 mt-0.5">
                    Rate from back-end data
                  </p>
                </div>
                <CreatableCombobox
                  storageKey="gravure-metallic-colors"
                  defaultOptions={COLOR_COUNTS}
                  value={form.metallicColors}
                  onChange={(v) => setField("metallicColors", v)}
                  placeholder="0"
                  className="w-24"
                />
              </div>
            </div>
            <div className="divider mx-4" />
            <div className="card-section">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-label">Matt Finish</p>
                  <p className="text-xs text-label-3 mt-0.5">
                    Rate from back-end data
                  </p>
                </div>
                <IOSToggle
                  on={form.mattFinish}
                  onToggle={() => setField("mattFinish", !form.mattFinish)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-section pb-2">
              <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
                Lamination Charges
              </p>
              <p className="text-xs text-label-3 mt-0.5">
                Rate from back-end data
              </p>
            </div>
            <div className="divider mx-4" />
            <LaminationRow
              label="Single"
              checked={form.lamination === "single"}
              onClick={() => handleLamination("single")}
            />
            <div className="divider mx-4" />
            <LaminationRow
              label="Double"
              checked={form.lamination === "double"}
              onClick={() => handleLamination("double")}
            />
          </div>

          <div className="card">
            <div className="card-section">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-label">
                    Slitting Charges
                  </p>
                  <p className="text-xs text-label-3 mt-0.5">
                    Rate from back-end data
                  </p>
                </div>
                <IOSToggle
                  on={form.slitting}
                  onToggle={() => setField("slitting", !form.slitting)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-section">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-label">Wastage</p>
                <div className="flex items-center gap-2">
                  <CreatableCombobox
                    storageKey="gravure-wastage"
                    defaultOptions={WASTAGE_DEFAULTS}
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

      {/* Footer */}
      <div className="card">
        <div className="card-section flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-label">Price per kg</p>
            <p className="text-xs text-label-3 mt-0.5">
              Updates as you fill in values
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-grouped-background-3 text-label font-semibold text-base px-5 py-2 rounded-xl tracking-tight">
              {result
                ? `₹${result.pricePerKg.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / kg`
                : "— / kg"}
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
