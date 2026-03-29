import { useState, useEffect } from "react";
import CalculatorHeader from "../layout/CalculatorHeader";
import { SearchIcon } from "../ui/Icons";
import {
  getQuotes,
  deleteQuote,
  getInitialQuotes,
} from "../../utils/quoteStorage";
import { groupByMonth } from "../../utils/format";
import QuoteListItem from "../ui/QuoteListItem";
import { useToast } from "../ui/Toast";

/**
 * SavedQuotesView — shared 2-column saved-quotes layout.
 *
 * Renders a search + grouped quote list (left) and a calculator-specific
 * breakdown card (right). All state, filtering, delete, and sync logic
 * lives here — each calculator only provides config via props.
 *
 * @param {string}    calcKey         — quote storage key ("gravure", "flexo-rate-calc", "job-cost")
 * @param {Component} icon            — calculator icon component (e.g. GravureIcon)
 * @param {string}    title           — page title ("Gravure — Saved Quotes")
 * @param {Array}     sampleQuotes    — seed data from constants
 * @param {Function}  calculateRate   — pure calculation function (form → result | null)
 * @param {Component} ResultComponent — breakdown card component (receives result, form, status, date)
 */
export default function SavedQuotesView({
  calcKey,
  icon,
  title,
  sampleQuotes,
  calculateRate,
  ResultComponent,
  formatPrice,
}) {
  const [quotes, setQuotes] = useState(() =>
    getInitialQuotes(calcKey, sampleQuotes),
  );
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, showToast] = useToast();

  const selectedQuote = selectedId
    ? quotes.find((q) => q.id === selectedId)
    : null;

  function handleDelete() {
    if (!selectedQuote) return;
    const name = selectedQuote.quoteName;
    const idx = quotes.findIndex((q) => q.id === selectedId);
    const updated = deleteQuote(calcKey, selectedId);
    const nextId =
      updated.length > 0
        ? (updated[Math.min(idx, updated.length - 1)]?.id ?? null)
        : null;
    setQuotes(updated);
    setSelectedId(nextId);
    window.dispatchEvent(
      new CustomEvent("quotes-updated", { detail: calcKey }),
    );
    showToast(name, "Deleted from saved quotes");
  }

  useEffect(() => {
    function handleUpdate(e) {
      if (e.detail === calcKey) {
        setQuotes(getQuotes(calcKey));
      }
    }
    window.addEventListener("quotes-updated", handleUpdate);
    return () => window.removeEventListener("quotes-updated", handleUpdate);
  }, [calcKey]);

  const filtered = search.trim()
    ? quotes.filter((q) =>
        q.quoteName.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : quotes;

  const groups = groupByMonth(filtered);

  const selectedResult = selectedQuote
    ? calculateRate(selectedQuote.form)
    : null;

  return (
    <div className="calc-shell">
      {toast}
      <CalculatorHeader
        icon={icon}
        title={title}
        subtitle={`${quotes.length} saved quote${quotes.length !== 1 ? "s" : ""}`}
        onPrint={selectedQuote ? () => window.print() : null}
        onExport={selectedQuote ? () => {} : null}
        onDelete={selectedQuote ? handleDelete : null}
      />

      {/* 2-column layout: quote list | breakdown */}
      <div className="calc-grid">
        {/* Left — Quote list */}
        <div className="flex flex-col glass-panel min-h-0">
          <div className="shrink-0 p-3 pb-0">
            <div className="mb-3 relative">
              <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quotes…"
                className="input-base text-sm pl-9 rounded-full"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {groups.map((group) => (
              <div key={group.label} className="mb-4 last:mb-0">
                {/* Month label */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="month-label">{group.label}</span>
                  <div className="flex-1 h-px bg-separator" />
                </div>

                {/* Quote items */}
                <div>
                  {group.items.map((q) => (
                    <QuoteListItem
                      key={q.id}
                      quote={q}
                      isActive={selectedId === q.id}
                      onSelect={() => setSelectedId(q.id)}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Breakdown */}
        <div className="calc-column" data-print-area>
          <ResultComponent
            result={selectedResult}
            form={selectedQuote?.form ?? null}
            status="Saved"
            date={selectedQuote?.savedAt}
          />
        </div>
      </div>
    </div>
  );
}
