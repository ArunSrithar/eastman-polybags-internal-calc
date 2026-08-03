import { useState, useImperativeHandle, forwardRef, useEffect, useRef } from "react";
import FormStack from "../../form/FormStack";
import FormSection from "../../form/FormSection";
import TextField from "../../form/TextField";
import NumberField from "../../form/NumberField";
import SelectField from "../../form/SelectField";
import DateField from "../../form/DateField";
import ItemRow from "../ItemRow";
import IOSToggle from "../../ui/IOSToggle";
import CreatableSelect from "../../ui/CreatableSelect";
import ProcessCountCompanyRow from "../GravureRateCalculator/formRows/ProcessCountCompanyRow";
import ToggleCompanyRow from "../GravureRateCalculator/formRows/ToggleCompanyRow";
import LaminationCompanyRow from "../GravureRateCalculator/formRows/LaminationCompanyRow";
import {
  getProcessCompanyOptions,
  makeCompanyOptionRenderer,
} from "../GravureRateCalculator/processCompanyOptions";
import {
  makeInitialForm,
  MATERIAL_ITEMS,
  FLAT_ITEMS,
  DROPDOWN_SEEDS,
  storeFlatChargePrice,
} from "./formConfig";
import {
  useGravureSettings,
  buildRatesFromSettings,
  getCurrentPrice,
} from "../../../context/GravureSettingsContext";
import {
  NORMAL_COLOR_RATE,
  METALLIC_COLOR_RATE,
  MATT_FINISH_RATE,
  SINGLE_LAM_RATE,
  DOUBLE_LAM_RATE,
  SLITTING_RATE,
  DEFAULT_POUCH_RATE,
} from "../../../constants/gravureRates";
import { fmt } from "../../../utils/format";

/* ─── Rate resolution helpers ────────────────────────────────────────────── */

const PROCESS_RATE_KEY = {
  normalColor: "normalColorRate",
  metallicColor: "metallicColorRate",
  mattFinish: "mattFinishRate",
  singleLamination: "singleLamRate",
  doubleLamination: "doubleLamRate",
  slitting: "slittingRate",
};

const PROCESS_FALLBACK = {
  normalColor: NORMAL_COLOR_RATE,
  metallicColor: METALLIC_COLOR_RATE,
  mattFinish: MATT_FINISH_RATE,
  singleLamination: SINGLE_LAM_RATE,
  doubleLamination: DOUBLE_LAM_RATE,
  slitting: SLITTING_RATE,
};

function resolveProcessRate(processKey, companyName, companies, rates) {
  const company = (companies ?? []).find(
    (c) => c.name === companyName && c.isActive !== false,
  );
  if (company) {
    const proc = company.processes?.[processKey];
    if (proc?.isAvailable !== false && Number.isFinite(proc?.price)) {
      return proc.price;
    }
  }
  const rateKey = PROCESS_RATE_KEY[processKey];
  return (rateKey ? rates?.[rateKey] : undefined) ?? PROCESS_FALLBACK[processKey] ?? 0;
}

function computePrintingPrice(printItem, companies, rates) {
  const normalColors = parseInt(printItem.normalColors) || 0;
  const normalRate = resolveProcessRate("normalColor", printItem.normalColorCompany, companies, rates);
  const metallicRate = printItem.metallicEnabled
    ? resolveProcessRate("metallicColor", printItem.metallicColorCompany, companies, rates)
    : 0;
  const mattRate = printItem.mattFinish
    ? resolveProcessRate("mattFinish", printItem.mattFinishCompany, companies, rates)
    : 0;
  return normalColors * normalRate + metallicRate + mattRate;
}

function computeLaminationPrice(lamItem, companies, rates) {
  const processKey =
    lamItem.laminationType === "double" ? "doubleLamination" : "singleLamination";
  return resolveProcessRate(processKey, lamItem.laminationCompany, companies, rates);
}

function computeSlittingPrice(slitItem, companies, rates) {
  return resolveProcessRate("slitting", slitItem.slittingCompany, companies, rates);
}

