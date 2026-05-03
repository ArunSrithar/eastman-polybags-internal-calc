import { useState, useEffect } from "react";
import { getQuoteCount } from "../utils/quoteStorage";
import { QUOTE_STORAGE_KEYS } from "../constants/navigation";
import { useAuth } from "../context/AuthContext";

// Maps storage key → calcKey used by canViewQuotes()
const STORAGE_KEY_TO_CALC = {
  gravure: "gravure",
  "flexo-rate-calc": "flexo",
  "job-cost": "job-cost",
};

const ALL_KEYS = Object.values(QUOTE_STORAGE_KEYS);

/**
 * useQuoteCounts — returns an object with quote counts for all calculators
 * the current user has viewQuotes permission for.
 */
export function useQuoteCounts() {
  const auth = useAuth();
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(ALL_KEYS.map((k) => [k, 0])),
  );

  useEffect(() => {
    let cancelled = false;

    // Only fetch counts for calcs the user can view quotes for
    const allowedKeys = ALL_KEYS.filter((key) => {
      const calcKey = STORAGE_KEY_TO_CALC[key];
      return calcKey ? auth.canViewQuotes(calcKey) : false;
    });

    async function refresh() {
      if (allowedKeys.length === 0) return;
      const results = await Promise.all(
        allowedKeys.map((key) =>
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
  }, [auth]);

  return counts;
}
