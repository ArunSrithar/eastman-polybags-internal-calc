/**
 * Shared formatting utilities used across calculators.
 */

/**
 * Format a number as Indian locale currency (2 decimal places).
 * e.g. 12345.6 → "12,345.60"
 */
export function fmt(n) {
  return Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format an ISO date string as "DD Mon YYYY, HH:MM AM/PM"
 * e.g. "2026-02-26T09:15:00.000Z" → "26 Feb 2026, 09:15 am"
 */
export function formatDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}, ${time}`;
}

/**
 * Group a pre-sorted list of objects by month+year from their `savedAt` field.
 * Returns: [{ label: "March 2026", items: [...] }, ...]
 */
export function groupByMonth(items) {
  const groups = [];
  let currentLabel = null;
  let currentItems = [];

  for (const item of items) {
    const label = new Date(item.savedAt).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
    if (label !== currentLabel) {
      if (currentLabel)
        groups.push({ label: currentLabel, items: currentItems });
      currentLabel = label;
      currentItems = [item];
    } else {
      currentItems.push(item);
    }
  }
  if (currentLabel) groups.push({ label: currentLabel, items: currentItems });
  return groups;
}

/* ─── Amount in words (INR) ────────────────────────────────────────── */

const _ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const _TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function _words(n) {
  if (n === 0) return "";
  if (n < 20) return _ONES[n];
  if (n < 100)
    return _TENS[Math.floor(n / 10)] + (n % 10 ? " " + _ONES[n % 10] : "");
  if (n < 1000)
    return (
      _ONES[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + _words(n % 100) : "")
    );
  if (n < 100000)
    return (
      _words(Math.floor(n / 1000)) +
      " Thousand" +
      (n % 1000 ? " " + _words(n % 1000) : "")
    );
  if (n < 10000000)
    return (
      _words(Math.floor(n / 100000)) +
      " Lakh" +
      (n % 100000 ? " " + _words(n % 100000) : "")
    );
  return (
    _words(Math.floor(n / 10000000)) +
    " Crore" +
    (n % 10000000 ? " " + _words(n % 10000000) : "")
  );
}

/**
 * Convert a number to Indian Rupee words.
 * e.g. 11198.20 → "INR Eleven Thousand One Hundred Ninety Eight and Twenty Paise Only"
 */
export function amountInWords(amount) {
  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);
  if (rupees === 0 && paise === 0) return "INR Zero Only";
  let result = "INR ";
  if (rupees > 0) result += _words(rupees);
  if (paise > 0)
    result += (rupees > 0 ? " and " : "") + _words(paise) + " Paise";
  return result + " Only";
}
