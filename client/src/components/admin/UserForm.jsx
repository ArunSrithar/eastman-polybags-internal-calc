import { useEffect, useMemo, useRef, useState } from "react";
import IOSToggle from "../ui/IOSToggle";
import { TrashIcon, ResetIcon, SaveIcon } from "../ui/Icons";

// ── Permission matrix config ───────────────────────────────────────────────

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

function makeInitialForm(user) {
  if (!user) {
    return {
      username: "",
      email: "",
      isActive: true,
      roles: [],
    };
  }
  return {
    username: user.username,
    email: user.email ?? "",
    isActive: user.isActive ?? true,
    roles: (user.roles || []).map((r) => String(r.id || r._id)),
  };
}

function mergeRolePermissions(selectedRoleIds, availableRoles) {
  const merged = makeEmptyPermissions();
  const roleMap = new Map(availableRoles.map((r) => [String(r.id), r]));

  for (const roleId of selectedRoleIds) {
    const role = roleMap.get(String(roleId));
    const perms = role?.permissions;
    if (!perms) continue;

    for (const { key } of CALC_ROWS) {
      merged[key].calculate ||= Boolean(perms[key]?.calculate);
      merged[key].saveQuote ||= Boolean(perms[key]?.saveQuote);
      merged[key].viewQuotes ||= Boolean(perms[key]?.viewQuotes);
      merged[key].editPrices ||= Boolean(perms[key]?.editPrices);
    }
    merged.manageUsers ||= Boolean(perms.manageUsers);
  }

  return merged;
}

function normalizeRoleIds(roleIds) {
  return [...roleIds].map(String).sort();
}

function makeComparableCreateForm(form) {
  return {
    username: form.username.trim().toLowerCase(),
    email: form.email.trim(),
    roles: normalizeRoleIds(form.roles),
  };
}

function makeComparableEditForm(form) {
  return {
    email: form.email.trim(),
    isActive: Boolean(form.isActive),
    roles: normalizeRoleIds(form.roles),
  };
}

// ── Component ─────────────────────────────────────────────────────────────

