# Eastman Polybags — Internal Quote Calculator

> ## ⛔ STOP — READ BEFORE WRITING ANY CODE
>
> **Do not write, edit, or refactor any code until you have explicitly loaded every applicable SKILL.md listed in the "Mandatory skill loading" section below.**
>
> Required steps before starting any implementation task:
>
> 1. Identify which skills apply to the task (React component? UI? Backend? Layout?).
> 2. Call `read_file` on each applicable SKILL.md — confirm them in your reply.
> 3. Only then begin writing code.
>
> Skipping this step is a violation of project rules. When in doubt, load the skill.

---

An internal calculator for a small enterprise that helps generate quotes for customers based on daily fluctuating rates.

---

## Overview

- **Stack:** MERN (MongoDB, Express, React, Node.js)
- **Styling:** Tailwind CSS (v4) with iOS-inspired design tokens (`theme.css`)
- **Responsive:** Tailwind CSS utility classes
- **Dark / Light mode:** Tailwind class-based dark mode (`dark:` variant) toggled manually via sidebar footer; preference persisted in `localStorage`
- **3 Calculators** accessible via expandable left sidebar navigation (Dashboard, Gravure, Flexo, Job Cost)

---

## Skills Reference

The following skills are available in `.agents/skills/`. Load the relevant one before starting the described task:

| Skill                          | When to use                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `vercel-react-best-practices`  | Writing or refactoring React components — performance patterns, avoiding waterfalls, bundle size         |
| `vercel-composition-patterns`  | Designing component APIs — compound components, avoiding boolean prop proliferation, lifting state       |
| `web-design-guidelines`        | UI/UX review — accessibility, spacing, contrast, interaction patterns                                    |
| `wcag-audit-patterns`          | Accessibility audit — WCAG 2.2 compliance, `aria-*` attributes, keyboard navigation                      |
| `nodejs-express-server`        | Building the Express server (`server/`) — routing, middleware, request handling                          |
| `nodejs-backend-patterns`      | Backend architecture — REST API design, middleware chains, error handling, auth                          |
| `architecture-patterns`        | Structuring backend layers — Clean Architecture, use cases, controllers vs. services                     |
| `mongodb`                      | MongoDB/Mongoose schemas, queries, aggregation pipelines — Phase 3 DB persistence                        |
| `skill-creator`                | Creating or improving agent skills — writing SKILL.md files, optimizing descriptions, running evals      |
| `frontend-design`              | Building distinctive, production-grade UI — components, pages, dashboards, creative web design           |
| `tailwind-design-system`       | Extending `theme.css` tokens, building component variants, standardizing UI patterns with Tailwind v4    |
| `tailwindcss-advanced-layouts` | Complex multi-column CSS Grid / Flexbox layouts — calculator grids, sidebar layouts, responsive patterns |

> **Not applicable to this project:** `react-native-architecture`, `vercel-react-native-skills` — this is a web app, not a native app.

### Mandatory skill loading

> **STOP — declare your skills before writing code.**
> Before starting any task, state which skills apply and confirm you have read each SKILL.md. Do not proceed until this is done.

| Task type                                                                   | Skills to load                                               |
| --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Writing or refactoring **any** React component                              | `vercel-react-best-practices`, `vercel-composition-patterns` |
| Building or designing **any** new UI, component, or calculator from scratch | `frontend-design` + the two React skills above               |
| Building any backend route or server logic                                  | `nodejs-express-server`, `nodejs-backend-patterns`           |
| Designing MongoDB schemas                                                   | `mongodb`                                                    |
| UI/UX review or audit                                                       | `web-design-guidelines`                                      |
| Extending `theme.css`, design tokens, or new component variants             | `tailwind-design-system`                                     |
| Complex multi-column grid / advanced flex layouts                           | `tailwindcss-advanced-layouts`                               |
| Adding, modifying, or evaluating any skill in `.agents/skills/`             | `skill-creator`                                              |

---

## Stack & Tooling

- React 18 functional components, `.jsx` extension everywhere — no class components
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Vite build tool; no Next.js
- No external state management library (no Zustand, Redux, MobX) — use `useState`, `useContext`, `useRef`
- No React Router — navigation is handled by `activeView` string state in `AppShell.jsx`, driven by sidebar menu clicks

---

## Calculators

### 1. Gravure Rate Calculator

See [GravureRateCalculator.md](../client/src/components/calculators/GravureRateCalculator/GravureRateCalculator.md) for full formula, field reference, charge rates, and data flow.

### 2. Flexo Rate Calculator

See [FlexoRateCalculator.md](../client/src/components/calculators/FlexoRateCalculator/FlexoRateCalculator.md) for full formula, field reference, charge rates, and data flow.

### 3. Job Cost Calculator

See [JobCostCalculator.md](../client/src/components/calculators/JobCostCalculator/JobCostCalculator.md) for full formula, field reference, line item definitions, and data flow.

---

## Features

