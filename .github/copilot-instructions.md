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
│   └── useQuoteCounts.js        ✅ Reads quote counts for all calcs from localStorage, listens to storage events
│
├── components/
│   ├── ui/
│   │   ├── IOSToggle.jsx        ✅ iOS-style boolean toggle (on + onToggle)
│   │   ├── Badge.jsx            ✅ Reusable count pill (min-w-5 h-5 rounded-full)
│   │   ├── GlassSeparator.jsx   ✅ Inset glass separator line with role="separator"
│   │   ├── SectionLabel.jsx     ✅ Uppercase tracking label for sidebar sections
│   │   └── Icons.jsx            ✅ 14 icons: Close, Trash, ChevronDown, Dashboard, Gravure, Flexo, JobCost, Sun, Moon, Calculator, Quotes, History, User, Logout
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
│   │   └── AppShell.jsx                 ✅ Sidebar + main workspace, manages activeView state
│   │
│   ├── overlays/                🔲 All pending
│   │
│   ├── RateSettings/            🔲 All pending
│   │
│   └── calculators/             🔄 All deleted — pending rebuild (original code in git checkpoint ebecfc5)
│       ├── GravureRateCalculator/   🔲 index, Form, Result, QuoteModal
│       ├── FlexoRateCalculator/     🔲 index, Form, Result, QuoteModal
│       └── JobCostCalculator/       🔲 index, Form, Result, QuoteModal
│
├── constants/
│   ├── navigation.js        ✅ NAV_ITEMS array, QUOTE_STORAGE_KEYS, VIEW_META
│   ├── layout.js            ✅ SIDEBAR_WIDTH, SIDEBAR_GAP, MAIN_MARGIN_LEFT, APP_NAME, APP_SUBTITLE
│   ├── gravureRates.js      ✅ Printing/lam/slitting rates, pouch lookup, sample quotes
│   ├── flexoRateCalc.js     ✅ Toggle rates, roll/cutting size lookups, sample quotes
│   └── jobCost.js           ✅ Line item definitions, default prices, dropdown seeds, sample quotes
│
├── utils/
│   ├── format.js            ✅ fmt(), formatDate()
│   ├── quoteStorage.js      ✅ getQuotes(), saveQuote(), deleteQuote()
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

| Class            | Description                                           |
| ---------------- | ----------------------------------------------------- |
| `.card`          | `bg-grouped-background-2 rounded-2xl overflow-hidden` |
| `.card-section`  | `px-4 py-3` padding inside a card                     |
| `.divider`       | `border-t border-separator` horizontal rule           |
| `.field-label`   | `text-sm font-medium text-label-2`                    |
| `.input-base`    | full-width rounded input with focus ring              |
| `.btn-primary`   | filled tint button                                    |
| `.btn-secondary` | filled fill-2 button                                  |
| `.btn-ghost`     | text-only tint button                                 |
| `.btn-icon`      | 36px circular icon button                             |

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
  index.jsx                ← container: state, refs, quote list, save/delete handlers
  {Name}Form.jsx           ← controlled form; calls onProceed(form) in event handlers
  {Name}Result.jsx         ← collapsible breakdown card
  {Name}QuoteModal.jsx     ← invoice detail modal (React portal)
```

> **Note**: Per-calculator `*QuotesSidebar.jsx` files have been removed. Saved quotes are now accessed via sidebar sub-menu navigation, rendering a quotes list view in the main workspace.

Calculation logic goes in `utils/calculators/{camelName}.js` as a **pure function** — no side effects, no DOM, no React imports.

Rate constants go in `constants/{camelName}.js`.

### Naming

- Components: `PascalCase.jsx`
- Utilities / constants: `camelCase.js`
- localStorage keys: kebab-case strings (`"quotes-gravure"`, `"gravure-material-values"`)

---

## Calculator Container Pattern (`index.jsx`)

Follow the pattern established in `GravureRateCalculator/index.jsx` and `FlexoRateCalculator/index.jsx`:

```jsx
const CALC_KEY = "my-calc";

function getInitialQuotes() {
  const stored = getQuotes(CALC_KEY);
  const allSamples = stored.length > 0 && stored.every((q) => q.id.startsWith("sample-"));
  if (stored.length === 0 || allSamples) {
    localStorage.setItem(`quotes-${CALC_KEY}`, JSON.stringify(SAMPLE_QUOTES));
    return SAMPLE_QUOTES;
  }
  return stored;
}

