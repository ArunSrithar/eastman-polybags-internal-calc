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
  formatLabel,
  renderOption,
  creatable = true,
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
  }, [defaultKey, defaultOptions]);

  const [inputVal, setInputVal] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropPos, setDropPos] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    openAbove: false,
  });
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const optionRefs = useRef([]);

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

  useEffect(() => {
    if (!open) return;

    function closeDropdown() {
      setOpen(false);
    }

    // Close on any parent/window scroll to avoid a detached floating menu.
    window.addEventListener("scroll", closeDropdown, true);
    window.addEventListener("resize", closeDropdown);

    return () => {
      window.removeEventListener("scroll", closeDropdown, true);
      window.removeEventListener("resize", closeDropdown);
    };
  }, [open]);

  function commitValue(val) {
    const trimmed = val.trim();
    // Only persist and notify if the value actually changed
    if (trimmed === value) {
      setOpen(false);
      return;
    }
    if (creatable && trimmed && !options.includes(trimmed)) {
      const next = [...options, trimmed];
      setOptions(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
    // Non-creatable: reject typed value that isn't in options
    if (!creatable && trimmed && !options.includes(trimmed)) {
      setInputVal(value);
      setOpen(false);
      return;
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

  function moveActive(direction, total) {
    if (total === 0) return;
    if (activeIndex < 0) {
      setActiveIndex(direction > 0 ? 0 : total - 1);
      return;
    }
    const next = (activeIndex + direction + total) % total;
    setActiveIndex(next);
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        openDropdown();
        return;
      }
      moveActive(1, filtered.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openDropdown();
        return;
      }
      moveActive(-1, filtered.length);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
        return;
      }
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

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }

    const selectedIndex = filtered.findIndex((opt) => opt === value);
    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : filtered.length > 0 ? 0 : -1,
    );
  }, [open, filtered, value]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={
          formatLabel
            ? open
              ? inputVal
              : value
                ? formatLabel(value)
                : inputVal
            : inputVal
        }
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
        className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 ${
          open ? "text-tint rotate-180" : "text-label-3 rotate-0"
        }`}
        aria-hidden="true"
      >
        <ChevronDownIcon className="size-3" />
      </span>

      {open && filtered.length > 0
        ? createPortal(
            <ul
              className={`dropdown-menu ${
                dropPos.openAbove ? "dropdown-menu-up" : "dropdown-menu-down"
              }`}
              style={{
                top: dropPos.top,
                bottom: dropPos.bottom,
                left: dropPos.left,
                width: dropPos.width,
              }}
            >
              {filtered.map((opt, idx) => (
                <li key={opt}>
                  <button
                    ref={(node) => {
                      optionRefs.current[idx] = node;
                    }}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`dropdown-option ${
                      idx === activeIndex
                        ? "dropdown-option-active"
                        : opt === value
                          ? "text-tint font-medium"
                          : "text-label"
                    }`}
                  >
                    {renderOption
                      ? renderOption(opt)
                      : formatLabel
                        ? formatLabel(opt)
                        : opt}
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
