import { useState, useEffect } from "react";
import { getQuotes } from "../utils/quoteStorage";
import { QUOTE_STORAGE_KEYS } from "../constants/navigation";

/**
 * useQuoteCounts — returns an object with quote counts for all calculators.
 * Listens for localStorage changes to stay in sync across tabs.
 *
 * Returns: { gravure: number, "flexo-rate-calc": number, "job-cost": number }
 */
export function useQuoteCounts() {
  const [counts, setCounts] = useState(() => buildCounts());

  useEffect(() => {
    function handleUpdate() {
      setCounts(buildCounts());
    }
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("quotes-updated", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("quotes-updated", handleUpdate);
    };
  }, []);

  return counts;
}

function buildCounts() {
  const counts = {};
  for (const key of Object.values(QUOTE_STORAGE_KEYS)) {
    counts[key] = getQuotes(key).length;
  }
  return counts;
}
