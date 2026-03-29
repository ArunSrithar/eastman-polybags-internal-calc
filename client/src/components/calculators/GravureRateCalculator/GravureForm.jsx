import { useState, useImperativeHandle, forwardRef } from "react";
import FormStack from "../../form/FormStack";
import FormSection from "../../form/FormSection";
import TextField from "../../form/TextField";
import NumberField from "../../form/NumberField";
import ToggleField from "../../form/ToggleField";
import RadioField from "../../form/RadioField";
import SelectField from "../../form/SelectField";
import MaterialRow from "./MaterialRow";
import { MATERIALS, storeMaterialField, makeInitialForm } from "./formConfig";

const LAMINATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
];

/* ─── GravureForm ────────────────────────────────────────────────────────── */
export default forwardRef(function GravureForm(
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

  function setMaterial(key, field, val) {
    storeMaterialField(key, field, val);
    const next = {
      ...form,
      materials: {
        ...form.materials,
        [key]: { ...form.materials[key], [field]: val },
      },
    };
    setForm(next);
    onProceed?.(next);
  }

  function toggleMaterial(key) {
    const next = {
      ...form,
      materials: {
        ...form.materials,
        [key]: {
          ...form.materials[key],
          enabled: !form.materials[key].enabled,
        },
      },
    };
    setForm(next);
    onProceed?.(next);
  }

  return (
    <FormStack>
      <FormSection>
        <TextField
          label="Customer / Quote Name"
          placeholder="e.g. Rajesh Traders"
          value={form.quoteName}
          onChange={(v) => setField("quoteName", v)}
          error={saveError}
        />
      </FormSection>

      <FormSection title="Materials">
        {MATERIALS.map((mat) => (
          <MaterialRow
            key={mat.key}
            name={mat.name}
            material={form.materials[mat.key]}
            onToggle={() => toggleMaterial(mat.key)}
            onChange={(field, val) => setMaterial(mat.key, field, val)}
          />
        ))}
      </FormSection>

      <FormSection>
        <SelectField
          label="Pouch Size"
          placeholder="e.g. 4x6"
          storageKey="gravure-pouch-sizes"
          defaultOptions={["4x6", "5x7", "6x8", "7x10"]}
          value={form.pouchSize}
          onChange={(v) => setField("pouchSize", v)}
        />
      </FormSection>

      <FormSection title="Printing Charges">
        <NumberField
          label="Normal Colors"
          min={0}
          max={12}
          value={form.normalColors}
          onChange={(v) => setField("normalColors", v)}
        />
        <NumberField
          label="Metallic Colors"
          min={0}
          max={12}
          value={form.metallicColors}
          onChange={(v) => setField("metallicColors", v)}
        />
        <ToggleField
          label="Matt Finish"
          on={form.mattFinish}
          onToggle={() => setField("mattFinish", !form.mattFinish)}
        />
      </FormSection>

      <FormSection title="Lamination">
        <RadioField
          name="lamination"
          options={LAMINATION_OPTIONS}
          value={form.lamination}
          onChange={(v) => setField("lamination", v)}
        />
      </FormSection>

      <FormSection>
        <ToggleField
          label="Slitting Charges"
          on={form.slitting}
          onToggle={() => setField("slitting", !form.slitting)}
        />
      </FormSection>

      <FormSection>
        <SelectField
          label="Wastage"
          placeholder="0"
          inline
          unit="%"
          storageKey="gravure-wastage"
          defaultOptions={["0", "1", "2", "3", "4", "5", "8", "10"]}
          value={form.wastage}
          onChange={(v) => setField("wastage", v)}
        />
      </FormSection>
    </FormStack>
  );
});
