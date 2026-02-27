/**
 * IOSToggle — reusable iOS-style toggle switch
 *
 * Props:
 *   on        boolean   current state
 *   onToggle  fn()      called on click
 */
export default function IOSToggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="shrink-0 cursor-pointer"
    >
      <span
        className={`relative inline-flex h-6 w-10 rounded-full transition-colors duration-200 ${
          on ? "bg-tint" : "bg-fill-2"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            on ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
