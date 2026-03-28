/**
 * TableHeader — column header row for invoice tables.
 * Renders: Item | Rate | Qty | Amount
 */
export default function TableHeader() {
  return (
    <div className="invoice-grid px-6 py-2 bg-fill-3 invoice-meta-label">
      <span>Item</span>
      <span className="invoice-col-rate text-right">Rate</span>
      <span className="invoice-col-qty text-right">Qty</span>
      <span className="invoice-col-amount text-right">Amount</span>
    </div>
  );
}
