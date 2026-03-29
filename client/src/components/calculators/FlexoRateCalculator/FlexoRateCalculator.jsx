import { useState, useRef } from "react";
import CalculatorHeader from "../../layout/CalculatorHeader";
import { FlexoIcon } from "../../ui/Icons";
import FlexoForm from "./FlexoForm";
import FlexoResult from "./FlexoResult";
import { makeInitialForm } from "./formConfig";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import { saveQuote, getQuotes } from "../../../utils/quoteStorage";
import { useToast } from "../../ui/Toast";

const CALC_KEY = "flexo-rate-calc";

export default function FlexoRateCalculator() {
  const [form, setForm] = useState(() => makeInitialForm());
  const [result, setResult] = useState(() =>
    calculateFlexoRate(makeInitialForm()),
  );
  const [saveError, setSaveError] = useState(null);
  const formRef = useRef(null);
  const [toast, showToast] = useToast();

  function handleFormChange(formData) {
    setForm(formData);
    setResult(calculateFlexoRate(formData));
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
    const calc = calculateFlexoRate(form);
    if (!calc) {
      setSaveError("Fill in required fields before saving.");
      return;
    }
    setSaveError(null);
    saveQuote(CALC_KEY, {
      quoteName: name,
      totalRate: calc.totalRate,
      coverSize: form.coverSize,
      form: { ...form, quoteName: name },
    });
    window.dispatchEvent(
      new CustomEvent("quotes-updated", { detail: CALC_KEY }),
    );
    showToast(name, "Saved the flexo calculation successfully");
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
        icon={FlexoIcon}
        title="Flexo Rate Calculator"
        subtitle="Calculate rates for flexo printing jobs"
        onSave={handleSave}
        onPrint={handlePrint}
        onReset={handleReset}
      />

      {/* 2-column layout: form | breakdown */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Left — Form */}
        <div className="overflow-y-auto p-3 glass-panel">
          <FlexoForm
            ref={formRef}
            onProceed={handleFormChange}
            saveError={saveError}
          />
        </div>

        {/* Right — Breakdown */}
        <div className="overflow-y-auto p-3 glass-panel" data-print-area>
          <FlexoResult result={result} form={form} />
        </div>
      </div>
    </div>
  );
}
