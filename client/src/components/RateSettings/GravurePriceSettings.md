# Gravure Price Settings

Admin panel for managing daily-fluctuating rates used by the Gravure Rate Calculator. Provides a tabbed interface for 3 data categories — material prices, pouch sizes, and charge rates — backed by a REST API with JSON file persistence.

---

## Overview

- **Route:** Sidebar → Gravure → Price Settings (`activeView: "gravure-settings"`)
- **Component:** `GravurePriceSettings.jsx` — orchestrator with tab state + handler wrappers
- **Data source:** `GravureSettingsContext` → Express API → `server/data/gravure-settings.json`
- **Pattern:** Tabbed single-page admin with inline add/edit rows per table type

---

## Data Categories & Tabs

Tabs are defined in `settingsConfig.js` → `ALL_TABS` array. Each tab has `{ id, label, type }`.

### 1. Material Prices (4 tabs)

| Tab ID       | Label       | Type       |
| ------------ | ----------- | ---------- |
| `polyester`  | Polyester   | `material` |
| `silverPet`  | Silver PET  | `material` |
| `ldRoll`     | L.D. Roll   | `material` |
| `bopp`       | B.O.P.P.    | `material` |

Each material stores:

```json
{
  "label": "Polyester",
  "priceHistory": [
    { "price": 220, "changedBy": "Admin", "changedAt": "2026-04-01T..." }
  ],
  "micronOptions": [{ "value": "12", "createdAt": "..." }],
  "qtyOptions": [{ "value": "0.5", "createdAt": "..." }]
}
```

- **Display:** `MaterialPriceTable` → `HistoryRow` for each entry, newest first
- **Current value:** `history[0]` — shown with ★ star badge and violet→indigo→blue gradient row
- **Add:** `NewValueRow` inline (auto-focused input, Enter/Escape, CheckIcon/XMarkIcon)
- **API:** `PUT /api/gravure/materials/:materialKey/price` → prepends to `priceHistory`

### 2. Pouch Sizes (1 tab)

| Tab ID    | Label   | Type    |
| --------- | ------- | ------- |
| `pouches` | Pouches | `pouch` |

Each pouch stores:

```json
{
  "id": "ps-abc12345",
  "length": "4",
  "breadth": "6",
  "rate": 15,
  "enabled": true,
  "createdBy": "Admin",
  "createdAt": "2026-04-01T...",
  "modifiedBy": null,
  "modifiedAt": null
}
```

- **Display:** `PouchTable` → `PouchRow` for each entry, with S.No, Size (L × B), Rate, Created/Modified metadata, Enable toggle, Edit/Delete actions
- **Inline edit:** Click Edit → rate field becomes editable (size is read-only), Enter/Escape, Check/X buttons
- **Enable/disable:** `IOSToggle` — disabled pouches get `opacity-40` and are filtered out of the calculator form's dropdown
- **Add:** `NewPouchRow` — length + breadth + rate inputs, auto-focused
- **Delete:** Removes pouch permanently
- **API:**
  - `POST /api/gravure/pouches` → creates with random `ps-` prefixed ID
  - `PUT /api/gravure/pouches/:id` → updates rate, enabled, or size fields
  - `DELETE /api/gravure/pouches/:id` → removes permanently

### 3. Charge Rates (6 tabs)

| Tab ID              | Label              | Type   | Unit      |
| ------------------- | ------------------ | ------ | --------- |
| `normalColorRate`   | Normal Color       | `rate` | ₹/color   |
| `metallicColorRate` | Metallic Color     | `rate` | ₹/color   |
| `mattFinishRate`    | Matt Finish        | `rate` | ₹/kg      |
| `singleLamRate`     | Single Lamination  | `rate` | ₹/kg      |
| `doubleLamRate`     | Double Lamination  | `rate` | ₹/kg      |
| `slittingRate`      | Slitting           | `rate` | ₹/kg      |

Each charge rate stores:

```json
{
  "label": "Normal Color Rate",
  "unit": "₹/color",
  "history": [
    { "rate": 5, "changedBy": "Admin", "changedAt": "2026-04-01T..." }
  ]
}
```

- **Display:** `ChargeRateTable` → `HistoryRow` (same component as material prices, uses `valueKey` prop to read `rate` instead of `price`)
- **Add:** `NewValueRow` inline — same as material prices
- **API:** `PUT /api/gravure/charge-rates/:rateKey` → prepends to `history`

---

## Architecture

### File Structure

