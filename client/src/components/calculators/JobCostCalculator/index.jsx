import { useState, useRef, useEffect } from "react";
import JobCostForm from "./JobCostForm";
import JobCostResult from "./JobCostResult";
import JobCostQuotesSidebar from "./JobCostQuotesSidebar";
import { calculateJobCost } from "../../../utils/calculators/jobCost";
import { getQuotes, saveQuote, deleteQuote } from "../../../utils/quoteStorage";
import { SAMPLE_QUOTES } from "../../../constants/jobCost";

const CALC_KEY = "job-cost";

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

export default function JobCostCalculator() {
  const [result, setResult] = useState(null);
  const [quotes, setQuotes] = useState(() => getInitialQuotes());
  const [saveError, setSaveError] = useState(null);
  const [formHeight, setFormHeight] = useState(null);
  const formRef = useRef(null);

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
    setResult(calculateJobCost(form));
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
    const calc = calculateJobCost(form);
    if (!calc) {
      setSaveError("Fill in required fields before saving.");
      return;
    }
    setSaveError(null);
    const updated = saveQuote(CALC_KEY, {
      quoteName: name,
      costOfJob: calc.costOfJob,
      totalAmount: calc.totalAmount,
      dispatchWeight: calc.dispatchWeight,
      form: { ...form, quoteName: name },
    });
    setQuotes(updated);
  }

  function handleDelete(id) {
    setQuotes(deleteQuote(CALC_KEY, id));
  }

  return (
    <div className="mt-2 max-w-6xl mx-auto">
      {/* ── Title ─────────────────────────────────────────────────────── */}
      <div className="mb-4 px-1">
        <p className="text-lg font-semibold text-label">Job Cost Calculator</p>
        <p className="text-xs text-label-3 mt-0.5">
          Enter line items — cost per kg updates automatically.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 items-start gap-4">
        {/* ── Form + Result (left — 2 cols) ─────────────────────────── */}
        <div className="lg:col-span-2 min-w-0 w-full">
          <div ref={formRef}>
            <JobCostForm
              onProceed={handleFormChange}
              onSave={handleSave}
              result={result}
              saveError={saveError}
            />
          </div>
          <JobCostResult result={result} />
        </div>

        {/* ── Sidebar (right — 1 col) ────────────────────────────────── */}
        <div className="lg:col-span-1 lg:sticky lg:top-25 w-full">
          <JobCostQuotesSidebar
            quotes={quotes}
            onDelete={handleDelete}
            maxHeight={formHeight}
          />
        </div>
      </div>
    </div>
  );
}
