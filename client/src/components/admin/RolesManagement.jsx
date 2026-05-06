import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon, SearchIcon, ShieldIcon } from "../ui/Icons";
import CalculatorHeader from "../layout/CalculatorHeader";
import { useToast } from "../ui/Toast";
import RoleListItem from "./RoleListItem";
import RoleForm from "./RoleForm";
import EmptyRoleState from "./EmptyRoleState";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../utils/rolesApi";
import { getUsers } from "../../utils/usersApi";
import {
  ROLES_UPDATED_EVENT,
  USERS_UPDATED_EVENT,
} from "../../constants/events";

export default function RolesManagement() {
  const { canManageUsers } = useAuth();

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [toast, showToast] = useToast();

  const fetchRoles = useCallback(async () => {
    try {
      const data = await getRoles();
      setRoles(data);
      window.dispatchEvent(
        new CustomEvent(ROLES_UPDATED_EVENT, {
          detail: { count: data.length },
        }),
      );
      setFetchError(null);
    } catch (err) {
      setFetchError(err.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      // Keep existing users list if refresh fails.
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, [fetchRoles, fetchUsers]);

  useEffect(() => {
    function handleUsersUpdated() {
      fetchRoles();
      fetchUsers();
    }

    window.addEventListener(USERS_UPDATED_EVENT, handleUsersUpdated);
    return () => {
      window.removeEventListener(USERS_UPDATED_EVENT, handleUsersUpdated);
    };
  }, [fetchRoles, fetchUsers]);

  const filtered = search.trim()
    ? roles.filter((r) => {
        const q = search.trim().toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q)
        );
      })
    : roles;

  const selectedRole =
    selectedId && selectedId !== "new"
      ? (roles.find((r) => String(r.id) === selectedId) ?? null)
      : null;

  const selectedRoleUsers = useMemo(() => {
    if (!selectedRole) return [];
    const selectedRoleId = String(selectedRole.id);
    return users.filter((user) =>
      (user.roles || []).some(
        (role) => String(role.id || role._id) === selectedRoleId,
      ),
    );
  }, [users, selectedRole]);

  const isCreating = selectedId === "new";
  const canAdd = canManageUsers();

  function handleSelectRole(roleId) {
    setSaveError(null);
    setSelectedId(roleId);
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
        const created = await createRole(data);
        setRoles((prev) => {
          const next = [...prev, created];
          window.dispatchEvent(
            new CustomEvent(ROLES_UPDATED_EVENT, {
              detail: { count: next.length },
            }),
          );
          return next;
        });
        setSelectedId(String(created.id));
        showToast(`Role "${created.name}" created`);
      } else {
        const updated = await updateRole(selectedId, data);
        setRoles((prev) =>
          prev.map((r) => (String(r.id) === selectedId ? updated : r)),
        );
        showToast("Role updated");
      }
    } catch (err) {
      setSaveError(err.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await deleteRole(selectedId);
      setRoles((prev) => {
        const next = prev.filter((r) => String(r.id) !== selectedId);
        window.dispatchEvent(
          new CustomEvent(ROLES_UPDATED_EVENT, {
            detail: { count: next.length },
          }),
        );
        return next;
      });
      setSelectedId(null);
      showToast(`Role "${selectedRole.name}" deleted`);
    } catch (err) {
      setSaveError(err.message || "Failed to delete role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="calc-shell">
      {toast}

      <CalculatorHeader
        icon={ShieldIcon}
        title="Roles & Permissions"
        subtitle="Create reusable roles and attach them to users"
      />

      <div className="calc-grid">
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
                  placeholder="Search roles…"
                  className="input-base text-sm pl-9 rounded-full"
                />
              </div>
              {canAdd ? (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="btn-primary btn-pill shrink-0"
                  aria-label="Add new role"
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
                  ? "No roles match your search."
                  : "No roles yet."}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {filtered.map((r) => (
                  <li key={r.id}>
                    <RoleListItem
                      role={r}
                      isActive={selectedId === String(r.id)}
                      onClick={() => handleSelectRole(String(r.id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="calc-column">
          {selectedId === null ? (
            <EmptyRoleState />
          ) : (
            <RoleForm
              role={isCreating ? null : selectedRole}
              assignedUsers={isCreating ? [] : selectedRoleUsers}
              onSave={handleSave}
              onDelete={!isCreating ? handleDelete : null}
              saving={saving}
              saveError={saveError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