```
client/src/
├── components/RateSettings/
│   ├── GravurePriceSettings.jsx    ← Orchestrator: tab state, handler wrappers, layout
│   ├── settingsConfig.js           ← ALL_TABS, POUCH_COLUMNS, makeHistoryColumns()
│   ├── TabBar.jsx                  ← Underline tab navigation
│   ├── TableShell.jsx              ← Capsule-header table wrapper (rounded header row)
│   ├── MaterialPriceTable.jsx      ← Material tab: history list + inline add
│   ├── ChargeRateTable.jsx         ← Charge rate tab: history list + inline add
│   ├── PouchTable.jsx              ← Pouch tab: CRUD list + inline add
│   ├── HistoryRow.jsx              ← Shared: single history entry (★ gradient for current)
│   ├── NewValueRow.jsx             ← Shared: inline add row for prices/rates
│   ├── PouchRow.jsx                ← Display + inline edit mode for a single pouch
│   └── NewPouchRow.jsx             ← Inline add row for new pouch (L + B + rate)
│
├── context/
│   └── GravureSettingsContext.jsx   ← Provider: fetch, CRUD methods, fallback data, buildRatesFromSettings()
│
├── utils/
│   └── settingsApi.js              ← 7 fetch wrappers for all gravure settings endpoints
│
server/
├── config/
│   ├── paths.js                    ← GRAVURE_SETTINGS_PATH
│   └── constants.js                ← VALID_MATERIALS, VALID_RATE_KEYS, VALID_OPTION_TYPES
├── middleware/
│   └── validate.js                 ← validateMaterial, validateRateKey, validateNumber(), validateString(), validateOptionType
├── routes/
│   └── gravureSettings.js          ← 7 endpoints, middleware chains → controller refs
├── controllers/
│   └── gravureSettings.js          ← req/res handling, HTTP status codes, calls services
├── services/
│   └── gravureSettings.js          ← Pure business logic: getSettings, addMaterialPrice, createPouch, etc.
├── utils/
│   ├── fileStore.js                ← readJson/writeJson with atomic temp→rename writes
│   └── seed.js                     ← Seeds gravure-settings.json with defaults if missing
└── data/
    └── gravure-settings.json       ← Persisted settings (gitignored)
```

### Data Flow

```
User action (add/edit/delete)
  → GravurePriceSettings handler (thin wrapper + toast)
    → GravureSettingsContext method (useCallback)
      → settingsApi fetch wrapper
        → Express route → middleware → controller → service
          → fileStore.readJson / writeJson (atomic)
        ← JSON response
      ← setSettings() state update
    ← UI re-renders with new data
```

### Context Provider Integration

`GravureSettingsProvider` is instantiated once in `AppShell.jsx`, wrapping all persistent views. This ensures:
- Settings are shared between the Price Settings page and the Calculator form
- No duplicate providers or stale data

```jsx
// AppShell.jsx
<GravureSettingsProvider>
  {/* all views that need gravure settings */}
</GravureSettingsProvider>
```

### Calculator Form Integration

`GravureForm.jsx` consumes settings via `useGravureSettings()`:

1. **Material prices** — auto-synced from `settings.materials[key].priceHistory[0].price` into form state. Input fields are disabled (read-only from settings).
2. **Pouch dropdown** — filtered to `settings.pouches.filter(p => p.enabled !== false)`, displayed as `"L x B"` format.
3. **Charge rates** — `buildRatesFromSettings(settings)` extracts current values from `history[0]` for all 6 rates + enabled pouch rate map. Passed to `calculateGravureRate()`.

### Fallback Behavior

If the server is unreachable on initial load, `GravureSettingsContext` falls back to `buildFallbackSettings()` which uses constants from `gravureRates.js`. The UI remains functional with default values.

---

## API Reference

All endpoints are under `/api/gravure`.

| Method   | Endpoint                              | Middleware                                         | Body                                | Response        |
| -------- | ------------------------------------- | -------------------------------------------------- | ----------------------------------- | --------------- |
| `GET`    | `/settings`                           | —                                                  | —                                   | Full settings   |
| `PUT`    | `/materials/:materialKey/price`       | `validateMaterial`, `validateNumber("price")`       | `{ price: number }`                 | Updated material|
| `POST`   | `/materials/:materialKey/options`     | `validateMaterial`, `validateOptionType`            | `{ type: "micron"\|"qty", value }`  | Updated material|
| `POST`   | `/pouches`                            | `validateString("length","breadth")`, `validateNumber("rate")` | `{ length, breadth, rate }` | New pouch (201) |
| `PUT`    | `/pouches/:id`                        | —                                                  | `{ rate?, enabled?, length?, breadth? }` | Updated pouch |
| `DELETE` | `/pouches/:id`                        | —                                                  | —                                   | `{ success: true }` |
| `PUT`    | `/charge-rates/:rateKey`              | `validateRateKey`, `validateNumber("rate")`         | `{ rate: number }`                  | Updated rate obj|

### Validation Constants

```js
VALID_MATERIALS = ["polyester", "silverPet", "ldRoll", "bopp"]
VALID_RATE_KEYS = ["normalColorRate", "metallicColorRate", "mattFinishRate", "singleLamRate", "doubleLamRate", "slittingRate"]
VALID_OPTION_TYPES = ["micron", "qty"]
```

---

## Seed Data (Defaults)

Created by `server/utils/seed.js` on first server start if `data/gravure-settings.json` doesn't exist.

