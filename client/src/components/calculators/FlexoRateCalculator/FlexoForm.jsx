import { useState, useImperativeHandle, forwardRef } from "react";
import FormStack from "../../form/FormStack";
import FormSection from "../../form/FormSection";
import TextField from "../../form/TextField";
import NumberField from "../../form/NumberField";
import ToggleField from "../../form/ToggleField";
import RadioField from "../../form/RadioField";
import SelectField from "../../form/SelectField";
import {
  makeInitialForm,
  CUTTING_SIZE_OPTIONS,
  WASTAGE_OPTIONS,
  CONVERSION_MATERIAL_TYPES,
  PRINTING_COLORS_OPTIONS,
} from "./formConfig";
import { useFlexoSettings } from "../../../context/FlexoSettingsContext";
import { compareDimensions } from "../../../utils/dimensionUtils";

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
  const { settings } = useFlexoSettings();

  // Derive roll size options from live enabled rollSizeRates for selected material, sorted numerically
  const liveRollSizeOptions = Object.entries(
    settings?.rollSizeRates?.[form.conversionMaterial] ?? {},
  )
    .filter(([, entry]) => entry.enabled !== false)
    .map(([key]) => key)
    .sort((a, b) => parseFloat(a) - parseFloat(b));

  // Derive cover size options from live printingRates (sorted L then B), filtered to enabled only
  const liveCoverSizeOptions = Object.entries(settings?.printingRates ?? {})
    .filter(([, entry]) => entry.enabled !== false)
    .map(([key]) => key)
    .sort(compareDimensions);

  function withLiveMaterialPrice(nextForm) {
    const liveMaterialPrice =
      settings?.materials?.[nextForm.conversionMaterial]?.priceHistory?.[0]
        ?.price ?? 0;

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
    const next = withLiveMaterialPrice({ ...form, [key]: val });
    setForm(next);
    onProceed?.(next);
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
        <NumberField
          label="Material Price"
          value={form.materialPrice}
          onChange={(v) => setField("materialPrice", v)}
          min={0}
          unit="₹"
          disabled
        />
        <SelectField
          label="Roll Size"
          placeholder="Select"
          inline
          storageKey="flexo-roll-sizes"
          defaultOptions={liveRollSizeOptions}
          value={form.rollSize}
          onChange={(v) => setField("rollSize", v)}
        />
      </FormSection>

      {/* ── Size & Printing ── */}
      <FormSection title="Size &amp; Printing">
        <SelectField
          label="Cover Size"
          placeholder="e.g. 10x12"
          storageKey="flexo-cover-sizes"
          defaultOptions={liveCoverSizeOptions}
          value={form.coverSize}
          onChange={(v) => setField("coverSize", v)}
          formatLabel={(v) => v.replace(/\s*[xX×]\s*/, " x ")}
        />
        <RadioField
          name="printingColors"
          label="Printing Colors"
          options={COLOR_OPTIONS}
          value={form.printingColors}
          onChange={(v) => setField("printingColors", v)}
        />
      </FormSection>

      {/* ── Additional Charges ── */}
      <FormSection title="Additional Charges">
        <ToggleField
          label="Gusset"
          on={form.gusset}
          onToggle={() => setField("gusset", !form.gusset)}
        />
        <ToggleField
          label="Punching"
          on={form.punching}
          onToggle={() => setField("punching", !form.punching)}
        />
        <ToggleField
          label="Opack"
          on={form.opack}
          onToggle={() => setField("opack", !form.opack)}
        />
      </FormSection>

      {/* ── Cutting ── */}
      <FormSection>
        <SelectField
          label="Cutting Size"
          placeholder="Select"
          inline
          storageKey="flexo-cutting-sizes"
          defaultOptions={CUTTING_SIZE_OPTIONS}
          value={form.cuttingSize}
          onChange={(v) => setField("cuttingSize", v)}
        />
      </FormSection>

      {/* ── Wastage ── */}
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
      </FormSection>
    </FormStack>
  );
});
