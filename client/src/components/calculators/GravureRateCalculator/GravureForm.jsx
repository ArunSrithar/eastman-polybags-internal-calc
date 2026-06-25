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
import SelectField from "../../form/SelectField";
import MaterialRow from "./MaterialRow";
import ProcessCountCompanyRow from "./formRows/ProcessCountCompanyRow";
import ToggleCompanyRow from "./formRows/ToggleCompanyRow";
import LaminationCompanyRow from "./formRows/LaminationCompanyRow";
import {
  getProcessCompanyOptions,
  makeCompanyOptionRenderer,
} from "./processCompanyOptions.jsx";
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
import { useAuth } from "../../../context/AuthContext";

const LAMINATION_OPTIONS = [
  { value: "none", label: "No Lamination" },
  { value: "single", label: "Single Lamination" },
  { value: "double", label: "Double Lamination" },
];

/* ─── GravureForm ────────────────────────────────────────────────────────── */
export default forwardRef(function GravureForm(
  { onProceed, saveError = null },
  ref,
) {
  const [form, setForm] = useState(() => makeInitialForm());
  const [savingPriceByMaterial, setSavingPriceByMaterial] = useState({});
  const { settings, companies, addMaterialOption, updateMaterialPrice } =
    useGravureSettings();
  const { canEditPrices } = useAuth();
  const canEditMaterialPrice = canEditPrices("gravure");

  const normalCompanyOptions = getProcessCompanyOptions(companies, "normalColor");
  const metallicCompanyOptions = getProcessCompanyOptions(companies, "metallicColor");
  const mattCompanyOptions = getProcessCompanyOptions(companies, "mattFinish");
  const singleLamCompanyOptions = getProcessCompanyOptions(
    companies,
    "singleLamination",
  );
  const doubleLamCompanyOptions = getProcessCompanyOptions(
    companies,
    "doubleLamination",
  );
  const slittingCompanyOptions = getProcessCompanyOptions(companies, "slitting");

  const renderNormalCompanyOption = makeCompanyOptionRenderer(
    companies,
    "normalColor",
  );
  const renderMetallicCompanyOption = makeCompanyOptionRenderer(
    companies,
    "metallicColor",
  );
  const renderMattCompanyOption = makeCompanyOptionRenderer(companies, "mattFinish");
  const renderSingleLamCompanyOption = makeCompanyOptionRenderer(
    companies,
    "singleLamination",
  );
  const renderDoubleLamCompanyOption = makeCompanyOptionRenderer(
    companies,
    "doubleLamination",
  );
  const renderSlittingCompanyOption = makeCompanyOptionRenderer(
    companies,
    "slitting",
  );

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

  async function handleMaterialPriceSave(materialKey, value) {
    const price = parseFloat(value);
    if (!Number.isFinite(price) || price < 0) return;

    const current = getCurrentPrice(settings?.materials?.[materialKey]);
    if (String(current) === String(price)) return;

    if (savingPriceByMaterial[materialKey]) return;

    setSavingPriceByMaterial((prev) => ({ ...prev, [materialKey]: true }));
    try {
      await updateMaterialPrice(materialKey, price);
    } finally {
      setSavingPriceByMaterial((prev) => ({ ...prev, [materialKey]: false }));
    }
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
          const priceOptions = (matSettings?.priceHistory ?? [])
            .map((entry) => String(entry.price))
            .filter((val, idx, arr) => arr.indexOf(val) === idx);

          return (
            <MaterialRow
              key={mat.key}
              name={mat.name}
              materialKey={mat.key}
              material={form.materials[mat.key]}
              currentPrice={getCurrentPrice(matSettings)}
              priceOptions={priceOptions}
              micronOptions={
                matSettings?.micronOptions?.map((o) => o.value) ?? []
              }
              qtyOptions={matSettings?.qtyOptions?.map((o) => o.value) ?? []}
              onToggle={() => toggleMaterial(mat.key)}
              onPriceChange={(value) => handleMaterialPriceSave(mat.key, value)}
              canEditPrice={canEditMaterialPrice}
              priceSaving={Boolean(savingPriceByMaterial[mat.key])}
              onChange={(field, val) => setMaterial(mat.key, field, val)}
              onNewOption={addMaterialOption}
              qtyDisabled={mat.key === "ldRoll" || mat.key === "bopp"}
            />
          );
        })}
      </FormSection>

      <FormSection title="Printing Charges">
        <ProcessCountCompanyRow
          label="Normal Colors"
          value={form.normalColors}
          onValueChange={(v) => setField("normalColors", v)}
          companyValue={form.normalColorCompany}
          onCompanyChange={(v) => setField("normalColorCompany", v)}
          companyOptions={normalCompanyOptions}
          renderCompanyOption={renderNormalCompanyOption}
          companyDisabled={Number(form.normalColors || 0) <= 0}
        />
        <ToggleCompanyRow
          label="Metallic Colors"
          on={form.metallicColorsEnabled}
          onToggle={() =>
            setField("metallicColorsEnabled", !form.metallicColorsEnabled)
          }
          companyValue={form.metallicColorCompany}
          onCompanyChange={(v) => setField("metallicColorCompany", v)}
          companyOptions={metallicCompanyOptions}
          renderCompanyOption={renderMetallicCompanyOption}
        />
        <ToggleCompanyRow
          label="Matt Finish"
          on={form.mattFinish}
          onToggle={() => setField("mattFinish", !form.mattFinish)}
          companyValue={form.mattFinishCompany}
          onCompanyChange={(v) => setField("mattFinishCompany", v)}
          companyOptions={mattCompanyOptions}
          renderCompanyOption={renderMattCompanyOption}
        />
      </FormSection>

      <FormSection title="Lamination">
        <LaminationCompanyRow
          lamination={form.lamination}
          onLaminationChange={(v) => setField("lamination", v)}
          laminationOptions={LAMINATION_OPTIONS}
          companyValue={
            form.lamination === "single"
              ? form.singleLaminationCompany
              : form.doubleLaminationCompany
          }
          onCompanyChange={(v) => {
            if (form.lamination === "single") {
              setField("singleLaminationCompany", v);
              return;
            }
            if (form.lamination === "double") {
              setField("doubleLaminationCompany", v);
            }
          }}
          companyOptions={
            form.lamination === "single"
              ? singleLamCompanyOptions
              : form.lamination === "double"
                ? doubleLamCompanyOptions
                : []
          }
          renderCompanyOption={
            form.lamination === "single"
              ? renderSingleLamCompanyOption
              : renderDoubleLamCompanyOption
          }
        />
      </FormSection>

      <FormSection>
        <ToggleCompanyRow
          label="Slitting"
          on={form.slitting}
          onToggle={() => setField("slitting", !form.slitting)}
          companyValue={form.slittingCompany}
          onCompanyChange={(v) => setField("slittingCompany", v)}
          companyOptions={slittingCompanyOptions}
          renderCompanyOption={renderSlittingCompanyOption}
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
