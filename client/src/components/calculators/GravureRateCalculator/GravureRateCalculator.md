# Gravure Rate Calculator

> Internal calculator for estimating per-kg printing rates for gravure (rotogravure) packaging jobs. Used daily by the Eastman Colour Printers team to generate customer quotes.

Reference: [`Gravure Rate Calculation.jpeg`](../../../assets/reference_bills/Gravure%20Rate%20Calculation.jpeg)

---

## Formula

```
Price per kg = Adjusted Total ÷ Total Material Qty

Where:
  Total Cost     = Material Cost + Charges per kg
  Wastage Amount = Total Cost × (Wastage% ÷ 100)
  Adjusted Total = Total Cost + Wastage Amount
```

### Worked example (from reference sheet)

| Material  | Price (₹/kg) | Qty (kg) | Amount (₹) |
| --------- | ------------ | -------- | ---------- |
| Polyester | 120          | 1.00     | 120.00     |
| L.D. Roll | 130          | 2.79     | 362.70     |

- **Material cost** = 120 + 362.70 = **₹482.70**
- **Charges per kg** (printing + lamination + slitting + pouch) = e.g. ₹42
- **Total cost** = 482.70 + 42 = **₹524.70**
- **Wastage** (5%) = 524.70 × 0.05 = **₹26.24**
- **Adjusted total** = 524.70 + 26.24 = **₹550.94**
- **Total qty** = 1.00 + 2.79 = **3.79 kg**
- **Price per kg** = 550.94 ÷ 3.79 = **₹145.37/kg**

---

## Form Fields

### 1. Customer / Quote Name

| Property    | Value                        |
| ----------- | ---------------------------- |
| Type        | Text input                   |
| Required    | Yes (for saving)             |
| Validation  | Non-empty, unique name       |
| Persistence | Not persisted between resets |

### 2. Materials

Four materials, each with a toggle + three sub-fields:

| Key         | Display Name | Default State |
| ----------- | ------------ | ------------- |
| `polyester` | Polyester    | Enabled       |
| `silverPet` | Silver PET   | Disabled      |
| `ldRoll`    | L.D. Roll    | Disabled      |
| `bopp`      | B.O.P.P.     | Disabled      |

**Sub-fields per material:**

| Field  | Type            | Unit | Stored in localStorage          |
| ------ | --------------- | ---- | ------------------------------- |
| Price  | Number input    | ₹/kg | Yes (`gravure-material-values`) |
| Micron | CreatableSelect | μ    | Yes (`gravure-material-values`) |
| Qty    | CreatableSelect | kg   | Yes (`gravure-material-values`) |

> Material prices, microns, and quantities persist across sessions via `localStorage` key `gravure-material-values`. This allows daily rate updates without re-entering static dimensions.

### 3. Pouch Size

| Property        | Value                               |
| --------------- | ----------------------------------- |
| Type            | CreatableSelect (dropdown + custom) |
| Default options | `4x6`, `5x7`, `6x8`, `7x10`         |
| Storage key     | `gravure-pouch-sizes`               |
| Used for        | Pouch making charge rate lookup     |

### 4. Printing Charges

| Field           | Type   | Range | Rate constant         | Rate (₹/kg) |
| --------------- | ------ | ----- | --------------------- | ----------- |
| Normal Colors   | Number | 0–12  | `NORMAL_COLOR_RATE`   | 5 per color |
| Metallic Colors | Number | 0–12  | `METALLIC_COLOR_RATE` | 8 per color |
| Matt Finish     | Toggle | —     | `MATT_FINISH_RATE`    | 3 flat      |

**Printing rate per kg** = `(normalColors × 5) + (metallicColors × 8) + (mattFinish ? 3 : 0)`

### 5. Lamination

| Option | Rate constant     | Rate (₹/kg) |
| ------ | ----------------- | ----------- |
| None   | —                 | 0           |
| Single | `SINGLE_LAM_RATE` | 12          |
| Double | `DOUBLE_LAM_RATE` | 20          |

Type: Radio pill group (None / Single / Double).

### 6. Slitting Charges

| Property | Value                   |
| -------- | ----------------------- |
| Type     | Toggle (on/off)         |
| Rate     | `SLITTING_RATE` = ₹4/kg |

### 7. Wastage

| Property        | Value                                   |
| --------------- | --------------------------------------- |
| Type            | CreatableSelect (inline, with `%` unit) |
| Default options | 0, 1, 2, 3, 4, 5, 8, 10                 |
| Storage key     | `gravure-wastage`                       |

Wastage is applied as a percentage surcharge on the total cost, **not** on quantity.

---

## Charge Rates (constants)

All rates are defined in `constants/gravureRates.js`. These are hardcoded placeholders that will be replaced by backend/DB values in Phase 2.

