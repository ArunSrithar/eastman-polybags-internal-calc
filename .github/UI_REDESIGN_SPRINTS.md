# UI Redesign — Sprint Plan

> **Status**: Planning complete. Ready for Sprint 1.
> **Approach**: Delete-then-recreate. Since the project uses git, read the old file for context, delete it, then create the new implementation with the **same filename**. No V2 suffixes needed — git history preserves the old code.
>
> **Main workspace design**: After the sidebar (Sprints 1–3) is finalized, the user will provide a custom layout skeleton for the main work area. Sprints 4–6 (forms, results, modals) will follow that design.

---

## Product Context

Eastman Polybags Internal Quote Calculator — an internal tool for staff to generate quotes for customers based on daily fluctuating rates. Three calculators (Gravure, Flexo, Job Cost) with saved quotes and live calculation results.

**Goal of redesign**: Transform from the current calculator-owns-sidebar layout into a clean 3-zone architecture — floating header, spacious main workspace, and a unified smart sidebar with tabbed Quotes/Price History sections. Simple, modern, neat.

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

## Target Layout: 3-Zone Architecture

```
┌─────────────────────────────────────────────────────────┐
│   ░░░░░  Floating Glass Header Island (existing)  ░░░░  │
│       [Logo]  [ Gravure | Flexo | Job Cost ]  [👤]      │
├────────────────────────────────────┬────────────────────┤
│                                    │                    │
│  MAIN WORKSPACE (~70% on lg+)      │  SIDEBAR (~30%)    │
│                                    │                    │
│  Calculator Title + Subtitle       │ [Quotes | History] │
│  ─────────────────────────         │  ────────────────  │
│                                    │                    │
│  ┌─ Form Card ─────────────────┐   │  🔍 Search...      │
│  │  ● Rate Fields              │   │                    │
│  │  ● Materials / Line Items   │   │  ● Quote 1   ₹214 │
│  │  ● Charges & Options        │   │  ● Quote 2   ₹189 │
│  │                             │   │  ● Quote 3   ₹231 │
│  │  [Customer] [Save] [Reset]  │   │  ...               │
│  └─────────────────────────────┘   │                    │
│                                    │                    │
│  ┌─ Live Result ───────────────┐   │                    │
│  │  ₹214.75/kg   View details ▸│   │                    │
│  └─────────────────────────────┘   │                    │
│                                    │                    │
└────────────────────────────────────┴────────────────────┘
```

**Responsive behavior:**

- **Desktop (lg+)**: Side-by-side, sidebar pinned right
- **Tablet (md)**: Sidebar collapses to narrow panel or overlay
- **Mobile (sm)**: Sidebar becomes a bottom sheet or separate tab view

---

## Approach: Delete-Then-Recreate (Git Tracks History)

> **⚠️ WORKFLOW**: Before reworking any component, **read the old file** to gather context, then **delete it** and create a fresh implementation with the **same filename**. Git preserves the old version — `git checkout -- <file>` restores it instantly if needed.
>
> No V2 suffixes. No parallel files. Clean filenames from the start.

| Keep as-is (never delete)                                                | Delete & Recreate (same filename, new implementation)                           | Brand New Files                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `theme.css` — all color tokens                                           | `AppShell.jsx` — rewrite as 2-column layout shell                               | `components/layout/Sidebar/Sidebar.jsx` — unified sidebar       |
| `index.css` — component layer classes (`.card`, `.btn-*`, `.input-base`) | `GravureForm.jsx` — rewrite with section grouping                               | `components/layout/Sidebar/QuotesList.jsx` — quotes list        |
| `ThemeContext.jsx` — dark mode toggle                                    | `FlexoRateCalcForm.jsx` — rewrite with section grouping                         | `components/layout/Sidebar/PriceHistoryList.jsx` — history tab  |
| `utils/calculators/*.js` — pure calculation functions                    | `JobCostForm.jsx` — rewrite with section grouping                               | `components/layout/CalculatorTitleBar.jsx` — title + subtitle   |
| `utils/quoteStorage.js` — localStorage quote helpers                     | `GravureResult.jsx` — rewrite with always-visible headline                      | `components/ui/SectionHeader.jsx` — colored dot section headers |
| `utils/format.js` — fmt(), formatDate()                                  | `FlexoRateCalcResult.jsx` — rewrite with always-visible headline                | `components/ui/FormActionBar.jsx` — save/reset footer           |
| `constants/*.js` — rates, lookups, sample quotes                         | `JobCostResult.jsx` — rewrite with always-visible headline                      | `components/ui/ResultHeadline.jsx` — headline card              |
| `components/ui/*` — IOSToggle, CreatableCombobox, Icons, CheckBox        | `GravureQuoteModal.jsx` — rewrite with dual-pane layout                         | `components/ui/DualPaneModal.jsx` — reusable modal wrapper      |
| `Header/` — floating glass bar, segmented control, user menu             | `FlexoRateCalcQuoteModal.jsx` — rewrite with dual-pane layout                   | `utils/priceHistory.js` — rate change logging utility           |
| `SegmentedControl/` — capsule tab components                             | `JobCostQuoteModal.jsx` — rewrite with dual-pane layout                         |                                                                 |
| All calculation logic and validation rules                               | Each calculator `index.jsx` — rewrite without sidebar, new layout               |                                                                 |
|                                                                          | Old `*QuotesSidebar.jsx` — **delete permanently** (replaced by unified sidebar) |                                                                 |

