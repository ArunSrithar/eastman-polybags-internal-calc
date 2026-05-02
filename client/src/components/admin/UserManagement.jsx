import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon, SearchIcon } from "../ui/Icons";
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

// ── Main view ───────────────────────────────────────────────────────────────

export default function UserManagement() {
  const { user: currentUser, isAdmin, canManageUsers } = useAuth();

  const [users, setUsers] = useState([]);
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
      const data = await getUsers();
      setUsers(data);
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

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(search.trim().toLowerCase()) ||
          (u.email ?? "").toLowerCase().includes(search.trim().toLowerCase()),
      )
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
        setUsers((prev) => [...prev, created]);
        setSelectedId(String(created.id));
        showToast(`User "${created.username}" created`);
      } else {
        const updated = await updateUser(selectedId, data);
        setUsers((prev) =>
          prev.map((u) => (String(u.id) === selectedId ? updated : u)),
        );
        showToast("Changes saved");
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
      setUsers((prev) => prev.filter((u) => String(u.id) !== selectedId));
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
        `Password reset — ${selectedUser.username} must change password on next login`,
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
        icon={UsersIcon}
        title="User Management"
        subtitle="Manage app users and permissions"
      />

      <div className="calc-grid">
        {/* ── Left: user list ─────────────────────────────────────── */}
        <div className="calc-column">
          <div className="glass-panel h-full flex flex-col overflow-hidden">
            {/* Search + Add */}
            <div className="px-4 py-3 border-b border-separator flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none">
                  <SearchIcon className="size-4" />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users…"
                  className="input-base pl-9 text-sm"
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

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2 px-2">
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

            {/* Footer count */}
            <div className="px-4 py-2 border-t border-separator">
              <p className="text-xs text-label-4">
                {users.length} {users.length === 1 ? "user" : "users"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: form panel ───────────────────────────────────── */}
        <div className="calc-column">
          {selectedId === null ? (
            <EmptyFormState onAdd={handleAddNew} canAdd={canAdd} />
          ) : (
            <UserForm
              user={isCreating ? null : selectedUser}
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
