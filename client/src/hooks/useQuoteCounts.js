import { useState, useEffect } from "react";
import { getQuoteCount } from "../utils/quoteStorage";
import { QUOTE_STORAGE_KEYS } from "../constants/navigation";

const KEYS = Object.values(QUOTE_STORAGE_KEYS);

/**
 * useQuoteCounts — returns an object with quote counts for all calculators.
 *
 * Counts are loaded asynchronously (some calculators are server-backed).
 * Re-fetches on `quotes-updated` (in-tab) and `storage` (cross-tab) events.
 * On fetch failure, the previous count is preserved.
 *
 * Returns: { gravure: number, "flexo-rate-calc": number, "job-cost": number }
 */
export function useQuoteCounts() {
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(KEYS.map((k) => [k, 0])),
  );

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const results = await Promise.all(
        KEYS.map((key) =>
          getQuoteCount(key).then(
            (n) => [key, n],
            (err) => {
              console.error(`Failed to load quote count for ${key}`, err);
              return null;
            },
          ),
        ),
      );
      if (cancelled) return;
      setCounts((prev) => {
        const next = { ...prev };
        for (const entry of results) {
          if (entry) next[entry[0]] = entry[1];
        }
        return next;
      });
    }

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("quotes-updated", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("quotes-updated", refresh);
    };
  }, []);

  return counts;
}