| Category        | Key                | Default Value |
| --------------- | ------------------ | ------------- |
| Material price  | polyester          | ₹220/kg       |
| Material price  | silverPet          | ₹260/kg       |
| Material price  | ldRoll             | ₹158/kg       |
| Material price  | bopp               | ₹0/kg         |
| Pouch           | 4 × 6              | ₹15/kg        |
| Pouch           | 5 × 7              | ₹18/kg        |
| Pouch           | 6 × 8              | ₹20/kg        |
| Pouch           | 7 × 10             | ₹25/kg        |
| Charge rate     | normalColorRate    | ₹5/color      |
| Charge rate     | metallicColorRate  | ₹8/color      |
| Charge rate     | mattFinishRate     | ₹3/kg         |
| Charge rate     | singleLamRate      | ₹12/kg        |
| Charge rate     | doubleLamRate      | ₹20/kg        |
| Charge rate     | slittingRate       | ₹4/kg         |

---

## UI Components

### Shared / Reusable (available for Flexo & Job Cost settings)

| Component      | Props                                        | Purpose                                          |
| -------------- | -------------------------------------------- | ------------------------------------------------ |
| `TabBar`       | `tabs, activeTab, onSelect`                  | Underline tab navigation, scrollable overflow     |
| `TableShell`   | `columns, children`                          | `<table>` wrapper with capsule rounded header     |
| `HistoryRow`   | `entry, index, total, valueKey`              | Single history row, ★ gradient for `index === 0`  |
| `NewValueRow`  | `placeholder, onConfirm, onCancel`           | Inline add row with auto-focused number input     |

### Gravure-Specific

| Component           | Props                                           | Purpose                                       |
| ------------------- | ----------------------------------------------- | --------------------------------------------- |
| `MaterialPriceTable`| `materialKey, settings, adding, onAdd, onCancelAdd` | Material price history table               |
| `ChargeRateTable`   | `rateKey, settings, adding, onAdd, onCancelAdd` | Charge rate history table                      |
| `PouchTable`        | `settings, onEdit, onDelete, adding, onAdd, onCancelAdd` | Pouch CRUD table                      |
| `PouchRow`          | `pouch, index, onEdit, onDelete`                | Display + inline edit mode for single pouch    |
| `NewPouchRow`       | `onConfirm, onCancel`                           | Inline add form (L + B + rate)                 |

### CSS Classes Used

| Class                 | Where Used                   |
| --------------------- | ---------------------------- |
| `.table-header-cell`  | `TableShell` header `<th>`   |
| `.table-cell`         | `HistoryRow`, `PouchRow` display mode |
| `.table-cell-compact` | `PouchRow` edit mode, `NewValueRow`, `NewPouchRow` |
| `.table-action-btn`   | Edit/Delete/Check/X buttons  |
| `.input-no-spinner`   | Number inputs (hides arrows) |
| `.current-row-first`  | HistoryRow gradient start    |
| `.current-row-mid`    | HistoryRow gradient middle   |
| `.current-row-last`   | HistoryRow gradient end      |
| `.calc-shell`         | Page wrapper                 |
| `.glass-panel`        | Tab + table container        |
| `.btn-primary .btn-pill` | "Add New" button          |

---

## Blueprint for Flexo & Job Cost Settings

To implement price settings for another calculator:

### 1. Server Layer

- Add `server/data/{calc}-settings.json` path to `config/paths.js`
- Add valid keys to `config/constants.js`
- Create `services/{calc}Settings.js` — same pattern: `load()`, `save()`, CRUD functions
- Create `controllers/{calc}Settings.js` — thin req/res handlers calling service
- Create `routes/{calc}Settings.js` — endpoints with middleware chains
- Add seed data to `utils/seed.js`
- Register route in `index.js`: `app.use("/api/{calc}", router)`

### 2. Client Context

- Create `context/{Calc}SettingsContext.jsx` — same pattern as `GravureSettingsContext`:
  - Fetch on mount, fallback to constants if server unreachable
  - CRUD methods wrapped in `useCallback`
  - `buildRatesFromSettings()` export for calculator integration
  - `getCurrentPrice()` / `getCurrentRate()` helpers

### 3. Client API

- Add fetch wrappers to `utils/settingsApi.js` (or create a separate file per calculator)

### 4. UI — Tab Config

- Create `settingsConfig.js` in the settings folder (or extend the existing one) with:
  - Tab definitions (`{ id, label, type }`)
  - Column definitions for any calculator-specific tables

### 5. UI — Orchestrator

- Create `{Calc}PriceSettings.jsx` — same pattern as `GravurePriceSettings`:
  - Tab state + `adding` state
  - Handler wrappers (context method + toast)
  - `renderTable()` switch on `activeTab.type`

### 6. Reuse Existing Components

The following are **fully reusable** without modification:
- `TabBar` — works with any tab array
- `TableShell` — works with any column definitions
- `HistoryRow` — works with any `{ changedBy, changedAt, [valueKey] }` entry shape
- `NewValueRow` — works for any single-number inline add

Only create new components if the calculator has a unique data type (like Gravure's pouches with L×B + enable/disable).

### 7. Calculator Integration

- Wrap calculator views in the new provider (in `AppShell.jsx`)
- Update the calculator form to read settings and auto-fill rates
- Update the calculation function to accept a rates object from `buildRatesFromSettings()`
