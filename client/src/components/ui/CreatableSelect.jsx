import { useState, useRef, useEffect, useMemo, useId } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, SearchIcon } from "./Icons";

/**
 * CreatableSelect — dropdown that allows typing new values.
 * New values are persisted to localStorage and added to the dropdown list.
 *
 * Two render modes:
 *   - Combobox mode (default): the trigger is a text input that is both the
 *     display value and the search box. Typing filters the list and (when
 *     `creatable`) can commit a brand-new value.
 *   - Picker mode (`searchInMenu`, defaults to `!creatable`): the trigger is
 *     a read-only button. The search box lives inside the open menu and is
 *     auto-focused, so the full option list is always visible on open
 *     instead of being pre-filtered down to the current selection.
 *
 * Props:
 *   storageKey      string     localStorage key to persist option list
 *   defaultOptions  string[]   seed options when nothing is stored
 *   value           string     controlled value
 *   onChange        fn(val)    called on select or new entry
 *   placeholder     string
 *   className       string     extra classes on the outer wrapper
 *   searchInMenu    bool       use picker mode (read-only trigger + menu search)
 *   emptyMessage    string     shown in picker mode when no options match
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
  searchInMenu = !creatable,
  emptyMessage = "No matches found",
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
  const [query, setQuery] = useState("");
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
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const optionRefs = useRef([]);
  const listboxId = useId();

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  function computePosition() {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const maxH = 260;
    const openThreshold = searchInMenu ? 200 : 140;
    const minHeight = searchInMenu ? 180 : 120;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const spaceAbove = r.top - 8;
    const openAbove = spaceBelow < openThreshold && spaceAbove > spaceBelow;
    const available = openAbove ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(minHeight, Math.min(maxH, available));

    // The menu can be wider than a narrow trigger so option labels (company
    // names + price badges) aren't clipped — but never wider than the
    // viewport it's anchored in.
    const minMenuWidth = 300;
    const maxMenuWidth = window.innerWidth - r.left - 8;
    const width = Math.min(Math.max(r.width, minMenuWidth), maxMenuWidth);

    setDropPos({
      top: openAbove ? undefined : r.bottom + 4,
      bottom: openAbove ? window.innerHeight - r.top + 4 : undefined,
      left: r.left,
      width,
      openAbove,
      maxHeight,
    });
  }

  function openDropdown() {
    if (disabled) return;
    computePosition();
    if (searchInMenu) setQuery("");
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

  // Picker mode: focus the in-menu search box as soon as the menu opens.
  useEffect(() => {
    if (!open || !searchInMenu) return;
    searchRef.current?.focus();
  }, [open, searchInMenu]);

  // Picker mode: close on any click outside the trigger and the portal menu.
  useEffect(() => {
    if (!open || !searchInMenu) return;

    function handleDocMouseDown(e) {
      const target = e.target;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handleDocMouseDown);
    return () => document.removeEventListener("mousedown", handleDocMouseDown);
  }, [open, searchInMenu]);

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
    if (searchInMenu) triggerRef.current?.focus();
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

  const filtered = useMemo(() => {
    const needle = String((searchInMenu ? query : inputVal) || "").toLowerCase();
    if (!needle) return options;
    return options.filter((opt) => {
      const valueText = getOptionValue(opt).toLowerCase();
      const labelText = getOptionLabel(opt).toLowerCase();
      return valueText.includes(needle) || labelText.includes(needle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, query, inputVal, searchInMenu]);

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

  function handleTriggerKeyDown(e) {
    if (disabled) return;
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();
      if (!open) openDropdown();
    }
  }

  function handleSearchKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1, filtered.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1, filtered.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  function handleBlur() {
    if (disabled) return;
    // Delay to allow click on dropdown option to fire first
    setTimeout(() => {
      commitValue(inputVal);
    }, 150);
  }

  // Reset the active row only on the open transition — matching the current
  // selection (or the first row) — so live typing/arrow-key nav afterward
  // isn't clobbered by this effect re-running on every render.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function renderOptionRow(opt, idx) {
    const optionValue = getOptionValue(opt);
    const disabledOption = isOptionDisabled(opt);
    const optionLabel = renderOption ? renderOption(opt) : getOptionLabel(opt);

    return (
      <li key={optionValue || String(idx)} role="presentation">
        <button
          ref={(node) => {
            optionRefs.current[idx] = node;
          }}
          type="button"
          role="option"
          aria-selected={optionValue === value}
          onMouseDown={(e) => {
            e.preventDefault();
            if (disabledOption) return;
            handleSelect(opt);
          }}
          onMouseEnter={() => {
            if (!disabledOption) setActiveIndex(idx);
          }}
          disabled={disabledOption}
          className={`dropdown-option ${
            idx === activeIndex
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
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {searchInMenu ? (
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => (open ? setOpen(false) : openDropdown())}
          onKeyDown={handleTriggerKeyDown}
          disabled={disabled}
          className={`input-base text-left truncate ${hideArrow ? "" : "pr-7"} ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {value ? (
            formatLabel ? (
              formatLabel(value)
            ) : (
              value
            )
          ) : (
            <span className="text-label-3">{placeholder}</span>
          )}
        </button>
      ) : (
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
      )}
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

      {open && (searchInMenu || filtered.length > 0)
        ? createPortal(
          searchInMenu ? (
            <div
              ref={menuRef}
              className={`dropdown-panel ${dropPos.openAbove ? "dropdown-menu-up" : "dropdown-menu-down"
                }`}
              style={{
                top: dropPos.top,
                bottom: dropPos.bottom,
                left: dropPos.left,
                width: dropPos.width,
                maxHeight: `${dropPos.maxHeight}px`,
              }}
            >
              <div className="dropdown-search">
                <SearchIcon className="size-4 text-label-3 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search…"
                  className="bg-transparent outline-none text-sm text-label placeholder:text-label-3 w-full"
                />
              </div>
              <ul id={listboxId} role="listbox" className="dropdown-list">
                {filtered.length === 0 ? (
                  <li className="dropdown-empty" role="presentation">
                    {emptyMessage}
                  </li>
                ) : (
                  filtered.map((opt, idx) => renderOptionRow(opt, idx))
                )}
              </ul>
            </div>
          ) : (
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
              {filtered.map((opt, idx) => renderOptionRow(opt, idx))}
            </ul>
          ),
          document.body,
        )
        : null}
    </div>
  );
}
