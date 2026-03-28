/**
 * SectionLabel — uppercase tracking label for sidebar sections.
 *
 * Props:
 *   children  string  label text (e.g. "Settings")
 *   className string  additional classes
 */
export default function SectionLabel({ children, className = "" }) {
  return (
    <p
      className={`px-3 pt-2 pb-3 text-[11px] font-semibold uppercase tracking-wider text-placeholder ${className}`}
    >
      {children}
    </p>
  );
}
