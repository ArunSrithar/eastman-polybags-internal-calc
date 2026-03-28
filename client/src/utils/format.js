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