- **Global Rate Settings panel** — daily base rates entered once via a bottom sheet; applies to all calculators as defaults _(pending)_
- **Per-calculator rate override** — each calculator form has an override toggle to use custom rates for that specific quote _(pending)_
- **Quote output — 3 formats:**
  - Inline result card shown below the form _(pending)_
  - Full breakdown in a slide-up bottom sheet modal _(pending)_
  - Print-optimised layout triggered by "Print Quote" (`@media print`) _(pending)_

---

## Architecture & Module Structure

Legend: ✅ Built | � Rebuilding | 🔲 Pending

```
client/src/
├── context/
│   ├── ThemeContext.jsx         ✅ isDark + toggleTheme(), applies .dark to <html>, seeds from OS, persists to localStorage
│   └── RateContext.jsx          🔲 Global daily rates + per-calculator overrides
│
├── hooks/
│   ├── useQuoteCounts.js        ✅ Reads quote counts for all calcs from localStorage, listens to storage events
│   └── useCalculator.js         ✅ Shared calculator state + handlers hook (form, result, save, toast, reset, print)
│
├── components/
│   ├── ui/
│   │   ├── IOSToggle.jsx        ✅ iOS-style boolean toggle (on + onToggle)
│   │   ├── Badge.jsx            ✅ Reusable count pill (min-w-5 h-5 rounded-full)
│   │   ├── GlassSeparator.jsx   ✅ Inset glass separator line with role="separator"
│   │   ├── SectionLabel.jsx     ✅ Uppercase tracking label for sidebar sections
│   │   ├── CreatableSelect.jsx  ✅ Dropdown with custom option creation + localStorage persistence
│   │   ├── MetaRow.jsx          ✅ Labeled metadata field (label + value)
│   │   ├── Toast.jsx            ✅ macOS-style self-dismissing notification + useToast() hook
│   │   └── Icons.jsx            ✅ 22 icons: Close, Trash, ChevronDown, Dashboard, Gravure, Flexo, JobCost, Sun, Moon, Calculator, Quotes, History, User, Logout, Save, Pdf, Print, Reset, Delete, Export, Search, PriceSettings
│   │
│   ├── form/                        ✅ Reusable compound form components (composition pattern)
│   │   ├── FormStack.jsx            ✅ Outer wrapper, flex col gap-4
│   │   ├── FormSection.jsx          ✅ .card wrapper with optional title + auto-dividers
│   │   ├── TextField.jsx            ✅ Labeled text input (.field-label + .input-base), error prop for inline validation
│   │   ├── NumberField.jsx          ✅ Inline row (.form-row) with label + compact number input
│   │   ├── ToggleField.jsx          ✅ Inline row with label + IOSToggle
│   │   ├── RadioField.jsx           ✅ Horizontal radio group with .radio-pill styling
│   │   └── SelectField.jsx          ✅ Labeled CreatableSelect, supports inline mode with width + unit
│   │
│   ├── invoice/                         ✅ Reusable invoice breakdown primitives
│   │   ├── InvoiceHeader.jsx            ✅ Branding + customer/date metadata + status badge
│   │   ├── InvoiceFooter.jsx            ✅ Total row + highlighted price-per-kg strip
│   │   ├── InvoiceEmpty.jsx             ✅ Placeholder for no-result state
│   │   ├── TableHeader.jsx              ✅ 4-column header (Item, Rate, Qty, Amount)
│   │   ├── ItemRow.jsx                  ✅ 4-column data row with invoice-grid
│   │   ├── SectionLabel.jsx             ✅ Colored dot + section name
│   │   ├── SectionSubtotal.jsx          ✅ Bordered pill subtotal row + divider
│   │   └── WastageRow.jsx               ✅ Reusable wastage adjustment line (percent, base, amount)
│   │
│   ├── layout/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx          ✅ Glass island container (fixed left, frosted glass, rounded-2xl)
│   │   │   ├── SidebarHeader.jsx    ✅ App branding + glass separator
│   │   │   ├── SidebarNav.jsx       ✅ Navigation list using NAV_ITEMS config
│   │   │   ├── SidebarFooter.jsx    ✅ Theme toggle + account row
│   │   │   ├── NavItem.jsx          ✅ Expandable top-level nav item (active = bg-tint/10 text-tint)
│   │   │   └── SubNavItem.jsx       ✅ Sub-menu item with icon + badge
│   │   ├── PlaceholderView.jsx          ✅ Centered placeholder for unbuilt views
│   │   ├── CalculatorHeader.jsx         ✅ Calculator page header (icon + title + subtitle + action buttons)
│   │   └── AppShell.jsx                 ✅ Sidebar + main workspace, manages activeView state
│   │
│   ├── overlays/                🔲 All pending
│   │
│   ├── RateSettings/            ✅ Gravure Price Settings (11 files, see GravurePriceSettings.md)
│   │
│   └── calculators/             ✅ All 3 calculators complete
│       ├── SavedQuotesView.jsx          ✅ Shared saved quotes 2-col layout (list + breakdown)
│       ├── GravureRateCalculator/
│       │   ├── GravureRateCalculator.jsx ✅ Container: useCalculator hook, 2-col grid
│       │   ├── GravureForm.jsx          ✅ Controlled form, forwardRef + reset(), compound form components
│       │   ├── GravureResult.jsx        ✅ Invoice-style breakdown card (reused by saved quotes)
│       │   ├── GravureSavedQuotes.jsx   ✅ Saved quotes list + search + breakdown panel
│       │   ├── MaterialRow.jsx          ✅ Material toggle + price/micron/qty inputs
│       │   ├── formConfig.js            ✅ MATERIALS config, localStorage helpers, makeInitialForm()
│       │   └── GravureRateCalculator.md ✅ Full calculator documentation
│       ├── FlexoRateCalculator/
│       │   ├── FlexoRateCalculator.jsx  ✅ Container: useCalculator hook, 2-col grid
│       │   ├── FlexoForm.jsx            ✅ Controlled form, forwardRef + reset(), compound form components
│       │   ├── FlexoResult.jsx          ✅ Invoice-style breakdown card (reused by saved quotes)
│       │   ├── FlexoSavedQuotes.jsx     ✅ Saved quotes list (wraps SavedQuotesView + formatFlexoPrice)
│       │   ├── formConfig.js            ✅ Option arrays, makeInitialForm()
│       │   └── FlexoRateCalculator.md   ✅ Full calculator documentation
│       └── JobCostCalculator/
│           ├── JobCostCalculator.jsx     ✅ Container: useCalculator hook, 2-col grid
│           ├── JobCostForm.jsx          ✅ 6-section form, forwardRef + reset(), 10 toggleable items
│           ├── JobCostResult.jsx         ✅ Invoice breakdown, 3 color-coded sections (Materials/Charges/Other)
│           ├── JobCostSavedQuotes.jsx    ✅ Saved quotes (wraps SavedQuotesView + formatJobCostPrice)
│           ├── ItemRow.jsx              ✅ Toggleable line item row (qty + price or flat amount)
│           ├── formConfig.js            ✅ makeInitialForm(), item group exports, re-exports
│           └── JobCostCalculator.md     ✅ Full calculator documentation
│
├── constants/
│   ├── navigation.js        ✅ NAV_ITEMS array, QUOTE_STORAGE_KEYS, VIEW_META
│   ├── layout.js            ✅ SIDEBAR_WIDTH, SIDEBAR_GAP, MAIN_MARGIN_LEFT, APP_NAME, APP_SUBTITLE
│   ├── gravureRates.js      ✅ Printing/lam/slitting rates, pouch lookup, sample quotes
│   ├── flexoRateCalc.js     ✅ Conversion/printing/gusset rate lookups, toggle rates, cutting/wastage, sample quotes
│   ├── jobCost.js           ✅ Line item definitions, default prices, dropdown seeds, sample quotes
│   └── invoiceColors.js     ✅ Shared SECTION_COLORS for invoice section labels (blue, green, purple, orange)
│
├── utils/
│   ├── format.js            ✅ fmt(), formatDate(), groupByMonth()
│   ├── quoteStorage.js      ✅ getQuotes(), saveQuote(), deleteQuote(), getInitialQuotes()
│   └── calculators/
│       ├── gravureRate.js   ✅ calculateGravureRate() pure function
│       ├── flexoRateCalc.js ✅ calculateFlexoRate() pure function
│       └── jobCost.js       ✅ calculateJobCost() pure function
│
├── App.jsx                  ✅ Renders AppShell
├── main.jsx                 ✅ Entry: ThemeProvider > App
├── theme.css                ✅ Tailwind @theme iOS color tokens + @custom-variant dark
└── index.css                ✅ .dark overrides, @layer base, @layer components, grid background pattern on body

server/                          🔲 All pending (node_modules installed, no source files yet)
├── index.js
├── routes/
├── controllers/
├── models/
└── package.json
```

