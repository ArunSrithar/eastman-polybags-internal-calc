import { useState, useEffect, useCallback } from "react";
import { VIEW_TO_PATH, PATH_TO_VIEW } from "../constants/navigation";

function getViewFromPath() {
  const path = window.location.pathname;
  const normalized = path.endsWith("/") ? path : path + "/";
  return PATH_TO_VIEW[normalized] || "dashboard";
}

export function useRouting() {
  const [activeView, setActiveView] = useState(getViewFromPath);

  const navigate = useCallback((viewId) => {
    const path = VIEW_TO_PATH[viewId] || "/";
    window.history.pushState({ view: viewId }, "", path);
    setActiveView(viewId);
  }, []);

  useEffect(() => {
    function handlePopState() {
      setActiveView(getViewFromPath());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return [activeView, navigate];
}
