import {
  DashboardIcon,
  GravureIcon,
  FlexoIcon,
  JobCostIcon,
  CalculatorSubIcon,
  QuotesIcon,
  PriceSettingsIcon,
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
    path: "/",
    meta: {
      title: "Dashboard",
      description:
        "Overview of recent quotes and activity across all calculators.",
    },
    subItems: null,
  },
  {
    id: "gravure",
    label: "Gravure",
    icon: GravureIcon,
    subItems: [
      {
        id: "gravure",
        label: "Calculator",
        icon: CalculatorSubIcon,
        path: "/gravure/",
      },
      {
        id: "gravure-quotes",
        label: "Saved Quotes",
        icon: QuotesIcon,
        badgeKey: "gravure",
        path: "/gravure/quotes/",
        meta: {
          title: "Gravure — Saved Quotes",
          description: "View and manage saved Gravure rate quotes.",
        },
      },
      {
        id: "gravure-settings",
        label: "Price Settings",
        icon: PriceSettingsIcon,
        path: "/gravure/settings/",
        meta: {
          title: "Gravure — Price History",
          description: "Track price changes for Gravure material rates.",
        },
      },
    ],
  },
  {
    id: "flexo",
    label: "Flexo",
    icon: FlexoIcon,
    subItems: [
      {
        id: "flexo",
        label: "Calculator",
        icon: CalculatorSubIcon,
        path: "/flexo/",
      },
      {
        id: "flexo-quotes",
        label: "Saved Quotes",
        icon: QuotesIcon,
        badgeKey: "flexo-rate-calc",
        path: "/flexo/quotes/",
        meta: {
          title: "Flexo — Saved Quotes",
          description: "View and manage saved Flexo rate quotes.",
        },
      },
      {
        id: "flexo-settings",
        label: "Price Settings",
        icon: PriceSettingsIcon,
        path: "/flexo/settings/",
        meta: {
          title: "Flexo — Price History",
          description: "Track price changes for Flexo material rates.",
        },
      },
    ],
  },
  {
    id: "job-cost",
    label: "Job Cost",
    icon: JobCostIcon,
    subItems: [
      {
        id: "job-cost",
        label: "Calculator",
        icon: CalculatorSubIcon,
        path: "/job-cost/",
      },
      {
        id: "job-cost-quotes",
        label: "Saved Quotes",
        icon: QuotesIcon,
        badgeKey: "job-cost",
        path: "/job-cost/quotes/",
        meta: {
          title: "Job Cost — Saved Quotes",
          description: "View and manage saved Job Cost quotes.",
        },
      },
      {
        id: "job-cost-settings",
        label: "Price Settings",
        icon: PriceSettingsIcon,
        path: "/job-cost/settings/",
        meta: {
          title: "Job Cost — Price History",
          description: "Track price changes for Job Cost material rates.",
        },
      },
    ],
  },
];

/**
 * Derive VIEW_TO_PATH, PATH_TO_VIEW, VIEW_META, and QUOTE_STORAGE_KEYS from NAV_ITEMS.
 * Single source of truth — no duplicate key maintenance.
 */
function buildLookups(items) {
  const viewToPath = {};
  const viewMeta = {};
  const quoteKeys = {};
  for (const item of items) {
    if (item.path) viewToPath[item.id] = item.path;
    if (item.meta) viewMeta[item.id] = item.meta;
    if (item.subItems) {
      for (const sub of item.subItems) {
        if (sub.path) viewToPath[sub.id] = sub.path;
        if (sub.meta) viewMeta[sub.id] = sub.meta;
        if (sub.badgeKey) quoteKeys[item.id] = sub.badgeKey;
      }
    }
  }
  return { viewToPath, viewMeta, quoteKeys };
}

const { viewToPath, viewMeta, quoteKeys } = buildLookups(NAV_ITEMS);

export const VIEW_TO_PATH = viewToPath;

export const PATH_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([view, path]) => [path, view]),
);

export const VIEW_META = viewMeta;

export const QUOTE_STORAGE_KEYS = quoteKeys;
