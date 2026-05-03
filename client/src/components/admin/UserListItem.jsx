export default function UserListItem({ user, isActive, onClick }) {
  const primaryName = user.displayName || user.fullName || user.username;
  const showUsername = primaryName !== user.username;
  const enabled = user.isActive ?? true;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`quote-list-item ${isActive ? "quote-list-item-active" : "hover:bg-fill"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-sm font-medium truncate ${isActive ? "text-tint" : enabled ? "text-label" : "text-label-3"}`}
        >
          {primaryName}
        </span>
        <span
          className={`text-[11px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-full border ${
            enabled
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          }`}
        >
          {enabled ? "Active" : "Deactivated"}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-0.5">
        {showUsername ? (
          <span className="text-[11px] text-label-3 truncate">@{user.username}</span>
        ) : null}
        {showUsername && user.email ? (
          <span className="text-[11px] text-label-3">·</span>
        ) : null}
        {user.email ? (
          <span className="text-[11px] text-label-3 truncate">{user.email}</span>
        ) : (
          <span className="text-[11px] text-label-4 truncate">No email</span>
        )}
        {!showUsername ? (
          <>
            <span className="text-[11px] text-label-3">·</span>
            <span className="text-[11px] text-label-3 truncate">@{user.username}</span>
          </>
        ) : null}
      </div>

      {!enabled ? (
        <span className="sr-only">
          User is disabled
        </span>
      ) : null}
    </button>
  );
}
