# Eastman Polybags — Internal Quote Calculator

An internal calculator for a small enterprise that helps generate quotes for customers based on daily fluctuating rates.

---

## Overview

- **Stack:** MERN (MongoDB, Express, React, Node.js)
- **Styling:** Tailwind CSS (v4) with iOS-inspired design tokens (`theme.css`)
- **Responsive:** Tailwind CSS utility classes
- **Dark / Light mode:** Tailwind class-based dark mode (`dark:` variant) toggled manually via the user menu; preference persisted in `localStorage`
- **4 Calculators** accessible via a capsule segmented tab control inside the header

---

## Calculators

### 1. Gravure Rate Calculator

<!-- Explanation to be added -->

### 2. Rate Calculator

<!-- Explanation to be added -->

### 3. Calculator 3

<!-- Explanation to be added -->

### 4. Costing Calculator

<!-- Explanation to be added -->

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

Legend: ✅ Built | 🔲 Pending

```
client/src/
├── context/
│   ├── ThemeContext.jsx         ✅ isDark + toggleTheme(), applies .dark to <html>, seeds from OS, persists to localStorage
│   └── RateContext.jsx          🔲 Global daily rates + per-calculator overrides
│
├── components/
│   ├── ui/                      🔲 Primitive components (all pending)
│   │   ├── Button/
│   │   │   ├── Button.jsx       🔲 Base button (primary, secondary, ghost, destructive)
│   │   │   └── IconButton.jsx   🔲 Icon-only button variant
│   │   ├── Input/
│   │   │   ├── TextInput.jsx    🔲
│   │   │   ├── NumberInput.jsx  🔲 Numeric input with unit suffix (₹, kg, m, %)
│   │   │   ├── InputLabel.jsx   🔲
│   │   │   ├── InputError.jsx   🔲
│   │   │   └── InputGroup.jsx   🔲 Composes Label + Input + Error
│   │   ├── Card/
│   │   │   ├── Card.jsx         🔲
│   │   │   ├── CardHeader.jsx   🔲
│   │   │   └── CardSection.jsx  🔲
│   │   ├── Toggle/
│   │   │   └── Toggle.jsx       🔲 Animated iOS-style boolean toggle
│   │   ├── Badge/
│   │   │   └── Badge.jsx        🔲 Status chip with color variant
│   │   ├── Divider/
│   │   │   └── Divider.jsx      🔲
│   │   └── index.js             🔲 Barrel export for all primitives
│   │
│   ├── layout/                  ✅ All built
│   │   ├── Header/
│   │   │   ├── AppHeader.jsx    ✅ Island-style floating glass bar (logo | capsule tabs | user menu)
│   │   │   ├── AppLogo.jsx      ✅ Company name + subtitle
│   │   │   └── UserMenu/
│   │   │       ├── UserMenu.jsx         ✅ Open/close state + outside-click dismiss
│   │   │       ├── UserAvatar.jsx       ✅ Circle icon button, tints when open
│   │   │       ├── UserMenuDropdown.jsx ✅ Floating card: user info, theme toggle, logout
│   │   │       └── ThemeToggleRow.jsx   ✅ Label + animated iOS pill toggle (reads/writes ThemeContext)
│   │   ├── SegmentedControl/
│   │   │   ├── SegmentedControl.jsx     ✅ Capsule island container (inline-flex, sizes to content)
│   │   │   └── SegmentedTab.jsx         ✅ Capsule pill tab, active = bg-tint text-white
│   │   └── AppShell.jsx                 ✅ Wires header tabs to active calculator, manages activeIndex state
│   │
│   ├── overlays/                🔲 All pending
│   │   ├── BottomSheet/
│   │   │   ├── BottomSheet.jsx
│   │   │   ├── BottomSheetHeader.jsx
│   │   │   └── BottomSheetBody.jsx
│   │   └── Modal/
│   │       ├── Modal.jsx
│   │       └── ModalOverlay.jsx
│   │
│   ├── RateSettings/            🔲 All pending
│   │   ├── RateSettingsPanel.jsx
│   │   ├── RateFieldGroup.jsx
│   │   └── RateOverrideToggle.jsx
│   │
│   ├── quote/                   🔲 All pending
│   │   ├── ResultCard/
│   │   │   ├── ResultCard.jsx
│   │   │   └── ResultRow.jsx
│   │   ├── QuoteSheet/
│   │   │   ├── QuoteSheet.jsx
│   │   │   ├── QuoteLineItem.jsx
│   │   │   └── QuoteTotal.jsx
│   │   └── PrintView/
│   │       ├── PrintView.jsx
│   │       ├── PrintHeader.jsx
│   │       └── PrintFooter.jsx
│   │
│   └── calculators/             ✅ Shell only (placeholder cards) — forms pending per calculator
│       ├── GravureRateCalculator/
│       │   ├── index.jsx        ✅ Placeholder shell
│       │   ├── GravureForm.jsx          🔲
│       │   ├── GravureRateOverride.jsx  🔲
│       │   └── GravureResult.jsx        🔲
│       ├── RateCalculator/
│       │   ├── index.jsx        ✅ Placeholder shell
│       │   ├── RateCalcForm.jsx         🔲
│       │   ├── RateCalcRateOverride.jsx 🔲
│       │   └── RateCalcResult.jsx       🔲
│       ├── Calculator3/
│       │   ├── index.jsx        ✅ Placeholder shell
│       │   ├── Calc3Form.jsx            🔲
│       │   ├── Calc3RateOverride.jsx    🔲
│       │   └── Calc3Result.jsx          🔲
│       └── CostingCalculator/
│           ├── index.jsx        ✅ Placeholder shell
│           ├── CostingForm.jsx          🔲
│           ├── CostingRateOverride.jsx  🔲
│           └── CostingResult.jsx        🔲
│
├── utils/                       🔲 All pending
│   ├── formatCurrency.js
│   ├── formatNumber.js
│   └── calculators/
│       ├── gravureRate.js
│       ├── rateCalc.js
│       ├── calc3.js
│       └── costingCalc.js
│
├── App.jsx                      ✅ Renders AppShell
├── main.jsx                     ✅ Entry: ThemeProvider > App
├── theme.css                    ✅ Tailwind @theme iOS color tokens + @custom-variant dark
└── index.css                    ✅ .dark overrides, @layer base (html/body defaults), @layer components (.card, .btn-primary, .input-base, etc.)

server/                          🔲 All pending (node_modules installed, no source files yet)
├── index.js
├── routes/
├── controllers/
├── models/
└── package.json
```

