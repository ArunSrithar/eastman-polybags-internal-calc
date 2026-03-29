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
  ROLL_SIZE_OPTIONS,
  CUTTING_SIZE_OPTIONS,
  COVER_SIZE_OPTIONS,
  WASTAGE_OPTIONS,
  CONVERSION_MATERIAL_TYPES,
  PRINTING_COLORS_OPTIONS,
} from "./formConfig";

const MATERIAL_TYPE_OPTIONS = CONVERSION_MATERIAL_TYPES.map((t) => ({
  value: t,
  label: t,
}));

const COLOR_OPTIONS = PRINTING_COLORS_OPTIONS.map((c) => ({
  value: c,
  label: c === "1" ? "1 Color" : `${c} Colors`,
}));

/* ─── FlexoForm ──────────────────────────────────────────────────────────── */
export default forwardRef(function FlexoForm(
  { onProceed, saveError = null },
  ref,
) {
  const [form, setForm] = useState(() => makeInitialForm());

  function resetForm() {
    const next = makeInitialForm();
    setForm(next);
    onProceed?.(next);
  }

  useImperativeHandle(ref, () => ({ reset: resetForm }));

  function setField(key, val) {
    const next = { ...form, [key]: val };
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
        <NumberField
          label="Material Price"
          value={form.materialPrice}
          onChange={(v) => setField("materialPrice", v)}
          min={0}
          unit="₹"
        />
        <RadioField
          name="conversionMaterial"
          options={MATERIAL_TYPE_OPTIONS}
          value={form.conversionMaterial}
          onChange={(v) => setField("conversionMaterial", v)}
        />
      </FormSection>

      {/* ── Size & Printing ── */}
      <FormSection title="Size &amp; Printing">
        <SelectField
          label="Cover Size"
          placeholder="e.g. 10x12"
          storageKey="flexo-cover-sizes"
          defaultOptions={COVER_SIZE_OPTIONS}
          value={form.coverSize}
          onChange={(v) => setField("coverSize", v)}
        />
        <SelectField
          label="Roll Size"
          placeholder="Select"
          inline
          storageKey="flexo-roll-sizes"
          defaultOptions={ROLL_SIZE_OPTIONS}
          value={form.rollSize}
          onChange={(v) => setField("rollSize", v)}
        />
        <RadioField
          name="printingColors"
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
