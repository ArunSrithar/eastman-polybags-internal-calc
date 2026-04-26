import CalculatorHeader from "../../layout/CalculatorHeader";
import { JobCostIcon } from "../../ui/Icons";
import JobCostForm from "./JobCostForm";
import JobCostResult from "./JobCostResult";
import { makeInitialForm } from "./formConfig";
import { calculateJobCost } from "../../../utils/calculators/jobCost";
import useCalculator from "../../../hooks/useCalculator";

const buildPayload = (name, form, calc) => ({
  quoteName: name,
  pricePerKg: calc.costOfJob,
  form: { ...form, quoteName: name },
});

export default function JobCostCalculator() {
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
    calcKey: "job-cost",
    calculateFn: calculateJobCost,
    makeInitialForm,
    buildPayload,
    toastMessage: "Saved the job cost calculation successfully",
  });

  return (
    <div className="calc-shell">
      {toast}
      <CalculatorHeader
        icon={JobCostIcon}
        title="Job Cost Calculator"
        subtitle="Calculate total job cost and cost per kg"
        onSave={handleSave}
        onPrint={handlePrint}
        onReset={handleReset}
      />

      {/* 2-column layout: form | breakdown */}
      <div className="calc-grid">
        {/* Left — Form */}
        <div className="calc-column">
          <JobCostForm
            ref={formRef}
            onProceed={handleFormChange}
            saveError={saveError}
          />
        </div>

        {/* Right — Breakdown */}
        <div className="calc-column" data-print-area>
          <JobCostResult result={result} form={form} />
        </div>
      </div>
    </div>
  );
}
