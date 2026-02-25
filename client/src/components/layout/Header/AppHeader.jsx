import AppLogo from "./AppLogo";
import UserMenu from "./UserMenu/UserMenu";
import SegmentedControl from "../SegmentedControl/SegmentedControl";

export default function AppHeader({ tabs, activeIndex, onChange }) {
  return (
    <div className="fixed top-0 inset-x-0 z-50 px-4 pt-3">
      <header className="h-[76px] flex items-center px-7 rounded-2xl bg-white/40 dark:bg-white/8 backdrop-blur-2xl backdrop-saturate-200 border border-white/50 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30">
        {/* Left — logo */}
        <div className="flex-1">
          <AppLogo />
        </div>

        {/* Center — island segmented control */}
        <div className="flex-none">
          <SegmentedControl
            tabs={tabs}
            activeIndex={activeIndex}
            onChange={onChange}
          />
        </div>

        {/* Right — user menu */}
        <div className="flex-1 flex justify-end">
          <UserMenu />
        </div>
      </header>
    </div>
  );
}
