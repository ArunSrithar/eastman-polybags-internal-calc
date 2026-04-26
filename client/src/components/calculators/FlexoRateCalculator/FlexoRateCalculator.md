# Flexo Rate Calculator

> Internal calculator for estimating per-job printing rates for flexo (flexographic) packaging jobs. Used daily by the Eastman Colour Printers team to generate customer quotes.

Reference: [`Rate Calculation.jpeg`](../../../assets/reference_bills/Rate%20Calculation.jpeg)

---

## Formula

```
Total Rate = Subtotal × (1 + Wastage% ÷ 100)

Where:
  Subtotal = Material Price + Conversion Rate + Printing Rate
           + Gusset Rate + Punching Rate + Opack Rate + Cutting Size Rate
```

### Worked example

| Component       | Lookup / Value          | Amount (₹) |
| --------------- | ----------------------- | ----------- |
| Material Price  | (user input)            | 150.00      |
| Conversion Rate | PP × 8x6               | 18.00       |
| Printing Rate   | 10x12 × 2 colors       | 18.00       |
| Gusset Rate     | 10x12                  | 36.00       |
| Punching Rate   | off                    | 0.00        |
| Opack Rate      | on (fixed)             | 87.30       |
| Cutting Size    | size 8                 | 11.00       |
| **Subtotal**    |                        | **320.30**  |
| Wastage (3%)    | 320.30 × 0.03         | 9.61        |
| **Total Rate**  |                        | **329.91**  |

---

## Form Fields

### 1. Customer / Quote Name

| Property    | Value                        |
| ----------- | ---------------------------- |
| Type        | Text input                   |
| Required    | Yes (for saving)             |
| Validation  | Non-empty, unique name       |
| Persistence | Not persisted between resets |

### 2. Material Price

| Property | Value            |
| -------- | ---------------- |
| Type     | Number input     |
| Unit     | ₹               |
| Required | Yes (> 0)        |
| Default  | Empty            |

### 3. Conversion Material

| Property | Value                              |
| -------- | ---------------------------------- |
| Type     | Radio pill group                   |
| Options  | PP, HM, LD                        |
| Default  | PP                                 |
| Lookup   | `CONVERSION_RATES[material][rollSize]` |

Determines the conversion rate in combination with roll size.

### 4. Cover Size

| Property        | Value                               |
| --------------- | ----------------------------------- |
| Type            | CreatableSelect (dropdown + custom) |
| Default options | `8x10`, `10x12`, `12x14`, `14x16`, `16x18`, `18x20` |
| Storage key     | `flexo-cover-sizes`                 |
| Used for        | Printing rate lookup, gusset rate lookup |

### 5. Roll Size

| Property        | Value                               |
| --------------- | ----------------------------------- |
| Type            | CreatableSelect (inline)            |
| Default options | `4x3`, `6x4`, `8x6`, `10x8`, `12x10`, `14x12` |
| Storage key     | `flexo-roll-sizes`                  |
| Used for        | Conversion rate lookup              |

### 6. Printing Colors

| Property | Value                              |
| -------- | ---------------------------------- |
| Type     | Radio pill group                   |
| Options  | 1 Color, 2 Colors, 3 Colors, 4 Colors |
| Default  | 1                                  |
| Lookup   | `PRINTING_RATES[coverSize][colors]` |

### 7. Gusset

| Property | Value                          |
| -------- | ------------------------------ |
| Type     | Toggle (on/off)                |
| Lookup   | `GUSSET_RATES[coverSize]`      |

Rate varies by cover size (not a fixed constant).

### 8. Punching

| Property | Value                       |
| -------- | --------------------------- |
| Type     | Toggle (on/off)             |
| Rate     | `PUNCHING_RATE` = ₹72.31    |

### 9. Opack

| Property | Value                       |
| -------- | --------------------------- |
| Type     | Toggle (on/off)             |
| Rate     | `OPACK_RATE` = ₹87.30       |

### 10. Cutting Size

| Property        | Value                                   |
| --------------- | --------------------------------------- |
| Type            | CreatableSelect (inline)                |
| Default options | 4, 5, 6, 7, 8, 9, 10, 11, 12, 14       |
| Storage key     | `flexo-cutting-sizes`                   |
| Lookup          | `CUTTING_SIZE_RATES[cuttingSize]`        |

### 11. Wastage

| Property        | Value                                   |
| --------------- | --------------------------------------- |
| Type            | CreatableSelect (inline, with `%` unit) |
| Default options | 0, 1, 2, 3, 4, 5                        |
| Storage key     | `flexo-wastage`                         |

Wastage is applied as a percentage surcharge on the subtotal, **not** on quantity.

---

## Charge Rates (constants)

All rates are defined in `constants/flexoRateCalc.js`. These are hardcoded placeholders that will be replaced by backend/DB values in a later phase.

### Fixed toggle rates

| Constant        | Value  | Unit |
| --------------- | ------ | ---- |
| `PUNCHING_RATE` | 72.31  | ₹    |
| `OPACK_RATE`    | 87.30  | ₹    |