| Constant              | Value | Unit           |
| --------------------- | ----- | -------------- |
| `NORMAL_COLOR_RATE`   | 5     | ₹ per color/kg |
| `METALLIC_COLOR_RATE` | 8     | ₹ per color/kg |
| `MATT_FINISH_RATE`    | 3     | ₹/kg           |
| `SINGLE_LAM_RATE`     | 12    | ₹/kg           |
| `DOUBLE_LAM_RATE`     | 20    | ₹/kg           |
| `SLITTING_RATE`       | 4     | ₹/kg           |
| `DEFAULT_POUCH_RATE`  | 15    | ₹/kg           |

**Pouch rate by size:**

| Size | Rate (₹/kg) |
| ---- | ----------- |
| 4x6  | 15          |
| 5x7  | 18          |
| 6x8  | 20          |
| 7x10 | 25          |

---

## Calculation Logic

Pure function: `utils/calculators/gravureRate.js` → `calculateGravureRate(form)`

**Input:** form state object  
**Output:** result object (or `null` if no enabled materials / zero qty)

### Result object shape

```js
{
  materialLines,       // [{ key, enabled, price, qty, amount }]
  totalMaterialQty,    // sum of enabled material quantities
  totalMaterialCost,   // sum of (price × qty) for enabled materials
  printingRatePerKg,   // printing charge total (₹/kg)
  laminationRatePerKg, // lamination charge (₹/kg)
  slittingRatePerKg,   // slitting charge (₹/kg)
  pouchRatePerKg,      // pouch making charge (₹/kg)
  totalChargesPerKg,   // sum of all per-kg charges
  totalCost,           // materialCost + chargesPerKg
  wastagePercent,      // from form input
  wastageAmount,       // totalCost × (wastage% / 100)
  adjustedTotal,       // totalCost + wastageAmount
  pricePerKg,          // adjustedTotal / totalMaterialQty — THE FINAL ANSWER
}
```

### Step-by-step

1. **Materials** — for each enabled material: `amount = price × qty`. Sum all amounts → `totalMaterialCost`. Sum all qty → `totalMaterialQty`. If qty is 0, return `null`.
2. **Printing** — `normalColors × 5 + metallicColors × 8 + (mattFinish ? 3 : 0)`
3. **Lamination** — lookup by radio: none = 0, single = 12, double = 20
4. **Slitting** — toggle: on = 4, off = 0
5. **Pouch** — lookup `POUCH_RATE_BY_SIZE[pouchSize]`, fallback to 15
6. **Total cost** = `totalMaterialCost + printingRate + laminationRate + slittingRate + pouchRate`
7. **Wastage** = `totalCost × (wastage% / 100)`
8. **Adjusted total** = `totalCost + wastageAmount`
9. **Price per kg** = `adjustedTotal / totalMaterialQty`

> **Note:** Charges (printing, lamination, slitting, pouch) are flat per-kg rates added to material cost — they are NOT multiplied by material quantity. Only wastage is applied as a percentage on the full total.

---

## Data Flow

```
┌─────────────────────┐
│    GravureForm      │  form state (controlled)
│  (forwardRef)       │──── onProceed(form) ────┐
└─────────────────────┘                         │
                                                ▼
┌─────────────────────┐              ┌──────────────────────┐
│  GravureRateCalc    │◄─────────────│  calculateGravureRate │
│  (index.jsx)        │   result     │  (pure function)      │
│                     │              └──────────────────────┘
│  handleSave()       │──── saveQuote() ────▶ localStorage
│  handleReset()      │──── formRef.reset() ──▶ GravureForm
│  handlePrint()      │──── window.print()
└────────┬────────────┘
         │ result + form
         ▼
┌─────────────────────┐
│   GravureResult     │  Invoice-style breakdown card
│   (breakdown)       │  Sections: Materials → Printing → Charges → Adjustments → Total
└─────────────────────┘
```

---

## File Structure

```
GravureRateCalculator/
├── GravureRateCalculator.jsx    Container: state, refs, save/print/reset, 2-col grid layout
├── GravureForm.jsx              Controlled form with forwardRef + reset()
├── GravureResult.jsx            Invoice breakdown card (reused by saved quotes)
├── GravureSavedQuotes.jsx       Saved quotes list view with search + breakdown panel
├── QuoteListItem.jsx            Presentational quote row (name, price, date, savedBy)
├── MaterialRow.jsx              Single material toggle + price/micron/qty inputs
├── formConfig.js                MATERIALS config, localStorage helpers, makeInitialForm()
└── GravureRateCalculator.md     This file
```

### File responsibilities

