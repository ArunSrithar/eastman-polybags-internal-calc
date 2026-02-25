import ThemeToggleRow from "./ThemeToggleRow";

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* Placeholder — will be replaced once auth is implemented */
const MOCK_USER = { name: "Admin", role: "Manager" };

export default function UserMenuDropdown({ onClose }) {
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-2xl bg-background-2 dark:bg-background-2 border border-separator shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* User info */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-label">{MOCK_USER.name}</p>
        <p className="text-xs text-label-2 mt-0.5">{MOCK_USER.role}</p>
      </div>

      {/* Theme toggle */}
      <ThemeToggleRow />

      {/* Logout */}
      <button
        onClick={onClose}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-fill-3 transition-colors cursor-pointer"
      >
        <LogoutIcon />
        Logout
      </button>
    </div>
  );
}
