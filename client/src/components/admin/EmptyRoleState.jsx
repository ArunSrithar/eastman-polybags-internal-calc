import { ShieldIcon, PlusIcon } from "../ui/Icons";

export default function EmptyRoleState({ onAdd, canAdd }) {
  return (
    <div className="glass-panel h-full flex flex-col items-center justify-center gap-4 text-center p-8">
      <span className="size-14 flex items-center justify-center rounded-2xl bg-tint/10 text-tint">
        <ShieldIcon className="size-7" />
      </span>
      <div>
        <p className="text-sm font-semibold text-label">No role selected</p>
        <p className="text-xs text-label-3 mt-1">
          Select a role to edit, or create a new role.
        </p>
      </div>
      {canAdd ? (
        <button type="button" onClick={onAdd} className="btn-primary btn-pill">
          <PlusIcon className="size-4" />
          <span>Add Role</span>
        </button>
      ) : null}
    </div>
  );
}