### Conversion rate lookup (`CONVERSION_RATES`)

materialType × rollSize → ₹ (placeholder values)

| Roll Size | PP    | HM    | LD    |
| --------- | ----- | ----- | ----- |
| 4x3       | 10.00 | 12.00 | 14.00 |
| 6x4       | 14.00 | 16.00 | 19.00 |
| 8x6       | 18.00 | 21.00 | 25.00 |
| 10x8      | 24.00 | 28.00 | 32.00 |
| 12x10     | 30.00 | 34.00 | 40.00 |
| 14x12     | 36.00 | 42.00 | 48.00 |

### Printing rate lookup (`PRINTING_RATES`)

coverSize × numColors → ₹ (placeholder values)

| Cover Size | 1 clr | 2 clr | 3 clr | 4 clr |
| ---------- | ----- | ----- | ----- | ----- |
| 8x10       | 8.00  | 14.00 | 20.00 | 26.00 |
| 10x12      | 10.00 | 18.00 | 25.00 | 32.00 |
| 12x14      | 12.00 | 22.00 | 30.00 | 38.00 |
| 14x16      | 14.00 | 26.00 | 35.00 | 44.00 |
| 16x18      | 16.00 | 30.00 | 40.00 | 50.00 |
| 18x20      | 18.00 | 34.00 | 45.00 | 56.00 |

### Gusset rate lookup (`GUSSET_RATES`)

coverSize → ₹ (placeholder values)

| Cover Size | Rate  |
| ---------- | ----- |
| 8x10       | 30.00 |
| 10x12      | 36.00 |
| 12x14      | 42.00 |
| 14x16      | 48.00 |
| 16x18      | 54.00 |
| 18x20      | 60.00 |

### Cutting size rate lookup (`CUTTING_SIZE_RATES`)

| Size | Rate  |
| ---- | ----- |
| 4    | 5.00  |
| 5    | 6.50  |
| 6    | 8.00  |
| 7    | 9.50  |
| 8    | 11.00 |
| 9    | 12.50 |
| 10   | 14.00 |
| 11   | 15.50 |
| 12   | 17.00 |
| 14   | 20.00 |

---

## Calculation Logic

Pure function: `utils/calculators/flexoRateCalc.js` → `calculateFlexoRate(form)`

**Input:** form state object
**Output:** result object (or `null` if materialPrice is 0 or empty)

### Result object shape

```js
{
  materialPrice,       // parsed number from form input
  conversionMaterial,  // "PP" | "HM" | "LD"
  conversionRate,      // CONVERSION_RATES[material][rollSize]
  rollSize,            // from form (e.g. "8x6")
  coverSize,           // from form (e.g. "10x12")
  printingColors,      // from form (e.g. "2")
  printingRate,        // PRINTING_RATES[coverSize][colors]
  gussetRate,          // GUSSET_RATES[coverSize] or 0
  punchingRate,        // PUNCHING_RATE or 0
  opackRate,           // OPACK_RATE or 0
  cuttingSize,         // from form (e.g. "8")
  cuttingSizeRate,     // CUTTING_SIZE_RATES[cuttingSize]
  subtotal,            // sum of all above
  wastagePercent,      // from form input
  wastageAmount,       // subtotal × (wastage% / 100)
  totalRate,           // subtotal + wastageAmount — THE FINAL ANSWER
}
```

### Step-by-step

1. **Material Price** — parse `materialPrice` from form. If 0, return `null`.
2. **Conversion Rate** — lookup `CONVERSION_RATES[conversionMaterial][rollSize]`, fallback 0.
3. **Printing Rate** — lookup `PRINTING_RATES[coverSize][printingColors]`, fallback 0.
4. **Gusset Rate** — if gusset toggle on, lookup `GUSSET_RATES[coverSize]`, fallback 0.
5. **Punching Rate** — if toggle on, use `PUNCHING_RATE` (72.31).
6. **Opack Rate** — if toggle on, use `OPACK_RATE` (87.30).
7. **Cutting Size Rate** — lookup `CUTTING_SIZE_RATES[cuttingSize]`, fallback 0.
8. **Subtotal** = sum of steps 1–7.
9. **Wastage** = `subtotal × (wastage% / 100)`.
10. **Total Rate** = `subtotal + wastageAmount`.

> **Key difference from Gravure:** Flexo calculates a flat total rate (₹), not a per-kg rate. There is no quantity/weight in the Flexo formula.

---

## Data Flow

```
┌─────────────────────┐
│    FlexoForm        │  form state (controlled)
│  (forwardRef)       │──── onProceed(form) ────┐
└─────────────────────┘                         │
                                                ▼
┌─────────────────────┐              ┌──────────────────────┐
│  FlexoRateCalc      │◄─────────────│  calculateFlexoRate   │
│  (container)        │   result     │  (pure function)      │
│                     │              └──────────────────────┘
│  handleSave()       │──── saveQuote() ────▶ localStorage
│  handleReset()      │──── formRef.reset() ──▶ FlexoForm
│  handlePrint()      │──── window.print()
└────────┬────────────┘
         │ result + form
         ▼
┌─────────────────────┐
│    FlexoResult      │  Invoice-style breakdown card
│   (breakdown)       │  Sections: Material → Printing → Charges → Adjustments → Total
└─────────────────────┘
```

