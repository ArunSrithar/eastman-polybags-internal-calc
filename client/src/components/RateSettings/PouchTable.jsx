import TableShell from "./TableShell";
import NewPouchRow from "./NewPouchRow";
import PouchRow from "./PouchRow";
import { POUCH_COLUMNS } from "./settingsConfig";
import { PlusIcon } from "../ui/Icons";

export default function PouchTable({
  settings,
  onEdit,
  onDelete,
  adding,
  onAdd,
  onCancelAdd,
  onAddStart,
}) {
  const pouches = settings.pouches ?? [];
  const action =
    !adding && onAddStart ? (
      <button
        type="button"
        onClick={onAddStart}
        className="flex items-center gap-1 text-sm text-tint hover:text-tint/80 transition-colors"
      >
        <PlusIcon className="size-3.5" />
        <span>Add Pouch</span>
      </button>
    ) : null;

  return (
    <TableShell
      title="Pouch Size Rates"
      action={action}
      columns={POUCH_COLUMNS}
    >
      {adding ? <NewPouchRow onConfirm={onAdd} onCancel={onCancelAdd} /> : null}
      {pouches.length === 0 && !adding ? (
        <tr>
          <td
            colSpan={POUCH_COLUMNS.length}
            className="px-4 py-8 text-center text-label-3"
          >
            No pouch sizes yet
          </td>
        </tr>
      ) : null}
      {pouches.map((p, i) => (
        <PouchRow
          key={p.id}
          pouch={p}
          index={i}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </TableShell>
  );
}
