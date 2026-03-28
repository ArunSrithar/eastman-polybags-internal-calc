/**
 * MetaRow — labeled metadata field (uppercase label + value).
 * Used in invoice headers, quote details, and info panels.
 */
export default function MetaRow({ label, value }) {
  return (
    <div>
      <span className="invoice-meta-label">{label}</span>
      <p className="text-sm text-label mt-0.5">{value}</p>
    </div>
  );
}