---

## Color & Theming — CRITICAL

All colors **must** use the semantic iOS-inspired tokens defined in `theme.css` and overridden for dark mode in `index.css`. Never use raw Tailwind palette colors (blue-500, gray-200, etc.) or hardcoded hex values.

### Semantic Token Reference

| Token                                                                           | Use for                                   |
| ------------------------------------------------------------------------------- | ----------------------------------------- |
| `bg-background` / `bg-background-2` / `bg-background-3`                         | page / surface / elevated surface         |
| `bg-grouped-background` / `bg-grouped-background-2` / `bg-grouped-background-3` | grouped list backgrounds                  |
| `text-label`                                                                    | primary body text                         |
| `text-label-2`                                                                  | secondary / supporting text               |
| `text-label-3`                                                                  | placeholder / tertiary text               |
| `text-label-4`                                                                  | disabled text                             |
| `bg-fill` / `bg-fill-2` / `bg-fill-3` / `bg-fill-4`                             | semi-transparent fills, input backgrounds |
| `bg-tint` / `text-tint`                                                         | primary accent (iOS blue)                 |
| `border-separator`                                                              | dividers, input borders                   |
| `border-separator-opaque`                                                       | fully-opaque dividers                     |
| `text-placeholder`                                                              | input placeholder color                   |
| `text-hyperlink`                                                                | links                                     |

