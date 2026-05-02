import { UsersIcon, PlusIcon } from "../ui/Icons";

/**
 * EmptyFormState — shown in the right panel of UserManagement when no user is selected.
 *
 * Props:
 *   onAdd   fn()     — called when the Add User button is clicked
 *   canAdd  boolean  — whether to show the Add User button
 */
export default function EmptyFormState({ onAdd, canAdd }) {
  return (
    <div className="glass-panel h-full flex flex-col items-center justify-center gap-4 text-center p-8">
      <span className="size-14 flex items-center justify-center rounded-2xl bg-tint/10 text-tint">
        <UsersIcon className="size-7" />
      </span>
      <div>
        <p className="text-sm font-semibold text-label">No user selected</p>
        <p className="text-xs text-label-3 mt-1">
          Select a user to edit, or create a new one.
        </p>
      </div>
      {canAdd ? (
        <button type="button" onClick={onAdd} className="btn-primary btn-pill">
          <PlusIcon className="size-4" />
          <span>Add User</span>
        </button>
      ) : null}
    </div>
  );
}
