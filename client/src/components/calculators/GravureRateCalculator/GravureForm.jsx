import {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import FormStack from "../../form/FormStack";
import FormSection from "../../form/FormSection";
import TextField from "../../form/TextField";
import NumberField from "../../form/NumberField";
import ToggleField from "../../form/ToggleField";
import RadioField from "../../form/RadioField";
import SelectField from "../../form/SelectField";
import MaterialRow from "./MaterialRow";
import {
  MATERIALS,
  storeMaterialField,
  makeInitialForm,
  calculateLdRollQtyFromMicron,
  calculateBoppQtyFromMicron,
} from "./formConfig";
import { fmt } from "../../../utils/format";
import { POUCH_RATE_BY_SIZE } from "../../../constants/gravureRates";
import {
  useGravureSettings,
  getCurrentPrice,
} from "../../../context/GravureSettingsContext";

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
  const { settings, addMaterialOption } = useGravureSettings();

  // Derive pouch size options from settings (only enabled pouches)
  const pouchSizeOptions = settings?.pouches
    ?.filter((p) => p.enabled !== false)
    .map((p) => `${p.length} x ${p.breadth}`) ?? [
    "4 x 6",
    "5 x 7",
    "6 x 8",
    "7 x 10",
  ];

  const pouchRateBySize =
    settings?.pouches?.reduce((acc, p) => {
      if (p.enabled === false) return acc;
      acc[`${p.length} x ${p.breadth}`] = p.rate;
      return acc;
    }, {}) ?? POUCH_RATE_BY_SIZE;

  // Sync material prices from settings into form state
  const didSyncPrices = useRef(false);
  const pendingSyncRef = useRef(null);

  useEffect(() => {
    if (!settings?.materials) return;
    setForm((prev) => {
      const nextMaterials = { ...prev.materials };
      let changed = false;
      for (const mat of MATERIALS) {
        const settingsPrice = getCurrentPrice(settings.materials[mat.key]);
        if (
          settingsPrice &&
          String(nextMaterials[mat.key]?.price) !== String(settingsPrice)
        ) {
          nextMaterials[mat.key] = {
            ...nextMaterials[mat.key],
            price: String(settingsPrice),
          };
          changed = true;
        }
      }
      if (!changed) return prev;
      const next = { ...prev, materials: nextMaterials };
      if (didSyncPrices.current) pendingSyncRef.current = next;
      didSyncPrices.current = true;
      return next;
    });
  }, [settings?.materials]);

  // Notify parent after settings-driven form update (outside render)
  useEffect(() => {
    if (pendingSyncRef.current) {
      onProceed?.(pendingSyncRef.current);
      pendingSyncRef.current = null;
    }
  });

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
    if ((key === "ldRoll" || key === "bopp") && field === "qty") return;

    const nextMaterial = {
      ...form.materials[key],
      [field]: val,
    };

    if (key === "ldRoll" && field === "micron") {
      nextMaterial.qty = calculateLdRollQtyFromMicron(val);
      storeMaterialField(key, "qty", nextMaterial.qty);
    }

    if (key === "bopp" && field === "micron") {
      nextMaterial.qty = calculateBoppQtyFromMicron(val);
      storeMaterialField(key, "qty", nextMaterial.qty);
    }

    storeMaterialField(key, field, val);
    const next = {
      ...form,
      materials: {
        ...form.materials,
        [key]: nextMaterial,
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
        {MATERIALS.map((mat) => {
          const matSettings = settings?.materials?.[mat.key];
          return (
            <MaterialRow
              key={mat.key}
              name={mat.name}
              materialKey={mat.key}
              material={form.materials[mat.key]}
              currentPrice={getCurrentPrice(matSettings)}
              micronOptions={
                matSettings?.micronOptions?.map((o) => o.value) ?? []
              }
              qtyOptions={matSettings?.qtyOptions?.map((o) => o.value) ?? []}
              onToggle={() => toggleMaterial(mat.key)}
              onChange={(field, val) => setMaterial(mat.key, field, val)}
              onNewOption={addMaterialOption}
              qtyDisabled={mat.key === "ldRoll" || mat.key === "bopp"}
            />
          );
        })}
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
          label="Pouch Size"
          placeholder="Search pouch size…"
          storageKey="gravure-pouch-sizes"
          defaultOptions={pouchSizeOptions}
          value={form.pouchSize}
          onChange={(v) => setField("pouchSize", v)}
          creatable={false}
          renderOption={(size) => {
            const rate = pouchRateBySize[size];
            return (
              <span className="flex items-center justify-between gap-4">
                <span>{size}</span>
                <span className="text-xs text-label-3 tabular-nums">
                  {rate != null ? `₹${fmt(rate)}` : "Custom"}
                </span>
              </span>
            );
          }}
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
        <SelectField
          label="Service"
          placeholder="0"
          inline
          unit="%"
          storageKey="gravure-service"
          defaultOptions={["0", "1", "2", "3", "4", "5", "8", "10"]}
          value={form.service}
          onChange={(v) => setField("service", v)}
        />
      </FormSection>
    </FormStack>
  );
});
