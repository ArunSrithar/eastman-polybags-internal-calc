import CalculatorHeader from "../../layout/CalculatorHeader";
import { GravureIcon } from "../../ui/Icons";
import GravureForm from "./GravureForm";
import GravureResult from "./GravureResult";
import { makeInitialForm } from "./formConfig";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";
import useCalculator from "../../../hooks/useCalculator";
import { useAuth } from "../../../context/AuthContext";
import {
  useGravureSettings,
  buildRatesFromSettings,
} from "../../../context/GravureSettingsContext";

const buildPayload = (name, form, calc) => ({
  quoteName: name,
  pouchSize: form.pouchSize,
  pricePerKg: calc.pricePerKg,
  form: { ...form, quoteName: name },
});

function GravureRateCalculatorInner() {
  const { settings, loading } = useGravureSettings();
  const rates = settings ? buildRatesFromSettings(settings) : undefined;
  const { canSaveQuote } = useAuth();

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
    calcKey: "gravure",
    calculateFn: (f) => calculateGravureRate(f, rates),
    makeInitialForm,
    buildPayload,
    toastMessage: "Saved the gravure calculation successfully",
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
        icon={GravureIcon}
        title="Gravure Rate Calculator"
        subtitle="Calculate printing rates for gravure jobs"
        onSave={canSaveQuote("gravure") ? handleSave : null}
        onPrint={handlePrint}
        onReset={handleReset}
      />

      {/* 2-column layout: form | breakdown */}
      <div className="calc-grid">
        {/* Left — Form */}
        <div className="calc-column">
          <GravureForm
            ref={formRef}
            onProceed={handleFormChange}
            saveError={saveError}
          />
        </div>

        {/* Right — Breakdown */}
        <div className="calc-column" data-print-area>
          <GravureResult result={result} form={form} />
        </div>
      </div>
    </div>
  );
}

export default function GravureRateCalculator() {
  return <GravureRateCalculatorInner />;
}
