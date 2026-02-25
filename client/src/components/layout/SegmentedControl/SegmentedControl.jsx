import SegmentedTab from "./SegmentedTab";

/**
 * iOS island-style segmented control — sizes to content, not full width.
 *
 * @param {{ id: string, label: string }[]} tabs
 * @param {number} activeIndex
 * @param {(index: number) => void} onChange
 */
export default function SegmentedControl({ tabs, activeIndex, onChange }) {
  return (
    <div className="inline-flex items-center bg-fill rounded-full p-1 gap-0.5 shadow-sm">
      {tabs.map((tab, i) => (
        <SegmentedTab
          key={tab.id}
          label={tab.label}
          isActive={activeIndex === i}
          onClick={() => onChange(i)}
        />
      ))}
    </div>
  );
}
