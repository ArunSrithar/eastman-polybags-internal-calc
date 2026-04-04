import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "./Icons";

/**
 * CreatableSelect — dropdown that allows typing new values.
 * New values are persisted to localStorage and added to the dropdown list.
 *
 * Props:
 *   storageKey      string     localStorage key to persist option list
 *   defaultOptions  string[]   seed options when nothing is stored
 *   value           string     controlled value
 *   onChange        fn(val)    called on select or new entry
 *   placeholder     string
 *   className       string     extra classes on the outer wrapper
 */
export default function CreatableSelect({
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

  // Re-sync when defaultOptions change (e.g. pouch enabled/disabled in settings)
  const defaultKey = defaultOptions.join(",");
  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultKey]);

  const [inputVal, setInputVal] = useState(value);
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    openAbove: false,
  });
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  function computePosition() {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const maxH = 200;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const openAbove = spaceBelow < Math.min(maxH, 100);
    setDropPos({
      top: openAbove ? undefined : r.bottom + 4,
      bottom: openAbove ? window.innerHeight - r.top + 4 : undefined,
      left: r.left,
      width: r.width,
      openAbove,
    });
  }

  function openDropdown() {
    computePosition();
    setOpen(true);
  }

  function commitValue(val) {
    const trimmed = val.trim();
    // Only persist and notify if the value actually changed
    if (trimmed === value) {
      setOpen(false);
      return;
    }
    if (trimmed && !options.includes(trimmed)) {
      const next = [...options, trimmed];
      setOptions(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
    setInputVal(trimmed);
    onChange?.(trimmed);
    setOpen(false);
  }

  function handleSelect(opt) {
    setInputVal(opt);
    onChange?.(opt);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitValue(inputVal);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleBlur() {
    // Delay to allow click on dropdown option to fire first
    setTimeout(() => {
      commitValue(inputVal);
    }, 150);
  }

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(inputVal.toLowerCase()),
  );

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value);
          if (!open) openDropdown();
        }}
        onFocus={openDropdown}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="input-base pr-7"
      />
      <span
        className="absolute right-2 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none"
        aria-hidden="true"
      >
        <ChevronDownIcon className="size-3" />
      </span>

      {open && filtered.length > 0
        ? createPortal(
            <ul
              className="dropdown-menu"
              style={{
                top: dropPos.top,
                bottom: dropPos.bottom,
                left: dropPos.left,
                width: dropPos.width,
              }}
            >
              {filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    className={`dropdown-option ${
                      opt === value
                        ? "text-tint font-medium bg-tint/5"
                        : "text-label hover:bg-fill-3"
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
