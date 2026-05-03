import { useState } from "react";
import IOSToggle from "../ui/IOSToggle";
import { TrashIcon, ResetIcon } from "../ui/Icons";

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
      role: "user",
      permissions: makeEmptyPermissions(),
    };
  }
  return {
    username: user.username,
    email: user.email ?? "",
    role: user.role,
    permissions: {
      manageUsers: Boolean(user.permissions?.manageUsers),
      gravure: {
        ...makeEmptyPermissions().gravure,
        ...user.permissions?.gravure,
      },
      flexo: { ...makeEmptyPermissions().flexo, ...user.permissions?.flexo },
      jobCost: {
        ...makeEmptyPermissions().jobCost,
        ...user.permissions?.jobCost,
      },
    },
  };
}

// ── Component ─────────────────────────────────────────────────────────────

/**
 * UserForm — create or edit a user with a permissions matrix.
 *
 * Props:
 *   user            object|null  null → create mode; object → edit mode
 *   currentUser     object       logged-in user (from useAuth)
 *   onSave          fn(data)     called with { username, email, role, permissions }
 *   onDelete        fn()|null    shown only when admin + not self
 *   onResetPassword fn()|null    reset password to username
 *   saving          boolean      disables the save button
 *   saveError       string|null  inline error message
 */
export default function UserForm({
  user = null,
  currentUser,
  onSave,
  onDelete = null,
  onResetPassword = null,
  saving = false,
  saveError = null,
}) {
  const isCreate = user === null;
  const isSelf = !isCreate && String(user.id) === String(currentUser?.id);
  const isAdmin = currentUser?.role === "admin";

  const [form, setForm] = useState(() => makeInitialForm(user));

  // Cannot change role/permissions for yourself
  const canEditRolePerms = !isSelf;
  // Non-admins cannot grant manageUsers or set role=admin
  const canGrantAdmin = isAdmin;
  const canGrantManageUsers = isAdmin;

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function setPermCalc(calcKey, permKey, val) {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [calcKey]: { ...prev.permissions[calcKey], [permKey]: val },
      },
    }));
  }

  function setPermTop(key, val) {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: val },
    }));
  }

  // Toggle an entire calculator row on/off at once
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
    onSave(
      isCreate
        ? {
            username: form.username.trim(),
            email: form.email.trim(),
            role: form.role,
            permissions: form.permissions,
          }
        : {
            email: form.email.trim(),
            role: form.role,
            permissions: form.permissions,
          },
    );
  }

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

            {/* Role — admin only */}
            {isAdmin ? (
              <div>
                <p className="field-label mb-1.5">Role</p>
                <div
                  className={`flex gap-2 ${!canEditRolePerms ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {["user", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setField("role", r)}
                      className={
                        form.role === r
                          ? "radio-pill radio-pill-active"
                          : "radio-pill radio-pill-inactive"
                      }
                    >
                      {r === "admin" ? "Admin" : "User"}
                    </button>
                  ))}
                </div>
                {isSelf ? (
                  <p className="text-xs text-label-4 mt-1.5">
                    You cannot change your own role.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Permissions matrix ─────────────────────────────────────── */}
        <div
          className={`card ${!canEditRolePerms ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="card-section pb-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-label">Permissions</h3>
              {isSelf ? (
                <span className="text-xs text-label-4">
                  Read-only for your own account
                </span>
              ) : null}
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
            const rowPerms = form.permissions[key];
            const allOn = PERM_COLS.every(({ key: pk }) => rowPerms[pk]);
            return (
              <div key={key}>
                {idx > 0 ? <div className="divider mx-4" /> : null}
                <div className="px-4 py-2">
                  <div className="grid grid-cols-[minmax(80px,1fr)_repeat(4,44px)] gap-1 items-center">
                    {/* Row label — click to toggle all */}
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

          {/* Manage Users — admin only */}
          {canGrantManageUsers ? (
            <>
              <div className="divider mx-4" />
              <div className="card-section">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-label">
                      Manage Users
                    </p>
                    <p className="text-xs text-label-3 mt-0.5">
                      Can add, edit, and reset passwords for other users.
                    </p>
                  </div>
                  <IOSToggle
                    on={form.permissions.manageUsers}
                    onToggle={() =>
                      setPermTop("manageUsers", !form.permissions.manageUsers)
                    }
                    activeColor="bg-tint"
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* ── Error ──────────────────────────────────────────────────── */}
        {saveError ? <p className="form-error">{saveError}</p> : null}

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving || (isCreate && !form.username.trim())}
            className="btn-primary btn-pill disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : isCreate ? "Create User" : "Save Changes"}
          </button>

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

          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="btn-danger btn-pill ml-auto"
            >
              <TrashIcon />
              <span>Delete</span>
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
