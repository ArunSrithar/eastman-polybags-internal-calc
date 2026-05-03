import { useEffect, useMemo, useRef, useState } from "react";
import { TrashIcon, SaveIcon } from "../ui/Icons";
import IOSToggle from "../ui/IOSToggle";

const CALC_ROWS = [
  { key: "gravure", label: "Gravure" },
  { key: "flexo", label: "Flexo" },
  { key: "jobCost", label: "Job Cost" },
];

const PERM_COLS = [
  { key: "calculate", label: "Calculate" },
  { key: "saveQuote", label: "Save" },
  { key: "viewQuotes", label: "View" },
  { key: "editPrices", label: "Prices" },
];

function makeEmptyPermissions() {
  const perms = { manageUsers: false };
  for (const { key } of CALC_ROWS) {
    perms[key] = {
      calculate: false,
      saveQuote: false,
      viewQuotes: false,
      editPrices: false,
    };
  }
  return perms;
}

function makeInitialForm(role) {
  if (!role) {
    return {
      name: "",
      description: "",
      permissions: makeEmptyPermissions(),
    };
  }
  return {
    name: role.name,
    description: role.description || "",
    permissions: {
      manageUsers: Boolean(role.permissions?.manageUsers),
      gravure: { ...makeEmptyPermissions().gravure, ...role.permissions?.gravure },
      flexo: { ...makeEmptyPermissions().flexo, ...role.permissions?.flexo },
      jobCost: { ...makeEmptyPermissions().jobCost, ...role.permissions?.jobCost },
    },
  };
}

function normalizeRoleForm(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    permissions: form.permissions,
  };
}

