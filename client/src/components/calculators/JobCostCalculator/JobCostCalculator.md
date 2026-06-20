# Job Cost Calculator — Technical Reference

> **Status**: ✅ Complete (UI Redesign Sprint 2)
> **Storage**: MongoDB `quotes` collection, filtered by `calcKey: "job-cost"` (via `/api/quotes/job-cost`)

---

## Purpose

Calculates the **Cost of Job per kg** for a given set of materials, processing charges, and flat charges. Unlike Gravure and Flexo (which compute rate-per-kg from material/printing/adjustment rates), Job Cost tracks individually toggled line items with quantities and prices, then divides the total by dispatch weight.

---

## Formula

```
Cost of Job (₹/kg) = Total Amount / Dispatch Weight
```

Where:

| Term                | Definition                                                  |
| ------------------- | ----------------------------------------------------------- |
| **Total Amount**    | Sum of all **enabled** line item amounts                    |
| **Line amount**     | `qty × price` for qty-based items; `price × finishedWeight` for packing/transport |
| **Dispatch Weight** | User-entered weight (kg) of finished goods dispatched      |

### Worked Example

| Item               | Qty (kg) | Price (₹/kg) | Amount (₹) |
| ------------------ | -------: | -----------: | ---------: |
| Polyster           |       40 |          200 |      8,000 |
| L.D.N. / L.D.op.   |       20 |          160 |      3,200 |
| Printing Charges   |       60 |           30 |      1,800 |
| Lamination Charges |       60 |           15 |        900 |
| Transport Charge   |        — |            — |        500 |

- **Total Amount** = 8,000 + 3,200 + 1,800 + 900 + 500 = **₹14,400**
- **Dispatch Weight** = 60 kg
- **Cost of Job** = 14,400 ÷ 60 = **₹240.00/kg**

---

## Form Fields

### Metadata Fields (12)

| Field            | Type          | Key              | Notes                               |
| ---------------- | ------------- | ---------------- | ----------------------------------- |
| Customer Name    | `TextField`   | `quoteName`      | Required for save; validates unique |
| Job Card No      | `TextField`   | `jobCardNo`      | e.g. JC-001                         |
| Job Card Date    | `date` input  | `jobCardDate`    | Native HTML date picker             |
| Dispatch Date    | `date` input  | `dispatchDate`   | Native HTML date picker             |
| Job Work Company | `SelectField` | `jobWorkCompany` | CreatableSelect, persisted options  |
| Billing No       | `TextField`   | `billingNo`      | e.g. B-001                          |
| Billing Date     | `date` input  | `billingDate`    | Native HTML date picker             |
| Billing Rate     | `NumberField` | `billingRate`    | ₹ unit                              |
| No. of Bundles   | `NumberField` | `noOfBundles`    |                                     |
| Film             | `TextField`   | `film`           | e.g. PET / BOPP                     |
| Micron           | `SelectField` | `micron`         | Creatable, seed: 12, 15, 20, 25…    |
| No. of Colours   | `SelectField` | `noOfColours`    | Creatable, seed: 1–4 Colour, Multi  |

### Line Items (10)

Each item has `enabled` (toggle), `price`, and optionally `qty`. Items are defined in `constants/jobCost.js → LINE_ITEMS`.

| #   | Key                  | Label                | Has Qty | Default Price (₹) | Group     |
| --- | -------------------- | -------------------- | ------- | ----------------: | --------- |
| 0   | `polyster`           | Polyster             | ✅      |               200 | Materials |
| 1   | `silverPolyster`     | Silver Polyster      | ✅      |               250 | Materials |
| 2   | `boppSilver`         | B.O.P.P / Silver     | ✅      |               180 | Materials |
| 3   | `ldnLdop`            | L.D.N. / L.D.op.     | ✅      |               160 | Materials |
| 4   | `printingCharges`    | Printing Charges     | ✅      |                30 | Charges   |
| 5   | `laminationCharges`  | Lamination Charges   | ✅      |                15 | Charges   |
| 6   | `slittingCharges`    | Slitting Charges     | ✅      |                 8 | Charges   |
| 7   | `pouchMakingCharges` | Pouch Making Charges | ✅      |                20 | Charges   |
| 8   | `transportCharge`    | Transport Charge     | ❌      |               500 | Other     |
| 9   | `wastages`           | Wastages             | ❌      |               300 | Other     |

Items 0–7 are **qty-based**: `amount = qty × price`.
Items 8–9 are **per-kg charges**: `amount = price × finishedWeight`.

### Weight Fields (2)

| Field           | Key              | Unit |
| --------------- | ---------------- | ---- |
| Finished Weight | `finishedWeight` | kg   |
| Dispatch Weight | `dispatchWeight` | kg   |

---

## Form Sections (6)

