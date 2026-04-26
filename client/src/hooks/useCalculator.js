import { useState, useRef } from "react";
import { saveQuote, getQuotes } from "../utils/quoteStorage";
import { useToast } from "../components/ui/Toast";

/**
 * useCalculator — shared state + handlers for all calculator containers.
 *
 * Encapsulates: form state, result calculation, save validation,
 * quote storage (async — local or remote), toast notifications,
 * form reset, and print.
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
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);
  const [toast, showToast] = useToast();

  function handleFormChange(formData) {
    setForm(formData);
    setResult(calculateFn(formData));
    setSaveError(null);
  }

  async function handleSave() {
    if (saving) return;

    const name = form.quoteName.trim();
    if (!name) {
      setSaveError("Enter a customer name before saving.");
      return;
    }

    const calc = calculateFn(form);
    if (!calc) {
      setSaveError("Fill in required fields before saving.");
      return;
    }

    // Best-effort client-side dup check (snappier UX). Server enforces
    // uniqueness via 409, which we still handle below.
    try {
      const quotes = await getQuotes(calcKey);
      const dup = quotes.some(
        (q) => q.quoteName.trim().toLowerCase() === name.toLowerCase(),
      );
      if (dup) {
        setSaveError(
          `A quote named "${name}" already exists. Use a different name.`,
        );
        return;
      }
    } catch {
      // Couldn't pre-check (offline?) — fall through and let the server decide.
    }

    setSaveError(null);
    setSaving(true);
    try {
      await saveQuote(calcKey, buildPayload(name, form, calc));
      window.dispatchEvent(
        new CustomEvent("quotes-updated", { detail: calcKey }),
      );
      showToast(name, toastMessage);
      formRef.current?.reset();
    } catch (err) {
      if (err?.code === "DUPLICATE" || err?.status === 409) {
        setSaveError(
          `A quote named "${name}" already exists. Use a different name.`,
        );
      } else {
        setSaveError(
          err?.message ? `Couldn't save — ${err.message}` : "Couldn't save — try again.",
        );
      }
    } finally {
      setSaving(false);
    }
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
    saving,
    formRef,
    toast,
    handleFormChange,
    handleSave,
    handleReset,
    handlePrint,
  };
}