### Dark Mode

Dark mode is handled entirely by the token system — tokens auto-switch when `.dark` is on `<html>`. **Do not** add `dark:` variants for any color that already uses a semantic token. Only use `dark:` for glassmorphism / raw-alpha values that must differ:

```jsx
// ✅ CORRECT — token handles dark automatically
<div className="bg-grouped-background-2 text-label" />

// ✅ CORRECT — only use dark: for manually-specified alpha values
<header className="bg-white/40 dark:bg-white/8 border-white/50 dark:border-white/10" />

// ❌ WRONG — never use raw palette colors
<div className="bg-white text-gray-900 dark:bg-zinc-900 dark:text-white" />
```

Dark mode is toggled by `ThemeContext` (`useTheme()` hook), which adds/removes `.dark` on `<html>` and persists to `localStorage`. Tailwind v4 implementation: `@custom-variant dark (&:where(.dark, .dark *))` in `theme.css`; all `--color-*` tokens in `@theme {}`; dark overrides in `.dark {}` in `index.css`.

---

## Component Layer Classes

Prefer `@layer components` classes from `index.css` over repeating utility strings:

| Class                     | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `.card`                   | `bg-grouped-background-2 rounded-2xl overflow-hidden` |
| `.card-section`           | `px-4 py-3` padding inside a card                     |
| `.divider`                | `border-t border-separator` horizontal rule           |
| `.field-label`            | `text-sm font-medium text-label-2`                    |
| `.input-base`             | full-width rounded input with focus ring              |
| `.form-row`               | inline flex row for label + input pairs               |
| `.form-row-label`         | label styling inside `.form-row`                      |
| `.glass-panel`            | frosted glass surface with backdrop blur              |
| `.section-header`         | flex row section title                                |
| `.radio-pill`             | horizontal radio option base                          |
| `.radio-pill-active`      | selected radio pill state                             |
| `.radio-pill-inactive`    | unselected radio pill state                           |
| `.dropdown-menu`          | fixed portal dropdown container                       |
| `.dropdown-option`        | dropdown list item button                             |
| `.btn-primary`            | filled tint button                                    |
| `.btn-secondary`          | filled fill-2 button                                  |
| `.btn-ghost`              | text-only tint button                                 |
| `.btn-icon`               | 36px circular icon button                             |
| `.btn-pill`               | rounded pill button                                   |
| `.btn-danger`             | red pill button                                       |
| `.nav-button`             | sidebar top-level nav item                            |
| `.sub-nav-button`         | sidebar sub-menu item                                 |
| `.quote-list-item`        | saved quote list button base                          |
| `.quote-list-item-active` | selected quote item state                             |
| `.month-label`            | month grouping label in quote lists                   |
| `.calc-shell`             | `h-full flex flex-col` calculator page wrapper        |
| `.calc-grid`              | `flex-1 grid grid-cols-2 gap-3 min-h-0` 2-col layout  |
| `.calc-column`            | overflow scroll column with glass-panel styling       |
| `.item-row-header`        | flex row for item label + toggle                      |
| `.item-row-label`         | item row label text styling                           |
| `.item-row-inputs`        | item row input grid container                         |
| `.item-row-inputs-off`    | disabled state for item row inputs                    |

```jsx
// ✅ Preferred
<div className="card">
  <div className="card-section">
    <label className="field-label">Material</label>
    <input className="input-base" />
  </div>
  <div className="divider mx-4" />
  <div className="card-section">...</div>
</div>

// ❌ Avoid re-declaring what the class already does
<div className="bg-grouped-background-2 rounded-2xl overflow-hidden px-4 py-3">
```

---

## Sidebar Design Notes

The header island has been **removed entirely** and replaced by a **left navigation sidebar** — a frosted glass island fixed to the left edge:

- Outer positioning: `fixed top-3 bottom-3 left-3 z-40 w-64` for floating island effect
- Glass material: `bg-background/60 dark:bg-background-2/60 backdrop-blur-2xl backdrop-saturate-200 border border-separator/30 dark:border-white/10 rounded-2xl shadow-lg`
- Internal layout: `flex flex-col h-full` → SidebarHeader + SidebarNav (flex-1 overflow-y-auto) + SidebarFooter
- Navigation: expandable menus with `ChevronDown` rotation, all expanded by default
- Active state: parent = `bg-tint/10 text-tint`, sub-item = `text-tint font-medium` (no background)
- Footer: dark mode IOSToggle + account row (blue user icon, "Admin", red logout button)
- Grid background: CSS grid pattern on `body` using `--color-separator` for lines, `5em` gap
- Navigation state: `activeView` string in AppShell (e.g., `"gravure"`, `"gravure-quotes"`, `"dashboard"`)

