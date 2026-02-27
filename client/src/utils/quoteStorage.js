/**
 * Per-calculator quote storage backed by localStorage.
 * Each calculator has its own key: "quotes-gravure", "quotes-rate", etc.
 * Shape of each quote object:
 *   { id, savedAt, quoteName, pouchSize, pricePerKg, form }
 */

function storageKey(calcKey) {
  return `quotes-${calcKey}`;
}

export function getQuotes(calcKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(calcKey)) || "[]");
  } catch {
    return [];
  }
}

export function saveQuote(calcKey, quoteData) {
  const existing = getQuotes(calcKey);
  const entry = {
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
    ...quoteData,
  };
  const updated = [entry, ...existing];
  localStorage.setItem(storageKey(calcKey), JSON.stringify(updated));
  return updated;
}

export function deleteQuote(calcKey, id) {
  const updated = getQuotes(calcKey).filter((q) => q.id !== id);
  localStorage.setItem(storageKey(calcKey), JSON.stringify(updated));
  return updated;
}
