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
  disabled = false,
  persistOptions = true,
  sanitizeInput,
  hideArrow = false,
}) {
  function getOptionValue(opt) {
    return typeof opt === "string" ? opt : opt?.value ?? "";
  }

  function getOptionLabel(opt) {
    if (typeof opt === "string") {
      return formatLabel ? formatLabel(opt) : opt;
    }
    const value = opt?.value ?? "";
    const label = opt?.label ?? value;
    return formatLabel ? formatLabel(value) : label;
  }

  function isOptionDisabled(opt) {
    return typeof opt === "object" && opt?.disabled === true;
  }

  const [options, setOptions] = useState(() => {
    if (!persistOptions || !storageKey) {
      return defaultOptions;
    }

    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      return stored && stored.length > 0 ? stored : defaultOptions;
    } catch {
      return defaultOptions;
    }
  });

  // Re-sync when defaultOptions change (e.g. pouch enabled/disabled in settings)
  const defaultKey = JSON.stringify(
    defaultOptions.map((opt) => {
      if (typeof opt === "string") return opt;
      return {
        value: opt?.value ?? "",
        label: opt?.label ?? opt?.value ?? "",
        disabled: opt?.disabled === true,
      };
    }),
  );
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
    maxHeight: 220,
  });
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const optionRefs = useRef([]);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  function computePosition() {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const maxH = 260;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const spaceAbove = r.top - 8;
    const openAbove = spaceBelow < 140 && spaceAbove > spaceBelow;
    const available = openAbove ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(120, Math.min(maxH, available));

    setDropPos({
      top: openAbove ? undefined : r.bottom + 4,
      bottom: openAbove ? window.innerHeight - r.top + 4 : undefined,
      left: r.left,
      width: r.width,
      openAbove,
      maxHeight,
    });
  }

  function openDropdown() {
    if (disabled) return;
    computePosition();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function handleViewportChange(event) {
      const target = event?.target;
      if (target && menuRef.current?.contains(target)) {
        return;
      }
      computePosition();
    }

    // Keep dropdown anchored during viewport/container scrolling.
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [open]);

  function commitValue(val) {
    if (disabled) {
      setOpen(false);
      return;
    }

    const normalized = sanitizeInput ? sanitizeInput(val) : val;
    const trimmed = normalized.trim();
    // Only persist and notify if the value actually changed
    if (trimmed === value) {
      setOpen(false);
      return;
    }
    const hasExactOption = options.some((opt) => getOptionValue(opt) === trimmed);

    if (creatable && trimmed && !hasExactOption) {
      const next = [...options, trimmed];
      setOptions(next);
      if (persistOptions && storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(next));
      }
    }
    // Non-creatable: reject typed value that isn't in options
    if (!creatable && trimmed && !hasExactOption) {
      setInputVal(value);
      setOpen(false);
      return;
    }
    setInputVal(trimmed);
    onChange?.(trimmed);
    setOpen(false);
  }

  function handleSelect(opt) {
    if (isOptionDisabled(opt)) return;

    const optionValue = getOptionValue(opt);
    setInputVal(optionValue);
    onChange?.(optionValue);
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
    if (disabled) return;
    // Delay to allow click on dropdown option to fire first
    setTimeout(() => {
      commitValue(inputVal);
    }, 150);
  }

  const filtered = options.filter((opt) => {
    const valueText = getOptionValue(opt).toLowerCase();
    const labelText = getOptionLabel(opt).toLowerCase();
    const needle = String(inputVal || "").toLowerCase();
    return valueText.includes(needle) || labelText.includes(needle);
  });

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }

    const selectedIndex = filtered.findIndex(
      (opt) => getOptionValue(opt) === value,
    );
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
          const raw = e.target.value;
          const next = sanitizeInput ? sanitizeInput(raw) : raw;
          setInputVal(next);
          if (!open) openDropdown();
        }}
        onFocus={openDropdown}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-base ${hideArrow ? "" : "pr-7"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      />
      {hideArrow ? null : (
        <span
          className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 ${disabled
            ? "text-label-4 rotate-0"
            : open
              ? "text-tint rotate-180"
              : "text-label-3 rotate-0"
            }`}
          aria-hidden="true"
        >
          <ChevronDownIcon className="size-3" />
        </span>
      )}

      {open && filtered.length > 0
        ? createPortal(
          <ul
            ref={menuRef}
            className={`dropdown-menu ${dropPos.openAbove ? "dropdown-menu-up" : "dropdown-menu-down"
              }`}
            style={{
              top: dropPos.top,
              bottom: dropPos.bottom,
              left: dropPos.left,
              width: dropPos.width,
              maxHeight: `${dropPos.maxHeight}px`,
            }}
          >
            {filtered.map((opt, idx) => {
              const optionValue = getOptionValue(opt);
              const disabledOption = isOptionDisabled(opt);
              const optionLabel = renderOption
                ? renderOption(opt)
                : getOptionLabel(opt);

              return (
                <li key={optionValue || String(idx)}>
                  <button
                    ref={(node) => {
                      optionRefs.current[idx] = node;
                    }}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (disabledOption) return;
                      handleSelect(opt);
                    }}
                    onMouseEnter={() => {
                      if (!disabledOption) setActiveIndex(idx);
                    }}
                    disabled={disabledOption}
                    className={`dropdown-option ${idx === activeIndex
                      ? "dropdown-option-active"
                      : optionValue === value
                        ? "text-tint font-medium"
                        : "text-label"
                      } ${disabledOption ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {optionLabel}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
        : null}
    </div>
  );
}
