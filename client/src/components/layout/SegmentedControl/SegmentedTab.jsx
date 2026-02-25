const ACTIVE_CLASS = "bg-tint text-white shadow-sm";
const INACTIVE_CLASS = "text-label-2 hover:text-label transition-colors";

export default function SegmentedTab({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-2.5 px-5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
        isActive ? ACTIVE_CLASS : INACTIVE_CLASS
      }`}
    >
      {label}
    </button>
  );
}
