import { useState, useImperativeHandle, forwardRef } from "react";
import FormStack from "../../form/FormStack";
import FormSection from "../../form/FormSection";
import TextField from "../../form/TextField";
import NumberField from "../../form/NumberField";
import SelectField from "../../form/SelectField";
import RadioField from "../../form/RadioField";
import DateField from "../../form/DateField";
import ItemRow from "../ItemRow";
import {
  makeInitialForm,
  PROCESSING_ITEMS,
  FLAT_ITEMS,
  DROPDOWN_SEEDS,
} from "./formConfig";

const MATERIAL_TYPE_OPTIONS = [
  { value: "PP", label: "PP" },
  { value: "HM", label: "HM" },
  { value: "LD", label: "LD" },
];

/* ─── FlexoJobCostForm ───────────────────────────────────────────────────── */
export default forwardRef(function FlexoJobCostForm(
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

  function setItem(itemKey, field, val) {
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
          onChange={(v) => setField("materialType", v)}
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
          label="Cover Size"
          placeholder="Select"
          inline
          width="w-40"
          storageKey="flexo-job-cost-cover-sizes"
          defaultOptions={DROPDOWN_SEEDS.coverSizes}
          value={form.coverSize}
          onChange={(v) => setField("coverSize", v)}
        />
      </FormSection>

      {/* ── Processing Charges ── */}
      <FormSection title="Processing Charges">
        {PROCESSING_ITEMS.map((def) => (
          <ItemRow
            key={def.key}
            def={def}
            item={form.items[def.key]}
            onToggle={() => toggleItem(def.key)}
            onChange={(field, val) => setItem(def.key, field, val)}
          />
        ))}
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

      {/* ── Other Charges ── */}
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