export default function UserForm({
  user = null,
  availableRoles = [],
  currentUser,
  onSave,
  onDelete = null,
  onResetPassword = null,
  saving = false,
  saveError = null,
}) {
  const isCreate = user === null;
  const isSelf = !isCreate && String(user.id) === String(currentUser?.id);
  const canEditPerms = !isSelf;
  const usernameInputRef = useRef(null);
  const initialForm = useMemo(() => makeInitialForm(user), [user]);

  const [form, setForm] = useState(() => makeInitialForm(user));
  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (!isCreate) return;
    const raf = window.requestAnimationFrame(() => {
      usernameInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isCreate, user]);

  const effectivePermissions = useMemo(
    () => mergeRolePermissions(form.roles, availableRoles),
    [form.roles, availableRoles],
  );

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function toggleRole(roleId) {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((id) => id !== roleId)
        : [...prev.roles, roleId],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const effectiveUsername = form.username.trim().toLowerCase();
    if (isCreate) {
      onSave({
        username: effectiveUsername,
        email: form.email.trim() || undefined,
        roles: form.roles,
      });
    } else {
      onSave({
        email: form.email.trim() || undefined,
        isActive: form.isActive,
        roles: form.roles,
      });
    }
  }

  const hasChanges = useMemo(() => {
    if (isCreate) {
      return (
        JSON.stringify(makeComparableCreateForm(form)) !==
        JSON.stringify(makeComparableCreateForm(initialForm))
      );
    }

    return (
      JSON.stringify(makeComparableEditForm(form)) !==
      JSON.stringify(makeComparableEditForm(initialForm))
    );
  }, [form, initialForm, isCreate]);

  const submitDisabled =
    saving ||
    (isCreate && !form.username.trim()) ||
    !hasChanges;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-3">
        {/* ── Identity ───────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-section pb-1">
            <h3 className="text-sm font-semibold text-label">
              {isCreate ? "New User" : `Edit — ${user.username}`}
            </h3>
          </div>
          <div className="divider mx-4" />
          <div className="card-section space-y-3">
            {/* Username */}
            <div>
              <label htmlFor="uf-username" className="field-label mb-1.5 block">
                Username
              </label>
              {isCreate ? (
                <input
                  id="uf-username"
                  ref={usernameInputRef}
                  type="text"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value)}
                  placeholder="e.g. john"
                  autoComplete="off"
                  className="input-base"
                  required
                />
              ) : (
                <p className="text-sm text-label px-3 py-2 rounded-xl bg-fill-3">
                  {form.username}
                </p>
              )}
              {isCreate ? (
                <p className="text-xs text-label-3 mt-1.5">
                  Default password will be the username — user must change it on
                  first login.
                </p>
              ) : null}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="uf-email" className="field-label mb-1.5 block">
                Email{" "}
                <span className="text-label-4 font-normal">(optional)</span>
              </label>
              <input
                id="uf-email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="user@example.com"
                autoComplete="off"
                className="input-base"
              />
            </div>
          </div>
        </div>

        {/* ── Role Assignment ────────────────────────────────────────── */}
        <div className={`card ${!canEditPerms ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="card-section pb-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-label">Assigned Roles</h3>
              {isSelf ? (
                <span className="text-xs text-label-4">Read-only for your own account</span>
              ) : null}
            </div>
          </div>
          <div className="divider mx-4" />
          <div className="card-section">
            {availableRoles.length === 0 ? (
              <p className="text-xs text-label-3">
                No roles found. Create roles in Roles (Permissions) first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => {
                  const id = String(role.id);
                  const active = form.roles.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleRole(id)}
                      className={active ? "radio-pill radio-pill-active" : "radio-pill radio-pill-inactive"}
                    >
                      {role.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Effective Permissions (Read-only) ─────────────────────── */}
        <div
          className="card"
        >
          <div className="card-section pb-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-label">Effective Permissions</h3>
              <span className="text-xs text-label-4">Read-only (derived from roles)</span>
            </div>
          </div>
          <div className="divider mx-4" />

          {/* Column headers */}
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

          {/* Calculator rows */}
          {CALC_ROWS.map(({ key, label }, idx) => {
            const rowPerms = effectivePermissions[key];
            return (
              <div key={key}>
                {idx > 0 ? <div className="divider mx-4" /> : null}
                <div className="px-4 py-2">
                  <div className="grid grid-cols-[minmax(80px,1fr)_repeat(4,44px)] gap-1 items-center">
                    <span className="text-left text-xs font-medium text-label">
                      {label}
                    </span>
                    {PERM_COLS.map(({ key: pk }) => (
                      <span key={pk} className="flex justify-center">
                        <span
                          aria-label={`${label} ${pk}`}
                          className={`size-6 rounded-md border flex items-center justify-center ${
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
                        </span>
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
                <p className="text-xs text-label-3 mt-0.5">
                  Access to Users and Roles management views.
                </p>
              </div>
              <IOSToggle
                on={effectivePermissions.manageUsers}
                onToggle={() => {}}
                disabled
              />
            </div>
          </div>
        </div>

        {/* ── Error ──────────────────────────────────────────────────── */}
        {saveError ? <p className="form-error">{saveError}</p> : null}

        {/* ── Account Status ─────────────────────────────────────────── */}
        {!isCreate && !isSelf ? (
          <div className="card">
            <div className="card-section">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-label">
                    Account Status
                  </p>
                  <p className="text-xs text-label-3 mt-0.5">
                    {form.isActive
                      ? "Active — user can log in."
                      : "Disabled — user cannot log in."}
                  </p>
                </div>
                <IOSToggle
                  on={form.isActive}
                  onToggle={() => setField("isActive", !form.isActive)}
                  activeColor="bg-tint"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {onResetPassword ? (
            <button
              type="button"
              onClick={onResetPassword}
              className="btn-secondary btn-pill"
              title="Reset password to username"
            >
              <ResetIcon className="size-4" />
              <span>Reset Password</span>
            </button>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="btn-danger btn-pill"
              >
                <TrashIcon />
                <span>Delete</span>
              </button>
            ) : null}

            <button
              type="submit"
              disabled={submitDisabled}
              className="btn-primary btn-pill disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isCreate ? <SaveIcon className="size-4" /> : null}
              {saving ? "Saving…" : isCreate ? "Create User" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
