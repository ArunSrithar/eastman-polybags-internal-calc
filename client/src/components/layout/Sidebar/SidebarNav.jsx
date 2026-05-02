import { useState } from "react";
import { useQuoteCounts } from "../../../hooks/useQuoteCounts";
import { NAV_ITEMS } from "../../../constants/navigation";
import { useAuth } from "../../../context/AuthContext";
import { canAccessView } from "../../../hooks/useRouting";
import NavItem from "./NavItem";

// ── Permission helper ──────────────────────────────────────────────────────
// canAccessView (from useRouting) is the single source of truth for permission checks.
// We alias it here for clarity since we're filtering by item ID, not by view navigation.

export default function SidebarNav({ activeView, onNavigate }) {
  const quoteCounts = useQuoteCounts();
  const auth = useAuth();

  // Filter nav items: hide items the user has no permission to access.
  // For sections with sub-items, hide the section entirely if all sub-items are hidden.
  const visibleItems = NAV_ITEMS.map((item) => {
    if (item.subItems) {
      const visibleSubs = item.subItems.filter((sub) =>
        canAccessView(sub.id, auth),
      );
      if (visibleSubs.length === 0) return null;
      return visibleSubs.length === item.subItems.length
        ? item
        : { ...item, subItems: visibleSubs };
    }
    return canAccessView(item.id, auth) ? item : null;
  }).filter(Boolean);

  // Track which top-level items are expanded — all expanded by default
  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    for (const item of NAV_ITEMS) {
      if (item.subItems) initial[item.id] = true;
    }
    return initial;
  });

  function handleTopClick(item) {
    if (item.subItems) {
      const wasExpanded = expanded[item.id];
      setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
      if (!wasExpanded) {
        onNavigate(item.id);
      }
    } else {
      onNavigate(item.id);
    }
  }

  function isTopActive(item) {
    if (activeView === item.id) return true;
    if (item.subItems)
      return item.subItems.some((sub) => sub.id === activeView);
    return false;
  }

  return (
    <nav
      className="flex-1 overflow-y-auto px-3 py-2"
      aria-label="Main navigation"
    >
      <ul className="space-y-0.5">
        {visibleItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={isTopActive(item)}
            isExpanded={!!expanded[item.id]}
            activeView={activeView}
            quoteCounts={quoteCounts}
            onTopClick={handleTopClick}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  );
}
