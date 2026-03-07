import { useState, useRef, useEffect } from "react";
import FlexoRateCalcForm from "./FlexoRateCalcForm";
import FlexoRateCalcQuotesSidebar from "./FlexoRateCalcQuotesSidebar";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import { getQuotes, saveQuote, deleteQuote } from "../../../utils/quoteStorage";
import { SAMPLE_QUOTES } from "../../../constants/flexoRateCalc";

const CALC_KEY = "flexo-rate-calc";

function getInitialQuotes() {
  const stored = getQuotes(CALC_KEY);
  const allSamples =
    stored.length > 0 && stored.every((q) => q.id.startsWith("sample-"));
  if (stored.length === 0 || allSamples) {
    localStorage.setItem(`quotes-${CALC_KEY}`, JSON.stringify(SAMPLE_QUOTES));
    return SAMPLE_QUOTES;
  }
  return stored;
}

export default function FlexoRateCalculator() {
  const [result, setResult] = useState(null);
  const [quotes, setQuotes] = useState(() => getInitialQuotes());
  const [formHeight, setFormHeight] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const formRef = useRef(null);

  // Observe form height to drive sidebar maxHeight
  useEffect(() => {
    if (!formRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setFormHeight(entry.contentRect.height);
    });
    ro.observe(formRef.current);
    return () => ro.disconnect();
  }, []);

  function handleFormChange(form) {
    setSaveError(null);
    setResult(calculateFlexoRate(form));
  }

  function handleSave(form) {
    const name = form.quoteName.trim();
    if (!name) {
      setSaveError("Enter a customer name before saving.");
      return;
    }
    const duplicate = quotes.some(
      (q) => q.quoteName.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      setSaveError(
        `A quote named "${name}" already exists. Use a different name.`,
      );
      return;
    }
    const calc = calculateFlexoRate(form);
    if (!calc) {
      setSaveError("Enter a material price before saving.");
      return;
    }
    setSaveError(null);
    const updated = saveQuote(CALC_KEY, {
      quoteName: name,
      coverSize: form.coverSize,
      totalRate: calc.totalRate,
      savedBy: "Arun",
      form: { ...form, quoteName: name },
    });
    setQuotes(updated);
  }

  function handleDelete(id) {
    setQuotes(deleteQuote(CALC_KEY, id));
  }

  return (
    <div className="mt-2 max-w-6xl mx-auto">
      {/* Title */}
      <div className="mb-4 px-1">
        <p className="text-lg font-semibold text-label">
          Flexo Rate Calculator
        </p>
        <p className="text-xs text-label-3 mt-0.5">
          Fill in the fields — total rate updates automatically.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 items-start gap-4">
        {/* ── Calculator (left / main — 2 cols) ────────────────────────── */}
        <div className="lg:col-span-2 min-w-0" ref={formRef}>
          <FlexoRateCalcForm
            onProceed={handleFormChange}
            onSave={handleSave}
            result={result}
            saveError={saveError}
          />
        </div>

        {/* ── Saved Quotes sidebar (right — 1 col) ──────────────────────── */}
        <div className="lg:col-span-1 lg:sticky lg:top-25 self-start">
          <FlexoRateCalcQuotesSidebar
            quotes={quotes}
            onDelete={handleDelete}
            maxHeight={formHeight}
          />
        </div>
      </div>
    </div>
  );
}
