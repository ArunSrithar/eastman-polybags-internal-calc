import { useState, useRef } from "react";
import CalculatorHeader from "../../layout/CalculatorHeader";
import { GravureIcon } from "../../ui/Icons";
import GravureForm from "./GravureForm";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";

export default function GravureRateCalculator() {
  const [result, setResult] = useState(null);
  const formRef = useRef(null);

  function handleFormChange(form) {
    setResult(calculateGravureRate(form));
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
        <div className="overflow-y-auto p-3 flex items-center justify-center glass-panel">
          <p className="text-label-3 text-sm">Breakdown goes here</p>
        </div>
      </div>
    </div>
  );
}
