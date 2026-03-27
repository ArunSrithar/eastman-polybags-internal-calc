/**
 * Badge — small rounded pill with a count value.
 *
 * Props:
 *   count     number  value to display
 *   className string  additional classes
 */
export default function Badge({ count, className = "" }) {
  if (!count || count <= 0) return null;

  return (
    <span
      className={`min-w-5 h-5 flex items-center justify-center rounded-full bg-fill-2 text-[11px] font-semibold text-label-2 px-1.5 ${className}`}
    >
      {count}
    </span>
  );
}
