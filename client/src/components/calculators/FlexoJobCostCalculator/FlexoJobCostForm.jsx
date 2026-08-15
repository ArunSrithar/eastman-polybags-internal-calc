import { useState, useImperativeHandle, forwardRef, useEffect, useRef } from "react";
import FormStack from "../../form/FormStack";
import FormSection from "../../form/FormSection";
import TextField from "../../form/TextField";
import NumberField from "../../form/NumberField";
import SelectField from "../../form/SelectField";
import RadioField from "../../form/RadioField";
import DateField from "../../form/DateField";
import IOSToggle from "../../ui/IOSToggle";
import {
  makeInitialForm,
  FLAT_ITEMS,
  DROPDOWN_SEEDS,
  storeFlatChargePrice,
} from "./formConfig";
import {
  useFlexoSettings,
  getCurrentRate,
} from "../../../context/FlexoSettingsContext";
import { fmt } from "../../../utils/format";
import ItemRow from "../ItemRow";
import {
  getFlexoCompanyOptions,
  makeFlexoChargeOptionRenderer,
  findFlexoCompanyByName,
  getCompanyCoverSizeOptions,
} from "../FlexoRateCalculator/processCompanyOptions";

/* ─── Price compute helpers ──────────────────────────────────────────────── */

function computeRollSizePrice(materialType, rollSizeSpec, settings) {
  if (!materialType || !rollSizeSpec || !settings) return 0;
  // Prefer the newer rollSizeRates model; fall back to conversionRates
  const rollSizeCell = settings.rollSizeRates?.[materialType]?.[rollSizeSpec];
  if (rollSizeCell) return getCurrentRate(rollSizeCell);
  const convCell = settings.conversionRates?.[materialType]?.rates?.[rollSizeSpec];
  return getCurrentRate(convCell);
}

function computePrintingPrice(
  coverSize,
  printColors,
  settings,
  company,
  companyCoverSizes,
) {
  if (!coverSize || !printColors) return 0;
  if (company) {
    const doc = (companyCoverSizes?.[company.id] ?? []).find(
      (cs) => cs.coverSize === coverSize,
    );
    return doc?.printingColors?.[String(printColors)]?.price ?? 0;
  }
  if (!settings) return 0;
  return getCurrentRate(settings.printingRates?.[coverSize]?.[String(printColors)]);
}

function computeGussetPrice(coverSize, settings, company, companyCoverSizes) {
  if (!coverSize) return 0;
  if (company) {
    const doc = (companyCoverSizes?.[company.id] ?? []).find(
      (cs) => cs.coverSize === coverSize,
    );
    return doc?.gussetRate?.price ?? 0;
  }
  if (!settings) return 0;
  return getCurrentRate(settings.gussetRates?.[coverSize]);
}

function computeCuttingPrice(coverSize, settings, company, companyCoverSizes) {
  if (!coverSize) return 0;
  if (company) {
    const doc = (companyCoverSizes?.[company.id] ?? []).find(
      (cs) => cs.coverSize === coverSize,
    );
    return doc?.cuttingRate?.price ?? 0;
  }
  if (!settings) return 0;
  return getCurrentRate(settings.cuttingRates?.[coverSize]);
}

function computeOpaquePrice(settings, company) {
  if (company) return company.charges?.opack?.price ?? 0;
  return getCurrentRate(settings?.opackRate);
}

function computePunchingPrice(settings, company) {
  if (company) return company.charges?.punching?.price ?? 0;
  return getCurrentRate(settings?.punchingRate);
}

