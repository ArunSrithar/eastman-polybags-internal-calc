import { useTheme } from "../../../context/ThemeContext";
import { SunIcon, MoonIcon, UserIcon, LogoutIcon } from "../../ui/Icons";
import IOSToggle from "../../ui/IOSToggle";
import GlassSeparator from "../../ui/GlassSeparator";

export default function SidebarFooter() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="px-3 pb-5">
      <GlassSeparator className="mb-4" />

      {/* Theme toggle row */}
      <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-label-2">
        {isDark ? (
          <MoonIcon className="size-5 shrink-0" />
        ) : (
          <SunIcon className="size-5 shrink-0" />
        )}
        <span className="flex-1 text-left">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
        <IOSToggle on={isDark} onToggle={toggleTheme} />
      </div>

      {/* Account row */}
      <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-label mt-0.5 bg-fill-4 dark:bg-fill-4">
        <span className="shrink-0 size-8 flex items-center justify-center rounded-full bg-tint/12 text-tint">
          <UserIcon className="size-4" />
        </span>
        <span className="flex-1 text-left truncate font-semibold">Admin</span>
        <button
          type="button"
          className="btn-icon bg-red-500/12 text-red-500 hover:bg-red-500/24"
          aria-label="Logout"
        >
          <LogoutIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
