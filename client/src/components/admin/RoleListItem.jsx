export default function RoleListItem({ role, isActive, onClick }) {
  const count = role.userCount || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`quote-list-item ${isActive ? "quote-list-item-active" : "hover:bg-fill"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-sm font-medium truncate ${isActive ? "text-tint" : "text-label"}`}
        >
          {role.name}
        </span>
        {count > 0 ? (
          <span className="text-xs font-semibold text-label-2 tabular-nums whitespace-nowrap">
            {count} {count === 1 ? "user" : "users"}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[11px] text-label-3 truncate">
          {role.description || "No description"}
        </span>
      </div>
    </button>
  );
}