---

## CSS / Tailwind Guidelines

- Tailwind v4 installed via `@tailwindcss/vite` Vite plugin
- Dark mode via `@custom-variant dark (&:where(.dark, .dark *))` in `theme.css` — toggled by adding/removing `.dark` on `<html>`
- `@theme {}` in `theme.css` — all iOS `--color-*` tokens defined here (light defaults); dark overrides in `.dark {}` block in `index.css`
- `@layer base` in `index.css` — `html, body` background and text defaults using token colours
- `@layer components` in `index.css` — reusable classes: `.card`, `.card-section`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-icon`, `.input-base`, `.field-label`, `.divider`
- Keep JSX className strings minimal — prefer the `@layer components` classes, extend with `dark:` / responsive utilities only as needed

---

## Header Design Notes

The header is an **island-style floating glass bar** — detached from screen edges with margin, fully rounded (`rounded-2xl`), and always-on frosted glass:

- Outer wrapper: `fixed top-0 inset-x-0 z-50 px-4 pt-3` creates the floating gap
- Inner `<header>`: `h-[76px] rounded-2xl bg-white/40 dark:bg-white/8 backdrop-blur-2xl backdrop-saturate-200 border border-white/50 dark:border-white/10 shadow-lg`
- Three-column flex layout: `flex-1` logo | `flex-none` island tabs | `flex-1 justify-end` user menu
- Segmented control: `inline-flex rounded-full` container with `rounded-full` capsule tabs; active tab = `bg-tint text-white`
- User menu: avatar button → dropdown card with user name/role, iOS pill dark mode toggle, logout

---

## Next Session — Where to Continue

**Immediate next steps:**

1. Build `RateContext.jsx` — global rates state store
2. Build `components/ui/` primitive components (Button, Input, Card, Toggle, Badge, Divider) + barrel `index.js`
3. Build `components/overlays/` (BottomSheet, Modal)
4. Build `components/RateSettings/` panel (inside BottomSheet, triggered from header — button to be added next to UserMenu)
5. **Start first calculator form** — user will explain Gravure Rate Calculator fields and logic to begin

**When starting the next session, share:**

- This README for full context
- The calculator explanation for whichever calculator you want to build first

---

## Development Phases

| Phase | Scope                                                                                         | Status     |
| ----- | --------------------------------------------------------------------------------------------- | ---------- |
| 1a    | App shell, header island, segmented control, dark mode, ThemeContext                          | ✅ Done    |
| 1b    | UI primitives (Button, Input, Card, Toggle, Badge), RateContext, overlays, RateSettings panel | 🔲 Next    |
| 1c    | Calculator forms + calculation logic (one at a time, user explains each)                      | 🔲 Pending |
| 2     | Authentication (simple)                                                                       | 🔲 Pending |
| 3     | DB persistence — save & retrieve quotes                                                       | 🔲 Pending |