---

## File & Folder Conventions

### Adding a New Calculator

Every calculator lives in its own folder under `components/calculators/`:

```
components/calculators/{Name}/
  {Name}Calculator.jsx     ← container: state, refs, save/print/reset handlers
  {Name}Form.jsx           ← controlled form; calls onProceed(form) in event handlers
  {Name}Result.jsx         ← invoice-style breakdown card
  {Name}SavedQuotes.jsx    ← saved quotes list + search + breakdown
  QuoteListItem.jsx        ← presentational quote row
  formConfig.js            ← materials config, localStorage helpers, form factories
  {Name}Calculator.md      ← calculator documentation
```

> **Note**: Per-calculator `*QuotesSidebar.jsx` files have been removed. Saved quotes are now accessed via sidebar sub-menu navigation, rendering a quotes list view in the main workspace.

Calculation logic goes in `utils/calculators/{camelName}.js` as a **pure function** — no side effects, no DOM, no React imports.

Rate constants go in `constants/{camelName}.js`.

### Naming

- Components: `PascalCase.jsx`
- Utilities / constants: `camelCase.js`
- localStorage keys: kebab-case strings (`"quotes-gravure"`, `"gravure-material-values"`)

---

## Calculator Container Pattern

All 3 calculator containers use the shared `useCalculator` hook from `hooks/useCalculator.js`:

```jsx
import useCalculator from "../../../hooks/useCalculator";
import { calculateMyRate } from "../../../utils/calculators/myRate";
import { makeInitialForm } from "./formConfig";

const buildPayload = (name, form, calc) => ({
  quoteName: name,
  pricePerKg: calc.pricePerKg,
  form: { ...form, quoteName: name },
});

export default function MyCalculator() {
  const {
    form,
    result,
    saveError,
    formRef,
    toast,
    handleFormChange,
    handleSave,
    handleReset,
    handlePrint,
  } = useCalculator({
    calcKey: "my-calc",
    calculateFn: calculateMyRate,
    makeInitialForm,
    buildPayload,
    toastMessage: "Saved successfully",
  });

  return (
    <div className="calc-shell">
      {toast}
      <CalculatorHeader
        icon={MyIcon}
        title="My Calculator"
        subtitle="Description"
        onSave={handleSave}
        onPrint={handlePrint}
        onReset={handleReset}
      />
      <div className="calc-grid">
        <div className="calc-column">
          <MyForm
            ref={formRef}
            onProceed={handleFormChange}
            saveError={saveError}
          />
        </div>
        <div className="calc-column" data-print-area>
          <MyResult result={result} form={form} />
        </div>
      </div>
    </div>
  );
}
```

The hook encapsulates: form state, result calculation, save validation (empty name → duplicate → null result), quote storage, `CustomEvent("quotes-updated")`, toast, form reset via `formRef`, and print.

---

## Quote Storage

Use `utils/quoteStorage.js` helpers — never write to `localStorage` directly for quote data:

```js
import {
  getQuotes,
  saveQuote,
  deleteQuote,
  getInitialQuotes,
} from "../../../utils/quoteStorage";

const CALC_KEY = "my-calc"; // unique per calculator, kebab-case
```

For persisting individual form field values between sessions (material prices, etc.), use a dedicated helper object inside the Form component — see `GravureForm.jsx` for the pattern.

---

## Save Validation Rules

Every `handleSave` must validate in this order:

1. **Empty name** → `setSaveError("Enter a customer name before saving.")`
2. **Duplicate name** (case-insensitive) → ``setSaveError(`A quote named "${name}" already exists. Use a different name.`)``
3. **No calculable result** → `setSaveError("Fill in required fields before saving.")`

`handleFormChange` must call `setSaveError(null)` to auto-clear the error on any form change.

---

## Number & Currency Formatting

Always use the helpers from `utils/format.js`:

```js
import { fmt, formatDate } from "../../../utils/format";

fmt(12345.6); // → "12,345.60"  (en-IN locale, 2 dp)
formatDate(isoString); // → "26 Feb 2026, 09:15 am"
```

- Currency symbol: `₹` — never `Rs.`, `INR`, or `Rs`
- Locale: `en-IN` for all number/date formatting

---

## UI Primitives

Use existing primitives from `components/ui/` — do not re-implement them:

| Component         | Use for                                                         |
| ----------------- | --------------------------------------------------------------- |
| `IOSToggle`       | Boolean toggle switches (`on` + `onToggle` props)               |
| `Badge`           | Count pill display (sidebar quote counts, notification dots)    |
| `GlassSeparator`  | Glass-style inset separator line (`role="separator"`)           |
| `SectionLabel`    | Uppercase tracking label for sidebar/form sections              |
| `CreatableSelect` | Dropdown with custom option creation + localStorage persistence |
| `MetaRow`         | Labeled metadata field (label + value)                          |
| `Toast`           | macOS-style self-dismissing notification + `useToast()` hook    |
| `Icons.jsx`       | 22 SVG icons (nav, actions, theme, account, search, export)     |

