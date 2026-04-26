/**
 * Per-calculator quote storage.
 *
 * Dispatches to the server API for calcKeys in REMOTE_KEYS,
 * falls back to localStorage for the rest. All functions are async.
 *
 * Shape of each quote object:
 *   { id, savedAt, quoteName, pouchSize, pricePerKg, form }
 */

import * as quotesApi from "./quotesApi";

// Calculators whose quotes are persisted server-side.
const REMOTE_KEYS = new Set(["gravure"]);

function isRemote(calcKey) {
  return REMOTE_KEYS.has(calcKey);
}

function storageKey(calcKey) {
  return `quotes-${calcKey}`;
}

function readLocal(calcKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(calcKey)) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(calcKey, list) {
  try {
    localStorage.setItem(storageKey(calcKey), JSON.stringify(list));
  } catch {
    // Quota / private mode — ignore; caller still gets the in-memory list.
  }
}

export async function getQuotes(calcKey) {
  if (isRemote(calcKey)) {
    return quotesApi.listQuotes(calcKey);
  }
  return readLocal(calcKey);
}

export async function getQuoteCount(calcKey) {
  if (isRemote(calcKey)) {
    return quotesApi.countQuotes(calcKey);
  }
  return readLocal(calcKey).length;
}

export async function saveQuote(calcKey, quoteData) {
  if (isRemote(calcKey)) {
    return quotesApi.createQuote(calcKey, quoteData);
  }
  const existing = readLocal(calcKey);
  const entry = {
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
    ...quoteData,
  };
  writeLocal(calcKey, [entry, ...existing]);
  return entry;
}

export async function deleteQuote(calcKey, id) {
  if (isRemote(calcKey)) {
    await quotesApi.deleteQuote(calcKey, id);
    return;
  }
  const updated = readLocal(calcKey).filter((q) => q.id !== id);
  writeLocal(calcKey, updated);
}

/**
 * Load quotes for a calculator, seeding with sample data on first visit.
 * Sample seeding only applies to local-storage calculators; remote
 * calculators always start from the server's actual list.
 */
export async function getInitialQuotes(calcKey, sampleQuotes) {
  if (isRemote(calcKey)) {
    return quotesApi.listQuotes(calcKey);
  }
  const stored = readLocal(calcKey);
  const allSamples =
    stored.length > 0 &&
    stored.every((q) => String(q.id).startsWith("sample-"));
  if (sampleQuotes && (stored.length === 0 || allSamples)) {
    writeLocal(calcKey, sampleQuotes);
    return sampleQuotes;
  }
  return stored;
}
