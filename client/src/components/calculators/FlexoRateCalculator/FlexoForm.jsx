import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import FormStack from "../../form/FormStack";
import FormSection from "../../form/FormSection";
import TextField from "../../form/TextField";
import RadioField from "../../form/RadioField";
import SelectField from "../../form/SelectField";
import ToggleCompanyRow from "./formRows/ToggleCompanyRow";
import {
  makeInitialForm,
  WASTAGE_OPTIONS,
  CONVERSION_MATERIAL_TYPES,
  PRINTING_COLORS_OPTIONS,
} from "./formConfig";
import { useFlexoSettings } from "../../../context/FlexoSettingsContext";
import { useAuth } from "../../../context/AuthContext";
import {
  getFlexoCompanyOptions,
  makeFlexoChargeOptionRenderer,
  findFlexoCompanyByName,
  getCompanyCoverSizeOptions,
} from "./processCompanyOptions";

const MATERIAL_TYPE_OPTIONS = CONVERSION_MATERIAL_TYPES.map((t) => ({
  value: t,
  label: t,
}));

const COLOR_OPTIONS = PRINTING_COLORS_OPTIONS.map((c) => ({
  value: c,
  label: c,
}));

/* ─── FlexoForm ──────────────────────────────────────────────────────────── */
export default forwardRef(function FlexoForm(
  { onProceed, saveError = null },
  ref,
) {
  const [form, setForm] = useState(() => makeInitialForm());
  const [savingPriceByMaterial, setSavingPriceByMaterial] = useState({});
  const {
    settings,
    updateMaterialPrice,
    companies,
    companyCoverSizes,
    fetchCompanyCoverSizes,
  } = useFlexoSettings();
  const { canEditPrices } = useAuth();
  const canEditMaterialPrice = canEditPrices("flexo-rate-calc");

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

  // Fetch cover sizes for any company selected across the printing/gusset/cutting rows
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

  // Derive roll size options from live enabled rollSizeRates for selected material, sorted numerically
  const liveRollSizeOptions = Object.entries(
    settings?.rollSizeRates?.[form.conversionMaterial] ?? {},
  )
    .filter(([, entry]) => entry.enabled !== false)
    .map(([key]) => key)
    .sort((a, b) => parseFloat(a) - parseFloat(b));

  // Cover sizes are company-scoped only — nothing to fall back to until a
  // printing company is selected (the global rate tables this used to read
  // from are no longer editable anywhere).
  const liveCoverSizeOptions = printingCompanyObj
    ? getCompanyCoverSizeOptions(companyCoverSizes, printingCompanyObj.id)
    : [];

  function getLiveMaterialPrice(materialKey) {
    if (!materialKey) return 0;
    return settings?.materials?.[materialKey]?.priceHistory?.[0]?.price ?? 0;
  }

  function withLiveMaterialPrice(nextForm) {
    if (!nextForm.conversionMaterial) return nextForm;
    const liveMaterialPrice = getLiveMaterialPrice(nextForm.conversionMaterial);

    return {
      ...nextForm,
      materialPrice: String(liveMaterialPrice),
    };
  }

  function resetForm() {
    const next = withLiveMaterialPrice(makeInitialForm());
    setForm(next);
    onProceed?.(next);
  }

  useImperativeHandle(ref, () => ({ reset: resetForm }));

  function setField(key, val) {
    const next = { ...form, [key]: val };
    setForm(next);
    onProceed?.(next);
  }

  async function handleMaterialPriceSave(material, value) {
    const price = parseFloat(value);
    if (!material || !Number.isFinite(price) || price < 0) return;

    const current = getLiveMaterialPrice(material);
    if (String(current) === String(price)) return;
    if (savingPriceByMaterial[material]) return;

    setSavingPriceByMaterial((prev) => ({ ...prev, [material]: true }));
    try {
      await updateMaterialPrice(material, price);
    } finally {
      setSavingPriceByMaterial((prev) => ({ ...prev, [material]: false }));
    }
  }

  return (
    <FormStack>
      {/* ── Customer ── */}
      <FormSection>
        <TextField
          label="Customer / Quote Name"
          placeholder="e.g. Rajesh Traders"
          value={form.quoteName}
          onChange={(v) => setField("quoteName", v)}
          error={saveError}
        />
      </FormSection>

      {/* ── Material ── */}
      <FormSection title="Material">
        <RadioField
          name="conversionMaterial"
          options={MATERIAL_TYPE_OPTIONS}
          value={form.conversionMaterial}
          onChange={(v) => {
            const next = withLiveMaterialPrice({
              ...form,
              conversionMaterial: v,
              rollSize: "",
            });
            setForm(next);
            onProceed?.(next);
          }}
        />
        <SelectField
          label="Material Price"
          placeholder="₹ price"
          inline
          unit="₹"
          width="w-48"
          storageKey={`flexo-price-history-${form.conversionMaterial}`}
          defaultOptions={(settings?.materials?.[form.conversionMaterial]?.priceHistory ?? []).map((e) => String(e.price)).filter((v, i, a) => a.indexOf(v) === i)}
          value={form.conversionMaterial ? String(getLiveMaterialPrice(form.conversionMaterial) || "") : ""}
          onChange={(v) => {
            setField("materialPrice", v);
            handleMaterialPriceSave(form.conversionMaterial, v);
          }}
          disabled={!canEditMaterialPrice || !form.conversionMaterial || Boolean(savingPriceByMaterial[form.conversionMaterial])}
          persistOptions={false}
        />
        <SelectField
          label="Roll Size"
          placeholder="Search roll size…"
          inline
          width="w-48"
          storageKey="flexo-roll-sizes"
          defaultOptions={liveRollSizeOptions}
          value={form.rollSize}
          onChange={(v) => setField("rollSize", v)}
          creatable={false}
        />
      </FormSection>

      {/* ── Size & Printing ── */}
      <FormSection title="Size &amp; Printing">
        <SelectField
          label="Printing Company"
          placeholder="Search company…"
          defaultOptions={companyOptions}
          value={form.printingCompany}
          onChange={(v) => setField("printingCompany", v)}
          creatable={false}
          persistOptions={false}
        />
        <SelectField
          label="Cover Size"
          placeholder={
            printingCompanyObj
              ? "Search cover size…"
              : "Select a company first"
          }
          storageKey="flexo-cover-sizes"
          defaultOptions={liveCoverSizeOptions}
          value={form.coverSize}
          onChange={(v) => setField("coverSize", v)}
          formatLabel={(v) => v.replace(/\s*[xX×]\s*/, " x ")}
          creatable={false}
          disabled={!printingCompanyObj}
        />
        <RadioField
          name="printingColors"
          label="Printing Colors"
          options={COLOR_OPTIONS}
          value={form.printingColors}
          onChange={(v) => setField("printingColors", v)}
          disabled={!form.coverSize}
        />
      </FormSection>

      {/* ── Additional Charges ── */}
      <FormSection title="Additional Charges">
        <ToggleCompanyRow
          label="Gusset"
          on={form.gusset}
          onToggle={() => setField("gusset", !form.gusset)}
          companyValue={form.gussetCompany}
          onCompanyChange={(v) => setField("gussetCompany", v)}
          companyOptions={companyOptions}
        />
        <ToggleCompanyRow
          label="Cutting"
          on={form.cutting}
          onToggle={() => setField("cutting", !form.cutting)}
          companyValue={form.cuttingCompany}
          onCompanyChange={(v) => setField("cuttingCompany", v)}
          companyOptions={companyOptions}
        />
        <ToggleCompanyRow
          label="Punching"
          on={form.punching}
          onToggle={() => setField("punching", !form.punching)}
          companyValue={form.punchingCompany}
          onCompanyChange={(v) => setField("punchingCompany", v)}
          companyOptions={companyOptions}
          renderCompanyOption={punchingOptionRenderer}
        />
        <ToggleCompanyRow
          label="Opack"
          on={form.opack}
          onToggle={() => setField("opack", !form.opack)}
          companyValue={form.opackCompany}
          onCompanyChange={(v) => setField("opackCompany", v)}
          companyOptions={companyOptions}
          renderCompanyOption={opackOptionRenderer}
        />
      </FormSection>

      {/* ── Wastage & Service ── */}
      <FormSection>
        <SelectField
          label="Wastage"
          placeholder="0"
          inline
          unit="%"
          storageKey="flexo-wastage"
          defaultOptions={WASTAGE_OPTIONS}
          value={form.wastage}
          onChange={(v) => setField("wastage", v)}
        />
        <SelectField
          label="Service"
          placeholder="0"
          inline
          unit="%"
          storageKey="flexo-service"
          defaultOptions={WASTAGE_OPTIONS}
          value={form.service}
          onChange={(v) => setField("service", v)}
        />
      </FormSection>
    </FormStack>
  );
});
