import TableShell from "./TableShell";
import NewValueRow from "./NewValueRow";
import HistoryRow from "./HistoryRow";
import { makeHistoryColumns } from "./settingsConfig";
import { EditIcon } from "../ui/Icons";

export default function ChargeRateTable({
  rateKey,
  settings,
  adding,
  onAdd,
  onCancelAdd,
  title,
  onAddStart,
}) {
  const rateObj = settings[rateKey];
  if (!rateObj) return null;

  const history = rateObj.history ?? [];
  const columns = makeHistoryColumns(`Rate (${rateObj.unit})`);

  const tableTitle = title ? `${title} — Rate History` : "Rate History";
  const action =
    !adding && onAddStart ? (
      <button
        type="button"
        onClick={onAddStart}
        className="flex items-center gap-1 text-sm text-tint hover:text-tint/80 transition-colors"
      >
        <EditIcon className="size-3.5" />
        <span>Update Rate</span>
      </button>
    ) : null;

  return (
    <TableShell title={tableTitle} action={action} columns={columns}>
      {adding ? (
        <NewValueRow
          placeholder="₹ rate"
          onConfirm={onAdd}
          onCancel={onCancelAdd}
        />
      ) : null}
      {history.length === 0 && !adding ? (
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center text-label-3">
            No rate history yet
          </td>
        </tr>
      ) : null}
      {history.map((entry, i) => (
        <HistoryRow
          key={i}
          entry={entry}
          index={i}
          total={history.length}
          valueKey="rate"
        />
      ))}
    </TableShell>
  );
}
