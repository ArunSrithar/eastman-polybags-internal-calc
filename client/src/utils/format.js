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
