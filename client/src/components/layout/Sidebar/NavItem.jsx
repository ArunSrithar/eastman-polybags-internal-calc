import { ChevronDownIcon } from "../../ui/Icons";
import SubNavItem from "./SubNavItem";

/**
 * NavItem — a top-level sidebar navigation item with optional expandable sub-items.
 *
 * Props:
 *   item        object    nav item config from NAV_ITEMS
 *   isActive    boolean   this item or one of its children is the active view
 *   isExpanded  boolean   sub-items are visible
 *   activeView  string    current active view id
 *   quoteCounts object    { [badgeKey]: count }
 *   onTopClick  fn(item)  handle top-level click
 *   onNavigate  fn(id)    navigate to a sub-item view
 */
export default function NavItem({
  item,
  isActive,
  isExpanded,
  activeView,
  quoteCounts,
  onTopClick,
  onNavigate,
}) {
  const Icon = item.icon;
  const hasSubItems = !!item.subItems;

  return (
    <li>
      <button
        onClick={() => onTopClick(item)}
        className={`nav-button ${
          isActive
            ? "bg-tint text-white"
            : "text-label-2 hover:bg-fill-3 hover:text-label"
        }`}
        aria-expanded={hasSubItems ? isExpanded : undefined}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="size-5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {hasSubItems ? (
          <ChevronDownIcon
            className={`size-4 transition-transform duration-200 ${isActive ? "text-white" : "text-tint"} ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        ) : null}
      </button>

      {hasSubItems ? (
        <div
          className={`overflow-hidden transition-all duration-200 ${
            isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="mt-0.5 ml-5 space-y-0.5 border-l border-separator dark:border-separator pl-3">
            {item.subItems.map((sub) => (
              <SubNavItem
                key={sub.id}
                id={sub.id}
                label={sub.label}
                icon={sub.icon}
                isActive={activeView === sub.id}
                badgeCount={sub.badgeKey ? quoteCounts[sub.badgeKey] : 0}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
