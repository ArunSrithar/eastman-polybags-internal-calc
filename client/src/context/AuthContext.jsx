/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getMeApi, loginApi, logoutApi, refreshApi } from "../utils/authApi";

// ── Constants ──────────────────────────────────────────────────────────────

// Refresh access token 1 minute before it expires (token lifetime = 15 min).
const REFRESH_INTERVAL_MS = 14 * 60 * 1000;

// Consider user idle after 6 hours of no interaction.
const INACTIVITY_LIMIT_MS = 6 * 60 * 60 * 1000;

// Throttle — update lastActivity at most once every 30 seconds.
const ACTIVITY_THROTTLE_MS = 30 * 1000;

// BroadcastChannel name for cross-tab auth sync.
const AUTH_CHANNEL = "auth";

// calcKey (app) → permissions key (camelCase in User model)
export const CALC_PERMISSION_KEYS = {
  gravure: "gravure",
  flexo: "flexo",
  "flexo-rate-calc": "flexo",
  "job-cost": "jobCost",
};

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const lastActivityRef = useRef(0);
  const refreshTimerRef = useRef(null);
  const channelRef = useRef(null);

  // ── Activity tracking ────────────────────────────────────────────────────

  useEffect(() => {
    lastActivityRef.current = Date.now();
    let lastUpdate = 0;

    function handleActivity() {
      const now = Date.now();
      if (now - lastUpdate > ACTIVITY_THROTTLE_MS) {
        lastActivityRef.current = now;
        lastUpdate = now;
      }
    }

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true }),
    );
    return () =>
      events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, []);

  // ── Logout (stable ref so interval callbacks can call it) ────────────────

  const logoutRef = useRef(null);

  const logout = useCallback(async ({ broadcast = true } = {}) => {
    clearInterval(refreshTimerRef.current);
    try {
      await logoutApi();
    } catch {
      /* best effort */
    }
    setUser(null);
    if (broadcast) {
      try {
        channelRef.current?.postMessage({ type: "logout" });
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // ── Auto-refresh with inactivity guard ───────────────────────────────────

  const startRefreshTimer = useCallback(() => {
    clearInterval(refreshTimerRef.current);

    refreshTimerRef.current = setInterval(async () => {
      const idle = Date.now() - lastActivityRef.current;

      if (idle >= INACTIVITY_LIMIT_MS) {
        // User has been idle for 6+ hours — let token expire naturally.
        clearInterval(refreshTimerRef.current);
        return;
      }

      // Only one tab should refresh; broadcast the result to others.
      try {
        const data = await refreshApi();
        if (data?.user) {
          setUser(data.user);
          channelRef.current?.postMessage({ type: "refresh", user: data.user });
        }
      } catch {
        logoutRef.current?.({ broadcast: true });
      }
    }, REFRESH_INTERVAL_MS);
  }, []);

  // ── Cross-tab sync via BroadcastChannel ──────────────────────────────────

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channelRef.current = channel;

    channel.onmessage = ({ data }) => {
      if (data?.type === "logout") {
        clearInterval(refreshTimerRef.current);
        setUser(null);
      }
      if (data?.type === "refresh" && data.user) {
        // Another tab refreshed — adopt the updated user without re-fetching.
        setUser(data.user);
      }
    };

    return () => channel.close();
  }, []);

  // ── Listen for forced logout from fetch interceptors ─────────────────────

  useEffect(() => {
    function handleForceLogout() {
      logoutRef.current?.({ broadcast: true });
    }
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  // ── Session restore on mount ──────────────────────────────────────────────

  useEffect(() => {
    getMeApi()
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          startRefreshTimer();
        }
      })
      .catch(() => {
        /* no session — remain logged out */
      })
      .finally(() => setLoading(false));

    return () => clearInterval(refreshTimerRef.current);
  }, [startRefreshTimer]);

  // ── login ─────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (username, password) => {
      const data = await loginApi(username, password);
      setUser(data.user);
      startRefreshTimer();
      return data.user;
    },
    [startRefreshTimer],
  );

  // ── Permission helpers ────────────────────────────────────────────────────

  const isAdmin = user?.role === "admin";
  const activePermissions = user?.effectivePermissions || user?.permissions;

  const canCalculate = useCallback(
    (calcKey) => {
      if (!user) return false;
      if (isAdmin) return true;
      const key = CALC_PERMISSION_KEYS[calcKey];
      return Boolean(key && activePermissions?.[key]?.calculate);
    },
    [user, isAdmin, activePermissions],
  );

  const canSaveQuote = useCallback(
    (calcKey) => {
      if (!user) return false;
      if (isAdmin) return true;
      const key = CALC_PERMISSION_KEYS[calcKey];
      return Boolean(key && activePermissions?.[key]?.saveQuote);
    },
    [user, isAdmin, activePermissions],
  );

  const canViewQuotes = useCallback(
    (calcKey) => {
      if (!user) return false;
      if (isAdmin) return true;
      const key = CALC_PERMISSION_KEYS[calcKey];
      return Boolean(key && activePermissions?.[key]?.viewQuotes);
    },
    [user, isAdmin, activePermissions],
  );

  const canEditPrices = useCallback(
    (calcKey) => {
      if (!user) return false;
      if (isAdmin) return true;
      const key = CALC_PERMISSION_KEYS[calcKey];
      return Boolean(key && activePermissions?.[key]?.editPrices);
    },
    [user, isAdmin, activePermissions],
  );

  const canManageUsers = useCallback(() => {
    if (!user) return false;
    return isAdmin || Boolean(activePermissions?.manageUsers);
  }, [user, isAdmin, activePermissions]);

  // ── refreshUser ───────────────────────────────────────────────────────────
  // Re-fetches the current user from the server and updates state.
  // Use this after operations that mutate the user (e.g. change password).

  const refreshUser = useCallback(async () => {
    try {
      const data = await getMeApi();
      if (data?.user) setUser(data.user);
    } catch {
      // If the fetch fails (e.g. session expired) the existing user state is kept;
      // the 401 interceptor will handle session expiry separately.
    }
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin,
    login,
    logout,
    refreshUser,
    canCalculate,
    canSaveQuote,
    canViewQuotes,
    canEditPrices,
    canManageUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