---

## File Structure

```
FlexoRateCalculator/
├── FlexoRateCalculator.jsx    Container: state, refs, save/print/reset, 2-col grid layout
├── FlexoForm.jsx              Controlled form with forwardRef + reset()
├── FlexoResult.jsx            Invoice breakdown card (reused by saved quotes)
├── FlexoSavedQuotes.jsx       Saved quotes list view (wraps SavedQuotesView)
├── formConfig.js              Option arrays, makeInitialForm()
└── FlexoRateCalculator.md     This file
```

### File responsibilities

| File                       | Role                                                                                                                                                                                    | LOC  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `FlexoRateCalculator.jsx`  | Container — `useState` (form, result, saveError), `useRef` (formRef), save/print/reset handlers. Renders 2-column grid: form left, result right.                                       | ~100 |
| `FlexoForm.jsx`            | Controlled form via `forwardRef`. Uses compound form components. 6 sections: Customer, Material, Size & Printing, Additional Charges, Cutting, Wastage. Calls `onProceed(form)` on change. | ~155 |
| `FlexoResult.jsx`          | Stateless invoice breakdown. Sections: Material & Conversion, Printing, Additional Charges, Adjustments. Uses invoice primitives + `WastageRow`.                                        | ~170 |
| `FlexoSavedQuotes.jsx`     | Thin wrapper around `SavedQuotesView` with Flexo config + `formatFlexoPrice` (shows `₹X` not `₹X/kg`).                                                                                | ~20  |
| `formConfig.js`            | `makeInitialForm()`, derived option arrays (`ROLL_SIZE_OPTIONS`, `CUTTING_SIZE_OPTIONS`), re-exports from constants.                                                                    | ~35  |

---

## Quote Storage

| Key                  | Value                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **localStorage key** | `quotes-flexo-rate-calc`                                                                         |
| **CALC_KEY**         | `"flexo-rate-calc"`                                                                              |
| **Storage helpers**  | `getQuotes()`, `saveQuote()`, `deleteQuote()` from `utils/quoteStorage.js` |

### Saved quote shape

```js
{
  id,                // crypto.randomUUID()
  savedAt,           // ISO string
  savedBy,           // "Admin" (hardcoded, pending auth)
  quoteName,         // customer / quote name
  totalRate,         // final calculated total rate (₹)
  coverSize,         // from form (for display in list)
  form: { ... },     // full form state snapshot for recalculation
}
```

### Price display

Unlike Gravure (which shows `₹X/kg`), Flexo saved quotes display `₹X` (flat total rate). This is handled by the `formatFlexoPrice` function passed to `QuoteListItem` via `SavedQuotesView`.

---

## Invoice Breakdown Sections

The `FlexoResult` component renders 4 conditional sections using shared invoice primitives:

| Section              | Color   | Condition             | Rows                                          |
| -------------------- | ------- | --------------------- | --------------------------------------------- |
| Material & Conversion | Blue    | Always shown          | Material Price, Conversion (material/rollSize) |
| Printing             | Green   | `printingRate > 0`    | Printing (coverSize × colors)                  |
| Additional Charges   | Purple  | Any charge > 0        | Gusset, Punching, Opack, Cutting (each conditional) |
| Adjustments          | Orange  | `wastagePercent > 0`  | Wastage row via `WastageRow` component          |

Footer shows: Total Rate (₹) with annotation `"₹X subtotal + ₹Y wastage"`.

---

## Key Differences from Gravure

| Aspect             | Gravure                                | Flexo                                    |
| ------------------ | -------------------------------------- | ---------------------------------------- |
| **Output**         | Price per kg (₹/kg)                    | Flat total rate (₹)                      |
| **Materials**      | Multiple materials with qty/price each | Single material price (user-entered)     |
| **Conversion**     | N/A                                    | Lookup by material type × roll size      |
| **Printing Rate**  | Per-color rate × color count           | Lookup by cover size × color count       |
| **Gusset Rate**    | N/A                                    | Lookup by cover size                     |
| **Lamination**     | Single/Double radio                    | N/A                                      |
| **Slitting**       | Toggle with fixed rate                 | N/A                                      |
| **Pouch Making**   | Lookup by pouch size                   | N/A                                      |
| **Saved quote price** | `₹X/kg`                            | `₹X` (via `formatFlexoPrice`)            |

---

## Status

| Feature          | Status |
| ---------------- | ------ |
| Form             | ✅     |
| Result breakdown | ✅     |
| Save + validate  | ✅     |
| Saved Quotes     | ✅     |
| Print            | ✅     |
| Dark mode        | ✅     |
| AppShell wiring  | ✅     |
| Documentation    | ✅     |
