/**
 * CheckBox — circular tinted checkmark indicator (read-only display)
 *
 * Props:
 *   checked  boolean
 */
export default function CheckBox({ checked }) {
  return (
    <span
      className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
        checked ? "bg-tint border-tint" : "border-separator bg-transparent"
      }`}
    >
      {checked && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path
            d="M1 4l3.5 3.5L11 1"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
