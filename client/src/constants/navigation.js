import {
  DashboardIcon,
  GravureIcon,
  FlexoIcon,
  JobCostIcon,
  CalculatorSubIcon,
  QuotesIcon,
  HistoryIcon,
} from "../components/ui/Icons";

/**
 * Sidebar navigation structure.
 * Each top-level item can optionally have expandable `subItems`.
 * `badgeKey` maps to a quoteStorage key for showing saved-quote counts.
 */
export const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
    subItems: null,
  },
  {
    id: "gravure",
    label: "Gravure",
    icon: GravureIcon,
    subItems: [
      { id: "gravure", label: "Calculator", icon: CalculatorSubIcon },
      {
        id: "gravure-quotes",
        label: "Saved Quotes",
        icon: QuotesIcon,
        badgeKey: "gravure",
      },
      { id: "gravure-history", label: "Price History", icon: HistoryIcon },
    ],
  },
  {
    id: "flexo",
    label: "Flexo",
    icon: FlexoIcon,
    subItems: [
      { id: "flexo", label: "Calculator", icon: CalculatorSubIcon },
      {
        id: "flexo-quotes",
        label: "Saved Quotes",
        icon: QuotesIcon,
        badgeKey: "flexo-rate-calc",
      },
      { id: "flexo-history", label: "Price History", icon: HistoryIcon },
    ],
  },
  {
    id: "job-cost",
    label: "Job Cost",
    icon: JobCostIcon,
    subItems: [
      { id: "job-cost", label: "Calculator", icon: CalculatorSubIcon },
      {
        id: "job-cost-quotes",
        label: "Saved Quotes",
        icon: QuotesIcon,
        badgeKey: "job-cost",
      },
      { id: "job-cost-history", label: "Price History", icon: HistoryIcon },
    ],
  },
];

/**
 * Quote storage keys for all calculators.
 * Used by sidebar badge counts and the unified quotes system.
 */
export const QUOTE_STORAGE_KEYS = {
  gravure: "gravure",
  flexo: "flexo-rate-calc",
  "job-cost": "job-cost",
};

/**
 * Placeholder view metadata — title + description for views not yet built.
 */
export const VIEW_META = {
  dashboard: {
    title: "Dashboard",
    description:
      "Overview of recent quotes and activity across all calculators.",
  },
  "gravure-quotes": {
    title: "Gravure — Saved Quotes",
    description: "View and manage saved Gravure rate quotes.",
  },
  "gravure-history": {
    title: "Gravure — Price History",
    description: "Track price changes for Gravure material rates.",
  },
  "flexo-quotes": {
    title: "Flexo — Saved Quotes",
    description: "View and manage saved Flexo rate quotes.",
  },
  "flexo-history": {
    title: "Flexo — Price History",
    description: "Track price changes for Flexo material rates.",
  },
  "job-cost-quotes": {
    title: "Job Cost — Saved Quotes",
    description: "View and manage saved Job Cost quotes.",
  },
  "job-cost-history": {
    title: "Job Cost — Price History",
    description: "Track price changes for Job Cost material rates.",
  },
};