| File                        | Role                                                                                                                                                                                                                                                                                              | LOC  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `GravureRateCalculator.jsx` | Container — `useState` (form, result, saveError), `useRef` (formRef), save/print/reset handlers. Renders 2-column grid: form left, result right.                                                                                                                                                  | ~100 |
| `GravureForm.jsx`           | Controlled form via `forwardRef`. Uses compound form components (`FormStack`, `FormSection`, `TextField`, `NumberField`, `ToggleField`, `RadioField`, `SelectField`). Calls `onProceed(form)` in every field change event handler (not `useEffect`). Exposes `reset()` via `useImperativeHandle`. | ~130 |
| `GravureResult.jsx`         | Stateless invoice breakdown. Sections: Materials, Printing, Other Charges, Adjustments. Uses invoice primitives (`InvoiceHeader`, `TableHeader`, `ItemRow`, `SectionLabel`, `SectionSubtotal`, `InvoiceFooter`). Accepts optional `status` and `date` props for saved-quote context.              | ~180 |
| `GravureSavedQuotes.jsx`    | Saved quotes view — quote list with search (left) + `GravureResult` breakdown (right). Listens for `quotes-updated` CustomEvent. Delete with auto-select-next.                                                                                                                                    | ~120 |
| `QuoteListItem.jsx`         | Presentational button row — quote name, ₹/kg price, date, savedBy. Uses `.quote-list-item` CSS classes.                                                                                                                                                                                           | ~45  |
| `MaterialRow.jsx`           | Single material row — IOSToggle + 3-col grid (price input, micron CreatableSelect, qty CreatableSelect). Disabled state via opacity.                                                                                                                                                              | ~45  |
| `formConfig.js`             | `MATERIALS` list, `storeMaterialField()`, `makeInitialForm()` with localStorage hydration.                                                                                                                                                                                                        | ~85  |

---

## Quote Storage

| Key                  | Value                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **localStorage key** | `quotes-gravure`                                                                                 |
| **CALC_KEY**         | `"gravure"`                                                                                      |
| **Storage helpers**  | `getQuotes()`, `saveQuote()`, `deleteQuote()` from `utils/quoteStorage.js` |

### Saved quote shape

```js
{
  id: "1711526100000",           // Date.now() string
  savedAt: "2026-03-27T09:15Z",  // ISO timestamp
  quoteName: "Rajesh Traders",   // customer name
  pouchSize: "5x7",              // for display
  pricePerKg: 214.75,            // for list display
  form: { ... },                 // full form snapshot — used to recalculate on load
}
```

### Save validation (in order)

1. **Empty name** → `"Enter a customer name before saving."`
2. **Duplicate name** (case-insensitive) → `` `A quote named "${name}" already exists. Use a different name.` ``
3. **No calculable result** → `"Fill in required fields before saving."`

Errors display inline below the "Customer / Quote Name" field as a red ring + error text.

### Cross-component sync

Save and delete actions dispatch `CustomEvent("quotes-updated")` on `window`. Listeners:

- `GravureSavedQuotes` — refreshes quote list
- `useQuoteCounts` hook — updates sidebar badge count

---

## Saved Quotes View

**Route:** `activeView = "gravure-quotes"` (via sidebar sub-nav)

**Layout:** 2-column grid (same as calculator)

- **Left panel** — search bar + quote list grouped by month
- **Right panel** — `GravureResult` breakdown of selected quote (reuses the same component as the calculator view)

**Features:**

- Search: filters by quote name (case-insensitive substring match)
- Grouping: quotes grouped by month label (e.g. "March 2026") with separator lines
- Selection: click to select, breakdown updates instantly
- Delete: removes quote, auto-selects next item, dispatches `quotes-updated`
- Print: `window.print()` with `@media print` CSS targeting `[data-print-area]`

**Persistence:** View is mounted persistently in `AppShell` (CSS `display: none/block`) to preserve selection and search state across navigation.

---

## localStorage Keys

| Key                       | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `quotes-gravure`          | Saved quote array                                   |
| `gravure-material-values` | Material price/micron/qty persistence across resets |
| `gravure-pouch-sizes`     | Custom pouch sizes added by user                    |
| `gravure-microns`         | Custom micron values                                |
| `gravure-wastage`         | Custom wastage percentages                          |

---

## Status

| Feature                             | Status      |
| ----------------------------------- | ----------- |
| Calculator form                     | ✅ Complete |
| Live result breakdown               | ✅ Complete |
| Save with validation + toast        | ✅ Complete |
| Form reset after save               | ✅ Complete |
| Saved quotes list with search       | ✅ Complete |
| Saved quote breakdown               | ✅ Complete |
| Delete with auto-select             | ✅ Complete |
| Print (data-print-area)             | ✅ Complete |
| Export (PDF)                        | 🔲 Pending  |
| Backend persistence (Phase 2)       | 🔲 Pending  |
| Rate settings integration (Phase 3) | 🔲 Pending  |