---

## Layout Rules

- Sidebar: `fixed top-3 bottom-3 left-3 w-64` glass island (see Sidebar Design Notes)
- Main content offset: `margin-left: calc(16rem + 0.75rem * 2)` (sidebar width + gaps) via `MAIN_MARGIN_LEFT` from `constants/layout.js`
- Page padding: `p-6` on `<main>` in `AppShell.jsx`
- Grid background: CSS grid pattern on `body` visible behind main content
- No header offset — the header island has been removed
- Calculator forms render full-width in the main workspace area

---

## What to Avoid

- ❌ No `console.log` left in production code
- ❌ No inline `style={{}}` — use Tailwind utilities (exception: dynamic `maxHeight` driven by `ResizeObserver`, `marginLeft` from layout constants)
- ❌ No external UI libraries (shadcn, Radix, MUI, etc.) — build from the existing primitives
- ❌ No hardcoded `#hex` or `rgb()` values in JSX className strings
- ❌ No direct `document.querySelector` / DOM manipulation — use refs
- ❌ No saving with `quoteName: "Untitled"` — always validate and require a name

---

## Code Review Checklist — Always Apply

When the user says **"review the code"**, **"clean up"**, **"organize"**, or after completing any implementation, run through **all** of these checks on both client and server:

### File & Component Structure

- **One component per file** — never define multiple components in one `.jsx` file. Extract every `function ComponentName` into its own file.
- **Single responsibility** — each file does one thing. Config/constants, UI, business logic, and data access must live in separate files.
- **Folder conventions** — group related files in folders (e.g. `RateSettings/`, `calculators/`, `config/`, `controllers/`, `services/`, `middleware/`).

### Dead Code & Unused Imports

- Remove all unused imports, variables, functions, and commented-out code.
- Remove unused props being passed to components.
- Remove any orphaned files that are no longer imported anywhere.

### Tailwind / CSS Class Reuse

- **Extract repeated className strings** into `@layer components` classes in `index.css` whenever the same combination appears 3+ times across files.
- Keep JSX `className` strings short — reference extracted classes (`.card`, `.btn-primary`, `.table-action-btn`, etc.) instead of long utility chains.
- Never duplicate what an existing `@layer components` class already provides.

### Server Architecture (Express)

- **Routes** — only route definitions + middleware chains. No business logic.
- **Controllers** — handle `req`/`res`, call services, set HTTP status. No data access.
- **Services** — pure business logic + data access. No `req`/`res` objects.
- **Middleware** — reusable validation (e.g. `validateNumber("price")`, `validateMaterial`).
- **Config** — constants, paths, and environment variables in `config/` folder.
- No circular dependencies between modules.

### React Patterns

- Use `useState` with factory init (`() => makeInitialForm()`) for expensive defaults.
- Call parent callbacks in event handlers, never in `useEffect`.
- Use ternary `? : null` for conditionals, never `&&`.
- Derive state during render where possible — avoid `useEffect` for derived values.
- Icons belong in `Icons.jsx` — never inline SVGs in feature components.
- Shared UI primitives (`IOSToggle`, `Badge`, `CreatableSelect`, etc.) must be used — never re-implement.

### Scalability & Maintainability

- Code must be easy to extend — new calculators, new settings tabs, new rate types should only require adding data to config + a new component file.
- Business logic (calculation functions, rate builders) must be **pure functions** — no DOM, no React, no side effects.
- All shared state providers should be instantiated at the highest necessary level (e.g. `AppShell`), never duplicated in child components.

### Security

- **Input sanitization** — validate and sanitize all user input on the server. Never trust `req.body`/`req.params`/`req.query`. Add length limits and trim strings in validation middleware.
- **CORS origin** — `cors({ origin })` must use an env-var allowlist, never `"*"` in production. Use `process.env.CLIENT_ORIGIN` or similar.
- **Body size limit** — `express.json({ limit: '100kb' })` to prevent large payload attacks.
- **Helmet headers** — add `helmet` middleware for security headers (`X-Content-Type-Options`, `X-Frame-Options`, CSP, etc.).
- **Rate limiting** — add `express-rate-limit` on mutation endpoints (POST/PUT/DELETE) to prevent abuse.
- **No secrets in code** — API keys, DB URIs, ports must come from `process.env` via `.env` + `dotenv`. `.env` must be in `.gitignore`.

### Error Handling

- **Consistent error shape** — every error response must use `{ error: string }`. Never leak stack traces, file paths, or internal details to the client.
- **Async error propagation** — every controller must wrap logic in try/catch and call `next(err)`. No unhandled promise rejections.
- **Client fetch error handling** — every `fetch()` / API call must handle network errors, non-2xx responses, and JSON parse failures. Never assume a fetch succeeds.
- **Graceful degradation** — if the server is unreachable, the client must show a fallback state (error message, cached data, or empty state), never crash or show a blank screen.

