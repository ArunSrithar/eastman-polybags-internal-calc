import { useState, useImperativeHandle, forwardRef } from "react";
import FormStack from "../../form/FormStack";
import FormSection from "../../form/FormSection";
import TextField from "../../form/TextField";
import NumberField from "../../form/NumberField";
import SelectField from "../../form/SelectField";
import DateField from "../../form/DateField";
import ItemRow from "./ItemRow";
import {
  makeInitialForm,
  MATERIAL_ITEMS,
  CHARGE_ITEMS,
  FLAT_ITEMS,
  DROPDOWN_SEEDS,
  storeFlatChargePrice,
} from "./formConfig";

/* ─── JobCostForm ────────────────────────────────────────────────────────── */
export default forwardRef(function JobCostForm(
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
      {/* ── Customer & Job Details ── */}
      <FormSection>
        <TextField
          label="Customer / Quote Name"
          placeholder="e.g. Rajesh Traders"
          value={form.quoteName}
          onChange={(v) => setField("quoteName", v)}
          error={saveError}
        />
      </FormSection>

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

      {/* ── Materials (items 0–3) ── */}
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

      {/* ── Charges (items 4–7) ── */}
      <FormSection title="Charges">
        {CHARGE_ITEMS.map((def) => (
          <ItemRow
            key={def.key}
            def={def}
            item={form.items[def.key]}
            onToggle={() => toggleItem(def.key)}
            onChange={(field, val) => setItem(def.key, field, val)}
          />
        ))}
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

      {/* ── Flat Charges (packing + transport) ── */}
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
