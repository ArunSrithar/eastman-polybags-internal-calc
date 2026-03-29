# UI Redesign — Sprint Plan

> **Status**: Sprint 1 complete. Sprint 2 complete — all 3 calculators fully rebuilt (Gravure, Flexo, Job Cost) with forms, results, saved quotes, shared `useCalculator` hook, shared `SECTION_COLORS`, CSS directive extraction, and full documentation.
> **Approach**: Clean-slate rebuild. Old `components/` folder was deleted entirely (git checkpoint `ebecfc5` preserves it). New modular architecture built from scratch with proper separation of concerns.
>
> **Main workspace design**: Calculator forms use a 2-column grid layout (form left, result right) with a shared `CalculatorHeader`. Form fields built using reusable compound form components (`components/form/`). Saved quotes are separate views (also 2-column: quote list left, breakdown right) accessible via sidebar sub-navigation.

---

## Product Context

Eastman Polybags Internal Quote Calculator — an internal tool for staff to generate quotes for customers based on daily fluctuating rates. Three calculators (Gravure, Flexo, Job Cost) with saved quotes and live calculation results.

**Goal of redesign**: Transform from the current calculator-owns-sidebar layout into a left sidebar navigation architecture — glass island sidebar with expandable calculator menus, grid background pattern, and a spacious main workspace for calculator forms and results.

---

## Design References

All images stored in `UI References/` folder at project root.

| Reference             | File                                   | Key Takeaways                                                                                                                                                               |
| --------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zendenta**          | _(shared in chat, not saved)_          | Clean bill detail modal with grouped line items, colored dot category indicators, side-by-side dual-pane layout, section subtotals on header rows                           |
| **eevo.team sidebar** | `72cc3e5ab9382fdc1b417aca48bc9327.jpg` | Dark collapsible sidebar, expanded/collapsed states, section groups (MENU/OTHER), expandable nav with colored dot sub-items, count badges, tooltip labels in collapsed mode |
| **Email channel**     | `1f18bf56903c615f57b180e690c9b178.jpg` | Sidebar with search + collapsible sections + LISTS with colored dots, main area with bold title + muted subtitle, tab bar, Sort/Filter pill buttons, clean data table       |
| **InStudy Admin**     | `4ea25c72bb41a32078b1cb621cdc68df.jpg` | Icon rail sidebar, expandable tree with item counts (12, 8, 4), segmented "Folders / Tags" toggle, search bar, main area with section titles + card grid + file table       |

---

