import TableShell from "./TableShell";
import NewPouchRow from "./NewPouchRow";
import PouchRow from "./PouchRow";
import { POUCH_COLUMNS } from "./settingsConfig";

export default function PouchTable({
  settings,
  onEdit,
  onDelete,
  adding,
  onAdd,
  onCancelAdd,
}) {
  const pouches = settings.pouches ?? [];

  return (
    <TableShell columns={POUCH_COLUMNS}>
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
