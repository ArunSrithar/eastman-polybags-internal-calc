import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useQuoteCounts } from "./useQuoteCounts";
import { getRoles } from "../utils/rolesApi";
import { getUsers } from "../utils/usersApi";
import {
  ROLES_UPDATED_EVENT,
  USERS_UPDATED_EVENT,
} from "../constants/events";

/**
 * useSidebarBadgeCounts — central source for sidebar badge values.
 *
 * Includes calculator quote counts and user-management counts.
 */
export function useSidebarBadgeCounts() {
  const auth = useAuth();
  const quoteCounts = useQuoteCounts();
  const [adminCounts, setAdminCounts] = useState({ roles: 0, users: 0 });
  const canManageUsers = auth.canManageUsers();

  const refreshAdminCounts = useCallback(async () => {
    if (!canManageUsers) {
      setAdminCounts({ roles: 0, users: 0 });
      return;
    }

    try {
      const [roles, users] = await Promise.all([getRoles(), getUsers()]);
      setAdminCounts({ roles: roles.length, users: users.length });
    } catch {
      // Keep previous values if fetch fails.
    }
  }, [canManageUsers]);

  useEffect(() => {
    function handleRolesUpdated(event) {
      const count = event?.detail?.count;
      if (typeof count === "number") {
        setAdminCounts((prev) => ({ ...prev, roles: count }));
      }
      refreshAdminCounts();
    }

    function handleUsersUpdated(event) {
      const count = event?.detail?.count;
      if (typeof count === "number") {
        setAdminCounts((prev) => ({ ...prev, users: count }));
      }
      refreshAdminCounts();
    }

    const initialRefreshId = window.requestAnimationFrame(() => {
      refreshAdminCounts();
    });
    window.addEventListener(ROLES_UPDATED_EVENT, handleRolesUpdated);
    window.addEventListener(USERS_UPDATED_EVENT, handleUsersUpdated);
    return () => {
      window.cancelAnimationFrame(initialRefreshId);
      window.removeEventListener(ROLES_UPDATED_EVENT, handleRolesUpdated);
      window.removeEventListener(USERS_UPDATED_EVENT, handleUsersUpdated);
    };
  }, [refreshAdminCounts]);

  return { ...quoteCounts, ...adminCounts };
}