## Target Layout: Left Sidebar + Main Workspace

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                │
│ │ Eastman   │                                                │
│ │ Colour    │    MAIN WORKSPACE                              │
│ │ Printers  │                                                │
│ │───────────│    Calculator form + live result                │
│ │ Dashboard │    (renders based on sidebar selection)         │
│ │ ▾ Gravure │                                                │
│ │   Calc    │    ┌─ Form Card ─────────────────────────┐     │
│ │   Quotes 3│    │  Fields, toggles, materials...      │     │
│ │   History │    │  [Customer] [Save] [Reset]           │     │
│ │ ▾ Flexo   │    └─────────────────────────────────────┘     │
│ │   Calc    │                                                │
│ │   Quotes 2│    ┌─ Live Result ───────────────────────┐     │
│ │   History │    │  ₹214.75/kg   View details ▸        │     │
│ │ ▾ Job Cost│    └─────────────────────────────────────┘     │
│ │   Calc    │                                                │
│ │   Quotes 5│                                                │
│ │   History │                                                │
│ │───────────│                                                │
│ │ SETTINGS  │                                                │
│ │ 🌙 Dark   │                                                │
│ │ 👤 Admin ⏻│                                                │
│ └──────────┘                                                │
└──────────────────────────────────────────────────────────────┘
```

Grid background pattern visible on the main workspace area.
Sidebar is a frosted glass island (rounded, detached from edges).

- **Desktop (lg+)**: Sidebar pinned left as glass island, main workspace fills remainder
- **Tablet / Mobile**: Responsive behavior TBD — sidebar may collapse to hamburger overlay

---

## Approach: Clean-Slate Rebuild

> **⚠️ WHAT HAPPENED**: Instead of delete-then-recreate per file, the entire `components/` folder was deleted and rebuilt from scratch. Git checkpoint `ebecfc5` preserves all original code.
>
> **Rollback**: `git checkout ebecfc5 -- client/src/components/` restores the entire old components tree.

| Kept as-is (never deleted)                                                  | Deleted & rebuilt from scratch                         | Brand new files (Sprint 1)                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| `theme.css` — all color tokens                                              | `AppShell.jsx` — rewritten as sidebar + main workspace | `Sidebar/Sidebar.jsx` — glass island container                 |
| `index.css` — component layer classes + grid bg pattern added               | `ui/Icons.jsx` — expanded with nav icons               | `Sidebar/SidebarHeader.jsx` — branding + separator             |
| `ThemeContext.jsx` — dark mode toggle                                       | `ui/IOSToggle.jsx` — preserved logic, same file        | `Sidebar/SidebarNav.jsx` — navigation list using NavItem       |
| `utils/calculators/*.js` — pure calculation functions                       |                                                        | `Sidebar/SidebarFooter.jsx` — theme toggle + account row       |
| `utils/quoteStorage.js` — localStorage quote helpers + `getInitialQuotes()` |                                                        | `Sidebar/NavItem.jsx` — expandable top-level nav item          |
| `utils/format.js` — `fmt()`, `formatDate()`, `groupByMonth()`               |                                                        | `Sidebar/SubNavItem.jsx` — sub-menu item with badge            |
| `constants/gravureRates.js`, `flexoRateCalc.js`, `jobCost.js`               |                                                        | `layout/PlaceholderView.jsx` — placeholder for unbuilt views   |
|                                                                             |                                                        | `ui/Badge.jsx` — reusable count pill                           |
|                                                                             |                                                        | `ui/GlassSeparator.jsx` — inset separator line                 |
|                                                                             |                                                        | `ui/SectionLabel.jsx` — uppercase sidebar section label        |
|                                                                             |                                                        | `constants/navigation.js` — NAV_ITEMS, VIEW_META, QUOTE_KEYS   |
|                                                                             |                                                        | `constants/layout.js` — SIDEBAR_WIDTH, APP_NAME, margins       |
|                                                                             |                                                        | `hooks/useQuoteCounts.js` — quote count hook from localStorage |

**Deleted permanently** (replaced by sidebar navigation):

- `Header/` folder (AppHeader, AppLogo, DarkModeToggle, UserMenu/)
- `SegmentedControl/` folder
- All `*QuotesSidebar.jsx` files
- All calculator `index.jsx`, form, result, and modal files (to be rebuilt in later sprints)

---

## Sprint Breakdown

### Sprint 1 — Foundation: Layout Shell + Left Navigation Sidebar ✅ COMPLETE

> **Goal**: ~~Replace the current full-width single-zone with a 3-zone layout~~ → **Pivoted**: Remove header entirely and replace with a left navigation sidebar. Sidebar provides all navigation, theme toggle, and account controls.
>
> **What was actually built**:
>
> - Left-fixed glass island sidebar (frosted glass, rounded-2xl, detached from edges)
> - Expandable nav menus: Dashboard, Gravure, Flexo, Job Cost — each with sub-menus (Calculator, Saved Quotes, Price History)
> - Badge counts on saved quotes sub-items (live from localStorage)
> - Footer: dark mode toggle (IOSToggle) + account row (user icon, "Admin", logout button)
> - Grid background pattern on body (CSS grid using `--color-separator`)
> - AppShell: sidebar + main workspace with `margin-left` offset
> - PlaceholderView for all unbuilt views
> - All menus expanded by default
> - Navigation driven by `activeView` string state (not React Router)

**Chunk 1.1 — AppShell rewrite** ✅

- Deleted entire `components/` folder, rebuilt from scratch
- AppShell manages `activeView` state, renders sidebar + main area
- Main area uses `margin-left: calc(16rem + 0.75rem * 2)` from `constants/layout.js`
- Calculator views mapped in `CALCULATOR_VIEWS` object (all null — pending rebuild)
- Non-calculator views render `PlaceholderView`

**Chunk 1.2 — Sidebar glass island** ✅

- `Sidebar.jsx`: fixed left, frosted glass (`bg-background/60 dark:bg-background-2/60 backdrop-blur-2xl backdrop-saturate-200`)
- `rounded-2xl`, `top-3 bottom-3 left-3` for floating island effect
- Composed of: SidebarHeader → SidebarNav → SidebarFooter

**Chunk 1.3 — Sidebar navigation** ✅

- `SidebarNav.jsx` reads `NAV_ITEMS` from `constants/navigation.js`
- `NavItem.jsx`: top-level items with expand/collapse, active = `bg-tint/10 text-tint`
- `SubNavItem.jsx`: sub-items with icon + badge, active = `text-tint font-medium` (no bg)
- `useQuoteCounts` hook reads quote counts from localStorage, listens to `storage` events

**Chunk 1.4 — Sidebar footer** ✅

- Dark mode toggle: SunIcon/MoonIcon + "Dark Mode" label + IOSToggle (wired to ThemeContext)
- Account row: blue user icon circle + "Admin" + red logout circle button
- GlassSeparator between nav and settings section

**Chunk 1.5 — Shared UI components extracted** ✅

- `Badge.jsx`: reusable count pill (`min-w-5 h-5 rounded-full bg-fill-2`)
- `GlassSeparator.jsx`: `border-t border-black/10 dark:border-white/10` with `role="separator"`
- `SectionLabel.jsx`: uppercase tracking label for sidebar sections
- `Icons.jsx`: expanded with 14 icons (Dashboard, Gravure, Flexo, JobCost, Sun, Moon, Calculator, Quotes, History, User, Logout, Close, Trash, ChevronDown)

**Chunk 1.6 — Constants & hooks extracted** ✅

- `constants/navigation.js`: NAV_ITEMS, QUOTE_STORAGE_KEYS, VIEW_META
- `constants/layout.js`: SIDEBAR_WIDTH, SIDEBAR_GAP, MAIN_MARGIN_LEFT, APP_NAME, APP_SUBTITLE
- `hooks/useQuoteCounts.js`: custom hook for badge counts

**Chunk 1.7 — Grid background pattern** ✅

- Added to `index.css` body rule (outside @layer to avoid specificity issues)
- Uses `--grid-color: var(--color-separator)`, `--grid-gap: 5em`, `--grid-line: 1px`
- Visible in both light and dark modes

**Chunk 1.8 — Responsive** 🔲 DEFERRED

- Mobile sidebar behavior not yet implemented — deferred to later sprint

**Verification**: ✅ Build passes (`npx vite build` — 47 modules, 408ms, 0 errors). Sidebar renders with glass effect, all menus expand, badges show counts, dark mode works, placeholders show for all views. Calculators are placeholders (pending rebuild).

---

### Sprint 2 — Calculator Rebuild + Saved Quotes Views ✅ COMPLETE

> **Goal**: Rebuild all 3 calculator components in the new layout (form + result in main workspace). Build the "Saved Quotes" views accessible from sidebar sub-menus. Quote operations (view, save, delete) work through the new architecture.
>
> **Architecture note**: Quotes are no longer in a unified right sidebar. Each calculator has a "Saved Quotes" sub-menu in the left nav that renders a quotes list view in the main workspace area. Saved quotes view reuses the same `{Name}Result.jsx` component for the breakdown panel.
>
> **New architecture**: Reusable compound form components (`components/form/`) replace raw Tailwind in form JSX. Calculator containers use a 2-column grid (form + result) with a shared `CalculatorHeader`. Persistent view mounting in `AppShell` (CSS `display: none/block`) preserves state across navigation. Cross-component sync via `CustomEvent("quotes-updated")`.

**Chunk 2.0 — Compound form component system** `[FormComponents]` ✅ NEW

- Created 7 reusable form primitives in `components/form/`:
  - `FormStack.jsx` — outer wrapper, `flex flex-col gap-4`
  - `FormSection.jsx` — `.card` wrapper with title + auto-dividers between children
  - `TextField.jsx` — labeled text input (`.field-label` + `.input-base`)
  - `NumberField.jsx` — inline row (`.form-row`) with label + compact number input
  - `ToggleField.jsx` — inline row with label + `IOSToggle`
  - `RadioField.jsx` — horizontal radio group with `.radio-pill` styling
  - `SelectField.jsx` — labeled `CreatableSelect`, supports `inline` mode with `width` + `unit` props
- Composition approach: small reusable components composed in JSX (not JSON schema)

**Chunk 2.0b — CalculatorHeader component** `[CalcHeader]` ✅ NEW

- Created `components/layout/CalculatorHeader.jsx`
- Renders icon + title + subtitle on left, action buttons on right
- Action buttons: Reset (`ResetIcon`), Save (`SaveIcon`), Print (`PrintIcon`), Delete (`DeleteIcon`)
- Props: `icon`, `title`, `subtitle`, `onSave`, `onPrint`, `onReset`, `onDelete`

**Chunk 2.0c — CSS class extraction** `[CSSClasses]` ✅ NEW

- Extracted 10+ reusable `@layer components` classes to `index.css`:
  - `.glass-panel`, `.section-header`, `.form-row`, `.form-row-label`
  - `.btn-danger`, `.btn-pill`, `.radio-pill`/active/inactive
  - `.nav-button`, `.sub-nav-button`, `.dropdown-menu`, `.dropdown-option`
- Updated all JSX files to use extracted classes

**Chunk 2.0d — CreatableSelect dropdown fix** `[DropdownFix]` ✅ NEW

- Fixed dropdown positioning when opening above input and filtered list is shorter than `maxH`
- Switched from `top = r.top - maxH - 4` (fixed offset) to `bottom: window.innerHeight - r.top + 4` (anchors bottom edge of list to input top)
- Dropdown now grows upward naturally regardless of list height

**Chunk 2.0e — Icons expansion** `[IconsExpand]` ✅

- Added `PrintIcon`, `ResetIcon`, `SaveIcon`, `DeleteIcon`, `ExportIcon`, `SearchIcon`, `PdfIcon`, `PriceSettingsIcon` to `Icons.jsx`
- Total icon count: 22

**Chunk 2.1 — Rebuild calculator containers** `[Containers]` ✅ COMPLETE

- ✅ Gravure `GravureRateCalculator.jsx` rebuilt: 2-column grid, `CalculatorHeader`, save with validation + toast, `formRef` + `useImperativeHandle` for reset, `window.print()` for print
- ✅ Flexo `FlexoRateCalculator.jsx` rebuilt: same pattern as Gravure, `CALC_KEY = "flexo-rate-calc"`, saves `totalRate` (not `pricePerKg`)
- ✅ Job Cost `JobCostCalculator.jsx` rebuilt: same pattern, `CALC_KEY = "job-cost"`, saves `costOfJob`, `totalAmount`, `dispatchWeight`
- ✅ All 3 containers refactored to use shared `useCalculator` hook (`hooks/useCalculator.js`)
- ✅ Wired into `AppShell.jsx` PERSISTENT_VIEWS (gravure, gravure-quotes, flexo, flexo-quotes, job-cost, job-cost-quotes)

**Chunk 2.2 — Rebuild Gravure form + result** `[GravureRebuild]` ✅ COMPLETE

- ✅ `GravureForm.jsx` rebuilt using compound form components (`FormStack`, `FormSection`, `TextField`, `NumberField`, `ToggleField`, `RadioField`, `SelectField`, `MaterialRow`)
- ✅ `formConfig.js` extracted — `MATERIALS` config, localStorage helpers, `makeInitialForm()`
- ✅ `MaterialRow.jsx` extracted — presentational material toggle row
- ✅ `forwardRef` + `useImperativeHandle` for reset (clears quoteName, pouchSize, colors, mattFinish, lamination, slitting, wastage; keeps material toggle states + prices)
- ✅ Wastage field changed from NumberField to `SelectField` with `inline` mode
- ✅ `GravureResult.jsx` rebuilt — invoice-style breakdown card using invoice primitives (`InvoiceHeader`, `TableHeader`, `ItemRow`, `SectionLabel`, `SectionSubtotal`, `InvoiceFooter`)
- ✅ Accepts optional `status` and `date` props for saved-quote context
- ✅ `TextField.jsx` error prop for inline save validation (red ring + error text)
- ✅ Save validation: empty name, duplicate name (case-insensitive), no calculable result
- ✅ Toast notification on save + delete (`useToast()` hook, macOS-style)

**Chunk 2.3 — Rebuild Flexo form + result** `[FlexoRebuild]` ✅ COMPLETE

- ✅ `FlexoForm.jsx` rebuilt using compound form components (`FormStack`, `FormSection`, `TextField`, `NumberField`, `ToggleField`, `RadioField`, `SelectField`)
- ✅ `formConfig.js` extracted — `makeInitialForm()`, derived option arrays (`ROLL_SIZE_OPTIONS`, `CUTTING_SIZE_OPTIONS`), re-exports from constants
- ✅ `forwardRef` + `useImperativeHandle` for reset (clears all fields to initial state)
- ✅ 6 form sections: Customer, Material (price + PP/HM/LD radio), Size & Printing (cover size, roll size, color count radio), Additional Charges (3 toggles), Cutting, Wastage
- ✅ `FlexoResult.jsx` rebuilt — invoice-style breakdown with 4 conditional sections (Material & Conversion, Printing, Additional Charges, Adjustments)
- ✅ Uses `WastageRow` shared component (extracted from inline JSX in both Gravure + Flexo)
- ✅ `InvoiceFooter` highlight: "Total Rate" with no /kg suffix, annotation shows subtotal + wastage
- ✅ Constants updated: `CONVERSION_RATES` (materialType × rollSize), `PRINTING_RATES` (coverSize × numColors), `GUSSET_RATES` (coverSize) — all lookup-based with placeholder values
- ✅ `calculateFlexoRate()` updated: lookup-based conversion/printing/gusset rates, new return shape
- ✅ `SAMPLE_QUOTES` updated: added `conversionMaterial` + `printingColors`, removed `printingRate`, recalculated `totalRate` values
- ✅ Save validation: empty name, duplicate name (case-insensitive), no calculable result
- ✅ Toast notification on save

**Chunk 2.4 — Rebuild Job Cost form + result** `[JobCostRebuild]` ✅ COMPLETE

- ✅ `JobCostForm.jsx` rebuilt using compound form components (6 sections: Customer, Job Details, Specifications, Materials, Charges, Other Charges, Weights)
- ✅ 10 toggleable line items via `ItemRow.jsx` — 4 materials (qty × price), 4 charges (qty × price), 2 flat charges (amount only)
- ✅ `formConfig.js` — `makeInitialForm()`, derived groups (`MATERIAL_ITEMS`, `CHARGE_ITEMS`, `FLAT_ITEMS`), re-exports from constants
- ✅ `ItemRow.jsx` extracted as standalone component — toggleable with `IOSToggle`, supports qty+price or flat amount
- ✅ `forwardRef` + `useImperativeHandle` for reset
- ✅ `JobCostResult.jsx` rebuilt — invoice breakdown with 3 color-coded sections (Materials/blue, Charges/green, Other/orange)
- ✅ Uses shared `SECTION_COLORS` from `constants/invoiceColors.js`
- ✅ Dynamic `meta` array in `InvoiceHeader` (Job Card, Company, Film, Micron, Colours)
- ✅ `InvoiceFooter` with costOfJob highlight (`/kg` unit) + annotation showing total ÷ despatch weight
- ✅ Save validation: empty name, duplicate name, null result

**Chunk 2.5 — Saved Quotes view component** `[QuotesView]` ✅ COMPLETE (Gravure)

- ✅ `GravureSavedQuotes.jsx` — 2-column layout (quote list left, breakdown right)
- ✅ `QuoteListItem.jsx` — extracted presentational quote row (name, price, date, savedBy) with configurable `formatPrice` prop
- ✅ Quote list grouped by month via `groupByMonth()` utility
- ✅ Search bar with `SearchIcon` (capsule-shaped, sticky)
- ✅ Breakdown panel reuses `GravureResult` with `status="Saved"` and `date` props
- ✅ Delete with auto-select-next, toast notification, badge update
- ✅ Print button triggers `window.print()` with `@media print` + `data-print-area`
- ✅ Persistent view mounting in AppShell (display toggle preserves state)
- ✅ Cross-component sync: `CustomEvent("quotes-updated")` refreshes list + badge count
- ✅ 20 sample quotes seeded across 4 months via `getInitialQuotes()` shared utility
- ✅ `FlexoSavedQuotes.jsx` — wraps `SavedQuotesView` with Flexo config + `formatFlexoPrice` (₹X not ₹X/kg)
- ✅ `SavedQuotesView.jsx` — accepts `formatPrice` prop, passes through to `QuoteListItem`
- ✅ `JobCostSavedQuotes.jsx` — wraps `SavedQuotesView` with Job Cost config + `formatJobCostPrice` (₹X/kg)

**Chunk 2.6 — Invoice primitives system** `[InvoicePrimitives]` ✅ COMPLETE

- ✅ `InvoiceHeader.jsx` — branding + customer/date metadata + status badge
- ✅ `InvoiceFooter.jsx` — total row + highlighted price-per-kg strip
- ✅ `InvoiceEmpty.jsx` — placeholder for no-result state
- ✅ `TableHeader.jsx` — 4-column header (Item, Rate, Qty, Amount)
- ✅ `ItemRow.jsx` — 4-column data row with `.invoice-grid`
- ✅ `SectionLabel.jsx` — colored dot + section name
- ✅ `SectionSubtotal.jsx` — bordered pill subtotal row + divider
- ✅ `WastageRow.jsx` — reusable wastage adjustment line (percent, base, amount)
- Reusable across all calculator result/breakdown views

**Chunk 2.7 — Toast notification system** `[ToastSystem]` ✅ COMPLETE

- ✅ `Toast.jsx` + `useToast()` hook — macOS-style self-dismissing notification
- ✅ Glass material, slide-from-right animation (3-phase: enter → visible → exit)
- ✅ 2-line format (title bold + message), fixed `w-80`
- ✅ Used by both calculator save and saved-quotes delete

**Chunk 2.8 — CSS class extraction** `[CSSClasses2]` ✅ COMPLETE

- Added to `@layer components`: `.quote-list-item`, `.quote-list-item-active`, `.month-label`
- Added invoice classes: `.invoice-grid`, `.invoice-col-rate`, `.invoice-col-qty`, `.invoice-col-amount`, `.invoice-meta-label`, `.invoice-badge`
- Total reusable component classes: 20+

**Chunk 2.9 — Documentation** `[CalcDocs]` ✅ COMPLETE

- ✅ `GravureRateCalculator.md` — full calculator documentation (formula, fields, rates, data flow, file structure, storage, status)
- ✅ `FlexoRateCalculator.md` — full calculator documentation
- ✅ `JobCostCalculator.md` — full calculator documentation (formula, line items, 3 color-coded sections, data flow)
- ✅ `copilot-instructions.md` updated with current architecture, file tree, patterns, shared hook + colors

**Chunk 2.10 — Wire sidebar badge counts** `[Badges]` ✅ COMPLETE

- `useQuoteCounts` hook reads from localStorage + listens to `quotes-updated` CustomEvent
- Badges display on "Saved Quotes" sub-items, update live on save/delete

**Verification**: All 3 calculators fully functional: form input → live result → save quote with validation + toast → view in saved quotes list → search → select to view breakdown → delete with auto-select. Badges update live. Print works. State persists across navigation. All containers use shared `useCalculator` hook. All result components use shared `SECTION_COLORS`. CSS directives extracted (`.calc-shell`, `.calc-grid`, `.calc-column`, `.item-row-*`). Build: 95 modules, 261.33 KB JS, 0 errors.

---

### Sprint 3 — Price History Feature

> **Goal**: Build the Price Changes History tab. Track when daily-fluctuating rate fields change and display a chronological log.

**Chunk 3.1 — Price history storage utility** `[PriceHistoryUtil]`

- Create `utils/priceHistory.js`
- `logPriceChange(calculator, field, oldValue, newValue)` — appends to `localStorage["price-history"]`
- `getPriceHistory(calculator?)` — returns array, optionally filtered by calculator
- `clearPriceHistory()` — for dev/testing
- Each entry: `{ id, calculator, field, oldValue, newValue, timestamp }`
- Cap at 200 entries (FIFO — oldest removed when exceeded)

**Chunk 3.2 — Instrument form components to log changes** `[Instrumentation]`

- In each rewritten form component (from Sprint 4), detect when a persisted rate field changes
- Call `logPriceChange()` on change
- If Sprint 4 hasn't started yet, create a `usePriceChangeLogger` hook that can be added to forms when they're rewritten
- **Gravure tracked fields**: polyester.price, silverPet.price, ldRoll.price, bopp.price
- **Flexo tracked fields**: materialPrice, printingRate
- **Job Cost tracked fields**: polyster.price, silverPolyster.price, boppSilver.price, ldnLdop.price, printingCharges.price, laminationCharges.price, slittingCharges.price, pouchMakingCharges.price

**Chunk 3.3 — Price History list component** `[PriceHistoryList]`

- Create `components/layout/Sidebar/PriceHistoryList.jsx`
- Reads from `getPriceHistory()` for the active calculator (or all)
- Groups entries by date: "Today", "Yesterday", "25 Mar 2026"
- Each entry shows:
  - Field name (bold)
  - Old value → New value with change direction (↑ red / ↓ green + percentage)
  - Timestamp
  - Calculator dot indicator (if showing all)
- Empty state: "No price changes recorded yet."

**Chunk 3.4 — Wire history tab in sidebar** `[WireHistory]`

- Connect `PriceHistoryList` to the "History" tab in the sidebar
- Updates reactively when a price is changed in the form

**Verification**: Change a material price in Gravure form → Price History tab shows the change with old/new values. Works across all 3 calculators. Grouped by date. Persists across page reloads.

---

### Sprint 4 — Form Section Grouping & Visual Polish

> **Goal**: Reorganize form fields into named sections with colored dot indicators, section counts, and subtotals. Forms feel organized and scannable.

**Chunk 4.1 — Section header component** `[SectionHeader]`

- Create `components/ui/SectionHeader.jsx`
- Props: `color` (dot color), `label`, `count?`, `subtotal?`
- Renders: `● Section Name (3)` with optional right-aligned `₹ 18,700`
- Colored dot: `size-2 rounded-full` with the given color class

**Chunk 4.2 — Rewrite Gravure form with section grouping** `[GravureSections]`

- Read existing `GravureForm.jsx` for context, then delete and recreate
- Same field logic and `onProceed` callback pattern, but wrapped in sections:
  - 🔵 **Materials** (4) — material toggle rows
  - 🟣 **Printing** — normal colors, metallic colors, matt finish
  - 🟢 **Processing** — lamination, slitting, pouch size
  - 🟠 **Adjustments** — wastage
- Add `SectionHeader` above each group
- Show subtotal per section (material total, printing total, etc.)
- Include `FormActionBar` at bottom

**Chunk 4.3 — Rewrite Flexo form with section grouping** `[FlexoSections]`

- Read existing `FlexoRateCalcForm.jsx` for context, then delete and recreate
- Sections:
  - 🔵 **Base** — material price, cover size
  - 🟣 **Printing & Size** — printing rate, roll size, cutting size
  - 🟢 **Additional Charges** — gusset, punching, opack toggles
  - 🟠 **Adjustments** — wastage
- Include `FormActionBar` at bottom

**Chunk 4.4 — Rewrite Job Cost form with section grouping** `[JobCostSections]`

- Read existing `JobCostForm.jsx` for context, then delete and recreate
- Sections:
  - 🔵 **Job Details** — metadata fields (card no, billing, dates, company, etc.)
  - 🟣 **Materials** — polyester, silver polyester, BOPP silver, LDN/LDOP
  - 🟢 **Charges** — printing, lamination, slitting, pouch making
  - 🟠 **Flat Charges** — transport, wastages
  - ⚪ **Weights** — finished weight, dispatch weight
- Include `FormActionBar` at bottom

**Chunk 4.5 — Form footer action bar** `[ActionBar]`

- Create `components/ui/FormActionBar.jsx` — reusable footer component
- Props: `quoteName`, `onQuoteNameChange`, `onSave`, `onReset`, `saveError`
- Quote name input + Save/Reset buttons in a prominent footer
- Save error messages appear inline below the action bar
- Optional: sticky footer on scroll so Save is always accessible
- Used by all 3 rewritten form components

**Verification**: All 3 forms show clear section grouping with dots and labels. Section subtotals update live. Save action bar is prominent and easy to find.

---

### Sprint 5 — Result Card Redesign

> **Goal**: Result card is always visible with a large headline number. Detailed breakdown is expandable. Result feels like the culmination of the form.

**Chunk 5.1 — Always-visible headline result** `[HeadlineResult]`

- Create `components/ui/ResultHeadline.jsx` — reusable headline card
- Props: `value` (formatted string), `label` (e.g., "Price per kg"), `onToggleBreakdown`
- Large headline number: `₹214.75/kg` in `text-3xl font-bold text-tint`
- Below headline: “View breakdown ▸” toggle to expand detailed sections
- No more collapse-by-default — headline is always shown

**Chunk 5.2 — Grouped breakdown sections** `[BreakdownSections]`

- When expanded, breakdown uses the same colored dot + section header pattern as forms
- ● Materials breakdown — each material line
- ● Charges breakdown — printing, lam, slitting, pouch
- ● Wastage adjustment
- Section subtotals align with form sections

**Chunk 5.3 — Rewrite result cards for all 3 calculators** `[AllResults]`

- Read each existing `*Result.jsx` for context, then delete and recreate:
  - `GravureResult.jsx` — headline = ₹/kg, breakdown = materials + charges + wastage
  - `FlexoRateCalcResult.jsx` — headline = ₹ total rate, breakdown = base + charges + wastage
  - `JobCostResult.jsx` — headline = ₹/kg cost, breakdown = materials + charges + flat charges + weights
- All use `ResultHeadline` + grouped breakdown with `SectionHeader`

**Verification**: Result card shows headline immediately when form has data. Expanding shows grouped breakdown. Collapsing hides detail but keeps headline visible. All 3 calculators work.

---

### Sprint 6 — Enhanced Quote Detail Modal

> **Goal**: Quote modal gets a dual-pane layout on desktop and uses the same section grouping pattern. Print-ready.

**Chunk 6.1 — Dual-pane modal shell** `[DualPane]`

- Create `components/ui/DualPaneModal.jsx` — reusable modal wrapper
- On `lg+`: modal is `max-w-3xl` with 2-column grid
  - Left column slot: itemized breakdown (groups with dots)
  - Right column slot: quote metadata + final totals
- On `< lg`: single column (stacked)
- Reuses existing portal + backdrop + escape pattern from old modals

**Chunk 6.2 — Rewrite Gravure quote modal** `[GravureModal]`

- Read existing `GravureQuoteModal.jsx` for context, then delete and recreate
- Uses `DualPaneModal` wrapper
- Left: Materials section, Charges section, Wastage section (with dots)
- Right: Customer name, date, pouch size, rates used, subtotal → total → headline ₹/kg

**Chunk 6.3 — Rewrite Flexo quote modal** `[FlexoModal]`

- Read existing `FlexoRateCalcQuoteModal.jsx` for context, then delete and recreate
- Uses `DualPaneModal` wrapper
- Left: Base, Charges, Wastage sections
- Right: Customer, cover size, rates used, total

**Chunk 6.4 — Rewrite Job Cost quote modal** `[JobCostModal]`

- Read existing `JobCostQuoteModal.jsx` for context, then delete and recreate
- Uses `DualPaneModal` wrapper
- Left: Job details, Materials, Charges, Flat charges
- Right: Customer, weights, total amount, cost/kg

**Chunk 6.5 — Print Quote action** `[PrintAction]`

- "Print Quote" button in modal
- `@media print` styles: hide sidebar, header, backdrop; show only modal content
- Clean print layout with company name + quote details

**Verification**: Clicking a saved quote opens the enhanced dual-pane modal on desktop. Single column on mobile. Print produces a clean document. Delete still works.

---

### Sprint 7 — New Design Tokens & Component Classes (Partially Complete)

> **Goal**: Add new CSS tokens and component classes needed by the redesign. This sprint can run in parallel with any sprint that needs the tokens.

**Chunk 7.1 — Calculator color tokens** `[CalcColors]` 🔲

- Add to `theme.css` / `index.css`:
  - `--color-calc-gravure`: blue accent for Gravure dots/badges
  - `--color-calc-flexo`: purple accent for Flexo
  - `--color-calc-jobcost`: emerald accent for Job Cost
- Dark mode overrides if needed

**Chunk 7.2 — Section component classes** `[SectionClasses]` ✅ COMPLETE

- ✅ Added to `index.css` `@layer components`:
  - `.section-header` — flex row with label
  - `.form-row` / `.form-row-label` — inline label+input rows
  - `.radio-pill` / `.radio-pill-active` / `.radio-pill-inactive` — radio option styling
  - `.glass-panel` — frosted glass surface
  - `.dropdown-menu` / `.dropdown-option` — portal dropdown styling
  - `.btn-pill` / `.btn-danger` — button variants
  - `.nav-button` / `.sub-nav-button` — sidebar nav styling
  - `.quote-list-item` / `.quote-list-item-active` — saved quote list styling
  - `.month-label` — month grouping label
  - `.invoice-grid`, `.invoice-col-*`, `.invoice-meta-label`, `.invoice-badge` — invoice table
- 🔲 Still pending:
  - `.section-dot` — `size-2 rounded-full` base class
  - `.section-group` — container with left border accent or subtle indent

**Chunk 7.3 — Price change indicator classes** `[ChangeClasses]` 🔲

- `.price-up` — red text + ↑ indicator (cost increase = bad)
- `.price-down` — green text + ↓ indicator (cost decrease = good)
- `.price-neutral` — muted text for no change

**Chunk 7.4 — Sidebar component classes** `[SidebarClasses]` ✅

- Glass island sidebar styling done inline via Tailwind utilities
- Grid background pattern added to `index.css` body rule
- Glass separator component (`GlassSeparator.jsx`) created
- Badge component created
- SectionLabel component created

**Verification**: New tokens available in both light and dark mode. Classes render correctly. No regressions in existing components.

---

### Sprint 8 — Documentation & Final Verification (In Progress)

> **Goal**: Update documentation, verify everything works end-to-end.

**Chunk 8.1 — Update documentation** `[UpdateDocs]` ✅ COMPLETE

- ✅ Updated `UI_REDESIGN_SPRINTS.md` with completion status for all Gravure + Flexo features
- ✅ Updated `copilot-instructions.md` with new architecture, file tree, layout rules, patterns
- ✅ Created `GravureRateCalculator.md` with full calculator documentation
- ✅ Created `FlexoRateCalculator.md` with full calculator documentation
- ✅ Updated "Next Session" section to reflect Flexo completion

**Chunk 8.2 — Full regression test** `[RegressionTest]`

- Verify all 3 calculators: form input → live result → save quote → view in sidebar → open modal → delete
- Verify price history: change a rate → see entry in History tab
- Verify dark mode on every new component
- Verify mobile responsive behavior
- Verify print quote from modal

**Chunk 8.3 — Clean up any dead code** `[DeadCode]`

- Search for unused imports across all files
- Remove any orphaned utility functions or constants
- Verify no `console.log` left in production code

**Verification**: No dead code. No unused imports. Docs are current. All features work end-to-end in both light/dark mode on desktop and mobile.

---

## Sprint Dependency Map

```
Sprint 1 (sidebar + layout shell) ✅ COMPLETE
   │
   ├──▸ Sprint 2 (calculator rebuild + quotes views) ← IN PROGRESS
   │       │
   │       ├──▸ Sprint 3 (price history)
   │       │
   │       ├──▸ Sprint 4 (form section grouping)
   │       │       │
   │       │       ▼
   │       │   Sprint 5 (result redesign)
   │       │       │
   │       │       ▼
   │       └──▸ Sprint 6 (modal redesign)
   │
   ├──▸ Sprint 7 (tokens/classes) — partially done
   │
   └──▸ Sprint 8 (docs & verify) — in progress (docs being updated)
```

**Current sprint**: Sprint 2 — Gravure form rebuilt with compound components. Next: GravureResult, then Flexo and Job Cost rebuilds.

---

## Estimated Chunk Sizes

| Sprint                         | Chunks                     | Status         |
| ------------------------------ | -------------------------- | -------------- |
| **1 — Layout Shell + Sidebar** | 8 chunks                   | ✅ Complete    |
| **2 — Calculator Rebuild**     | 12 chunks (5 new + 7 orig) | 🔄 In progress |
| **3 — Price History**          | 4 chunks                   | 🔲 Pending     |
| **4 — Form Sections**          | 5 chunks                   | 🔲 Pending     |
| **5 — Result Redesign**        | 3 chunks                   | 🔲 Pending     |
| **6 — Modal Redesign**         | 5 chunks                   | 🔲 Pending     |
| **7 — Design Tokens**          | 4 chunks (2 partial)       | 🔄 Partial     |
| **8 — Docs & Verify**          | 3 chunks (1 in progress)   | 🔄 In progress |

---

## Key Rules During Redesign

1. **Delete-then-recreate workflow** — before rewriting a component, read the old file for context, then delete it and create the new implementation with the same filename
2. **Git is the safety net** — `git checkout -- <file>` restores any old file instantly; `git stash` saves work-in-progress
3. **New-only files go in new folders** — e.g., `Sidebar/`, or new filenames like `SectionHeader.jsx`, `FormActionBar.jsx`
4. **Old per-calculator sidebars are deleted permanently** — replaced by the unified sidebar; no need to keep them
5. **Pure functions unchanged** — `utils/calculators/*.js` stay identical
6. **Quote storage unchanged** — `quoteStorage.js` API stays identical
7. **Semantic tokens only** — all new UI uses `theme.css` tokens, no raw colors
8. **Test each sprint** before moving to next — verify specific checks listed above
9. **Rollback** — `git stash` or `git checkout` to restore any file to its pre-redesign state

### UI Implementation Constraints

10. **Tailwind CSS only** — all styling via Tailwind utility classes and `@layer components` in `index.css`. No inline styles, no external CSS libraries, no `style={{}}`
11. **Light & dark mode mandatory** — every new/rewritten component must work in both modes. Use semantic tokens (`bg-background`, `text-label`, `bg-tint`, etc.) which auto-switch. Only use `dark:` for raw alpha values (e.g., `bg-white/40 dark:bg-white/8`)
12. **UI only — never touch working flow** — calculation logic, validation rules, quote save/delete/storage, form state management, and data flow must remain identical. Only the visual presentation changes. Same props in, same callbacks out
13. **Main workspace layout is user-provided** — the sidebar (Sprints 1–3) will be built first. Once finalized, the user will share a design/skeleton for the main work area (forms, results, modals). Do NOT design the main area layout independently — wait for the user’s reference
14. **Accessibility required** — all interactive elements must have proper `aria-*` attributes, keyboard navigation (Tab, Enter, Escape), focus rings, sufficient color contrast (WCAG 2.2 AA minimum), and semantic HTML (`<button>`, `<nav>`, `<main>`, `<aside>`, `<label>`)
15. **Responsive / mobile-first** — every component must work on mobile browser devices. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) and test at small viewports. Sidebar must have a mobile-friendly alternative (bottom sheet, overlay, or collapsible). Touch targets minimum 44×44px on mobile
16. **Reusable components & modular code** — extract repeated UI patterns into shared components in `components/ui/` (e.g., `SectionHeader`, `FormActionBar`, `ResultHeadline`, `DualPaneModal`). Each component should be self-contained with clear props, no hardcoded calculator-specific logic. Prefer composition over duplication — if 3 calculators need the same layout, build one component and pass content via props/children
