import { fmt } from "../../../utils/format";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(val) {
  if (!val) return "—";
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

function ChargeDetailRow({ label, detail }) {
  if (!detail) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-separator last:border-0">
      <span className="text-xs text-label-3 shrink-0">{label}</span>
      <span className="text-sm text-label font-medium text-right">{detail}</span>
    </div>
  );
}

/* ─── Charge detail builders ─────────────────────────────────────────────── */

function buildPrintingDetail(p) {
  if (!p) return null;
  const parts = [];
  if (p.normalColors && p.normalColorCompany)
    parts.push(`${p.normalColors} Normal Colors — ${p.normalColorCompany}`);
  else if (p.normalColorCompany)
    parts.push(`Normal Colors — ${p.normalColorCompany}`);
  if (p.metallicEnabled && p.metallicColorCompany)
    parts.push(`Metallic — ${p.metallicColorCompany}`);
  if (p.mattFinishCompany)
    parts.push(`Matt Finish — ${p.mattFinishCompany}`);
  return parts.join("  •  ") || null;
}

function buildLaminationDetail(l) {
  if (!l) return null;
  return [l.laminationType, l.laminationCompany].filter(Boolean).join(" — ") || null;
}

/* ─── JobCostFormDetails ─────────────────────────────────────────────────── */

export default function JobCostFormDetails({ form }) {
  if (!form) return null;

  const pc = form.items?.printingCharges;
  const lc = form.items?.laminationCharges;
  const sc = form.items?.slittingCharges;
  const pm = form.items?.pouchMakingCharges;

  const printingDetail = pc?.enabled ? buildPrintingDetail(pc) : null;
  const laminationDetail = lc?.enabled ? buildLaminationDetail(lc) : null;
  const slittingDetail = sc?.enabled ? sc.slittingCompany || null : null;
  const pouchDetail = pm?.enabled
    ? [pm.pouchCompany, pm.pouchSize ? `Size: ${pm.pouchSize}` : ""].filter(Boolean).join(" — ") || null
    : null;

  const hasChargeDetails = printingDetail || laminationDetail || slittingDetail || pouchDetail;

  return (
    <div className="flex flex-col gap-3 mt-3">
      {/* ── Job Details ── */}
      <div className="glass-card p-4">
        <div className="text-xs font-semibold text-label-3 uppercase tracking-wider mb-3">
          Job Details
        </div>
        <div className="flex flex-col">
          <Row label="Customer" value={form.quoteName} />
          <Row label="Job Work Place" value={form.jobWorkCompany} />
          <Row label="Invoice No." value={form.billingNo} />
          <Row label="Job Card No." value={form.jobCardNo} />
          <Row label="Job Card Date" value={formatDate(form.jobCardDate)} />
          <Row label="Dispatch Date" value={formatDate(form.dispatchDate)} />
          <Row label="Billing Date" value={formatDate(form.billingDate)} />
          <Row label="Billing Rate" value={form.billingRate ? `₹ ${fmt(form.billingRate)}` : null} />
          <Row label="No. of Bundles" value={form.noOfBundles} />
          <Row label="Film" value={form.film} />
          <Row label="Micron" value={form.micron ? `${form.micron} μ` : null} />
          <Row label="No. of Colours" value={form.noOfColours} />
          <Row
            label="Finished Weight"
            value={form.finishedWeight ? `${fmt(form.finishedWeight)} kg` : null}
          />
          <Row
            label="Dispatch Weight"
            value={form.dispatchWeight ? `${fmt(form.dispatchWeight)} kg` : null}
          />
          <Row label="Wastage" value={form.wastage ? `${form.wastage}%` : null} />
        </div>
      </div>

      {/* ── Charge Details ── */}
      {hasChargeDetails && (
        <div className="glass-card p-4">
          <div className="text-xs font-semibold text-label-3 uppercase tracking-wider mb-3">
            Charge Details
          </div>
          <div className="flex flex-col">
            <ChargeDetailRow label="Printing" detail={printingDetail} />
            <ChargeDetailRow label="Lamination" detail={laminationDetail} />
            <ChargeDetailRow label="Slitting" detail={slittingDetail} />
            <ChargeDetailRow label="Pouch Making" detail={pouchDetail} />
          </div>
        </div>
      )}
    </div>
  );
}
