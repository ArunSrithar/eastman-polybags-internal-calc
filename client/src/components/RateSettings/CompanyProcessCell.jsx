import { useState, useRef, useEffect } from "react";
import IOSToggle from "../ui/IOSToggle";

export default function CompanyProcessCell({
    process,
    onUpdate,
    canEdit,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [price, setPrice] = useState(process.price);
    const inputRef = useRef(null);

    const handleSave = () => {
        const numPrice = Number(price);
        if (!Number.isNaN(numPrice) && numPrice >= 0) {
            onUpdate(numPrice, process.isAvailable);
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setPrice(process.price);
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    return (
        <td className="px-3 py-2">
            <div className="flex items-center gap-2">
                {isEditing && canEdit ? (
                    <input
                        ref={inputRef}
                        type="number"
                        min="0"
                        step="0.1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="input-base w-20 text-sm"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            if (!canEdit) return;
                            setPrice(process.price);
                            setIsEditing(true);
                        }}
                        disabled={!canEdit}
                        className={`text-sm font-medium px-2 py-1 rounded ${canEdit
                                ? "text-tint hover:bg-tint/10 cursor-pointer"
                                : "text-label-3 cursor-default"
                            } transition-colors`}
                    >
                        ₹{process.price}
                    </button>
                )}

                <IOSToggle
                    on={process.isAvailable}
                    onToggle={() => onUpdate(process.price, !process.isAvailable)}
                    disabled={!canEdit}
                />
            </div>
        </td>
    );
}
