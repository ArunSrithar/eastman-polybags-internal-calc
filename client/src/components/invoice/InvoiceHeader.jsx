import { formatDate } from "../../utils/format";
import MetaRow from "../ui/MetaRow";

/**
 * InvoiceHeader — branding + customer/date metadata block.
 *
 * @param {ReactNode} icon       — calculator icon element
 * @param {string}    title      — company or calculator name
 * @param {string}    subtitle   — estimate type (e.g. "Gravure Rate Estimate")
 * @param {string}    status     — badge label ("Draft" | "Saved")
 * @param {string}    customer   — customer / quote name
 * @param {string}    [date]     — ISO date string (defaults to now)
 * @param {Object[]}  [meta]     — extra metadata rows [{label, value}]
 */
export default function InvoiceHeader({
  icon,
  title,
  subtitle,
  status = "Draft",
  customer,
  date,
  meta = [],
}) {
  const dateStr = date || new Date().toISOString();
  const allMeta = [
    { label: "Customer", value: customer || "—" },
    ...meta,
    { label: "Date", value: formatDate(dateStr) },
  ];

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-tint/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-semibold text-label leading-none">
              {title}
            </h2>
            <span className="text-xs text-label-2 leading-none mt-2 block">
              {subtitle}
            </span>
          </div>
        </div>
        <span className="invoice-badge">{status}</span>
      </div>
      <div
        className="grid gap-x-4 gap-y-2.5"
        style={{ gridTemplateColumns: `repeat(${allMeta.length}, 1fr)` }}
      >
        {allMeta.map((m) => (
          <MetaRow key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
    </div>
  );
}
