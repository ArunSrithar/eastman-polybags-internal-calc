import { useState } from "react";
import FlexoRateCalcQuoteModal from "./FlexoRateCalcQuoteModal";
import { fmt, formatDate } from "../../../utils/format";

export default function FlexoRateCalcQuotesSidebar({
  quotes,
  onDelete,
  maxHeight,
}) {
  const [selectedQuote, setSelectedQuote] = useState(null);

  return (
    <>
      <div
        className="card flex flex-col overflow-hidden"
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
      >
        {/* Header */}
        <div className="card-section pb-2 flex items-center justify-between shrink-0">
          <p className="text-xs font-semibold text-label-2 uppercase tracking-wide">
            Saved Quotes
          </p>
          {quotes.length > 0 ? (
            <span className="bg-tint/10 text-tint text-xs font-semibold px-2 py-0.5 rounded-full">
              {quotes.length}
            </span>
          ) : null}
        </div>

        <div className="divider mx-4 shrink-0" />

        {/* List */}
        {quotes.length === 0 ? (
          <div className="card-section flex flex-col items-center justify-center py-10 gap-2">
            <p className="text-sm text-label-3 text-center">
              No quotes saved yet.
            </p>
            <p className="text-xs text-label-3 text-center">
              Fill in the form and press Save Quote.
            </p>
          </div>
        ) : (
          <ul className="overflow-y-auto flex-1">
            {quotes.map((q, i) => (
              <li key={q.id}>
                <div
                  className="px-4 py-3 hover:bg-fill-3 transition-colors cursor-pointer"
                  onClick={() => setSelectedQuote(q)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-label truncate flex-1 min-w-0">
                      {q.quoteName || "Untitled"}
                    </p>
                    <span className="text-sm font-semibold text-tint whitespace-nowrap shrink-0">
                      ₹{fmt(q.totalRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    {q.coverSize && (
                      <p className="text-xs text-label-3 truncate">
                        Cover: {q.coverSize}
                      </p>
                    )}
                    <p className="text-xs text-label-3 shrink-0 ml-auto">
                      {formatDate(q.savedAt)}
                    </p>
                  </div>
                </div>
                {i < quotes.length - 1 && (
                  <div className="mx-4 h-px bg-separator" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedQuote && (
        <RateCalcQuoteModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onDelete={
            onDelete
              ? (id) => {
                  onDelete(id);
                  setSelectedQuote(null);
                }
              : undefined
          }
        />
      )}
    </>
  );
}
