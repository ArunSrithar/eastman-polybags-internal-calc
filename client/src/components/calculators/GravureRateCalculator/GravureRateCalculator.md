# Gravure Rate Calculator

A React-based calculator for computing the **price per kg** of gravure-printed flexible packaging. Operators enter raw material costs, printing/lamination options and a wastage factor; the calculator returns a real-time cost breakdown and allows quotes to be saved locally.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Formula](#core-formula)
3. [Component Tree](#component-tree)
4. [File Structure](#file-structure)
5. [Form Fields Reference](#form-fields-reference)
6. [Calculation Breakdown](#calculation-breakdown)
7. [Charge Rates](#charge-rates)
8. [Data Flow](#data-flow)
9. [LocalStorage Keys](#localstorage-keys)
10. [Shared Utilities & Components](#shared-utilities--components)
11. [Future / DB Integration Points](#future--db-integration-points)

---

## Overview

| Item                     | Value                              |
| ------------------------ | ---------------------------------- |
| Calculator key (storage) | `gravure`                          |
| Entry component          | `GravureRateCalculator/index.jsx`  |
| Calculation util         | `utils/calculators/gravureRate.js` |
| Quote storage util       | `utils/quoteStorage.js`            |
| Constants                | `constants/gravureRates.js`        |

---

## Core Formula

```
Price per kg = (Total Cost × (1 + wastage / 100)) / Total Material Qty (kg)
```

Where:

```
Total Cost = Material Cost + Printing Cost + Lamination Cost + Slitting Cost + Pouch Cost

Material Cost   = Σ (price_i × qty_i)   for each enabled material
Printing Cost   = printingRatePerKg × totalMaterialQty
Lamination Cost = laminationRatePerKg × totalMaterialQty
Slitting Cost   = slittingRatePerKg × totalMaterialQty
Pouch Cost      = pouchRatePerKg × totalMaterialQty
```

Returns `null` if no materials are enabled or total qty is 0.

---

## Component Tree

```
GravureRateCalculator/index.jsx          ← 3-col layout, ResizeObserver, quote I/O
├── GravureForm.jsx                      ← All user inputs (col 1+2)
│   ├── MaterialRow                      ← Toggle + price / micron / qty inputs (×4)
│   ├── LaminationRow                    ← Checkbox button for single/double lam
│   ├── CreatableCombobox (ui/)          ← Pouch size, color counts, wastage
│   ├── IOSToggle (ui/)                  ← Matt finish, slitting, material enable
│   └── CheckBox (ui/)                   ← Lamination selection indicator
│
├── GravureResult.jsx                    ← Collapsible cost breakdown card (col 1+2)
│   └── Row                              ← Label / sub-label / value row
│
└── GravureQuotesSidebar.jsx             ← Saved quotes list (col 3)
    └── GravureQuoteModal.jsx            ← Full invoice modal (portal)
        ├── InvoiceRow
        └── SectionLabel
```

---

## File Structure

```
GravureRateCalculator/
├── index.jsx                  ← Layout, ResizeObserver, state management
├── GravureForm.jsx            ← Form UI + localStorage persistence
├── GravureResult.jsx          ← Collapsible breakdown card
├── GravureQuoteModal.jsx      ← Invoice detail modal (React portal)
├── GravureQuotesSidebar.jsx   ← Quotes list sidebar
└── GravureRateCalculator.md   ← This file

Shared (reusable across calculators):
src/
├── components/ui/
│   ├── IOSToggle.jsx          ← iOS-style toggle switch
│   ├── CheckBox.jsx           ← Circular tinted checkmark
│   ├── Icons.jsx              ← CloseIcon, TrashIcon, ChevronDownIcon
│   └── CreatableCombobox.jsx  ← Portal dropdown with localStorage options
├── utils/
│   ├── format.js              ← fmt(), formatDate()
│   └── calculators/
│       └── gravureRate.js     ← Pure calculation function
├── utils/quoteStorage.js      ← getQuotes(), saveQuote(), deleteQuote()
└── constants/
    └── gravureRates.js        ← All charge rates + MATERIAL_NAMES
```

---

## Form Fields Reference

### Quote Info

| Field       | Type   | Default | Description                             |
| ----------- | ------ | ------- | --------------------------------------- |
| `quoteName` | string | `""`    | Customer / job name for the saved quote |

### Materials (one block per material)

| Field                    | Type    | Default                          | Persisted                 |
| ------------------------ | ------- | -------------------------------- | ------------------------- |
| `materials[key].enabled` | boolean | polyester: `true`, rest: `false` | No                        |
| `materials[key].price`   | number  | last saved                       | `gravure-material-values` |
| `materials[key].micron`  | string  | last saved                       | `gravure-material-values` |
| `materials[key].qty`     | number  | last saved                       | `gravure-material-values` |

Available material keys: `polyester`, `silverPet`, `ldRoll`, `bopp`

### Printing

| Field            | Type          | Default | Description                    |
| ---------------- | ------------- | ------- | ------------------------------ |
| `normalColors`   | string (0–12) | `"0"`   | Number of normal ink colors    |
| `metallicColors` | string (0–12) | `"0"`   | Number of metallic ink colors  |
| `mattFinish`     | boolean       | `false` | Whether matt finish is applied |

### Lamination

| Field        | Type                                 | Default  | Description                        |
| ------------ | ------------------------------------ | -------- | ---------------------------------- |
| `lamination` | `"none"` \| `"single"` \| `"double"` | `"none"` | Lamination type (toggle-exclusive) |

### Other

| Field       | Type    | Default | Description                                                      |
| ----------- | ------- | ------- | ---------------------------------------------------------------- |
| `slitting`  | boolean | `false` | Slitting charge toggle                                           |
| `pouchSize` | string  | `""`    | Pouch size string (e.g. `"4x6"`) — selects pouch rate from table |
| `wastage`   | string  | `"0"`   | Wastage percentage applied to total cost                         |

---

## Calculation Breakdown

The `calculateGravureRate(form)` function returns an object with:

| Property              | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `materialLines`       | Array of `{ key, price, qty, amount }` for enabled materials  |
| `totalMaterialQty`    | Sum of all enabled material quantities (kg)                   |
| `totalMaterialCost`   | Sum of `price × qty` for all enabled materials                |
| `printingRatePerKg`   | Derived from color counts + matt finish                       |
| `printingCost`        | `printingRatePerKg × totalMaterialQty`                        |
| `laminationRatePerKg` | Flat rate based on lamination type                            |
| `laminationCost`      | `laminationRatePerKg × totalMaterialQty`                      |
| `slittingRatePerKg`   | Flat rate if slitting is on                                   |
| `slittingCost`        | `slittingRatePerKg × totalMaterialQty`                        |
| `pouchRatePerKg`      | Lookup by `pouchSize`, fallback to `DEFAULT_POUCH_RATE`       |
| `pouchCost`           | `pouchRatePerKg × totalMaterialQty` (only if `pouchSize` set) |
| `totalCost`           | Sum of all above costs                                        |
| `wastagePercent`      | Parsed `form.wastage`                                         |
| `wastageAmount`       | `totalCost × (wastagePercent / 100)`                          |
| `adjustedTotal`       | `totalCost + wastageAmount`                                   |
| `pricePerKg`          | `adjustedTotal / totalMaterialQty`                            |

---

## Charge Rates

All rates are defined in `constants/gravureRates.js` and will eventually be loaded from the backend.

| Constant              | Value | Unit           |
| --------------------- | ----- | -------------- |
| `NORMAL_COLOR_RATE`   | 5     | ₹ / color / kg |
| `METALLIC_COLOR_RATE` | 8     | ₹ / color / kg |
| `MATT_FINISH_RATE`    | 3     | ₹ / kg         |
| `SINGLE_LAM_RATE`     | 12    | ₹ / kg         |
| `DOUBLE_LAM_RATE`     | 20    | ₹ / kg         |
| `SLITTING_RATE`       | 4     | ₹ / kg         |
| `DEFAULT_POUCH_RATE`  | 15    | ₹ / kg         |

Pouch rates by size (₹/kg): `4x6` → 15, `5x7` → 18, `6x8` → 20, `7x10` → 25.

---

## Data Flow

```
User input
    │
    ▼
GravureForm (form state)
    │  onChange fires useEffect → onProceed(form)
    ▼
index.jsx (handleFormChange)
    │  calculateGravureRate(form) → result
    ▼
GravureResult ← result prop (live breakdown)
GravureForm   ← result prop (price per kg in footer)
    │
    │  user clicks "Save Quote"
    ▼
index.jsx (handleSave)
    │  saveQuote("gravure", { ...form data, pricePerKg, savedAt })
    ▼
quoteStorage.js → localStorage["quotes-gravure"]
    │
    ▼
GravureQuotesSidebar ← quotes prop (list)
    │  user clicks row
    ▼
GravureQuoteModal (invoice view + delete)
```

---

## LocalStorage Keys

| Key                       | Contents                                                                    | Managed by          |
| ------------------------- | --------------------------------------------------------------------------- | ------------------- |
| `gravure-material-values` | `{ [materialKey]: { price, micron, qty } }` — last-used values per material | `GravureForm.jsx`   |
| `gravure-pouch-sizes`     | Array of custom pouch size strings                                          | `CreatableCombobox` |
| `gravure-normal-colors`   | History of normal color count entries                                       | `CreatableCombobox` |
| `gravure-metallic-colors` | History of metallic color count entries                                     | `CreatableCombobox` |
| `gravure-wastage`         | History of custom wastage % entries                                         | `CreatableCombobox` |
| `gravure-microns`         | History of micron values                                                    | `CreatableCombobox` |
| `quotes-gravure`          | Array of saved quote objects                                                | `quoteStorage.js`   |

---

## Shared Utilities & Components

These are already abstracted for reuse in future calculators:

### `components/ui/IOSToggle.jsx`

```jsx
<IOSToggle on={boolean} onToggle={() => void} />
```

iOS-style pill toggle. Used for material enable, matt finish, slitting.

### `components/ui/CheckBox.jsx`

```jsx
<CheckBox checked={boolean} />
```

Read-only circular tinted checkmark. Used inside `LaminationRow`.

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

### `utils/format.js`

```js
import { fmt, formatDate } from "../../../utils/format";
fmt(12345.6); // "12,345.60"
formatDate(isoString); // "26 Feb 2026, 09:15 am"
```

### `utils/quoteStorage.js`

```js
getQuotes(calcKey); // → array, newest first
saveQuote(calcKey, data); // prepends, returns new array
deleteQuote(calcKey, id); // removes by id, returns new array
```

### `constants/gravureRates.js`

All rate constants + `MATERIAL_NAMES` map. Import what you need.

---

## Future / DB Integration Points

| What                                          | Where to change                                           | Notes                                                                                      |
| --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Charge rates (printing, lam, slitting, pouch) | `constants/gravureRates.js`                               | Replace hardcoded exports with API fetch; shape of imported object stays the same          |
| Pouch rate lookup                             | `utils/calculators/gravureRate.js` — `POUCH_RATE_BY_SIZE` | Will become a DB table keyed by size string                                                |
| Material prices as defaults                   | `GravureForm.jsx` — `makeInitialForm()`                   | Pre-populate from a product catalogue                                                      |
| Quote persistence                             | `utils/quoteStorage.js`                                   | Swap `localStorage` reads/writes for REST API calls; `calcKey` maps to DB table/collection |
| User attribution                              | `index.jsx` — `handleSave`                                | Pass `savedBy: currentUser.name` when auth is wired up                                     |
