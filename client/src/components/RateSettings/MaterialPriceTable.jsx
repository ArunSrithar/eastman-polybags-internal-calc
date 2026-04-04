import TableShell from "./TableShell";
import NewValueRow from "./NewValueRow";
import HistoryRow from "./HistoryRow";
import { makeHistoryColumns } from "./settingsConfig";

export default function MaterialPriceTable({
  materialKey,
  settings,
  adding,
  onAdd,
  onCancelAdd,
}) {
  const material = settings.materials[materialKey];
  if (!material) return null;

  const history = material.priceHistory ?? [];
  const columns = makeHistoryColumns("Price (₹/kg)");

  return (
    <TableShell columns={columns}>
      {adding ? (
        <NewValueRow
          placeholder="₹ price"
          onConfirm={onAdd}
          onCancel={onCancelAdd}
        />
      ) : null}
      {history.length === 0 && !adding ? (
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center text-label-3">
            No price history yet
          </td>
        </tr>
      ) : null}
      {history.map((entry, i) => (
        <HistoryRow
          key={i}
          entry={entry}
          index={i}
          total={history.length}
          valueKey="price"
        />
      ))}
    </TableShell>
  );
}