### API Design Consistency

- **HTTP status codes** — `200` reads/updates, `201` creates, `204` deletes, `400` validation errors, `404` not found, `500` server errors. Apply consistently across all controllers.
- **Response shape** — use a consistent envelope (flat payload or `{ data: ... }`) across all endpoints. Don't mix styles.
- **URL naming** — all routes use kebab-case nouns (`/api/gravure/settings`). No verbs in URLs (`/api/getSettings` ❌).

### Performance

- **Memoize expensive derivations** — use `useMemo` for filtering/sorting/transforming large lists. Don't memoize trivially cheap operations.
- **Stable callback references** — use `useCallback` for handlers passed to memoized children or used in dependency arrays. Not everywhere — only when it prevents unnecessary re-renders of expensive subtrees.
- **Avoid new references in JSX** — `style={{}}`, `options={[...]}`, or inline `onChange={() => {}}` create new objects every render. Hoist to module-level constants or memoize when passed to memoized children.
- **Key prop correctness** — list `key` must be a stable unique identifier (ID), never an array index (unless the list is static and never reordered/filtered).

### Data Integrity

- **Optimistic UI with rollback** — if a mutation fails after optimistic update, revert to the previous state rather than leaving stale/incorrect data on screen.
- **localStorage guard** — always wrap `localStorage.getItem`/`setItem` in try/catch — quota exceeded or disabled storage (private/incognito) throws.
- **Idempotent mutations** — PUT/DELETE operations must produce the same result if called multiple times (no duplicate entries on retry).

### Accessibility

- **Interactive elements** — every clickable element must be a `<button>` or `<a>`, never a `<div onClick>` or `<span onClick>`.
- **Form labels** — every `<input>` has an associated `<label>` (via `htmlFor`) or `aria-label`.
- **Keyboard navigation** — all interactive flows (modals, dropdowns, table row actions) must be operable with keyboard alone (Tab, Enter, Escape).
- **Focus management** — when opening a modal/sheet, focus moves into it; on close, focus returns to the trigger element.

### Build & Lint Hygiene

- **Zero build warnings** — `vite build` must produce zero warnings. Treat warnings as errors.
- **Zero ESLint errors** — run `eslint` before committing. All rules in `eslint.config.js` must pass.
- **No `console.log`** — remove all debug logging before review is complete. Server-side `console.error` in the global error handler is the only exception.

---

## Post-Implementation Workflow — Always Follow

After completing any implementation, review, or cleanup pass, execute these steps **in order** before moving to the next task:

### Step 1 — Code Review

Run through **every** subsection of the Code Review Checklist above. Fix all violations before proceeding.

### Step 2 — Build & Lint Verification

```bash
# Client
cd client && npx vite build

# Server (if changed)
cd server && node --check index.js
```

Both must exit with zero errors and zero warnings.

### Step 3 — Documentation

Update the relevant documentation to reflect what was built or changed:

- **Changed an existing feature?** → Update its existing `.md` doc (e.g., `GravureRateCalculator.md`, `FlexoRateCalculator.md`, `JobCostCalculator.md`).
- **Built a new feature/concept?** → Create a new `.md` doc in the feature's folder following the existing documentation pattern.
- **Changed architecture, file structure, or shared patterns?** → Update the Architecture & Module Structure tree and any affected sections in `copilot-instructions.md`.
- **Added new components, hooks, utils, or constants?** → Add them to the relevant reference table in `copilot-instructions.md` (UI Primitives, Component Layer Classes, etc.).
- **Added new `@layer components` classes?** → Add them to the Component Layer Classes table in `copilot-instructions.md`.

### Step 4 — Commit

Prepare a structured commit message from the staged + unstaged diff:

```
<type>(<scope>): <summary>

- bullet point for each logical change
- group by area (client, server, docs)
```

**Types:** `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `perf`
**Scopes:** `gravure`, `flexo`, `job-cost`, `settings`, `sidebar`, `ui`, `server`, `shell`, `docs`

Present the commit message to the user for approval.

### Step 5 — Push Reminder

After the commit message is approved and committed, remind the user:

> **Push your changes before starting the next task:**
>
> ```bash
> git push
> ```

Do not begin any new implementation until the user confirms the push is done.

---

## React Patterns (from `vercel-react-best-practices` + `vercel-composition-patterns`)

These rules **must be followed** in all React code in this project.

### `rendering-conditional-render` — Always use ternary, never `&&`, for JSX conditionals

`&&` can accidentally render `0` or other falsy primitives. Always use an explicit ternary with `null`.

```jsx
// ✅ Correct
{
  hasError ? <p className="text-red-500">{error}</p> : null;
}
{
  count > 0 ? <Badge>{count}</Badge> : null;
}

// ❌ Wrong — && renders "0" when count is 0
{
  count && <Badge>{count}</Badge>;
}
```

### `rerender-move-effect-to-event` — Call parent callbacks in event handlers, not `useEffect`

```jsx
// ✅ Correct — one render cycle
function setField(key, val) {
  const next = { ...form, [key]: val };
  setForm(next);
  onProceed?.(next); // notify parent in same event handler
}

