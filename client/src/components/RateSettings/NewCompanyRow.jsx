import { useState, useRef, useEffect } from "react";

export default function NewCompanyRow({ onConfirm, onCancel }) {
    const [name, setName] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = () => {
        if (name.trim().length > 0) {
            onConfirm(name.trim());
            setName("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSubmit();
        } else if (e.key === "Escape") {
            onCancel();
        }
    };

    return (
        <tr className="bg-tint/5">
            <td colSpan={9} className="px-3 py-2">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Company name (e.g., ABC Printing)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="input-base flex-1"
                    />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={name.trim().length === 0}
                        className="btn-primary text-sm"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </td>
        </tr>
    );
}