function computePouchPrice(pouchItem, settings, companies) {
  if (!pouchItem.pouchCompany || !pouchItem.pouchSize) return DEFAULT_POUCH_RATE;
  const activeCompanies = (companies ?? []).filter((c) => c.isActive !== false);
  const company = activeCompanies.find((c) => c.name === pouchItem.pouchCompany);
  if (!company) return DEFAULT_POUCH_RATE;
  const entry = (settings?.pouches ?? []).find(
    (p) =>
      p.companyId === company.id &&
      `${p.length} x ${p.breadth}` === pouchItem.pouchSize,
  );
  return entry?.types?.normalPouch?.price ?? DEFAULT_POUCH_RATE;
}

function pouchEntrySize(entry) {
  return `${entry.length} x ${entry.breadth}`;
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

const LAMINATION_OPTIONS = [
  { value: "single", label: "Single Lamination" },
  { value: "double", label: "Double Lamination" },
];

/* ─── JobCostForm ────────────────────────────────────────────────────────── */
export default forwardRef(function JobCostForm(
  { onProceed, saveError = null },
  ref,
) {
  const { settings, companies } = useGravureSettings();
  const rates = settings ? buildRatesFromSettings(settings) : null;

  const [form, setForm] = useState(() => makeInitialForm(rates, settings));

  const pendingSyncRef = useRef(null);
  const didSyncMaterials = useRef(false);

  // Sync material prices when settings change mid-session
  useEffect(() => {
    if (!settings?.materials) return;
    setForm((prev) => {
      const nextItems = { ...prev.items };
      let changed = false;
      const MAT_MAP = {
        polyster: "polyester",
        silverPolyster: "silverPet",
        boppSilver: "bopp",
        ldnLdop: "ldRoll",
      };
      for (const [itemKey, settingsKey] of Object.entries(MAT_MAP)) {
        const settingsPrice = getCurrentPrice(settings.materials[settingsKey]);
        if (settingsPrice && String(nextItems[itemKey]?.price) !== String(settingsPrice)) {
          nextItems[itemKey] = { ...nextItems[itemKey], price: String(settingsPrice) };
          changed = true;
        }
      }
      if (!changed) return prev;
      const next = { ...prev, items: nextItems };
      if (didSyncMaterials.current) pendingSyncRef.current = next;
      didSyncMaterials.current = true;
      return next;
    });
  }, [settings?.materials]);

  // Derive total material qty (sum of enabled material items)
  const totalMaterialQty = MATERIAL_ITEMS.reduce((sum, def) => {
    const item = form.items[def.key];
    if (!item?.enabled) return sum;
    return sum + (parseFloat(item.qty) || 0);
  }, 0);

  // Sync charge item qty fields when total material qty changes (read-only auto-derive)
  useEffect(() => {
    const qty = String(totalMaterialQty);
    const chargeKeys = ["printingCharges", "laminationCharges", "slittingCharges", "pouchMakingCharges"];
    setForm((prev) => {
      const nextItems = { ...prev.items };
      let changed = false;
      for (const key of chargeKeys) {
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

  // Fire any pending onProceed callbacks after render
  useEffect(() => {
    if (pendingSyncRef.current) {
      onProceed?.(pendingSyncRef.current);
      pendingSyncRef.current = null;
    }
  });

  function resetForm() {
    const freshRates = settings ? buildRatesFromSettings(settings) : null;
    const next = makeInitialForm(freshRates, settings);
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
    if (
      field === "price" &&
      (itemKey === "packingCharges" || itemKey === "transportCharge")
    ) {
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

  function setChargeItemFields(itemKey, fields) {
    const merged = { ...form.items[itemKey], ...fields };
    let price = merged.price;

    if (itemKey === "printingCharges" && !("price" in fields)) {
      price = String(computePrintingPrice(merged, companies, rates));
    } else if (itemKey === "laminationCharges" && !("price" in fields)) {
      price = String(computeLaminationPrice(merged, companies, rates));
    } else if (itemKey === "slittingCharges" && !("price" in fields)) {
      price = String(computeSlittingPrice(merged, companies, rates));
    } else if (itemKey === "pouchMakingCharges" && !("price" in fields)) {
      price = String(computePouchPrice(merged, settings, companies));
    }

    const next = {
      ...form,
      items: { ...form.items, [itemKey]: { ...merged, price } },
    };
    setForm(next);
    onProceed?.(next);
  }

  function toggleItem(itemKey) {
    const next = {
      ...form,
      items: {
        ...form.items,
        [itemKey]: { ...form.items[itemKey], enabled: !form.items[itemKey].enabled },
      },
    };
    setForm(next);
    onProceed?.(next);
  }

  /* ── Company option helpers ── */
  const activeCompanies = (companies ?? []).filter((c) => c.isActive !== false);

  const normalColorOptions = getProcessCompanyOptions(companies, "normalColor");
  const metallicColorOptions = getProcessCompanyOptions(companies, "metallicColor");
  const mattFinishOptions = getProcessCompanyOptions(companies, "mattFinish");
  const singleLamOptions = getProcessCompanyOptions(companies, "singleLamination");
  const doubleLamOptions = getProcessCompanyOptions(companies, "doubleLamination");
  const slittingOptions = getProcessCompanyOptions(companies, "slitting");

  const renderNormalColor = makeCompanyOptionRenderer(companies, "normalColor");
  const renderMetallicColor = makeCompanyOptionRenderer(companies, "metallicColor");
  const renderMattFinish = makeCompanyOptionRenderer(companies, "mattFinish");
  const renderSingleLam = makeCompanyOptionRenderer(companies, "singleLamination");
  const renderDoubleLam = makeCompanyOptionRenderer(companies, "doubleLamination");
  const renderSlitting = makeCompanyOptionRenderer(companies, "slitting");

  /* ── Pouch data ── */
  const activeCompanyById = new Map(activeCompanies.map((c) => [c.id, c]));
  const allPouchEntries = (settings?.pouches ?? []).filter(
    (e) => e.companyId && activeCompanyById.has(e.companyId),
  );
  const pouchCompanyByName = new Map(activeCompanies.map((c) => [c.name, c]));
  const pouchItem = form.items.pouchMakingCharges;

  const filteredPouchCompanyOptions = activeCompanies
    .filter((c) => {
      const entries = allPouchEntries.filter((e) => e.companyId === c.id);
      if (entries.length === 0) return false;
      if (!pouchItem.pouchSize) return true;
      return entries.some((e) => pouchEntrySize(e) === pouchItem.pouchSize);
    })
    .map((c) => ({ value: c.name, label: c.name }));

  const filteredPouchSizeOptions = pouchItem.pouchCompany
    ? Array.from(new Set(
        allPouchEntries
          .filter((e) => {
            const company = pouchCompanyByName.get(pouchItem.pouchCompany);
            return company && e.companyId === company.id;
          })
          .map(pouchEntrySize),
      )).sort((a, b) => a.localeCompare(b))
    : Array.from(new Set(allPouchEntries.map(pouchEntrySize))).sort((a, b) =>
        a.localeCompare(b),
      );

  function handlePouchCompanyChange(nextCompany) {
    const company = pouchCompanyByName.get(nextCompany);
    let nextSize = pouchItem.pouchSize;
    if (nextSize && company) {
      const hasSize = allPouchEntries.some(
        (e) => e.companyId === company.id && pouchEntrySize(e) === nextSize,
      );
      if (!hasSize) nextSize = "";
    }
    setChargeItemFields("pouchMakingCharges", { pouchCompany: nextCompany, pouchSize: nextSize });
  }

  function handlePouchSizeChange(nextSize) {
    let nextCompany = pouchItem.pouchCompany;
    if (nextCompany) {
      const company = pouchCompanyByName.get(nextCompany);
      if (company) {
        const hasSize = allPouchEntries.some(
          (e) => e.companyId === company.id && pouchEntrySize(e) === nextSize,
        );
        if (!hasSize) nextCompany = "";
      }
    }
    setChargeItemFields("pouchMakingCharges", { pouchSize: nextSize, pouchCompany: nextCompany });
  }

  /* ── Lamination type change ── */
  function handleLaminationTypeChange(newType) {
    const newProcessKey = newType === "double" ? "doubleLamination" : "singleLamination";
    const available = getProcessCompanyOptions(companies, newProcessKey);
    const companyStillValid = available.some(
      (o) => o.value === form.items.laminationCharges.laminationCompany,
    );
    setChargeItemFields("laminationCharges", {
      laminationType: newType,
      laminationCompany: companyStillValid ? form.items.laminationCharges.laminationCompany : "",
    });
  }

  /* ── Convenience aliases ── */
  const printItem = form.items.printingCharges;
  const lamItem = form.items.laminationCharges;
  const slitItem = form.items.slittingCharges;
  const lamIsDouble = lamItem.laminationType === "double";

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
        <DateField
          label="Job Card Date"
          value={form.jobCardDate}
          onChange={(v) => setField("jobCardDate", v)}
        />
        <TextField
          label="Job Card No"
          placeholder="e.g. JC-001"
          inline
          value={form.jobCardNo}
          onChange={(v) => setField("jobCardNo", v)}
        />
        <SelectField
          label="Job Work Company"
          placeholder="Select or type"
          inline
          width="flex-1"
          storageKey="job-cost-companies"
          defaultOptions={DROPDOWN_SEEDS.jobWorkCompanies}
          value={form.jobWorkCompany}
          onChange={(v) => setField("jobWorkCompany", v)}
        />
        <TextField
          label="Billing No"
          placeholder="e.g. B-001"
          inline
          value={form.billingNo}
          onChange={(v) => setField("billingNo", v)}
        />
        <DateField
          label="Billing Date"
          value={form.billingDate}
          onChange={(v) => setField("billingDate", v)}
        />
        <DateField
          label="Dispatch Date"
          value={form.dispatchDate}
          onChange={(v) => setField("dispatchDate", v)}
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
      </FormSection>

      {/* ── Specifications ── */}
      <FormSection title="Specifications">
        <TextField
          label="Film"
          placeholder="e.g. PET / BOPP"
          inline
          value={form.film}
          onChange={(v) => setField("film", v)}
        />
        <SelectField
          label="Micron"
          placeholder="Select"
          inline
          width="w-40"
          storageKey="job-cost-microns"
          defaultOptions={DROPDOWN_SEEDS.microns}
          value={form.micron}
          onChange={(v) => setField("micron", v)}
        />
        <SelectField
          label="No. of Colours"
          placeholder="Select"
          inline
          width="w-40"
          storageKey="job-cost-colours"
          defaultOptions={DROPDOWN_SEEDS.colours}
          value={form.noOfColours}
          onChange={(v) => setField("noOfColours", v)}
        />
      </FormSection>

      {/* ── Materials ── */}
      <FormSection title="Materials">
        {MATERIAL_ITEMS.map((def) => (
          <ItemRow
            key={def.key}
            def={def}
            item={form.items[def.key]}
            onToggle={() => toggleItem(def.key)}
            onChange={(field, val) => setItem(def.key, field, val)}
          />
        ))}
      </FormSection>

      {/* ── Printing Charges ── */}
      <FormSection title="Printing Charges">
        <ChargeHeaderRow
          label="Printing Charges"
          on={printItem.enabled}
          onToggle={() => toggleItem("printingCharges")}
          totalQty={totalMaterialQty}
          price={printItem.price}
          onPriceChange={(v) => setChargeItemFields("printingCharges", { price: v })}
        />
        <ProcessCountCompanyRow
          label="Normal Colors"
          value={printItem.normalColors}
          onValueChange={(v) => setChargeItemFields("printingCharges", { normalColors: v })}
          companyValue={printItem.normalColorCompany}
          onCompanyChange={(v) => setChargeItemFields("printingCharges", { normalColorCompany: v })}
          companyOptions={normalColorOptions}
          renderCompanyOption={renderNormalColor}
          companyDisabled={Number(printItem.normalColors || 0) <= 0}
        />
        <ToggleCompanyRow
          label="Metallic Colors"
          on={printItem.metallicEnabled}
          onToggle={() => setChargeItemFields("printingCharges", { metallicEnabled: !printItem.metallicEnabled })}
          companyValue={printItem.metallicColorCompany}
          onCompanyChange={(v) => setChargeItemFields("printingCharges", { metallicColorCompany: v })}
          companyOptions={metallicColorOptions}
          renderCompanyOption={renderMetallicColor}
        />
        <ToggleCompanyRow
          label="Matt Finish"
          on={printItem.mattFinish}
          onToggle={() => setChargeItemFields("printingCharges", { mattFinish: !printItem.mattFinish })}
          companyValue={printItem.mattFinishCompany}
          onCompanyChange={(v) => setChargeItemFields("printingCharges", { mattFinishCompany: v })}
          companyOptions={mattFinishOptions}
          renderCompanyOption={renderMattFinish}
        />
      </FormSection>

      {/* ── Lamination ── */}
      <FormSection title="Lamination">
        <ChargeHeaderRow
          label="Lamination Charges"
          on={lamItem.enabled}
          onToggle={() => toggleItem("laminationCharges")}
          totalQty={totalMaterialQty}
          price={lamItem.price}
          onPriceChange={(v) => setChargeItemFields("laminationCharges", { price: v })}
        />
        <LaminationCompanyRow
          lamination={lamItem.laminationType}
          onLaminationChange={handleLaminationTypeChange}
          laminationOptions={LAMINATION_OPTIONS}
          companyValue={lamItem.laminationCompany}
          onCompanyChange={(v) => setChargeItemFields("laminationCharges", { laminationCompany: v })}
          companyOptions={lamIsDouble ? doubleLamOptions : singleLamOptions}
          renderCompanyOption={lamIsDouble ? renderDoubleLam : renderSingleLam}
        />
      </FormSection>

      {/* ── Slitting ── */}
      <FormSection>
        <ChargeHeaderRow
          label="Slitting Charges"
          on={slitItem.enabled}
          onToggle={() => toggleItem("slittingCharges")}
          totalQty={totalMaterialQty}
          price={slitItem.price}
          onPriceChange={(v) => setChargeItemFields("slittingCharges", { price: v })}
        />
        <ToggleCompanyRow
          label="Slitting"
          on={slitItem.enabled}
          onToggle={() => toggleItem("slittingCharges")}
          companyValue={slitItem.slittingCompany}
          onCompanyChange={(v) => setChargeItemFields("slittingCharges", { slittingCompany: v })}
          companyOptions={slittingOptions}
          renderCompanyOption={renderSlitting}
        />
      </FormSection>

      {/* ── Pouch Making ── */}
      <FormSection title="Pouch Making">
        <ChargeHeaderRow
          label="Pouch Making Charges"
          on={pouchItem.enabled}
          onToggle={() => toggleItem("pouchMakingCharges")}
          totalQty={totalMaterialQty}
          price={pouchItem.price}
          onPriceChange={(v) => setChargeItemFields("pouchMakingCharges", { price: v })}
        />
        <SelectField
          label="Pouch Company"
          placeholder="Select company"
          value={pouchItem.pouchCompany}
          onChange={handlePouchCompanyChange}
          options={filteredPouchCompanyOptions}
          creatable={false}
        />
        <div className="card-section pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="field-label mb-1.5">Pouch Size</p>
              <CreatableSelect
                defaultOptions={filteredPouchSizeOptions}
                value={pouchItem.pouchSize}
                onChange={handlePouchSizeChange}
                placeholder="Search pouch size..."
                creatable={false}
                persistOptions={false}
                disabled={!pouchItem.pouchCompany}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── Wastage ── */}
      <FormSection>
        <SelectField
          label="Wastage"
          placeholder="0"
          inline
          unit="%"
          defaultOptions={["0", "1", "2", "3", "4", "5", "8", "10"]}
          value={form.wastage}
          onChange={(v) => setField("wastage", v)}
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