export default function MyCalculator() {
  const [result, setResult] = useState(null);
  const [quotes, setQuotes] = useState(() => getInitialQuotes());
  const [saveError, setSaveError] = useState(null);
  const [formHeight, setFormHeight] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!formRef.current) return;
    const ro = new ResizeObserver(([entry]) => setFormHeight(entry.contentRect.height));
    ro.observe(formRef.current);
    return () => ro.disconnect();
  }, []);

  function handleFormChange(form) {
    setSaveError(null);
    setResult(calculateMyRate(form));
  }

  function handleSave(form) {
    const name = form.quoteName.trim();
    if (!name) { setSaveError("Enter a customer name before saving."); return; }
    const dup = quotes.some((q) => q.quoteName.trim().toLowerCase() === name.toLowerCase());
    if (dup) { setSaveError(`A quote named "${name}" already exists. Use a different name.`); return; }
    const calc = calculateMyRate(form);
    if (!calc) { setSaveError("Fill in required fields before saving."); return; }
    setSaveError(null);
    setQuotes(saveQuote(CALC_KEY, { quoteName: name, /* summary fields */, form: { ...form, quoteName: name } }));
  }

  function handleDelete(id) {
    setQuotes(deleteQuote(CALC_KEY, id));
  }
}
```

---

## Quote Storage

Use `utils/quoteStorage.js` helpers — never write to `localStorage` directly for quote data:

```js
import { getQuotes, saveQuote, deleteQuote } from "../../../utils/quoteStorage";

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

| Component        | Use for                                                      |
| ---------------- | ------------------------------------------------------------ |
| `IOSToggle`      | Boolean toggle switches (`on` + `onToggle` props)            |
| `Badge`          | Count pill display (sidebar quote counts, notification dots) |
| `GlassSeparator` | Glass-style inset separator line (`role="separator"`)        |
| `SectionLabel`   | Uppercase tracking label for sidebar/form sections           |
| `Icons.jsx`      | 14 SVG icons (nav, actions, theme, account)                  |

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

**Sprint 1 (sidebar + layout shell) is complete.** The old header, segmented control, and per-calculator sidebars have been removed. A left navigation sidebar (glass island) with expandable menus is in place. Calculator components are deleted and pending rebuild.

**Next: Sprint 2** — Rebuild all 3 calculator components (form + result) in the new main workspace area. Build saved quotes views accessible from sidebar sub-menus. User will provide a main workspace design reference before starting.

**Git checkpoint**: `ebecfc5` — pre-UI-redesign state with all 3 calculators working. Use `git checkout ebecfc5 -- client/src/components/` to reference old component code.

Design references are stored in `UI References/` folder at project root.

---

## Development Phases

| Phase     | Scope                                                                             | Status                             |
| --------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| 1a        | App shell, header island, segmented control, dark mode, ThemeContext              | ✅ Done (removed in UI redesign)   |
| 1b        | UI primitives (IOSToggle, CheckBox, CreatableCombobox, Icons), quote storage util | ✅ Done                            |
| 1c        | Gravure Rate Calculator — form, result, sidebar, modal, validation                | ✅ Done (deleted, pending rebuild) |
| 1c        | Flexo Rate Calculator — form, result, sidebar, modal, validation                  | ✅ Done (deleted, pending rebuild) |
| 1c        | Job Cost Calculator — form, result, sidebar, modal, inline validation             | ✅ Done (deleted, pending rebuild) |
| 1d        | Full-width layout expansion — removed max-w-6xl, reduced page padding             | ✅ Done                            |
| **UI-1**  | **UI Redesign Sprint 1 — Left sidebar + layout shell + grid bg**                  | **✅ Complete**                    |
| **UI-2**  | **UI Redesign Sprint 2 — Calculator rebuild + saved quotes views**                | **🔲 Next**                        |
| **UI-3+** | **UI Redesign Sprints 3–8 (see `UI_REDESIGN_SPRINTS.md`)**                        | **🔲 Pending**                     |
| 2         | DB persistence — Express server, MongoDB, save & retrieve quotes                  | 🔲 Pending                         |
| 3         | Rate Settings — global rates + per-calculator overrides                           | 🔲 Pending                         |
| 4         | Authentication (nice-to-have)                                                     | 🔲 Pending                         |
