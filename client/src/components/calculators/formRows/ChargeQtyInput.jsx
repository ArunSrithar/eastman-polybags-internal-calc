/**
 * ChargeQtyInput — the small "kg" weight input shared by charge rows that let
 * the user enter their own qty (Printing sub-rows, Lamination, Slitting, Pouch
 * Making) instead of deriving it from the material total.
 */
export default function ChargeQtyInput({ qty, onQtyChange, disabled = false }) {
  return (
    <div
      className={`flex items-center input-base p-0 overflow-hidden shrink-0 ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <input
        type="number"
        min="0"
        value={qty}
        onChange={(e) => onQtyChange(e.target.value)}
        placeholder="0.00"
        disabled={disabled}
        className="w-full min-w-0 bg-transparent px-2 py-2 text-sm outline-none input-no-spinner"
      />
      <span className="px-2 text-label-3 text-xs shrink-0">kg</span>
    </div>
  );
}