1. **Customer & Job Details** — `quoteName` only
2. **Job Details** — jobCardNo, jobCardDate, dispatchDate, jobWorkCompany, billingNo, billingDate, billingRate, noOfBundles
3. **Specifications** — film, micron, noOfColours
4. **Materials** — items 0–3 (`MATERIAL_ITEMS`)
5. **Charges** — items 4–7 (`CHARGE_ITEMS`)
6. **Weights** — finishedWeight, dispatchWeight
7. **Other Charges** — items 8–9 (`FLAT_ITEMS`)

---

## Dropdown Seeds

Defined in `constants/jobCost.js → DROPDOWN_SEEDS`:

| Dropdown           | Seed Options                                        | Storage Key          |
| ------------------ | --------------------------------------------------- | -------------------- |
| Job Work Companies | Company A, Company B, Company C                     | `job-cost-companies` |
| Microns            | 12, 15, 20, 25, 30, 40, 50                          | `job-cost-microns`   |
| Colours            | 1 Colour, 2 Colour, 3 Colour, 4 Colour, Multicolour | `job-cost-colours`   |

All dropdowns support custom option creation via `CreatableSelect` and persist new options to `localStorage`.

---

## Calculation Logic

Source: `utils/calculators/jobCost.js → calculateJobCost(form)`

### Step-by-step

1. **Iterate** `LINE_ITEMS` array (10 items)
2. For each item, read `form.items[key]` → get `enabled`, `price`, `qty`
3. If **enabled** and **hasQty**: `amount = qty × price`
4. If **enabled** and **not hasQty** (packing/transport): `amount = price × finishedWeight`
5. If **disabled**: `amount = 0`
6. **Filter** to enabled items only → `enabledItems`
7. **Sum** all enabled amounts → `totalAmount`
8. Read `dispatchWeight` and `finishedWeight` from form
9. **Guard**: return `null` if `dispatchWeight === 0` OR `enabledItems.length === 0` OR `totalAmount === 0`
10. **Compute**: `costOfJob = totalAmount / dispatchWeight`

### Return Shape

```js
{
  lineItems: [            // all 10 items with computed amounts
    { key, label, hasQty, enabled, qty, price, amount }
  ],
  enabledItems: [...],    // only enabled items
  totalAmount: Number,    // sum of enabled amounts
  finishedWeight: Number,
  dispatchWeight: Number,
  costOfJob: Number       // totalAmount / dispatchWeight
}
```

Returns `null` when conditions in step 9 are met.

---

## Result Breakdown (Invoice View)

`JobCostResult.jsx` renders an invoice-style card with 3 color-coded sections:

| Section   | Color  | Token                   | Items     |
| --------- | ------ | ----------------------- | --------- |
| Materials | Blue   | `SECTION_COLORS.blue`   | items 0–3 |
| Charges   | Green  | `SECTION_COLORS.green`  | items 4–7 |
| Other     | Orange | `SECTION_COLORS.orange` | items 8–9 |

Each section shows item rows (label, rate, qty, amount) followed by a section subtotal.

**Header metadata** (dynamic — only shown when field has a value):

- Job Card, Company, Film, Micron (with μ suffix), Colours

**Footer**:

- Total Amount row
- Highlight strip: Cost of Job value with "/kg" unit
- Annotation: `₹{totalAmount} total ÷ {dispatchWeight} kg dispatch · {finishedWeight} kg finished`

---

## Data Flow

```
┌───────────────┐     onProceed(form)     ┌──────────────────┐
│  JobCostForm  │ ──────────────────────▶ │ JobCostCalculator │
│  (6 sections, │                         │   (container)     │
│   10 items)   │                         │                   │
└───────────────┘                         │  handleFormChange │
                                          │  ├─ setForm(data) │
                                          │  ├─ setResult(    │
                                          │  │  calculateJob  │
                                          │  │  Cost(data))   │
                                          │  └─ setSaveError  │
                                          │     (null)        │
                                          └────────┬─────────┘
                                                   │ result + form
                                                   ▼
                                          ┌──────────────────┐
                                          │  JobCostResult   │
                                          │  (invoice card)  │
                                          │  3 sections +    │
                                          │  footer           │
                                          └──────────────────┘
```

Container uses the shared `useCalculator` hook which encapsulates form state, result calculation, save validation, toast notifications, form reset, and print functionality.

---

## File Structure

```
components/calculators/JobCostCalculator/
├── JobCostCalculator.jsx     ← container: useCalculator hook, 2-col grid
├── JobCostForm.jsx           ← 6-section form orchestrator, forwardRef + reset
├── JobCostResult.jsx         ← invoice breakdown, 3 color-coded sections
├── JobCostPrintLayout.jsx    ← print mapping wrapper to PrintInvoice
├── JobCostSavedQuotes.jsx    ← SavedQuotesView wrapper with formatPrice
├── ItemRow.jsx               ← reusable toggleable line item (qty + price inputs)
├── formConfig.js             ← makeInitialForm(), item group exports
├── formRows/
│   └── JobCostItemRow.jsx    ← reusable item row with flexible qty/amount modes
└── JobCostCalculator.md      ← this file
```

### File responsibilities

