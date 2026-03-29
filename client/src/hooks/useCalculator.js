import { useState, useRef } from "react";
import { saveQuote, getQuotes } from "../utils/quoteStorage";
import { useToast } from "../components/ui/Toast";

/**
 * useCalculator — shared state + handlers for all calculator containers.
 *
 * Encapsulates: form state, result calculation, save validation,
 * quote storage, toast notifications, form reset, and print.
 *
 * @param {object}   options
 * @param {string}   options.calcKey        — quote storage key
 * @param {Function} options.calculateFn    — pure calculation function (form → result | null)
 * @param {Function} options.makeInitialForm — form state factory
 * @param {Function} options.buildPayload   — (name, form, calc) → save payload object
 * @param {string}   options.toastMessage   — toast body text on save
 */
export default function useCalculator({
  calcKey,
  calculateFn,
  makeInitialForm,
  buildPayload,
  toastMessage,
}) {
  const [form, setForm] = useState(() => makeInitialForm());
  const [result, setResult] = useState(() => calculateFn(makeInitialForm()));
  const [saveError, setSaveError] = useState(null);
  const formRef = useRef(null);
  const [toast, showToast] = useToast();

  function handleFormChange(formData) {
    setForm(formData);
    setResult(calculateFn(formData));
    setSaveError(null);
  }

  function handleSave() {
    const name = form.quoteName.trim();
    if (!name) {
      setSaveError("Enter a customer name before saving.");
      return;
    }
    const quotes = getQuotes(calcKey);
    const dup = quotes.some(
      (q) => q.quoteName.trim().toLowerCase() === name.toLowerCase(),
    );
    if (dup) {
      setSaveError(
        `A quote named "${name}" already exists. Use a different name.`,
      );
      return;
    }
    const calc = calculateFn(form);
    if (!calc) {
      setSaveError("Fill in required fields before saving.");
      return;
    }
    setSaveError(null);
    saveQuote(calcKey, buildPayload(name, form, calc));
    window.dispatchEvent(
      new CustomEvent("quotes-updated", { detail: calcKey }),
    );
    showToast(name, toastMessage);
    formRef.current?.reset();
  }

  function handleReset() {
    formRef.current?.reset();
  }

  function handlePrint() {
    window.print();
  }

  return {
    form,
    result,
    saveError,
    formRef,
    toast,
    handleFormChange,
    handleSave,
    handleReset,
    handlePrint,
  };
}
