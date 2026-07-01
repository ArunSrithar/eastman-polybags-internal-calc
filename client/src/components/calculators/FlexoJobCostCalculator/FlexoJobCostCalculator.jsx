import CalculatorHeader from "../../layout/CalculatorHeader";
import { FlexoIcon } from "../../ui/Icons";
import FlexoJobCostForm from "./FlexoJobCostForm";
import FlexoJobCostResult from "./FlexoJobCostResult";
import FlexoJobCostPrintLayout from "./FlexoJobCostPrintLayout";
import { makeInitialForm } from "./formConfig";
import { calculateFlexoJobCost } from "../../../utils/calculators/flexoJobCost";
import useCalculator from "../../../hooks/useCalculator";
import { useAuth } from "../../../context/AuthContext";

const buildPayload = (name, form, calc) => ({
  quoteName: name,
  pricePerKg: calc.costOfJob,
  form: { ...form, quoteName: name },
});

export default function FlexoJobCostCalculator() {
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
    calcKey: "flexo-job-cost",
    calculateFn: calculateFlexoJobCost,
    makeInitialForm,
    buildPayload,
    toastMessage: "Saved the Flexo job cost calculation successfully",
  });

  return (
    <div className="calc-shell">
      {toast}
      <CalculatorHeader
        icon={FlexoIcon}
        title="Flexo Job Cost Calculator"
        subtitle="Calculate total job cost and cost per kg"
        onSave={canSaveQuote("flexo-job-cost") ? handleSave : null}
        onPrint={handlePrint}
        onReset={handleReset}
      />

      {/* 2-column layout: form | breakdown */}
      <div className="calc-grid">
        {/* Left — Form */}
        <div className="calc-column">
          <FlexoJobCostForm
            ref={formRef}
            onProceed={handleFormChange}
            saveError={saveError}
          />
        </div>

        {/* Right — Breakdown */}
        <div className="calc-column" data-print-area>
          <div className="print:hidden">
            <FlexoJobCostResult result={result} form={form} />
          </div>
          <FlexoJobCostPrintLayout result={result} form={form} />
        </div>
      </div>
    </div>
  );
}