// ❌ Wrong — two render cycles
useEffect(() => {
  onProceed?.(form);
}, [form]);
```

### `rerender-lazy-state-init` — Use factory function for expensive `useState` init

```jsx
// ✅ Correct — makeInitialForm() runs only once
const [form, setForm] = useState(() => makeInitialForm());

// ❌ Wrong — runs makeInitialForm() on every render
const [form, setForm] = useState(makeInitialForm());
```

### `architecture-avoid-boolean-props` — No boolean flags to change component behaviour

Use explicit variant components instead of `isEditing`, `isReadOnly`, `isBold` props.

_Exception: simple file-scoped leaf components like `IOSToggle` (`on` prop) or `InvoiceRow` (`bold`/`muted`) are acceptable._

---

## Next Session — Where to Continue

> **⚠️ ACTIVE: UI Redesign in progress.**
> Sprint plan: [`UI_REDESIGN_SPRINTS.md`](UI_REDESIGN_SPRINTS.md)
> Read that file before starting any UI work.

**Sprint 1 (sidebar + layout shell) is complete.**

**Sprint 2 (all 3 calculator rebuilds) is complete.** All features built:

- ✅ Compound form component system (7 primitives in `components/form/`)
- ✅ `CalculatorHeader` component with Save/Print/Export/Reset/Delete buttons
- ✅ CSS class extraction (28+ reusable `@layer components` classes including `.calc-shell`, `.calc-grid`, `.calc-column`, `.item-row-*`)
- ✅ Shared `useCalculator` hook — all 3 containers refactored to use it
- ✅ Shared `SECTION_COLORS` in `constants/invoiceColors.js` — all 3 result components use it
- ✅ **Gravure**: form, result (4 sections), saved quotes, material row, formConfig, documentation
- ✅ **Flexo**: form (6 sections), result (4 sections), saved quotes, formConfig, documentation
- ✅ **Job Cost**: form (6 sections, 10 toggleable items), result (3 color-coded sections), saved quotes, ItemRow, formConfig, documentation
- ✅ `Toast.jsx` — macOS-style self-dismissing notification + `useToast()` hook
- ✅ Icons expanded (22 total)
- ✅ `CreatableSelect` dropdown positioning bug fixed
- ✅ Persistent view mounting in AppShell (preserves state across navigation)
- ✅ Cross-component sync via `CustomEvent("quotes-updated")`
- ✅ Badge live update via `useQuoteCounts` hook
- ✅ Print styles with `data-print-area` + `@media print`
- ✅ Shared utilities: `getInitialQuotes()`, `groupByMonth()` in utils
- ✅ `WastageRow.jsx` — shared invoice primitive
- ✅ `SavedQuotesView.jsx` + `QuoteListItem.jsx` — configurable `formatPrice` prop
- ✅ Full calculator documentation for all 3 calculators

**Next:** Sprint 3 — Price History Feature, or Sprint 4 — Dashboard.

**Git checkpoint**: `ebecfc5` — pre-UI-redesign state with all 3 calculators working. Use `git checkout ebecfc5 -- client/src/components/` to reference old component code.

Design references are stored in `UI References/` folder at project root.

---

## Development Phases

| Phase     | Scope                                                                             | Status                           |
| --------- | --------------------------------------------------------------------------------- | -------------------------------- |
| 1a        | App shell, header island, segmented control, dark mode, ThemeContext              | ✅ Done (removed in UI redesign) |
| 1b        | UI primitives (IOSToggle, CheckBox, CreatableCombobox, Icons), quote storage util | ✅ Done                          |
| 1c        | Gravure Rate Calculator — form, result, saved quotes, validation                  | ✅ Done (rebuilt in UI redesign) |
| 1c        | Flexo Rate Calculator — form, result, sidebar, modal, validation                  | ✅ Done (rebuilt in UI redesign) |
| 1c        | Job Cost Calculator — form, result, sidebar, modal, inline validation             | ✅ Done (rebuilt in UI redesign) |
| 1d        | Full-width layout expansion — removed max-w-6xl, reduced page padding             | ✅ Done                          |
| **UI-1**  | **UI Redesign Sprint 1 — Left sidebar + layout shell + grid bg**                  | **✅ Complete**                  |
| **UI-2**  | **UI Redesign Sprint 2 — Calculator rebuild + saved quotes views**                | **✅ Complete**                  |
| **UI-3+** | **UI Redesign Sprints 3–8 (see `UI_REDESIGN_SPRINTS.md`)**                        | **🔲 Pending**                   |
| 2         | DB persistence — Express server, MongoDB, save & retrieve quotes                  | 🔲 Pending                       |
| 3         | Rate Settings — global rates + per-calculator overrides                           | 🔲 Pending                       |
| 4         | Authentication (nice-to-have)                                                     | 🔲 Pending                       |
