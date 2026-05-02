import { useState, useEffect, useCallback, useRef } from "react";
import {
  VIEW_TO_PATH,
  PATH_TO_VIEW,
  VIEW_PERMISSIONS,
} from "../constants/navigation";
import { useAuth } from "../context/AuthContext";

function getViewFromPath() {
  const path = window.location.pathname;
  const normalized = path.endsWith("/") ? path : path + "/";
  return PATH_TO_VIEW[normalized] || "dashboard";
}

/**
 * canAccessView — pure permission check, exported for testing and shared use.
 */
export function canAccessView(viewId, auth) {
  if (!auth || auth.isAdmin) return true;
  const perm = VIEW_PERMISSIONS[viewId];
  if (!perm) return true;
  switch (perm.type) {
    case "manageUsers":
      return auth.canManageUsers();
    case "calculate":
      return auth.canCalculate(perm.calcKey);
    case "viewQuotes":
      return auth.canViewQuotes(perm.calcKey);
    case "editPrices":
      return auth.canEditPrices(perm.calcKey);
    default:
      return true;
  }
}

export function useRouting() {
  const auth = useAuth();
  // Keep a stable ref so event handlers don't capture stale auth
  const authRef = useRef(auth);
  useEffect(() => {
    authRef.current = auth;
  });

  const [activeView, setActiveView] = useState(getViewFromPath);

  // Stable navigate — uses ref so no recreation on every auth change
  const navigateTo = useCallback((viewId) => {
    const path = VIEW_TO_PATH[viewId] || "/";
    window.history.pushState({ view: viewId }, "", path);
    setActiveView(viewId);
  }, []);

  const navigate = useCallback(
    (viewId) => {
      const target = canAccessView(viewId, authRef.current)
        ? viewId
        : "dashboard";
      navigateTo(target);
    },
    [navigateTo],
  );

  // Guard popstate (browser back/forward)
  useEffect(() => {
    function handlePopState() {
      const view = getViewFromPath();
      const target = canAccessView(view, authRef.current) ? view : "dashboard";
      if (target !== view) {
        window.history.replaceState(
          { view: target },
          "",
          VIEW_TO_PATH[target] || "/",
        );
      }
      setActiveView(target);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return [activeView, navigate];
}
