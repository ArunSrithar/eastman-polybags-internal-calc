import CalculatorHeader from "../../layout/CalculatorHeader";
import { FlexoIcon } from "../../ui/Icons";
import FlexoForm from "./FlexoForm";
import FlexoResult from "./FlexoResult";
import { makeInitialForm } from "./formConfig";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import useCalculator from "../../../hooks/useCalculator";
import {
  useFlexoSettings,
  buildFlexoRatesFromSettings,
} from "../../../context/FlexoSettingsContext";

const buildPayload = (name, form, calc) => ({
  quoteName: name,
  totalRate: calc.totalRate,
  coverSize: form.coverSize,
  form: { ...form, quoteName: name },
});

export default function FlexoRateCalculator() {
  const { settings, loading } = useFlexoSettings();
  const rates = settings ? buildFlexoRatesFromSettings(settings) : undefined;

  const {
    form,
    result,
    saveError,
    formRef,
    toast,
    handleFormChange,
    handleSave,
    handleReset,
    handlePrint,
  } = useCalculator({
    calcKey: "flexo-rate-calc",
    calculateFn: (f) => calculateFlexoRate(f, rates),
    makeInitialForm,
    buildPayload,
    toastMessage: "Saved the flexo calculation successfully",
  });

  if (loading) {
    return (
      <div className="calc-shell items-center justify-center">
        <p className="text-label-2">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="calc-shell">
      {toast}
      <CalculatorHeader
        icon={FlexoIcon}
        title="Flexo Rate Calculator"
        subtitle="Calculate rates for flexo printing jobs"
        onSave={handleSave}
        onPrint={handlePrint}
        onReset={handleReset}
      />

      {/* 2-column layout: form | breakdown */}
      <div className="calc-grid">
        {/* Left — Form */}
        <div className="calc-column">
          <FlexoForm
            ref={formRef}
            onProceed={handleFormChange}
            saveError={saveError}
          />
        </div>

        {/* Right — Breakdown */}
        <div className="calc-column" data-print-area>
          <FlexoResult result={result} form={form} />
        </div>
      </div>
    </div>
  );
}