/* ─── Charge section header row ──────────────────────────────────────────── */
function ChargeHeaderRow({ label, on, onToggle, totalQty, price, onPriceChange }) {
  return (
    <div className="card-section">
      <div className={`flex items-center gap-3 ${on ? "" : "opacity-50"}`}>
        <IOSToggle on={on} onToggle={onToggle} />
        <span className={`flex-1 text-sm font-semibold ${on ? "text-label" : "text-label-3"}`}>
          {label}
        </span>
        {totalQty > 0 && (
          <span className="text-sm text-label-3 tabular-nums shrink-0">
            {fmt(totalQty)} kg
          </span>
        )}
        <div className={`flex items-center input-base p-0 overflow-hidden w-44 shrink-0 ${on ? "" : "pointer-events-none"}`}>
          <span className="px-3 text-label-3 text-sm border-r border-separator shrink-0">₹</span>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="0.00"
            className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm outline-none input-no-spinner"
          />
          <span className="px-2 text-label-3 text-xs shrink-0">per kg</span>
        </div>
      </div>
    </div>
  );
}

const MATERIAL_TYPE_OPTIONS = [
  { value: "PP", label: "PP" },
  { value: "HM", label: "HM" },
  { value: "LD", label: "LD" },
];

const PROCESSING_CHARGE_KEYS = [
  "rollSize",
  "printing",
  "gusset",
  "cutting",
  "opaque",
  "punching",
];

