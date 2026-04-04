import { fmt, formatDate } from "../../utils/format";

/**
 * HistoryRow — renders a single history entry for material prices or charge rates.
 * The first row (index 0) gets the violet→blue gradient + star.
 */
export default function HistoryRow({ entry, index, total, valueKey }) {
  const isCurrent = index === 0;
  const sno = isCurrent ? (
    <span className="text-violet-400">★</span>
  ) : (
    total - index
  );

  return (
    <tr>
      <td
        className={`table-cell text-label-3 ${isCurrent ? "current-row-first" : ""}`}
      >
        {sno}
      </td>
      <td
        className={`table-cell text-label ${isCurrent ? "current-row-mid" : ""}`}
      >
        {entry.changedBy}
      </td>
      <td
        className={`table-cell text-label font-medium ${isCurrent ? "current-row-mid" : ""}`}
      >
        ₹{fmt(entry[valueKey])}
      </td>
      <td
        className={`table-cell text-label-2 ${isCurrent ? "current-row-mid" : ""}`}
      >
        {formatDate(entry.changedAt)}
      </td>
      <td className={`table-cell ${isCurrent ? "current-row-last" : ""}`} />
    </tr>
  );
}
