import { useState, useRef, useEffect } from "react";
import GravureForm from "./GravureForm";
import GravureResult from "./GravureResult";
import GravureQuotesSidebar from "./GravureQuotesSidebar";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";
import { getQuotes, saveQuote, deleteQuote } from "../../../utils/quoteStorage";
import { SAMPLE_QUOTES } from "../../../constants/gravureRates";

const CALC_KEY = "gravure";

function getInitialQuotes() {
  const stored = getQuotes(CALC_KEY);
  // If stored quotes are all sample entries (no real user data), re-seed with full sample list
  const allSamples =
    stored.length > 0 && stored.every((q) => q.id.startsWith("sample-"));
  if (stored.length === 0 || allSamples) {
    localStorage.setItem(`quotes-${CALC_KEY}`, JSON.stringify(SAMPLE_QUOTES));
    return SAMPLE_QUOTES;
  }
  return stored;
}

export default function GravureRateCalculator() {
  const [result, setResult] = useState(null);
  const [quotes, setQuotes] = useState(() => getInitialQuotes());
  const [formHeight, setFormHeight] = useState(null);
  const [collapsedResultHeight, setCollapsedResultHeight] = useState(null);
  const formRef = useRef(null);
  const resultCardRef = useRef(null);
  const resultHeightLocked = useRef(false);

  // Observe form height
  useEffect(() => {
    if (!formRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setFormHeight(entry.contentRect.height);
    });
    ro.observe(formRef.current);
    return () => ro.disconnect();
  }, []);

  // Capture result card collapsed height (first measurement = collapsed state)
  useEffect(() => {
    if (!result) {
      resultHeightLocked.current = false;
      setCollapsedResultHeight(null);
      return;
    }
    const el = resultCardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!resultHeightLocked.current) {
        setCollapsedResultHeight(entry.contentRect.height);
        resultHeightLocked.current = true;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [result]);

  function handleFormChange(form) {
    setResult(calculateGravureRate(form));
  }

  function handleSave(form) {
    const calc = calculateGravureRate(form);
    if (!calc) {
      alert(
        "Nothing to save — fill in at least one material with price and qty.",
      );
      return;
    }
    const updated = saveQuote(CALC_KEY, {
      quoteName: form.quoteName || "Untitled",
      pouchSize: form.pouchSize,
      pricePerKg: calc.pricePerKg,
      savedBy: "Arun", // TODO: replace with logged-in user name
      form,
    });
    setQuotes(updated);
  }

  function handleDelete(id) {
    setQuotes(deleteQuote(CALC_KEY, id));
  }

  return (
    <div className="mt-2 max-w-6xl mx-auto">
      {/* ── Title — above both columns ────────────────────────────────── */}
      <div className="mb-4 px-1">
        <p className="text-lg font-semibold text-label">
          Gravure Rate Calculator
        </p>
        <p className="text-xs text-label-3 mt-0.5">
          Fill in the fields — price per kg updates automatically.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 items-start gap-4">
        {/* ── Calculator (left / main — 2 cols) ────────────────────────── */}
        <div className="lg:col-span-2 min-w-0">
          <div ref={formRef}>
            <GravureForm
              onProceed={handleFormChange}
              onSave={handleSave}
              result={result}
            />
          </div>
          <GravureResult result={result} cardRef={resultCardRef} />
        </div>

        {/* ── Saved Quotes sidebar (right — 1 col) ──────────────────────── */}
        <div className="lg:col-span-1 lg:sticky lg:top-[100px] self-start">
          <GravureQuotesSidebar
            quotes={quotes}
            onDelete={handleDelete}
            maxHeight={
              formHeight != null && collapsedResultHeight != null
                ? formHeight + 16 + collapsedResultHeight // 16 = mt-4 gap
                : formHeight
            }
          />
        </div>
      </div>
    </div>
  );
}
