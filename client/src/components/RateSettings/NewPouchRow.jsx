import { useState, useRef, useEffect } from "react";
import { CheckIcon, XMarkIcon } from "../ui/Icons";
import IOSToggle from "../ui/IOSToggle";

export default function NewPouchRow({ onConfirm, onCancel }) {
  const [length, setLength] = useState("");
  const [breadth, setBreadth] = useState("");
  const [rate, setRate] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleConfirm() {
    const rateNum = parseFloat(rate);
    if (!length.trim() || !breadth.trim() || isNaN(rateNum) || rateNum < 0)
      return;
    onConfirm(length.trim(), breadth.trim(), rateNum);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  }

  return (
    <tr className="bg-tint/5">
      <td className="table-cell-compact text-label-3">—</td>
      <td className="table-cell-compact">
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="L"
            className="input-base py-1.5 text-sm w-12 text-right"
          />
          <span className="text-label-3">×</span>
          <input
            type="text"
            value={breadth}
            onChange={(e) => setBreadth(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="B"
            className="input-base py-1.5 text-sm w-12 text-left"
          />
        </div>
      </td>
      <td className="table-cell-compact">
        <input
          type="number"
          min="0"
          step="any"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="₹ rate"
          className="input-base input-no-spinner py-1.5 text-sm w-24"
        />
      </td>
      <td className="table-cell-compact text-label-2">Admin</td>
      <td className="table-cell-compact text-label-3 italic">Now</td>
      <td className="table-cell-compact text-label-3">—</td>
      <td className="table-cell-compact text-label-3">—</td>
      <td className="table-cell-compact">
        <IOSToggle on={true} onToggle={() => {}} />
      </td>
      <td className="table-cell-compact">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleConfirm}
            className="table-action-btn text-tint hover:bg-tint/10"
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="table-action-btn text-label-3 hover:bg-fill-3"
          >
            <XMarkIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}
