import { useTheme } from "../../../context/ThemeContext";
import { SunIcon, MoonIcon, UserIcon, LogoutIcon } from "../../ui/Icons";
import IOSToggle from "../../ui/IOSToggle";
import GlassSeparator from "../../ui/GlassSeparator";
import SectionLabel from "../../ui/SectionLabel";

export default function SidebarFooter() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="px-3 pb-5">
      <GlassSeparator className="mx-3 mb-3" />

      <SectionLabel>Settings</SectionLabel>

      {/* Theme toggle row */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-label-2">
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
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-label-2 mt-0.5 bg-black/5 dark:bg-white/5">
        <span className="shrink-0 size-7 flex items-center justify-center rounded-full bg-tint/10 text-tint">
          <UserIcon className="size-3.5" />
        </span>
        <span className="flex-1 text-left truncate">Admin</span>
        <button
          type="button"
          className="shrink-0 size-7 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
          aria-label="Logout"
        >
          <LogoutIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