**Rollback**: `git checkout -- <file>` on any recreated file restores the old implementation instantly. `git stash` saves all in-progress work.

---

## Sprint Breakdown

### Sprint 1 — Foundation: Layout Shell + Sidebar Skeleton

> **Goal**: Replace the current full-width single-zone with the 3-zone layout. Sidebar exists but shows placeholder content. All 3 calculators still render and work.

**Chunk 1.1 — Rewrite AppShell layout** `[AppShell]`

- Read existing `AppShell.jsx` for context, then delete and recreate it
- 2-column CSS Grid: main (col-1) + sidebar (col-2) on `lg+`
- Main area: `pt-22 px-4 pb-8` (keep header offset)
- Sidebar: sticky, right-aligned, `lg:w-80` or percentage-based
- Import and render current calculator components in main area
- Sidebar renders the new `Sidebar` component

**Chunk 1.2 — Sidebar container component** `[Sidebar]`

- Create `components/layout/Sidebar/Sidebar.jsx`
- Card container with segmented control at top: "Quotes" | "History"
- `activeTab` state toggles between two panels
- Quotes panel: placeholder "Coming in Sprint 2"
- History panel: placeholder "Coming in Sprint 3"
- Sticky positioning: `lg:sticky lg:top-25`

**Chunk 1.3 — Calculator title + subtitle bar** `[TitleBar]`

- Create `components/layout/CalculatorTitleBar.jsx`
- Props: `title`, `subtitle`
- Render above the calculator form in the main area
- Bold `text-2xl font-bold text-label` title + `text-sm text-label-2` subtitle
- Each calculator gets its own title/subtitle string (define in constants or inline)

**Chunk 1.4 — Responsive: mobile sidebar behavior** `[Responsive]`

- On `< lg`: sidebar hidden, show a floating button or tab to access it
- Or: sidebar moves below the main content as a collapsible section
- Decide approach and implement basic responsive toggle

**Verification**: All 3 calculators render in the new 2-column layout. Sidebar shows with tab toggle. Title bar appears above each calculator. Dark mode works. Mobile is usable.

---

### Sprint 2 — Unified Quotes Sidebar

> **Goal**: Move saved quotes from per-calculator sidebars into the unified sidebar. All quote operations (view, save, delete) work through the new sidebar.

**Chunk 2.1 — Lift quotes state to AppShell** `[State Lift]`

- In the rewritten `AppShell.jsx`, manage quotes state for all 3 calculators (keyed by `CALC_KEY`)
- Use `getQuotes()` from `quoteStorage.js` for each calculator on init
- Pass down `quotes`, `onSave`, `onDelete`, `saveError` as props to calculator containers
- Sidebar receives all quotes for display

**Chunk 2.2 — Unified quotes list in sidebar** `[QuotesList]`

- Create `components/layout/Sidebar/QuotesList.jsx`
- Receives all quotes from all 3 calculators (merged + sorted by date)
- Each quote item shows:
  - Colored dot indicator (🔵 Gravure, 🟣 Flexo, 🟢 Job Cost)
  - Quote name (bold, left)
  - Headline price (bold, right) — ₹/kg or ₹ total
  - Metadata line: calculator type + key spec + date
- Click opens quote detail modal

**Chunk 2.3 — Search + filter in quotes list** `[QuotesSearch]`

- Search input at top of quotes panel — filters by quote name
- Optional: filter pills by calculator type (show all / gravure only / flexo only / job cost only)
- Empty state: "No quotes saved yet. Fill the form and save your first quote."

**Chunk 2.4 — Quote count badge on tab** `[Badge]`