/* ─── FlexoJobCostForm ───────────────────────────────────────────────────── */
export default forwardRef(function FlexoJobCostForm(
  { onProceed, saveError = null },
  ref,
) {
  const { settings, companies, companyCoverSizes, fetchCompanyCoverSizes } =
    useFlexoSettings();
  const [form, setForm] = useState(() => makeInitialForm(settings));

  const pendingSyncRef = useRef(null);

  const companyOptions = getFlexoCompanyOptions(companies);
  const punchingOptionRenderer = makeFlexoChargeOptionRenderer(
    companies,
    "punching",
  );
  const opackOptionRenderer = makeFlexoChargeOptionRenderer(companies, "opack");

  const printingCompanyObj = findFlexoCompanyByName(
    companies,
    form.printingCompany,
  );
  const gussetCompanyObj = findFlexoCompanyByName(companies, form.gussetCompany);
  const cuttingCompanyObj = findFlexoCompanyByName(
    companies,
    form.cuttingCompany,
  );
  const opackCompanyObj = findFlexoCompanyByName(companies, form.opackCompany);
  const punchingCompanyObj = findFlexoCompanyByName(
    companies,
    form.punchingCompany,
  );

  const liveCoverSizeOptions = printingCompanyObj
    ? getCompanyCoverSizeOptions(companyCoverSizes, printingCompanyObj.id)
    : DROPDOWN_SEEDS.coverSizes;

  // Fetch cover sizes for any company selected across printing/gusset/cutting
  useEffect(() => {
    for (const companyName of [
      form.printingCompany,
      form.gussetCompany,
      form.cuttingCompany,
    ]) {
      if (!companyName) continue;
      const company = findFlexoCompanyByName(companies, companyName);
      if (company && !companyCoverSizes[company.id]) {
        fetchCompanyCoverSizes(company.id);
      }
    }
  }, [
    form.printingCompany,
    form.gussetCompany,
    form.cuttingCompany,
    companies,
    companyCoverSizes,
    fetchCompanyCoverSizes,
  ]);

  // Auto-fill material price when materialType changes or settings load
  useEffect(() => {
    if (!settings?.materials) return;
    const matPrice = settings.materials[form.materialType]?.priceHistory?.[0]?.price;
    if (!matPrice) return;
    const current = form.items.material?.price;
    if (String(current) === String(matPrice)) return;
    setForm((prev) => {
      const next = {
        ...prev,
        items: {
          ...prev.items,
          material: { ...prev.items.material, price: String(matPrice) },
        },
      };
      pendingSyncRef.current = next;
      return next;
    });
  }, [form.materialType, settings?.materials]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fill processing charge prices from spec fields + settings (company-aware)
  useEffect(() => {
    if (!settings) return;
    const newPrices = {
      rollSize: String(computeRollSizePrice(form.materialType, form.rollSizeSpec, settings)),
      printing: String(
        computePrintingPrice(
          form.coverSize,
          form.printColors,
          settings,
          printingCompanyObj,
          companyCoverSizes,
        ),
      ),
      gusset: String(
        computeGussetPrice(form.coverSize, settings, gussetCompanyObj, companyCoverSizes),
      ),
      cutting: String(
        computeCuttingPrice(form.coverSize, settings, cuttingCompanyObj, companyCoverSizes),
      ),
      opaque: String(computeOpaquePrice(settings, opackCompanyObj)),
      punching: String(computePunchingPrice(settings, punchingCompanyObj)),
    };
    setForm((prev) => {
      const nextItems = { ...prev.items };
      let changed = false;
      for (const [key, price] of Object.entries(newPrices)) {
        if (nextItems[key]?.price !== price) {
          nextItems[key] = { ...nextItems[key], price };
          changed = true;
        }
      }
      if (!changed) return prev;
      const next = { ...prev, items: nextItems };
      pendingSyncRef.current = next;
      return next;
    });
  }, [
    form.materialType,
    form.rollSizeSpec,
    form.coverSize,
    form.printColors,
    settings,
    printingCompanyObj,
    gussetCompanyObj,
    cuttingCompanyObj,
    opackCompanyObj,
    punchingCompanyObj,
    companyCoverSizes,
  ]);

  // Auto-derive processing charge qty from material qty
  const totalMaterialQty = parseFloat(form.items.material?.qty) || 0;

  useEffect(() => {
    const qty = String(totalMaterialQty);
    setForm((prev) => {
      const nextItems = { ...prev.items };
      let changed = false;
      for (const key of PROCESSING_CHARGE_KEYS) {
        if (nextItems[key]?.qty !== qty) {
          nextItems[key] = { ...nextItems[key], qty };
          changed = true;
        }
      }
      if (!changed) return prev;
      const next = { ...prev, items: nextItems };
      pendingSyncRef.current = next;
      return next;
    });
  }, [totalMaterialQty]);

  // Fire pending onProceed after each render
  useEffect(() => {
    if (pendingSyncRef.current) {
      onProceed?.(pendingSyncRef.current);
      pendingSyncRef.current = null;
    }
  });

  function resetForm() {
    const next = makeInitialForm(settings);
    setForm(next);
    onProceed?.(next);
  }

  useImperativeHandle(ref, () => ({ reset: resetForm }));

  function setField(key, val) {
    const next = { ...form, [key]: val };
    setForm(next);
    onProceed?.(next);
  }

  function setItem(itemKey, field, val) {
    if (field === "price" && (itemKey === "packingCharges" || itemKey === "transportCharges")) {
      storeFlatChargePrice(itemKey, val);
    }
    const next = {
      ...form,
      items: {
        ...form.items,
        [itemKey]: { ...form.items[itemKey], [field]: val },
      },
    };
    setForm(next);
    onProceed?.(next);
  }

  function setProcessingPrice(itemKey, val) {
    setItem(itemKey, "price", val);
  }

  function toggleItem(itemKey) {
    const next = {
      ...form,
      items: {
        ...form.items,
        [itemKey]: {
          ...form.items[itemKey],
          enabled: !form.items[itemKey].enabled,
        },
      },
    };
    setForm(next);
    onProceed?.(next);
  }

  // Handle materialType change — also triggers material price sync via useEffect
  function handleMaterialTypeChange(val) {
    // Clear rollSizeSpec when material changes (roll sizes differ per material)
    setForm((prev) => {
      const next = { ...prev, materialType: val, rollSizeSpec: "" };
      onProceed?.(next);
      return next;
    });
  }

  return (
    <FormStack>
      {/* ── Customer & Quote Name ── */}
      <FormSection>
        <TextField
          label="Customer / Quote Name"
          placeholder="e.g. Rajesh Traders"
          value={form.quoteName}
          onChange={(v) => setField("quoteName", v)}
          error={saveError}
        />
      </FormSection>

      {/* ── Job Details ── */}
      <FormSection title="Job Details">
        <TextField
          label="Invoice No"
          placeholder="e.g. INV-001"
          inline
          value={form.invNo}
          onChange={(v) => setField("invNo", v)}
        />
        <TextField
          label="Job Card No"
          placeholder="e.g. JC-001"
          inline
          value={form.jobCardNo}
          onChange={(v) => setField("jobCardNo", v)}
        />
        <DateField
          label="Job Card Date"
          value={form.jobCardDate}
          onChange={(v) => setField("jobCardDate", v)}
        />
        <DateField
          label="Dispatch Date"
          value={form.dispatchDate}
          onChange={(v) => setField("dispatchDate", v)}
        />
        <DateField
          label="Billing Date"
          value={form.billingDate}
          onChange={(v) => setField("billingDate", v)}
        />
        <NumberField
          label="Billing Rate"
          unit="₹"
          width="w-40"
          value={form.billingRate}
          onChange={(v) => setField("billingRate", v)}
          min={0}
          placeholder="0.00"
        />
        <NumberField
          label="No. of Bundles"
          width="w-40"
          value={form.noOfBundles}
          onChange={(v) => setField("noOfBundles", v)}
          min={0}
          placeholder="0"
        />
        <SelectField
          label="Job Work Place"
          placeholder="Select or type"
          inline
          width="flex-1"
          storageKey="flexo-job-cost-workplaces"
          defaultOptions={DROPDOWN_SEEDS.jobWorkPlaces}
          value={form.jobWorkPlace}
          onChange={(v) => setField("jobWorkPlace", v)}
        />
      </FormSection>

      {/* ── Specifications ── */}
      <FormSection title="Specifications">
        <RadioField
          name="materialType"
          label="Material Type"
          options={MATERIAL_TYPE_OPTIONS}
          value={form.materialType}
          onChange={handleMaterialTypeChange}
        />
        <NumberField
          label="Material Price"
          unit="₹"
          width="w-40"
          value={form.items.material.price}
          onChange={(v) => setItem("material", "price", v)}
          min={0}
          placeholder="0.00"
        />
        <NumberField
          label="Material Qty"
          unit="kg"
          width="w-48"
          value={form.items.material.qty}
          onChange={(v) => setItem("material", "qty", v)}
          min={0}
          placeholder="0.00"
        />
        <SelectField
          label="Roll Size"
          placeholder="Select"
          inline
          width="w-40"
          storageKey="flexo-job-cost-roll-sizes"
          defaultOptions={DROPDOWN_SEEDS.rollSizes}
          value={form.rollSizeSpec}
          onChange={(v) => setField("rollSizeSpec", v)}
        />
        <NumberField
          label="Micron"
          width="w-40"
          value={form.micron}
          onChange={(v) => setField("micron", v)}
          min={0}
          placeholder="0"
        />
        <SelectField
          label="Print Colours"
          placeholder="Select"
          inline
          width="w-48"
          storageKey="flexo-job-cost-print-colors"
          defaultOptions={DROPDOWN_SEEDS.printColors}
          value={form.printColors}
          onChange={(v) => setField("printColors", v)}
        />
        <SelectField
          label="Printing Company"
          placeholder="Select company"
          inline
          width="w-48"
          defaultOptions={companyOptions}
          value={form.printingCompany}
          onChange={(v) => setField("printingCompany", v)}
          creatable={false}
          persistOptions={false}
        />
        <SelectField
          label="Cover Size"
          placeholder="Select"
          inline
          width="w-40"
          storageKey="flexo-job-cost-cover-sizes"
          defaultOptions={liveCoverSizeOptions}
          value={form.coverSize}
          onChange={(v) => setField("coverSize", v)}
        />
      </FormSection>

      {/* ── Processing Charges — one card per type ── */}
      <FormSection title="Roll Size">
        <ChargeHeaderRow
          label="Roll Size Charges"
          on={form.items.rollSize.enabled}
          onToggle={() => toggleItem("rollSize")}
          totalQty={totalMaterialQty}
          price={form.items.rollSize.price}
          onPriceChange={(v) => setProcessingPrice("rollSize", v)}
        />
      </FormSection>

      <FormSection title="Printing">
        <ChargeHeaderRow
          label="Printing Charges"
          on={form.items.printing.enabled}
          onToggle={() => toggleItem("printing")}
          totalQty={totalMaterialQty}
          price={form.items.printing.price}
          onPriceChange={(v) => setProcessingPrice("printing", v)}
        />
      </FormSection>

      <FormSection title="Gusset">
        <ChargeHeaderRow
          label="Gusset Charges"
          on={form.items.gusset.enabled}
          onToggle={() => toggleItem("gusset")}
          totalQty={totalMaterialQty}
          price={form.items.gusset.price}
          onPriceChange={(v) => setProcessingPrice("gusset", v)}
        />
        <SelectField
          label="Company"
          placeholder="Select company"
          inline
          width="w-48"
          defaultOptions={companyOptions}
          value={form.gussetCompany}
          onChange={(v) => setField("gussetCompany", v)}
          creatable={false}
          persistOptions={false}
        />
      </FormSection>

      <FormSection title="Cutting">
        <ChargeHeaderRow
          label="Cutting Charges"
          on={form.items.cutting.enabled}
          onToggle={() => toggleItem("cutting")}
          totalQty={totalMaterialQty}
          price={form.items.cutting.price}
          onPriceChange={(v) => setProcessingPrice("cutting", v)}
        />
        <SelectField
          label="Company"
          placeholder="Select company"
          inline
          width="w-48"
          defaultOptions={companyOptions}
          value={form.cuttingCompany}
          onChange={(v) => setField("cuttingCompany", v)}
          creatable={false}
          persistOptions={false}
        />
      </FormSection>

      <FormSection title="Opaque">
        <ChargeHeaderRow
          label="Opaque Charges"
          on={form.items.opaque.enabled}
          onToggle={() => toggleItem("opaque")}
          totalQty={totalMaterialQty}
          price={form.items.opaque.price}
          onPriceChange={(v) => setProcessingPrice("opaque", v)}
        />
        <SelectField
          label="Company"
          placeholder="Select company"
          inline
          width="w-48"
          defaultOptions={companyOptions}
          value={form.opackCompany}
          onChange={(v) => setField("opackCompany", v)}
          creatable={false}
          persistOptions={false}
          renderOption={opackOptionRenderer}
        />
      </FormSection>

      <FormSection title="Punching">
        <ChargeHeaderRow
          label="Punching Charges"
          on={form.items.punching.enabled}
          onToggle={() => toggleItem("punching")}
          totalQty={totalMaterialQty}
          price={form.items.punching.price}
          onPriceChange={(v) => setProcessingPrice("punching", v)}
        />
        <SelectField
          label="Company"
          placeholder="Select company"
          inline
          width="w-48"
          defaultOptions={companyOptions}
          value={form.punchingCompany}
          onChange={(v) => setField("punchingCompany", v)}
          creatable={false}
          persistOptions={false}
          renderOption={punchingOptionRenderer}
        />
      </FormSection>

      {/* ── Weights ── */}
      <FormSection title="Weights">
        <NumberField
          label="Finished Weight"
          value={form.finishedWeight}
          onChange={(v) => setField("finishedWeight", v)}
          min={0}
          unit="kg"
          width="w-48"
          placeholder="0.00"
        />
        <NumberField
          label="Dispatch Weight"
          value={form.dispatchWeight}
          onChange={(v) => setField("dispatchWeight", v)}
          min={0}
          unit="kg"
          width="w-48"
          placeholder="0.00"
        />
      </FormSection>

      {/* ── Other Charges (packing + transport) ── */}
      <FormSection title="Other Charges">
        {FLAT_ITEMS.map((def) => (
          <ItemRow
            key={def.key}
            def={def}
            item={form.items[def.key]}
            onToggle={() => toggleItem(def.key)}
            onChange={(field, val) => setItem(def.key, field, val)}
          />
        ))}
      </FormSection>
    </FormStack>
  );
});
