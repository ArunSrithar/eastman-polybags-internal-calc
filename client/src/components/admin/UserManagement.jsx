import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon, SearchIcon, UserIcon } from "../ui/Icons";
import CalculatorHeader from "../layout/CalculatorHeader";
import { useToast } from "../ui/Toast";
import UserListItem from "./UserListItem";
import UserForm from "./UserForm";
import EmptyFormState from "./EmptyFormState";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from "../../utils/usersApi";
import { getRoles } from "../../utils/rolesApi";
import { ROLES_UPDATED_EVENT, USERS_UPDATED_EVENT } from "../../constants/events";

// ── Main view ───────────────────────────────────────────────────────────────

export default function UserManagement() {
  const { user: currentUser, isAdmin, canManageUsers } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  // null = empty state; "new" = create mode; string id = edit mode
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [toast, showToast] = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
      window.dispatchEvent(
        new CustomEvent(USERS_UPDATED_EVENT, {
          detail: { count: usersData.length },
        }),
      );
      setFetchError(null);
    } catch (err) {
      setFetchError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    async function handleRolesUpdated() {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch {
        // Keep existing roles in UI if refresh fails.
      }
    }

    window.addEventListener(ROLES_UPDATED_EVENT, handleRolesUpdated);
    return () => {
      window.removeEventListener(ROLES_UPDATED_EVENT, handleRolesUpdated);
    };
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = search.trim()
    ? users.filter((u) => {
        const q = search.trim().toLowerCase();
        return (
          u.username.toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q) ||
          (u.fullName ?? "").toLowerCase().includes(q) ||
          (u.displayName ?? "").toLowerCase().includes(q)
        );
      })
    : users;

  const selectedUser =
    selectedId && selectedId !== "new"
      ? (users.find((u) => String(u.id) === selectedId) ?? null)
      : null;

  const isCreating = selectedId === "new";

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleSelectUser(userId) {
    setSaveError(null);
    setSelectedId(userId);
  }

  function handleAddNew() {
    setSaveError(null);
    setSelectedId("new");
  }

  async function handleSave(data) {
    setSaveError(null);
    setSaving(true);
    try {
      if (isCreating) {
        const created = await createUser(data);
        setUsers((prev) => {
          const next = [...prev, created];
          window.dispatchEvent(
            new CustomEvent(USERS_UPDATED_EVENT, {
              detail: { count: next.length },
            }),
          );
          return next;
        });
        setSelectedId(String(created.id));
        showToast(`User "${created.username}" created`);
      } else {
        const updated = await updateUser(selectedId, data);
        setUsers((prev) =>
          prev.map((u) => (String(u.id) === selectedId ? updated : u)),
        );
        showToast("Changes saved");
        window.dispatchEvent(
          new CustomEvent(USERS_UPDATED_EVENT, {
            detail: { count: users.length },
          }),
        );
      }
    } catch (err) {
      setSaveError(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await deleteUser(selectedId);
      setUsers((prev) => {
        const next = prev.filter((u) => String(u.id) !== selectedId);
        window.dispatchEvent(
          new CustomEvent(USERS_UPDATED_EVENT, {
            detail: { count: next.length },
          }),
        );
        return next;
      });
      setSelectedId(null);
      showToast(`User "${selectedUser.username}" deleted`);
    } catch (err) {
      setSaveError(err.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await resetUserPassword(selectedId);
      showToast(
        "Password Reset",
        `${selectedUser.username} must change password on next login`,
      );
    } catch (err) {
      setSaveError(err.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const canAdd = canManageUsers();

  return (
    <div className="calc-shell">
      {toast}

      <CalculatorHeader
        icon={UserIcon}
        title="User Management"
        subtitle="Manage app users and permissions"
      />

      <div className="calc-grid">
        {/* ── Left: user list ─────────────────────────────────────── */}
        <div className="flex flex-col glass-panel min-h-0">
          <div className="shrink-0 p-3 pb-0">
            <div className="mb-3 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none">
                  <SearchIcon className="size-4" />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users…"
                  className="input-base text-sm pl-9 rounded-full"
                />
              </div>
              {canAdd ? (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="btn-primary btn-pill shrink-0"
                  aria-label="Add new user"
                >
                  <PlusIcon className="size-4" />
                  <span>Add</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-5 h-5 rounded-full border-2 border-tint border-t-transparent animate-spin" />
              </div>
            ) : fetchError ? (
              <p className="text-sm text-red-500 px-3 py-4 text-center">
                {fetchError}
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-label-3 px-3 py-4 text-center">
                {search.trim()
                  ? "No users match your search."
                  : "No users yet."}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {filtered.map((u) => (
                  <li key={u.id}>
                    <UserListItem
                      user={u}
                      isActive={selectedId === String(u.id)}
                      onClick={() => handleSelectUser(String(u.id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right: form panel ───────────────────────────────────── */}
        <div className="calc-column">
          {selectedId === null ? (
            <EmptyFormState onAdd={handleAddNew} canAdd={canAdd} />
          ) : (
            <UserForm
              user={isCreating ? null : selectedUser}
              availableRoles={roles}
              currentUser={currentUser}
              onSave={handleSave}
              onDelete={
                !isCreating &&
                isAdmin &&
                String(selectedUser?.id) !== String(currentUser?.id)
                  ? handleDelete
                  : null
              }
              onResetPassword={
                !isCreating &&
                selectedUser &&
                String(selectedUser.id) !== String(currentUser?.id)
                  ? handleResetPassword
                  : null
              }
              saving={saving}
              saveError={saveError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
