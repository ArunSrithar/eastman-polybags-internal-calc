import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * CreatableCombobox
 * - Shows a dropdown of stored options (from localStorage)
 * - User can type a new value; pressing Enter or clicking away saves it to the list
 *
 * Props:
 *   storageKey      string     localStorage key to persist option list
 *   defaultOptions  string[]   fallback options shown when nothing is stored yet
 *   value           string     controlled value
 *   onChange        fn(val)    called on select / new entry
 *   placeholder     string
 *   className       string     extra classes on the wrapper
 */
export default function CreatableCombobox({
  storageKey,
  defaultOptions = [],
  value = "",
  onChange,
  placeholder = "Select or type…",
  className = "",
}) {
  const [options, setOptions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      return stored && stored.length > 0 ? stored : defaultOptions;
    } catch {
      return defaultOptions;
    }
  });

  const [inputVal, setInputVal] = useState(value);
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef(null);
  const dropRef = useRef(null);

  function openWithPos() {
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      const maxDropH = 224; // max-h-56
      const spaceBelow = window.innerHeight - r.bottom - 8;
      const spaceAbove = r.top - 8;
      // Open upward if not enough room below but enough above
      const top =
        spaceBelow >= Math.min(maxDropH, 120) || spaceBelow >= spaceAbove
          ? r.bottom + 4
          : r.top - maxDropH - 4;
      setDropPos({ top, left: r.left, width: r.width });
    }
    setOpen(true);
  }

  // Sync inputVal when parent changes controlled value
  useEffect(() => {
    setInputVal(value);
  }, [value]);

  // Close on outside click (wrapper OR portal dropdown)
  useEffect(() => {
    function handler(e) {
      const inWrap = wrapRef.current && wrapRef.current.contains(e.target);
      const inDrop = dropRef.current && dropRef.current.contains(e.target);
      if (!inWrap && !inDrop) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function saveOption(val) {
    const trimmed = val.trim();
    if (!trimmed) return;
    let updated = options;
    if (!options.includes(trimmed)) {
      updated = [...options, trimmed];
      setOptions(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
    onChange?.(trimmed);
    setInputVal(trimmed);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveOption(inputVal);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const filtered = options
    .filter((o) => o.toLowerCase().includes(inputVal.toLowerCase()))
    .sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.localeCompare(b);
    });

  const showCreate = inputVal.trim() && !options.includes(inputVal.trim());

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Input */}
      <input
        type="text"
        value={inputVal}
        placeholder={placeholder}
        className="input-base pr-8"
        onFocus={openWithPos}
        onChange={(e) => {
          setInputVal(e.target.value);
          openWithPos();
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // slight delay so click on option fires first
          setTimeout(() => setOpen(false), 150);
        }}
      />

      {/* Chevron icon */}
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-label-3">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Dropdown — portalled to body so it escapes overflow:hidden cards */}
      {open &&
        (filtered.length > 0 || showCreate) &&
        createPortal(
          <ul
            ref={dropRef}
            style={{
              position: "fixed",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
            }}
            className="z-9999 rounded-xl bg-grouped-background-2 border border-separator shadow-lg overflow-y-auto max-h-56"
          >
            {filtered.map((opt) => (
              <li
                key={opt}
                className={`px-3 py-2.5 text-sm cursor-pointer select-none transition-colors
                ${
                  opt === value
                    ? "bg-tint/10 text-tint font-medium"
                    : "text-label hover:bg-fill-3"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveOption(opt);
                }}
              >
                {opt}
              </li>
            ))}
            {showCreate && (
              <li
                className="px-3 py-2.5 text-sm cursor-pointer text-tint font-medium hover:bg-fill-3 border-t border-separator"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveOption(inputVal);
                }}
              >
                + Add &quot;{inputVal.trim()}&quot;
              </li>
            )}
          </ul>,
          document.body,
        )}
    </div>
  );
}
