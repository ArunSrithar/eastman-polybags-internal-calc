import TableShell from "./TableShell";
import NewValueRow from "./NewValueRow";
import HistoryRow from "./HistoryRow";
import { makeHistoryColumns } from "./settingsConfig";
import { EditIcon } from "../ui/Icons";

export default function MaterialPriceTable({
  materialKey,
  settings,
  adding,
  onAdd,
  onCancelAdd,
  onAddStart,
}) {
  const material = settings.materials[materialKey];
  if (!material) return null;

  const history = material.priceHistory ?? [];
  const columns = makeHistoryColumns("Price (₹/kg)");

  const title = `${material.label} — Price History`;
  const action =
    !adding && onAddStart ? (
      <button
        type="button"
        onClick={onAddStart}
        className="flex items-center gap-1 text-sm text-tint hover:text-tint/80 transition-colors"
      >
        <EditIcon className="size-3.5" />
        <span>Update Price</span>
      </button>
    ) : null;

  return (
    <TableShell title={title} action={action} columns={columns}>
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
