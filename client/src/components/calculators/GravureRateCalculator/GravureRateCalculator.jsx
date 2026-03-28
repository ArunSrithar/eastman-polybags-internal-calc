import { useState, useRef } from "react";
import CalculatorHeader from "../../layout/CalculatorHeader";
import { GravureIcon } from "../../ui/Icons";
import GravureForm from "./GravureForm";
import GravureResult from "./GravureResult";
import { makeInitialForm } from "./formConfig";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";

export default function GravureRateCalculator() {
  const [form, setForm] = useState(() => makeInitialForm());
  const [result, setResult] = useState(() =>
    calculateGravureRate(makeInitialForm()),
  );
  const formRef = useRef(null);

  function handleFormChange(formData) {
    setForm(formData);
    setResult(calculateGravureRate(formData));
  }

  function handleReset() {
    formRef.current?.reset();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="h-full flex flex-col">
      <CalculatorHeader
        icon={GravureIcon}
        title="Gravure Rate Calculator"
        subtitle="Calculate printing rates for gravure jobs"
        onSave={() => {}}
        onPrint={handlePrint}
        onReset={handleReset}
      />

      {/* 2-column layout: form | breakdown */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Left — Form */}
        <div className="overflow-y-auto p-3 glass-panel">
          <GravureForm ref={formRef} onProceed={handleFormChange} />
        </div>

        {/* Right — Breakdown */}
        <div className="overflow-y-auto p-3 glass-panel">
          <GravureResult result={result} form={form} />
        </div>
      </div>
    </div>
  );
}
