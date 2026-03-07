# Rate Calculator

A React-based calculator for computing the **overall rate** of flexible packaging products. Operators enter a material price, select roll/cover/cutting sizes, toggle add-on charges (gusset, punching, opack), enter a printing rate, and apply a wastage factor. The calculator returns a real-time cost breakdown and allows quotes to be saved locally.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Formula](#core-formula)
3. [Component Tree](#component-tree)
4. [File Structure](#file-structure)
5. [Form Fields Reference](#form-fields-reference)
6. [Calculation Breakdown](#calculation-breakdown)
7. [Charge Rates & Lookup Tables](#charge-rates--lookup-tables)
8. [Data Flow](#data-flow)
9. [LocalStorage Keys](#localstorage-keys)
10. [Shared Utilities & Components](#shared-utilities--components)
11. [Key Differences from Gravure Calculator](#key-differences-from-gravure-calculator)
12. [Implementation Steps](#implementation-steps)
13. [Future / DB Integration Points](#future--db-integration-points)

---

## Overview

| Item                     | Value                           |
| ------------------------ | ------------------------------- |
| Calculator key (storage) | `rate-calc`                     |
| Entry component          | `RateCalculator/index.jsx`      |
| Calculation util         | `utils/calculators/rateCalc.js` |
| Quote storage util       | `utils/quoteStorage.js`         |
| Constants                | `constants/rateCalc.js`         |

---

## Core Formula

```
Total Rate = Subtotal × (1 + wastage% / 100)
```

Where:

```
Subtotal = Material Price
         + Roll Size Rate        (lookup by selected roll size)
         + Printing Rate         (user-entered ₹ value)
         + Gusset Rate           (₹43.83 if toggled ON, else 0)
         + Punching Rate         (₹72.31 if toggled ON, else 0)
         + Opack Rate            (₹87.30 if toggled ON, else 0)
         + Cutting Size Rate     (lookup by selected cutting size)
```

Returns `null` if `materialPrice` is 0 or empty (nothing meaningful to calculate).

### Important Notes

- **Cover Size** is informational only — it is saved in the quote but does NOT contribute a rate to the formula.
- **Roll Size** and **Cutting Size** have rate lookup tables; if a custom value is entered that doesn't exist in the table, a default/fallback rate of `0` is used.
- **Printing** is a direct ₹ value entered by the user (no color count logic like Gravure).
- The final output is a single **"Total Rate"** (not per-kg or per-piece — just an overall rate figure).

---

## Component Tree

```
RateCalculator/index.jsx                 ← 3-col layout, ResizeObserver, quote I/O
├── RateCalcForm.jsx                     ← All user inputs (col 1+2)
│   ├── CreatableCombobox (ui/)          ← Cover size, roll size, cutting size, wastage
│   ├── IOSToggle (ui/)                  ← Gusset, punching, opack toggles
│   └── Number inputs                   ← Material price, printing rate
│
├── RateCalcResult.jsx                   ← Collapsible cost breakdown card (col 1+2)
│   └── Row                              ← Label / sub-label / value row
│
└── RateCalcQuotesSidebar.jsx            ← Saved quotes list (col 3)
    └── RateCalcQuoteModal.jsx           ← Full invoice modal (portal)
        ├── InvoiceRow
        └── SectionLabel
```

---

## File Structure

```
RateCalculator/
├── index.jsx                  ← Layout, ResizeObserver, state management
├── RateCalcForm.jsx           ← Form UI + localStorage persistence
├── RateCalcResult.jsx         ← Collapsible breakdown card
├── RateCalcQuoteModal.jsx     ← Invoice detail modal (React portal)
├── RateCalcQuotesSidebar.jsx  ← Quotes list sidebar
└── RateCalculator.md          ← This file

Shared (reusable across calculators):
src/
├── components/ui/
│   ├── IOSToggle.jsx          ← iOS-style toggle switch
│   ├── Icons.jsx              ← CloseIcon, TrashIcon, ChevronDownIcon
│   └── CreatableCombobox.jsx  ← Portal dropdown with localStorage options
├── utils/
│   ├── format.js              ← fmt(), formatDate()
│   └── calculators/
│       └── rateCalc.js        ← Pure calculation function
├── utils/quoteStorage.js      ← getQuotes(), saveQuote(), deleteQuote()
└── constants/
    └── rateCalc.js            ← All charge rates + lookup tables
```

---

## Form Fields Reference

### Quote Info

| Field       | Type   | Default | Description                             |
| ----------- | ------ | ------- | --------------------------------------- |
| `quoteName` | string | `""`    | Customer / job name for the saved quote |

### Core Pricing

| Field           | Type       | Default | Persisted                | Description                                  |
| --------------- | ---------- | ------- | ------------------------ | -------------------------------------------- |
| `materialPrice` | number (₹) | `""`    | `rate-calc-field-values` | Single material price value                  |
| `printingRate`  | number (₹) | `""`    | `rate-calc-field-values` | Direct printing charge (user enters ₹ value) |

### Size Selections

| Field         | Type                       | Default | Persisted via             | Description                                           |
| ------------- | -------------------------- | ------- | ------------------------- | ----------------------------------------------------- |
| `coverSize`   | string (CreatableCombobox) | `""`    | `rate-calc-cover-sizes`   | Informational only — no rate derived; preset + custom |
| `rollSize`    | string (CreatableCombobox) | `""`    | `rate-calc-roll-sizes`    | Selects rate from `ROLL_SIZE_RATES` lookup table      |
| `cuttingSize` | string (CreatableCombobox) | `""`    | `rate-calc-cutting-sizes` | Selects rate from `CUTTING_SIZE_RATES` lookup table   |

### Toggle Charges

| Field      | Type    | Default | Description                        |
| ---------- | ------- | ------- | ---------------------------------- |
| `gusset`   | boolean | `false` | ON → adds `GUSSET_RATE` (₹43.83)   |
| `punching` | boolean | `false` | ON → adds `PUNCHING_RATE` (₹72.31) |
| `opack`    | boolean | `false` | ON → adds `OPACK_RATE` (₹87.30)    |

### Other

| Field     | Type                       | Default | Description                            |
| --------- | -------------------------- | ------- | -------------------------------------- |
| `wastage` | string (CreatableCombobox) | `"0"`   | Wastage percentage applied to subtotal |

---

## Calculation Breakdown

The `calculateRate(form)` function in `utils/calculators/rateCalc.js` returns an object with:

| Property          | Description                                   |
| ----------------- | --------------------------------------------- |
| `materialPrice`   | Parsed material price (₹)                     |
| `rollSize`        | Selected roll size string (for display)       |
| `rollSizeRate`    | Rate looked up from `ROLL_SIZE_RATES` (₹)     |
| `printingRate`    | Parsed printing rate (₹)                      |
| `gussetRate`      | `GUSSET_RATE` if gusset is ON, else `0`       |
| `punchingRate`    | `PUNCHING_RATE` if punching is ON, else `0`   |
| `opackRate`       | `OPACK_RATE` if opack is ON, else `0`         |
| `cuttingSize`     | Selected cutting size string (for display)    |
| `cuttingSizeRate` | Rate looked up from `CUTTING_SIZE_RATES` (₹)  |
| `subtotal`        | Sum of all above rates                        |
| `wastagePercent`  | Parsed `form.wastage`                         |
| `wastageAmount`   | `subtotal × (wastagePercent / 100)`           |
| `totalRate`       | `subtotal + wastageAmount` — the final output |

---

## Charge Rates & Lookup Tables

All rates are defined in `constants/rateCalc.js` and will eventually be loaded from the backend.

### Fixed Toggle Rates

| Constant        | Value | Unit |
| --------------- | ----- | ---- |
| `GUSSET_RATE`   | 43.83 | ₹    |
| `PUNCHING_RATE` | 72.31 | ₹    |
| `OPACK_RATE`    | 87.30 | ₹    |

### Roll Size Rate Lookup (`ROLL_SIZE_RATES`)

Rate is looked up by the roll size string. Generate ~6 entries with realistic rates:

| Roll Size | Rate (₹) |
| --------- | -------- |
| `"4x3"`   | 12.50    |
| `"6x4"`   | 18.00    |
| `"8x6"`   | 24.50    |
| `"10x8"`  | 32.00    |
| `"12x10"` | 40.00    |
| `"14x12"` | 48.50    |

If the user enters a custom roll size not in the table, the rate defaults to `0` (no charge).

### Cover Size Options (`COVER_SIZE_OPTIONS`)

Informational presets — no rates associated. Generate ~6 entries:

`"8x10"`, `"10x12"`, `"12x14"`, `"14x16"`, `"16x18"`, `"18x20"`

### Cutting Size Rate Lookup (`CUTTING_SIZE_RATES`)

Rate is looked up by the cutting size string. Generate 10 entries:

| Cutting Size | Rate (₹) |
| ------------ | -------- |
| `"4"`        | 5.00     |
| `"5"`        | 6.50     |
| `"6"`        | 8.00     |
| `"7"`        | 9.50     |
| `"8"`        | 11.00    |
| `"9"`        | 12.50    |
| `"10"`       | 14.00    |
| `"11"`       | 15.50    |
| `"12"`       | 17.00    |
| `"14"`       | 20.00    |

If the user enters a custom cutting size not in the table, the rate defaults to `0`.

### Wastage Preset Options

Default options for the wastage CreatableCombobox: `"0"`, `"1"`, `"2"`, `"3"`, `"4"`, `"5"`

---

## Data Flow

```
User input
    │
    ▼
RateCalcForm (form state)
    │  onChange fires useEffect → onProceed(form)
    ▼
index.jsx (handleFormChange)
    │  calculateRate(form) → result
    ▼
RateCalcResult ← result prop (live breakdown)
RateCalcForm   ← result prop (total rate in footer)
    │
    │  user clicks "Save Quote"
    ▼
index.jsx (handleSave)
    │  saveQuote("rate-calc", { ...form data, totalRate, savedAt })
    ▼
quoteStorage.js → localStorage["quotes-rate-calc"]
    │
    ▼
RateCalcQuotesSidebar ← quotes prop (list)
    │  user clicks row
    ▼
RateCalcQuoteModal (invoice view + delete)
```

---

## LocalStorage Keys

| Key                       | Contents                                             | Managed by          |
| ------------------------- | ---------------------------------------------------- | ------------------- |
| `rate-calc-field-values`  | `{ materialPrice, printingRate }` — last-used values | `RateCalcForm.jsx`  |
| `rate-calc-cover-sizes`   | Array of custom cover size strings                   | `CreatableCombobox` |
| `rate-calc-roll-sizes`    | Array of custom roll size strings                    | `CreatableCombobox` |
| `rate-calc-cutting-sizes` | Array of custom cutting size strings                 | `CreatableCombobox` |
| `rate-calc-wastage`       | History of custom wastage % entries                  | `CreatableCombobox` |
| `quotes-rate-calc`        | Array of saved quote objects                         | `quoteStorage.js`   |

---

## Shared Utilities & Components

These are already abstracted and shared across calculators:

### `components/ui/IOSToggle.jsx`

```jsx
<IOSToggle on={boolean} onToggle={() => void} />
```

iOS-style pill toggle. Used for gusset, punching, opack.

### `components/ui/Icons.jsx`

```jsx
import { CloseIcon, TrashIcon, ChevronDownIcon } from "../../ui/Icons";
<ChevronDownIcon className="..." />;
```

SVG icons shared across modals and collapsible cards.

### `components/ui/CreatableCombobox.jsx`

- Portal-based dropdown that saves custom entries to localStorage
- Props: `storageKey`, `value`, `onChange`, `placeholder`, `defaultOptions`, `className`
- Flip-upward logic when near viewport bottom
- Used for: cover size, roll size, cutting size, wastage

### `utils/format.js`

```js
import { fmt, formatDate } from "../../../utils/format";
fmt(12345.6); // "12,345.60"
formatDate(isoString); // "26 Feb 2026, 09:15 am"
```

### `utils/quoteStorage.js`

```js
getQuotes("rate-calc"); // → array, newest first
saveQuote("rate-calc", data); // prepends, returns new array
deleteQuote("rate-calc", id); // removes by id, returns new array
```

---

## Key Differences from Gravure Calculator

| Aspect             | Gravure Rate Calculator                   | Rate Calculator                      |
| ------------------ | ----------------------------------------- | ------------------------------------ |
| **Output**         | Price per kg                              | Overall rate (single number)         |
| **Materials**      | 4 toggleable materials (price × qty each) | Single material price input          |
| **Printing**       | Color counts (normal + metallic) → per-kg | Direct ₹ value input                 |
| **Lamination**     | Single/double lamination toggle           | Not present                          |
| **Slitting**       | Toggle + per-kg rate                      | Not present                          |
| **Gusset**         | Not present                               | Toggle → flat ₹43.83                 |
| **Punching**       | Not present                               | Toggle → flat ₹72.31                 |
| **Opack**          | Not present                               | Toggle → flat ₹87.30                 |
| **Cover Size**     | Not present                               | Informational field (no rate)        |
| **Roll Size**      | Not present                               | Lookup → rate from table             |
| **Cutting Size**   | Not present                               | Lookup → rate from table             |
| **Pouch Size**     | Lookup → per-kg rate                      | Not present                          |
| **Matt Finish**    | Toggle + per-kg rate                      | Not present                          |
| **Formula**        | Rates × total material qty + wastage      | Sum of flat rates + wastage          |
| **Qty dependency** | All charges scale with total material qty | No qty — all charges are flat/direct |

---

## Implementation Steps

### Phase 1: Constants & Calculation Logic

**Step 1 — Create `constants/rateCalc.js`**

Export these:

- `GUSSET_RATE = 43.83`
- `PUNCHING_RATE = 72.31`
- `OPACK_RATE = 87.30`
- `ROLL_SIZE_RATES` — object mapping roll size strings → ₹ rates (6 entries, see table above)
- `COVER_SIZE_OPTIONS` — array of preset cover size strings (6 entries)
- `CUTTING_SIZE_RATES` — object mapping cutting size strings → ₹ rates (10 entries, see table above)
- `WASTAGE_OPTIONS` — array of default wastage % strings
- `SAMPLE_QUOTES` — 5–7 sample quote objects (seed data for sidebar)

**Step 2 — Create `utils/calculators/rateCalc.js`** _(depends on step 1)_

Pure function `calculateRate(form)`:

- Parse `materialPrice`, `printingRate` from form
- Look up `rollSizeRate` from `ROLL_SIZE_RATES[form.rollSize]` (default `0`)
- Look up `cuttingSizeRate` from `CUTTING_SIZE_RATES[form.cuttingSize]` (default `0`)
- Apply toggle rates: `gusset ? GUSSET_RATE : 0`, etc.
- Compute `subtotal` = sum of all above
- Apply `wastagePercent` → `wastageAmount` → `totalRate`
- Return breakdown object or `null` if `materialPrice` is 0/empty

### Phase 2: UI Components

**Step 3 — Create `RateCalcForm.jsx`** _(depends on step 1)_

Follow `GravureForm.jsx` patterns:

- Controlled form state with `useState`
- `useEffect` auto-triggers `onProceed(form)` on any change
- Title row with Quote Name input
- **Material Price** — number input with ₹ suffix
- **Cover Size** — `CreatableCombobox` with `storageKey="rate-calc-cover-sizes"` and `defaultOptions={COVER_SIZE_OPTIONS}`
- **Roll Size** — `CreatableCombobox` with `storageKey="rate-calc-roll-sizes"` and `defaultOptions={Object.keys(ROLL_SIZE_RATES)}`
- **Printing Rate** — number input with ₹ suffix
- **Gusset** — `IOSToggle` with rate label "₹43.83"
- **Punching** — `IOSToggle` with rate label "₹72.31"
- **Opack** — `IOSToggle` with rate label "₹87.30"
- **Cutting Size** — `CreatableCombobox` with `storageKey="rate-calc-cutting-sizes"` and `defaultOptions={Object.keys(CUTTING_SIZE_RATES)}`
- **Wastage %** — `CreatableCombobox` with `storageKey="rate-calc-wastage"` and `defaultOptions={WASTAGE_OPTIONS}`
- Footer: show total rate from `result` prop + "Save Quote" button
- Persist `materialPrice` and `printingRate` to `localStorage["rate-calc-field-values"]`

**Step 4 — Create `RateCalcResult.jsx`** _(parallel with step 3)_

Follow `GravureResult.jsx` pattern:

- Collapsible card with chevron toggle
- Line-item rows:
  - Material Price → `result.materialPrice`
  - Roll Size Rate → `result.rollSizeRate` (show selected roll size as sub-label)
  - Printing Rate → `result.printingRate`
  - Gusset → `result.gussetRate` (only if > 0)
  - Punching → `result.punchingRate` (only if > 0)
  - Opack → `result.opackRate` (only if > 0)
  - Cutting Size Rate → `result.cuttingSizeRate` (show selected cutting size as sub-label)
  - Divider
  - Subtotal → `result.subtotal`
  - Wastage → `result.wastageAmount` (show % as sub-label)
  - **Total Rate** → `result.totalRate` (bold, highlighted)

**Step 5 — Create `RateCalcQuoteModal.jsx`** _(parallel with step 3)_

Follow `GravureQuoteModal.jsx` pattern:

- React portal modal
- Header: quote name, saved date, saved by
- Invoice section with all rate line items
- Total Rate highlighted
- Delete button with confirmation
- Close on overlay click / Escape key

**Step 6 — Create `RateCalcQuotesSidebar.jsx`** _(parallel with step 3)_

Follow `GravureQuotesSidebar.jsx` pattern:

- Sticky sidebar (col 3)
- List of saved quotes showing: quote name, cover size, total rate, date
- Click row → opens `RateCalcQuoteModal`
- Dynamic `maxHeight` from parent (ResizeObserver-driven)

### Phase 3: Integration

**Step 7 — Rewrite `RateCalculator/index.jsx`** _(depends on steps 2-6)_

Follow `GravureRateCalculator/index.jsx` pattern:

- `CALC_KEY = "rate-calc"`
- `getInitialQuotes()` — seed with `SAMPLE_QUOTES` if empty
- State: `result`, `quotes`, `formHeight`, `collapsedResultHeight`
- Refs: `formRef`, `resultCardRef`
- ResizeObserver for form + result heights → drives sidebar maxHeight
- `handleFormChange(form)` → `calculateRate(form)` → `setResult`
- `handleSave(form)` → `saveQuote("rate-calc", { quoteName, coverSize, totalRate, form })`
- `handleDelete(id)` → `deleteQuote("rate-calc", id)`
- 3-column grid: form+result (col 1-2) | sidebar (col 3)

---

## Saved Quote Object Shape

Each saved quote in `localStorage["quotes-rate-calc"]` has this structure:

```js
{
  id: "q-1709abc123",           // generated by quoteStorage.js
  savedAt: "2026-03-07T...",    // ISO timestamp
  savedBy: "Arun",             // TODO: replace with logged-in user
  quoteName: "Customer Name",
  coverSize: "10x12",          // for sidebar display
  totalRate: 385.60,           // for sidebar display
  form: {                      // complete form snapshot for modal re-display
    quoteName: "Customer Name",
    materialPrice: "150",
    coverSize: "10x12",
    rollSize: "8x6",
    printingRate: "25",
    gusset: true,
    punching: false,
    opack: true,
    cuttingSize: "8",
    wastage: "3",
  }
}
```

---

## Verification Checklist

1. Switch to "Rate Calculator" tab → form renders with all fields
2. Enter Material Price → result card appears with breakdown
3. Select Roll Size → rate appears in breakdown, total updates
4. Select Cutting Size → rate appears in breakdown, total updates
5. Toggle Gusset / Punching / Opack → rates appear/disappear, total updates in real-time
6. Change Wastage % → total recalculates
7. Click "Save Quote" → quote appears in sidebar
8. Click a saved quote → modal opens with full invoice detail
9. Delete a quote from modal → removed from sidebar
10. Refresh page → persisted field values and quotes survive
11. Dark mode toggle → all colors use semantic tokens correctly
12. No console errors, no lint errors

---

## Future / DB Integration Points

| What                                   | Where to change                                | Notes                                                                                |
| -------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| Toggle rates (gusset, punching, opack) | `constants/rateCalc.js`                        | Replace hardcoded exports with API fetch; shape stays the same                       |
| Roll size lookup table                 | `constants/rateCalc.js` → `ROLL_SIZE_RATES`    | Will become a DB table keyed by size string                                          |
| Cover size presets                     | `constants/rateCalc.js` → `COVER_SIZE_OPTIONS` | Will become a DB-backed options list                                                 |
| Cutting size lookup table              | `constants/rateCalc.js` → `CUTTING_SIZE_RATES` | Will become a DB table keyed by size string                                          |
| Quote persistence                      | `utils/quoteStorage.js`                        | Swap `localStorage` reads/writes for REST API calls; `calcKey` maps to DB collection |
| User attribution                       | `index.jsx` → `handleSave`                     | Pass `savedBy: currentUser.name` when auth is wired up                               |
