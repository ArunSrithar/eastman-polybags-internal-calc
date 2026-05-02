import { UserIcon } from "../ui/Icons";

/**
 * UserListItem — presentational row for the user list.
 *
 * Props:
 *   user      object    { id, username, email, role }
 *   isActive  boolean   selected state
 *   onClick   fn()
 */
export default function UserListItem({ user, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={isActive ? "quote-list-item-active" : "quote-list-item"}
    >
      <span className="shrink-0 size-8 flex items-center justify-center rounded-full bg-tint/10 text-tint">
        <UserIcon className="size-4" />
      </span>

      <span className="flex-1 min-w-0 text-left">
        <span className="block text-sm font-medium text-label truncate">
          {user.username}
        </span>
        {user.email ? (
          <span className="block text-xs text-label-3 truncate mt-0.5">
            {user.email}
          </span>
        ) : null}
      </span>

      <span
        className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
          user.role === "admin"
            ? "bg-tint/12 text-tint"
            : "bg-fill-2 text-label-3"
        }`}
      >
        {user.role}
      </span>
    </button>
  );
}