- Segmented tab label shows count: "Quotes (12)"
- Badge updates reactively as quotes are saved/deleted

**Chunk 2.5 — Rewrite calculator containers** `[NewContainers]`

- Read each calculator `index.jsx` for context, then delete and recreate
- New `index.jsx` renders form + result in a single column (no 3-col grid)
- Receives `quotes`, `onSave`, `onDelete`, `saveError` props from `AppShell`
- No longer imports or renders `*QuotesSidebar` — sidebar is now unified
- Delete the old `*QuotesSidebar.jsx` files permanently (replaced by unified sidebar in Chunk 2.2)

**Verification**: Saving a quote from any calculator shows it in the unified sidebar. Clicking a sidebar quote opens the correct modal. Search filters work. Delete works. Old sidebar files still exist but are unused.

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

### Sprint 7 — New Design Tokens & Component Classes

> **Goal**: Add new CSS tokens and component classes needed by the redesign. This sprint can run in parallel with any sprint that needs the tokens.

**Chunk 7.1 — Calculator color tokens** `[CalcColors]`

- Add to `theme.css` / `index.css`:
  - `--color-calc-gravure`: blue accent for Gravure dots/badges
  - `--color-calc-flexo`: purple accent for Flexo
  - `--color-calc-jobcost`: emerald accent for Job Cost
- Dark mode overrides if needed

**Chunk 7.2 — Section component classes** `[SectionClasses]`

- Add to `index.css` `@layer components`:
  - `.section-header` — flex row with dot + label + count + subtotal
  - `.section-dot` — `size-2 rounded-full` base class
  - `.section-group` — container with left border accent or subtle indent

**Chunk 7.3 — Price change indicator classes** `[ChangeClasses]`

- `.price-up` — red text + ↑ indicator (cost increase = bad)
- `.price-down` — green text + ↓ indicator (cost decrease = good)
- `.price-neutral` — muted text for no change

**Chunk 7.4 — Sidebar component classes** `[SidebarClasses]`

- `.sidebar-card` — sidebar container styling
- `.quote-item` — hover state, padding, truncation
- `.quote-dot` — calculator-colored indicator

**Verification**: New tokens available in both light and dark mode. Classes render correctly. No regressions in existing components.

---

### Sprint 8 — Documentation & Final Verification

> **Goal**: Update documentation, verify everything works end-to-end. No file deletions needed — old files were already replaced in-place during earlier sprints.

**Chunk 8.1 — Update copilot-instructions.md** `[UpdateDocs]`

- Update Architecture & Module Structure section with new file tree
- Update Layout Rules section with new 2-column layout
- Update Development Phases table
- Add sidebar docs, price history docs
- Update "Next Session — Where to Continue" section

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
Sprint 7 (tokens/classes) ──────────────────────┐
   Can start immediately, needed by all others   │
                                                  ▼
Sprint 1 (layout shell) ──▸ Sprint 2 (quotes sidebar) ──▸ Sprint 3 (price history)
                │                                                      │
                ▼                                                      │
        Sprint 4 (form sections) ──▸ Sprint 5 (result redesign)       │
                                            │                          │
                                            ▼                          │
                                    Sprint 6 (modal redesign)          │
                                            │                          │
                                            ▼                          ▼
                                    Sprint 8 (cleanup & migration)
```

**Parallel tracks:**

- Sprint 7 can start Day 1 alongside Sprint 1
- Sprint 4 can start after Sprint 1 (forms don't depend on sidebar)
- Sprint 3 can start after Sprint 2 (history tab needs sidebar)
- Sprint 6 depends on Sprint 4 (uses same section grouping)
- Sprint 8 is always last

---

## Estimated Chunk Sizes

| Sprint                  | Chunks                         | Estimated Effort per Chunk |
| ----------------------- | ------------------------------ | -------------------------- |
| **1 — Layout Shell**    | 4 chunks                       | Small–Medium               |
| **2 — Unified Quotes**  | 5 chunks                       | Medium                     |
| **3 — Price History**   | 4 chunks                       | Medium                     |
| **4 — Form Sections**   | 5 chunks                       | Medium                     |
| **5 — Result Redesign** | 3 chunks                       | Small–Medium               |
| **6 — Modal Redesign**  | 5 chunks                       | Medium                     |
| **7 — Design Tokens**   | 4 chunks                       | Small                      |
| **8 — Docs & Verify**   | 3 chunks                       | Small                      |
| **Total**               | **33 chunks across 8 sprints** |                            |

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
