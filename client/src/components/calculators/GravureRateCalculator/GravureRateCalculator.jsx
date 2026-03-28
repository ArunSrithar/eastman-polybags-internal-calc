import { useState, useRef } from "react";
import CalculatorHeader from "../../layout/CalculatorHeader";
import { GravureIcon } from "../../ui/Icons";
import GravureForm from "./GravureForm";
import GravureResult from "./GravureResult";
import { makeInitialForm } from "./formConfig";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";
import { saveQuote, getQuotes } from "../../../utils/quoteStorage";
import { useToast } from "../../ui/Toast";

const CALC_KEY = "gravure";

export default function GravureRateCalculator() {
  const [form, setForm] = useState(() => makeInitialForm());
  const [result, setResult] = useState(() =>
    calculateGravureRate(makeInitialForm()),
  );
  const [saveError, setSaveError] = useState(null);
  const formRef = useRef(null);
  const [toast, showToast] = useToast();

  function handleFormChange(formData) {
    setForm(formData);
    setResult(calculateGravureRate(formData));
    setSaveError(null);
  }

  function handleSave() {
    const name = form.quoteName.trim();
    if (!name) {
      setSaveError("Enter a customer name before saving.");
      return;
    }
    const quotes = getQuotes(CALC_KEY);
    const dup = quotes.some(
      (q) => q.quoteName.trim().toLowerCase() === name.toLowerCase(),
    );
    if (dup) {
      setSaveError(
        `A quote named "${name}" already exists. Use a different name.`,
      );
      return;
    }
    const calc = calculateGravureRate(form);
    if (!calc) {
      setSaveError("Fill in required fields before saving.");
      return;
    }
    setSaveError(null);
    saveQuote(CALC_KEY, {
      quoteName: name,
      pouchSize: form.pouchSize,
      pricePerKg: calc.pricePerKg,
      form: { ...form, quoteName: name },
    });
    window.dispatchEvent(
      new CustomEvent("quotes-updated", { detail: CALC_KEY }),
    );
    showToast(name, "Saved the gravure calculation successfully");
    formRef.current?.reset();
  }

  function handleReset() {
    formRef.current?.reset();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="h-full flex flex-col">
      {toast}
      <CalculatorHeader
        icon={GravureIcon}
        title="Gravure Rate Calculator"
        subtitle="Calculate printing rates for gravure jobs"
        onSave={handleSave}
        onPrint={handlePrint}
        onReset={handleReset}
      />

      {/* 2-column layout: form | breakdown */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Left — Form */}
        <div className="overflow-y-auto p-3 glass-panel">
          <GravureForm
            ref={formRef}
            onProceed={handleFormChange}
            saveError={saveError}
          />
        </div>

        {/* Right — Breakdown */}
        <div className="overflow-y-auto p-3 glass-panel" data-print-area>
          <GravureResult result={result} form={form} />
        </div>
      </div>
    </div>
  );
}
