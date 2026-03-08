# Job Cost Calculator

A React-based calculator for computing the **cost of a job** in flexible packaging production. Operators enter job metadata (job card number, billing details, company names), line-item costs for materials and charges, and dispatch weight. The calculator returns the cost of the job (total amount ÷ dispatch weight) and allows quotes to be saved locally.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Formula](#core-formula)
3. [Component Tree](#component-tree)
4. [File Structure](#file-structure)
5. [Form Fields Reference](#form-fields-reference)
6. [Calculation Breakdown](#calculation-breakdown)
7. [Default Prices](#default-prices)
8. [Data Flow](#data-flow)
9. [LocalStorage Keys](#localstorage-keys)
10. [Shared Utilities & Components](#shared-utilities--components)
11. [Key Differences from Other Calculators](#key-differences-from-other-calculators)
12. [Implementation Steps](#implementation-steps)
13. [Future / DB Integration Points](#future--db-integration-points)

---

## Overview

| Item                     | Value                          |
| ------------------------ | ------------------------------ |
| Calculator key (storage) | `job-cost`                     |
| Entry component          | `JobCostCalculator/index.jsx`  |
| Calculation util         | `utils/calculators/jobCost.js` |
| Quote storage util       | `utils/quoteStorage.js`        |
| Constants                | `constants/jobCost.js`         |

---

## Core Formula

```
Cost of Job = Total Amount / Dispatch Weight (kg)
```

Where:

```
Total Amount = Σ (amount_i)   for each ENABLED line item

For items 1–8 (materials & charges with quantity):
    amount_i = quantity_i (kg) × price_i (₹/kg)

For items 9–10 (flat charges — Transport Charge, Wastages):
    amount_i = price_i (₹)        — no quantity involved
```

Returns `null` if:

- Dispatch weight is 0 or empty (prevents division by zero)
- No line items are enabled
- Total amount is 0

### Important Notes

- **Finished Weight** is informational only — it is saved in the quote but does NOT affect the formula.
- **Billing Rate** is a user-entered field whose purpose is TBD by the client — it is saved in the quote but does NOT affect the formula.
- **No of Bundles** is informational only — no formula involvement.
- Each of the 10 line items has an **enable/disable toggle**. When toggled OFF, the row remains visible (greyed out) but its amount is **excluded** from the total.
- **Transport Charge** and **Wastages** are flat ₹ amounts (no quantity field), unlike items 1–8 which are quantity × price.

---

## Component Tree

```
JobCostCalculator/index.jsx              ← 3-col layout, ResizeObserver, quote I/O
├── JobCostForm.jsx                      ← All user inputs (col 1+2)
│   ├── MetadataSection                  ← Job card no, billing no, dates, dropdowns
│   │   ├── CreatableCombobox (ui/)      ← Job work company, transport, micron, colour
│   │   └── Date / number inputs         ← Dates, bundles, billing rate
│   ├── LineItemsSection                 ← 10 rows in a card
│   │   ├── LineItemRow (×8)             ← IOSToggle + qty input + price input + amount
│   │   └── FlatChargeRow (×2)           ← IOSToggle + price input + amount (no qty)
│   └── WeightFooter                     ← Finished weight, dispatch weight, result, save
│
├── JobCostResult.jsx                    ← Collapsible cost breakdown card (col 1+2)
│   └── Row                              ← Label / sub-label / value row
│
└── JobCostQuotesSidebar.jsx             ← Saved quotes list (col 3)
    └── JobCostQuoteModal.jsx            ← Full invoice modal (portal)
        ├── InvoiceRow
        └── SectionLabel
```

---

## File Structure

```
JobCostCalculator/
├── index.jsx                  ← Layout, ResizeObserver, state management
├── JobCostForm.jsx            ← Form UI + localStorage persistence
├── JobCostResult.jsx          ← Collapsible breakdown card
├── JobCostQuoteModal.jsx      ← Invoice detail modal (React portal)
├── JobCostQuotesSidebar.jsx   ← Quotes list sidebar
└── JobCostCalculator.md       ← This file

Shared (reusable across calculators):
src/
├── components/ui/
│   ├── IOSToggle.jsx          ← iOS-style toggle switch
│   ├── Icons.jsx              ← CloseIcon, TrashIcon, ChevronDownIcon
│   └── CreatableCombobox.jsx  ← Portal dropdown with localStorage options
├── utils/
│   ├── format.js              ← fmt(), formatDate()
│   └── calculators/
│       └── jobCost.js         ← Pure calculation function
├── utils/quoteStorage.js      ← getQuotes(), saveQuote(), deleteQuote()
└── constants/
    └── jobCost.js             ← Line item definitions, default prices, dropdown seeds
```

---

## Form Fields Reference

### Section 1: Job Metadata (top of form)

| Field            | Type                       | Default | Persisted via                 | Description                                  |
| ---------------- | -------------------------- | ------- | ----------------------------- | -------------------------------------------- |
| `quoteName`      | string (text input)        | `""`    | —                             | Customer / job name (required for save)      |
| `jobCardNo`      | string (text input)        | `""`    | —                             | Job card reference number (manual entry)     |
| `billingNo`      | string (text input)        | `""`    | —                             | Billing reference number (manual entry)      |
| `jobCardDate`    | date (date picker)         | today   | —                             | Date of job card                             |
| `billingDate`    | date (date picker)         | today   | —                             | Date of billing                              |
| `jobWorkCompany` | string (CreatableCombobox) | `""`    | `job-cost-job-work-companies` | Job work company name (saves new for reuse)  |
| `transport`      | string (CreatableCombobox) | `""`    | `job-cost-transports`         | Transport company name (saves new for reuse) |
| `noOfBundles`    | number                     | `""`    | —                             | Number of bundles (informational only)       |
| `micron`         | string (CreatableCombobox) | `""`    | `job-cost-microns`            | Micron thickness value (saves new for reuse) |
| `colour`         | string (CreatableCombobox) | `""`    | `job-cost-colours`            | Colour description (saves new for reuse)     |
| `billingRate`    | number                     | `""`    | —                             | User-entered rate (purpose TBD by client)    |

### Section 2: Line Items (10 rows, each toggleable)

Each line item has: **enabled** (toggle), **quantity** (kg, items 1–8 only), **price** (₹/kg or flat ₹), **amount** (computed).

| #   | Key                  | Display Name         | Has Qty? | Price Unit | Amount Formula   |
| --- | -------------------- | -------------------- | -------- | ---------- | ---------------- |
| 1   | `polyster`           | Polyster             | ✅ kg    | ₹/kg       | `qty × price`    |
| 2   | `silverPolyster`     | Silver Polyster      | ✅ kg    | ₹/kg       | `qty × price`    |
| 3   | `boppSilver`         | B.O.P.P / Silver     | ✅ kg    | ₹/kg       | `qty × price`    |
| 4   | `ldnLdop`            | L.D.N. / L.D.op.     | ✅ kg    | ₹/kg       | `qty × price`    |
| 5   | `printingCharges`    | Printing Charges     | ✅ kg    | ₹/kg       | `qty × price`    |
| 6   | `laminationCharges`  | Lamination Charges   | ✅ kg    | ₹/kg       | `qty × price`    |
| 7   | `slittingCharges`    | Slitting Charges     | ✅ kg    | ₹/kg       | `qty × price`    |
| 8   | `pouchMakingCharges` | Pouch Making Charges | ✅ kg    | ₹/kg       | `qty × price`    |
| 9   | `transportCharge`    | Transport Charge     | ❌       | flat ₹     | `price` (no qty) |
| 10  | `wastages`           | Wastages             | ❌       | flat ₹     | `price` (no qty) |

Each line item's state shape:

```js
{
  enabled: true,    // IOSToggle ON/OFF
  qty: "",          // kg (items 1–8 only; items 9–10 omit this)
  price: "",        // ₹/kg (items 1–8) or flat ₹ (items 9–10)
}
```

**Toggle OFF behavior:** Row stays visible but is visually greyed out (reduced opacity, disabled inputs). The item's amount is excluded from the Total Amount calculation.

### Section 3: Weight & Output (bottom of form)

| Field            | Type   | Default | Description                                         |
| ---------------- | ------ | ------- | --------------------------------------------------- |
| `finishedWeight` | number | `""`    | Finished weight in kg (informational only)          |
| `dispatchWeight` | number | `""`    | Dispatch weight in kg (used in Cost of Job formula) |

---

## Calculation Breakdown

The `calculateJobCost(form)` function in `utils/calculators/jobCost.js` returns an object with:

| Property         | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `lineItems`      | Array of `{ key, label, enabled, qty, price, amount }` for all 10 items |
| `enabledItems`   | Array of only the enabled items (for display filtering)                 |
| `totalAmount`    | Sum of `amount` for all enabled items (₹)                               |
| `finishedWeight` | Parsed finished weight (kg) — informational                             |
| `dispatchWeight` | Parsed dispatch weight (kg) — used in formula                           |
| `costOfJob`      | `totalAmount / dispatchWeight` (₹/kg)                                   |

### Amount Calculation per Item

```
For items with quantity (1–8):
    amount = parseFloat(qty) × parseFloat(price)
    amount = 0 if qty or price is empty/NaN

For flat items (9–10):
    amount = parseFloat(price)
    amount = 0 if price is empty/NaN

If item is disabled (toggle OFF):
    amount = 0 (excluded from total regardless of qty/price values)
```

---

## Default Prices

All defaults are defined in `constants/jobCost.js`. These are **dummy placeholder values** — the user will update them with real rates later. Eventually these will be loaded from the backend.

### Line Item Definitions

```js
LINE_ITEMS = [
  { key: "polyster", label: "Polyster", hasQty: true, defaultPrice: 200 },
  {
    key: "silverPolyster",
    label: "Silver Polyster",
    hasQty: true,
    defaultPrice: 250,
  },
  {
    key: "boppSilver",
    label: "B.O.P.P / Silver",
    hasQty: true,
    defaultPrice: 180,
  },
  {
    key: "ldnLdop",
    label: "L.D.N. / L.D.op.",
    hasQty: true,
    defaultPrice: 160,
  },
  {
    key: "printingCharges",
    label: "Printing Charges",
    hasQty: true,
    defaultPrice: 30,
  },
  {
    key: "laminationCharges",
    label: "Lamination Charges",
    hasQty: true,
    defaultPrice: 15,
  },
  {
    key: "slittingCharges",
    label: "Slitting Charges",
    hasQty: true,
    defaultPrice: 8,
  },
  {
    key: "pouchMakingCharges",
    label: "Pouch Making Charges",
    hasQty: true,
    defaultPrice: 20,
  },
  {
    key: "transportCharge",
    label: "Transport Charge",
    hasQty: false,
    defaultPrice: 500,
  },
  { key: "wastages", label: "Wastages", hasQty: false, defaultPrice: 300 },
];
```

### CreatableCombobox Dropdown Seeds

| Dropdown         | Default Options                                                   |
| ---------------- | ----------------------------------------------------------------- |
| `jobWorkCompany` | `["Company A", "Company B", "Company C"]`                         |
| `transport`      | `["Transport Co 1", "Transport Co 2", "Transport Co 3"]`          |
| `micron`         | `["12", "15", "20", "25", "30", "40", "50"]`                      |
| `colour`         | `["1 Colour", "2 Colour", "3 Colour", "4 Colour", "Multicolour"]` |

> These are seed values for the CreatableCombobox dropdowns. Users can type new values and they will be persisted to localStorage for future reuse.

---

## Data Flow

```
User input
    │
    ▼
JobCostForm (form state)
    │  setField() calls onProceed(form) in event handler
    ▼
index.jsx (handleFormChange)
    │  calculateJobCost(form) → result
    ▼
JobCostResult ← result prop (live breakdown)
JobCostForm   ← result prop (cost of job in footer)
    │
    │  user clicks "Save Quote"
    ▼
index.jsx (handleSave)
    │  saveQuote("job-cost", { ...form data, costOfJob, savedAt })
    ▼
quoteStorage.js → localStorage["quotes-job-cost"]
    │
    ▼
JobCostQuotesSidebar ← quotes prop (list)
    │  user clicks row
    ▼
JobCostQuoteModal (invoice view + delete)
```

---

## LocalStorage Keys

| Key                           | Contents                                                | Managed by          |
| ----------------------------- | ------------------------------------------------------- | ------------------- |
| `job-cost-field-values`       | `{ items: { [key]: { qty, price } }, ... }` — last-used | `JobCostForm.jsx`   |
| `job-cost-job-work-companies` | Array of custom job work company name strings           | `CreatableCombobox` |
| `job-cost-transports`         | Array of custom transport company name strings          | `CreatableCombobox` |
| `job-cost-microns`            | Array of custom micron value strings                    | `CreatableCombobox` |
| `job-cost-colours`            | Array of custom colour strings                          | `CreatableCombobox` |
| `quotes-job-cost`             | Array of saved quote objects                            | `quoteStorage.js`   |

---

## Shared Utilities & Components

These are already abstracted and shared across calculators:

### `components/ui/IOSToggle.jsx`

```jsx
<IOSToggle on={boolean} onToggle={() => void} />
```

iOS-style pill toggle. Used for enabling/disabling each of the 10 line items.

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
- Used for: job work company, transport, micron, colour

### `utils/format.js`

```js
import { fmt, formatDate } from "../../../utils/format";
fmt(12345.6); // "12,345.60"
formatDate(isoString); // "26 Feb 2026, 09:15 am"
```

### `utils/quoteStorage.js`

```js
getQuotes("job-cost"); // → array, newest first
saveQuote("job-cost", data); // prepends, returns new array
deleteQuote("job-cost", id); // removes by id, returns new array
```

---

## Key Differences from Other Calculators

| Aspect                | Gravure Rate Calculator               | Flexo Rate Calculator         | Job Cost Calculator                              |
| --------------------- | ------------------------------------- | ----------------------------- | ------------------------------------------------ |
| **Output**            | Price per kg                          | Overall rate (single number)  | Cost of Job (₹/kg = total ÷ dispatch weight)     |
| **Materials**         | 4 toggleable (price × qty each)       | Single material price input   | 4 material rows + 4 charge rows + 2 flat         |
| **Line items**        | Not explicit rows                     | Not explicit rows             | 10 explicit toggleable rows                      |
| **Quantity handling** | All charges scale by total qty        | No qty — all charges flat     | Per-item qty (items 1–8), no qty (items 9–10)    |
| **Printing**          | Color counts → per-kg rate            | Direct ₹ value                | Qty × price line item                            |
| **Lamination**        | Single/double toggle                  | Not present                   | Qty × price line item                            |
| **Slitting**          | Toggle + per-kg rate                  | Not present                   | Qty × price line item                            |
| **Pouch Making**      | Size lookup → per-kg rate             | Not present                   | Qty × price line item                            |
| **Toggle charges**    | Matt finish only                      | Gusset, punching, opack       | Every line item is toggleable                    |
| **Transport**         | Not present                           | Not present                   | Flat ₹ line item                                 |
| **Wastage**           | Percentage of total cost              | Percentage of subtotal        | Flat ₹ line item (not %)                         |
| **Weight inputs**     | Not present                           | Not present                   | Finished weight + dispatch weight                |
| **Metadata fields**   | Quote name only                       | Quote name only               | Job card no, billing no, dates, company, etc.    |
| **Date pickers**      | Not present                           | Not present                   | Job card date + billing date                     |
| **Company dropdowns** | Not present                           | Not present                   | Job work company + transport (CreatableCombobox) |
| **Formula structure** | (sum of scaled costs + wastage) / qty | Sum of flat rates + % wastage | Sum of line items / dispatch weight              |

---

## Implementation Steps

### Phase 1: Constants & Calculation Logic

**Step 1 — Create `constants/jobCost.js`**

Export these:

- `LINE_ITEMS` — array of 10 item definitions `{ key, label, hasQty, defaultPrice }` (see [Default Prices](#default-prices))
- `JOB_WORK_COMPANY_OPTIONS` — array of seed company names
- `TRANSPORT_OPTIONS` — array of seed transport company names
- `MICRON_OPTIONS` — array of seed micron values
- `COLOUR_OPTIONS` — array of seed colour values
- `SAMPLE_QUOTES` — 5–7 sample quote objects (seed data for sidebar)

**Step 2 — Create `utils/calculators/jobCost.js`** _(depends on step 1)_

Pure function `calculateJobCost(form)`:

- Iterate over all 10 items from `form.items`
- For each enabled item with `hasQty`: `amount = qty × price`
- For each enabled flat item: `amount = price`
- Disabled items contribute `amount = 0`
- Compute `totalAmount` = sum of all enabled amounts
- Parse `dispatchWeight` from form
- Return `null` if `dispatchWeight` is 0/empty or `totalAmount` is 0
- Otherwise return breakdown object with `costOfJob = totalAmount / dispatchWeight`

### Phase 2: UI Components

**Step 3 — Create `JobCostForm.jsx`** _(depends on step 1)_

Follow `GravureForm.jsx` patterns:

- Controlled form state with `useState(() => makeInitialForm())`
- `setField()` updates state + calls `onProceed(form)` in the same event handler
- **Metadata card** (top):
  - Row 1: Quote Name (text input)
  - Row 2: Job Card No + Billing No (2-column)
  - Row 3: Job Card Date + Billing Date (2-column, native `<input type="date">`, default to today)
  - Row 4: Job Work Company + Transport (2-column, `CreatableCombobox`)
  - Row 5: No of Bundles + Micron + Colour (3-column)
  - Row 6: Billing Rate (number input)
- **Line items card** (middle):
  - Header row: Item | Qty (kg) | Price (₹/kg) | Amount (₹)
  - 8 rows (items 1–8): `IOSToggle` | number input | number input | computed `₹ fmt(amount)`
  - 2 rows (items 9–10): `IOSToggle` | — | number input (flat ₹) | computed `₹ fmt(amount)`
  - Toggle OFF → row gets `opacity-40` + inputs are `disabled`
  - Footer in card: **Total Amount** = `₹ fmt(sum)`
- **Weight & output card** (bottom):
  - Finished Weight (kg) | Dispatch Weight (kg)
  - Result display: **Cost of Job** = `₹ fmt(costOfJob)` per kg
  - "Save Quote" button + save error display
- Persist item quantities and prices to `localStorage["job-cost-field-values"]`

**Step 4 — Create `JobCostResult.jsx`** _(parallel with step 3)_

Follow `GravureResult.jsx` pattern:

- Collapsible card with chevron toggle
- Line-item rows (only enabled items shown):
  - For qty items: `label` — `qty kg × ₹price/kg` — `₹amount`
  - For flat items: `label` — `₹amount`
  - Divider
  - **Total Amount** → `₹ fmt(totalAmount)`
  - Dispatch Weight → `fmt(dispatchWeight) kg`
  - Divider
  - **Cost of Job** → `₹ fmt(costOfJob) /kg` (bold, highlighted)

**Step 5 — Create `JobCostQuoteModal.jsx`** _(parallel with step 3)_

Follow `GravureQuoteModal.jsx` pattern:

- React portal modal
- Header: quote name, saved date, saved by
- Metadata section: job card no, billing no, dates, company, transport, micron, colour, bundles, billing rate
- Invoice section: all 10 line items (enabled items with amounts, disabled items marked as "—")
- Weight section: finished weight, dispatch weight
- **Cost of Job** highlighted at bottom
- Delete button with confirmation
- Close on overlay click / Escape key

**Step 6 — Create `JobCostQuotesSidebar.jsx`** _(parallel with step 3)_

Follow `GravureQuotesSidebar.jsx` pattern:

- Sticky sidebar (col 3)
- List of saved quotes showing: quote name, cost of job (₹/kg), date
- Click row → opens `JobCostQuoteModal`
- Dynamic `maxHeight` from parent (ResizeObserver-driven)

### Phase 3: Integration

**Step 7 — Rewrite `JobCostCalculator/index.jsx`** _(depends on steps 2–6)_

Follow `GravureRateCalculator/index.jsx` pattern:

- `CALC_KEY = "job-cost"`
- `getInitialQuotes()` — seed with `SAMPLE_QUOTES` if empty
- State: `result`, `quotes`, `formHeight`, `saveError`
- Refs: `formRef`
- ResizeObserver for form height → drives sidebar `maxHeight`
- `handleFormChange(form)` → `calculateJobCost(form)` → `setResult`
- `handleSave(form)` → validate → `saveQuote("job-cost", { quoteName, costOfJob, form })`
- `handleDelete(id)` → `deleteQuote("job-cost", id)`
- 3-column grid: form + result (col 1–2) | sidebar (col 3)

---

## Saved Quote Object Shape

Each saved quote in `localStorage["quotes-job-cost"]` has this structure:

```js
{
  id: "1709abc123",              // generated by quoteStorage.js (Date.now())
  savedAt: "2026-03-08T...",     // ISO timestamp
  savedBy: "Arun",              // TODO: replace with logged-in user
  quoteName: "Rajesh Traders — March Job",
  costOfJob: 245.60,            // for sidebar display (₹/kg)
  form: {                       // complete form snapshot for modal re-display
    quoteName: "Rajesh Traders — March Job",
    jobCardNo: "JC-2026-0042",
    billingNo: "BL-2026-0108",
    jobCardDate: "2026-03-08",
    billingDate: "2026-03-08",
    jobWorkCompany: "Company A",
    transport: "Transport Co 1",
    noOfBundles: "12",
    micron: "20",
    colour: "3 Colour",
    billingRate: "280",
    items: {
      polyster:           { enabled: true,  qty: "50",  price: "200" },
      silverPolyster:     { enabled: true,  qty: "30",  price: "250" },
      boppSilver:         { enabled: false, qty: "",    price: "180" },
      ldnLdop:            { enabled: true,  qty: "20",  price: "160" },
      printingCharges:    { enabled: true,  qty: "100", price: "30"  },
      laminationCharges:  { enabled: true,  qty: "100", price: "15"  },
      slittingCharges:    { enabled: true,  qty: "100", price: "8"   },
      pouchMakingCharges: { enabled: false, qty: "",    price: "20"  },
      transportCharge:    { enabled: true,  price: "500" },
      wastages:           { enabled: true,  price: "300" },
    },
    finishedWeight: "95",
    dispatchWeight: "92",
  }
}
```

---

## Line Item Row Layout

Each line item row in the form uses a 4-column grid:

```
┌──────────┬────────────────┬────────────────┬──────────────┐
│ Toggle   │ Qty (kg)       │ Price (₹/kg)   │ Amount (₹)   │
│ + Label  │ number input   │ number input   │ computed     │
└──────────┴────────────────┴────────────────┴──────────────┘
```

For flat items (Transport Charge, Wastages) — the Qty column is empty:

```
┌──────────┬────────────────┬────────────────┬──────────────┐
│ Toggle   │      —         │ Amount (₹)     │              │
│ + Label  │                │ number input   │              │
└──────────┴────────────────┴────────────────┴──────────────┘
```

When toggle is OFF, the entire row gets `opacity-40` and all inputs become `disabled`.

---

## Verification Checklist

1. Switch to "Job Cost" tab → form renders with metadata + line items + weight fields
2. Toggle each line item ON/OFF → greyed-out styling applied, total recalculates
3. Enter qty × price for items 1–8 → amounts compute correctly, total updates
4. Enter flat ₹ for items 9–10 → amounts show correctly, total updates
5. Enter dispatch weight → **Cost of Job** appears in real-time
6. Dispatch weight = 0 or empty → result is `null` (no Cost of Job shown)
7. All 10 items disabled → result is `null`
8. Click "Save Quote" with empty name → error: "Enter a customer name before saving."
9. Click "Save Quote" with duplicate name → error: "A quote named "X" already exists."
10. Click "Save Quote" with no result → error: "Fill in required fields before saving."
11. Saved quote appears in sidebar with Cost of Job value
12. Click sidebar quote → modal opens with full metadata + line items + weights
13. Delete quote from modal → removed from sidebar
14. CreatableCombobox fields (`jobWorkCompany`, `transport`, `micron`, `colour`) persist new entries in localStorage
15. Date pickers default to today's date
16. Refresh page → persisted field values and quotes survive
17. Dark mode toggle → all colors use semantic tokens correctly
18. Responsive: 3-column grid collapses to stacked layout on mobile
19. No `console.log` statements, no lint errors

---

## Future / DB Integration Points

| What                                      | Where to change                          | Notes                                                                                |
| ----------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| Line item default prices                  | `constants/jobCost.js` — `LINE_ITEMS`    | Replace hardcoded defaults with API fetch; shape of imported array stays the same    |
| Job work company / transport name lists   | `constants/jobCost.js` — seed options    | Will become DB lookups; CreatableCombobox stays, just pre-populate from API          |
| Micron / colour option lists              | `constants/jobCost.js` — seed options    | Same as above                                                                        |
| Quote persistence                         | `utils/quoteStorage.js`                  | Swap `localStorage` reads/writes for REST API calls; `calcKey` maps to DB collection |
| User attribution                          | `index.jsx` — `handleSave`               | Pass `savedBy: currentUser.name` when auth is wired up                               |
| Billing Rate purpose                      | `JobCostForm.jsx` + `calculateJobCost()` | Wire into formula once client confirms its role                                      |
| Job card / billing number auto-generation | `JobCostForm.jsx` — `makeInitialForm()`  | Could auto-increment from DB sequence                                                |