export default function RoleForm({
  role = null,
  assignedUsers = [],
  onSave,
  onDelete = null,
  saving = false,
  saveError = null,
}) {
  const isCreate = role === null;
  const roleNameInputRef = useRef(null);
  const initialForm = useMemo(() => makeInitialForm(role), [role]);
  const [form, setForm] = useState(() => makeInitialForm(role));

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (!isCreate) return;
    const raf = window.requestAnimationFrame(() => {
      roleNameInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isCreate, role]);

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function setPermCalc(calcKey, permKey, val) {
    setForm((prev) => {
      const updated = { ...prev.permissions[calcKey], [permKey]: val };
      if (permKey === "saveQuote" && val) updated.calculate = true;
      if (permKey === "calculate" && !val) updated.saveQuote = false;
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [calcKey]: updated,
        },
      };
    });
  }

  function setPermTop(key, val) {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: val },
    }));
  }

  function toggleCalcRow(calcKey, newVal) {
    const updated = {};
    for (const { key } of PERM_COLS) updated[key] = newVal;
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [calcKey]: updated,
      },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      permissions: form.permissions,
    });
  }

  const deleteBlocked = !isCreate && (role?.userCount || 0) > 0;
  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(normalizeRoleForm(form)) !==
      JSON.stringify(normalizeRoleForm(initialForm))
    );
  }, [form, initialForm]);

  return (
    <form onSubmit={handleSubmit} noValidate className="h-full flex flex-col min-h-0">
      <div className="space-y-3 flex-1 min-h-0 flex flex-col">
        <div className="card">
          <div className="card-section pb-1">
            <h3 className="text-sm font-semibold text-label">
              {isCreate ? "New Role" : `Edit — ${role.name}`}
            </h3>
          </div>
          <div className="divider mx-4" />
          <div className="card-section space-y-3">
            <div>
              <label htmlFor="rf-name" className="field-label mb-1.5 block">
                Role Name
              </label>
              <input
                id="rf-name"
                ref={roleNameInputRef}
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Marketer"
                autoComplete="off"
                className="input-base"
                required
              />
            </div>

            <div>
              <label htmlFor="rf-desc" className="field-label mb-1.5 block">
                Description <span className="text-label-4 font-normal">(optional)</span>
              </label>
              <textarea
                id="rf-desc"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Briefly describe what this role can do"
                rows={2}
                className="input-base resize-none"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-section pb-1">
            <h3 className="text-sm font-semibold text-label">Permissions</h3>
          </div>
          <div className="divider mx-4" />

          <div className="px-4 pt-2 pb-1">
            <div className="grid grid-cols-[minmax(80px,1fr)_repeat(4,44px)] gap-1 items-center">
              <span className="text-xs text-label-4 font-medium"></span>
              {PERM_COLS.map((col) => (
                <span
                  key={col.key}
                  className="text-[10px] text-label-3 font-medium text-center leading-tight"
                >
                  {col.label}
                </span>
              ))}
            </div>
          </div>

          {CALC_ROWS.map(({ key, label }, idx) => {
            const rowPerms = form.permissions[key];
            const allOn = PERM_COLS.every(({ key: pk }) => rowPerms[pk]);
            return (
              <div key={key}>
                {idx > 0 ? <div className="divider mx-4" /> : null}
                <div className="px-4 py-2">
                  <div className="grid grid-cols-[minmax(80px,1fr)_repeat(4,44px)] gap-1 items-center">
                    <button
                      type="button"
                      onClick={() => toggleCalcRow(key, !allOn)}
                      className="text-left text-xs font-medium text-label hover:text-tint transition-colors"
                      title="Toggle all"
                    >
                      {label}
                    </button>
                    {PERM_COLS.map(({ key: pk }) => (
                      <span key={pk} className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => setPermCalc(key, pk, !rowPerms[pk])}
                          aria-pressed={rowPerms[pk]}
                          aria-label={`${label} ${pk}`}
                          className={`size-6 rounded-md border transition-colors ${
                            rowPerms[pk]
                              ? "bg-tint border-tint/30 text-white"
                              : "bg-fill-3 border-separator text-transparent"
                          }`}
                        >
                          <svg
                            viewBox="0 0 10 10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-3 mx-auto"
                          >
                            <polyline points="1.5 5 4 7.5 8.5 2.5" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="divider mx-4" />
          <div className="card-section">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-label">Manage Users</p>
                <p className="text-xs text-label-3 mt-0.5">Can open users and roles management views.</p>
              </div>
              <IOSToggle
                on={form.permissions.manageUsers}
                onToggle={() =>
                  setPermTop("manageUsers", !form.permissions.manageUsers)
                }
              />
            </div>
          </div>
        </div>

        {saveError ? <p className="form-error">{saveError}</p> : null}

        <div className="flex items-center gap-2">
          <div className="ml-auto flex items-center gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleteBlocked}
                className="btn-danger btn-pill disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  deleteBlocked
                    ? "Unassign this role from all users before deleting"
                    : "Delete role"
                }
              >
                <TrashIcon />
                <span>Delete</span>
              </button>
            ) : null}

            <button
              type="submit"
              disabled={saving || !form.name.trim() || !hasChanges}
              className="btn-primary btn-pill disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isCreate ? <SaveIcon className="size-4" /> : null}
              {saving ? "Saving…" : isCreate ? "Create Role" : "Save"}
            </button>
          </div>
        </div>

        {!isCreate ? <div className="divider" /> : null}

        {!isCreate ? (
          <div className="card flex-1 min-h-0 flex flex-col">
            <div className="card-section pb-1">
              <h3 className="text-sm font-semibold text-label">Users Sharing This Role</h3>
            </div>
            <div className="divider mx-4" />
            <div className="card-section flex-1 min-h-0 overflow-y-auto">
              {assignedUsers.length === 0 ? (
                <p className="text-xs text-label-3">No users are currently assigned to this role.</p>
              ) : (
                <ul className="space-y-0">
                  {assignedUsers.map((user) => {
                    const hasEmail = Boolean(user.email);
                    return (
                      <li
                        key={user.id}
                        className="quote-list-item !mb-0 rounded-none px-0 py-2 border-b border-separator/44 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-label-2 truncate">
                            @{user.username}
                            {hasEmail ? (
                              <>
                                <span className="mx-1 text-label-3">•</span>
                                <span className="text-label-3">{user.email}</span>
                              </>
                            ) : null}
                          </span>
                          <span className={`text-[11px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-full border ${
                            user.isActive === false
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-green-500/20 text-green-400 border-green-500/30"
                          }`}>
                            {user.isActive === false ? "Deactivated" : "Active"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
