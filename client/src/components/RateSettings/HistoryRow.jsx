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
    <tr className={isCurrent ? "current-row" : ""}>
      <td className="table-cell text-label-3">
        {sno}
      </td>
      <td className="table-cell text-label">
        {entry.changedBy}
      </td>
      <td className="table-cell text-label font-medium">
        ₹{fmt(entry[valueKey])}
      </td>
      <td className="table-cell text-label-2">
        {formatDate(entry.changedAt)}
      </td>
      <td className="table-cell" />
    </tr>
  );
}
