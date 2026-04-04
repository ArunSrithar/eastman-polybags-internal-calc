import { useState, useRef, useEffect } from "react";
import { CheckIcon, XMarkIcon } from "../ui/Icons";

/**
 * NewValueRow — inline editable row for adding a new material price or charge rate.
 */
export default function NewValueRow({ placeholder, onConfirm, onCancel }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleConfirm() {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    onConfirm(num);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  }

  return (
    <tr className="bg-tint/5">
      <td className="table-cell-compact text-label-3">—</td>
      <td className="table-cell-compact text-label-2">Admin</td>
      <td className="table-cell-compact">
        <input
          ref={inputRef}
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-base input-no-spinner py-1.5 text-sm w-32"
        />
      </td>
      <td className="table-cell-compact text-label-3 italic">Now</td>
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
