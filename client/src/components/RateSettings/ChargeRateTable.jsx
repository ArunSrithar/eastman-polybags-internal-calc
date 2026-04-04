import TableShell from "./TableShell";
import NewValueRow from "./NewValueRow";
import HistoryRow from "./HistoryRow";
import { makeHistoryColumns } from "./settingsConfig";

export default function ChargeRateTable({
  rateKey,
  settings,
  adding,
  onAdd,
  onCancelAdd,
}) {
  const rateObj = settings[rateKey];
  if (!rateObj) return null;

  const history = rateObj.history ?? [];
  const columns = makeHistoryColumns(`Rate (${rateObj.unit})`);

  return (
    <TableShell columns={columns}>
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
