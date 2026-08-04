import { fmt } from "../../../utils/format";

function formatDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-separator last:border-0">
      <span className="text-xs text-label-3 shrink-0">{label}</span>
      <span className="text-sm text-label font-medium text-right">{value}</span>
    </div>
  );
}

export default function FlexoJobCostFormDetails({ form }) {
  if (!form) return null;

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div className="glass-card p-4">
        <div className="text-xs font-semibold text-label-3 uppercase tracking-wider mb-3">
          Job Details
        </div>
        <div className="flex flex-col">
          <Row label="Invoice No." value={form.invNo} />
          <Row label="Job Card Date" value={formatDate(form.jobCardDate)} />
          <Row label="Dispatch Date" value={formatDate(form.dispatchDate)} />
          <Row label="Billing Date" value={formatDate(form.billingDate)} />
          <Row label="Billing Rate" value={form.billingRate ? `₹ ${fmt(form.billingRate)}` : null} />
          <Row label="No. of Bundles" value={form.noOfBundles} />
          <Row label="Finished Weight" value={form.finishedWeight ? `${fmt(form.finishedWeight)} kg` : null} />
          <Row label="Dispatch Weight" value={form.dispatchWeight ? `${fmt(form.dispatchWeight)} kg` : null} />
        </div>
      </div>
    </div>
  );
}
