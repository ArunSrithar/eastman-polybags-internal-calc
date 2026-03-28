/**
 * SectionLabel — colored dot + uppercase section name.
 *
 * @param {string} color — CSS color for the dot
 * @param {string} label — section name
 */
export default function SectionLabel({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 px-6 pt-3 pb-1">
      <span
        className="inline-block size-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="invoice-meta-label">{label}</span>
    </div>
  );
}
