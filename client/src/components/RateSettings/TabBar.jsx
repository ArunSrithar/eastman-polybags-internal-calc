export default function TabBar({ tabs, activeTab, onSelect }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-separator">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab)}
          className={`shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer relative ${
            activeTab.id === tab.id
              ? "text-tint after:absolute after:bottom-0 after:inset-x-1 after:h-[3px] after:rounded-full after:bg-tint"
              : "text-label-2 hover:text-label"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
