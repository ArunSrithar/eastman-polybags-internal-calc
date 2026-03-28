import Badge from "../../ui/Badge";

/**
 * SubNavItem — a single sub-navigation item inside an expandable menu.
 *
 * Props:
 *   id         string     view identifier
 *   label      string     display text
 *   icon       Component  icon component
 *   isActive   boolean    currently selected
 *   badgeCount number     optional badge count
 *   onNavigate fn(id)     navigation callback
 */
export default function SubNavItem({
  id,
  label,
  icon: Icon,
  isActive,
  badgeCount,
  onNavigate,
}) {
  return (
    <li>
      <button
        onClick={() => onNavigate(id)}
        className={`sub-nav-button ${
          isActive ? "text-tint font-medium" : "text-label-2 hover:text-label"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        <Badge count={badgeCount} />
      </button>
    </li>
  );
}