| File                    | Role                                                                                               | LOC  |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ---- |
| `JobCostCalculator.jsx` | Container — `useCalculator` hook, state, save/print/reset. Renders 2-col grid: form left, result right. | ~100 |
| `JobCostForm.jsx`       | Orchestrator form via `forwardRef`. Delegates all items to reusable `ItemRow` component.            | ~240 |
| `JobCostResult.jsx`     | Stateless invoice breakdown. 3 color-coded sections: Materials, Charges, Other. Uses invoice primitives. | ~190 |
| `JobCostPrintLayout.jsx` | Print mapping wrapper. Builds printable items and composes `PrintInvoice`.                         | ~160 |
| `JobCostSavedQuotes.jsx` | Thin wrapper around `SavedQuotesView` with Job Cost config + `formatJobCostPrice`.                 | ~20  |
| `ItemRow.jsx`           | Reusable item row — toggle + conditional qty+price or flat amount inputs.                         | ~70  |
| `formConfig.js`         | `makeInitialForm()`, `MATERIAL_ITEMS`, `CHARGE_ITEMS`, `FLAT_ITEMS`, `DROPDOWN_SEEDS`, localStorage helpers. | ~100 |
| `formRows/JobCostItemRow.jsx` | Reusable item row abstraction with flexible qty/amount modes.                               | ~55  |

### Supporting modules

- `constants/jobCost.js` — `LINE_ITEMS`, `DROPDOWN_SEEDS`
- `utils/calculators/jobCost.js` — `calculateJobCost()` pure function
- `hooks/useCalculator.js` — shared calculator state + handlers hook
- `constants/invoiceColors.js` — shared `SECTION_COLORS` for invoice sections

---

## Quote Storage

Quotes are persisted server-side in the shared MongoDB `quotes` collection,
routed through `/api/quotes/job-cost` (see [server/models/Quote.js](../../../../../server/models/Quote.js)).

| Field        | Source                             |
| ------------ | ---------------------------------- |
| `calcKey`    | `"job-cost"` (set server-side)     |
| `quoteName`  | Customer name (unique per calcKey) |
| `pricePerKg` | `calc.costOfJob` (₹/kg)            |
| `pouchSize`  | `null` (not used by Job Cost)      |
| `form`       | Full form state                    |
| `savedAt`    | Server timestamp                   |

### Saved Quote Shape

```js
{
  id: "q-xxxx",
  savedAt: "ISO-8601",
  quoteName: "Rajesh Traders — Feb",
  pricePerKg: 240.00,          // ₹/kg — used for formatPrice display
  pouchSize: null,
  form: { ...fullFormState }   // all metadata + items + weights
}
```

`totalAmount` and `dispatchWeight` are not persisted — they are recomputed by
`calculateJobCost(form)` whenever a saved quote is rendered.

### Save Validation

1. **Empty name** → error: "Enter a customer name before saving."
2. **Duplicate name** (case-insensitive) → error: `A quote named "${name}" already exists.`
3. **Null result** → error: "Fill in required fields before saving."

---

## Key Differences from Gravure & Flexo

| Aspect           | Gravure / Flexo                    | Job Cost                                     |
| ---------------- | ---------------------------------- | -------------------------------------------- |
| Calculation      | Rate-based (₹/kg from rate tables) | Accumulative (sum of item amounts)           |
| Line items       | Derived from form toggles/rates    | Individually toggled with qty × price        |
| Flat charges     | None                               | Transport + Wastages (amount only)           |
| Primary metric   | Price per kg / Total rate          | Cost of Job (₹/kg)                           |
| Form persistence | Material prices in localStorage    | No localStorage persistence                  |
| Result sections  | 2–4 sections (varies)              | 3 fixed sections (Materials, Charges, Other) |
| Footer unit      | `/kg` (Gravure) or flat (Flexo)    | `/kg` (cost of job per kg)                   |

---

## Status

| Component              | Status | Notes                                              |
| ---------------------- | ------ | -------------------------------------------------- |
| `JobCostCalculator`    | ✅     | Uses shared `useCalculator` hook                   |
| `JobCostForm`          | ✅     | 6 sections, `forwardRef` + reset                   |
| `JobCostResult`        | ✅     | 3 color-coded sections, dynamic meta               |
| `JobCostSavedQuotes`   | ✅     | Wraps `SavedQuotesView`, formatPrice = ₹X/kg       |
| `ItemRow`              | ✅     | Extracted, supports qty + flat variants            |
| `formConfig.js`        | ✅     | Factory + item groups + re-exports                 |
| `calculateJobCost()`   | ✅     | Pure function in `utils/calculators/`              |
| `constants/jobCost.js` | ✅     | LINE_ITEMS, DROPDOWN_SEEDS                         |
| Print layout           | ✅     | `data-print-area` + `@media print`; left panel uses Customer and Job Work Place labels; footer 3-box section hidden for Job Cost; TOTAL and Job Cost are ceil-rounded in print; Job Cost value is emphasized and total amount words are hidden |
| AppShell wiring        | ✅     | `job-cost` + `job-cost-quotes` in PERSISTENT_VIEWS |
