import CalculatorHeader from "../../layout/CalculatorHeader";
import { FlexoIcon } from "../../ui/Icons";
import FlexoForm from "./FlexoForm";
import FlexoResult from "./FlexoResult";
import { makeInitialForm } from "./formConfig";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import useCalculator from "../../../hooks/useCalculator";

const buildPayload = (name, form, calc) => ({
  quoteName: name,
  totalRate: calc.totalRate,
  coverSize: form.coverSize,
  form: { ...form, quoteName: name },
});

export default function FlexoRateCalculator() {
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
    calculateFn: calculateFlexoRate,
    makeInitialForm,
    buildPayload,
    toastMessage: "Saved the flexo calculation successfully",
  });

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
