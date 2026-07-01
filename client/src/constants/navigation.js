import {
  DashboardIcon,
  GravureIcon,
  FlexoIcon,
  JobCostIcon,
  CalculatorSubIcon,
  QuotesIcon,
  PriceSettingsIcon,
  UsersIcon,
  ShieldIcon,
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
      {
        id: "gravure-job-cost",
        label: "Job Cost",
        icon: JobCostIcon,
        path: "/gravure/job-cost/",
      },
      {
        id: "gravure-job-cost-quotes",
        label: "Saved Job Costs",
        icon: QuotesIcon,
        badgeKey: "job-cost",
        path: "/gravure/job-cost/quotes/",
        meta: {
          title: "Gravure — Job Cost Quotes",
          description: "View and manage saved Gravure job cost quotes.",
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
      {
        id: "flexo-job-cost",
        label: "Job Cost",
        icon: JobCostIcon,
        path: "/flexo/job-cost/",
      },
      {
        id: "flexo-job-cost-quotes",
        label: "Saved Job Costs",
        icon: QuotesIcon,
        badgeKey: "flexo-job-cost",
        path: "/flexo/job-cost/quotes/",
        meta: {
          title: "Flexo — Saved Job Costs",
          description: "View and manage saved Flexo job cost quotes.",
        },
      },
    ],
  },
  {
    id: "users-management",
    label: "Users Management",
    icon: UsersIcon,
    subItems: [
      {
        id: "roles",
        label: "Roles",
        icon: ShieldIcon,
        badgeKey: "roles",
        path: "/users/roles/",
        meta: {
          title: "Roles & Permissions",
          description: "Create reusable permission roles and assign them to users.",
        },
      },
      {
        id: "users",
        label: "Users",
        icon: UsersIcon,
        badgeKey: "users",
        path: "/users/",
        meta: {
          title: "User Management",
          description: "Manage app users and attach permission roles.",
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
  // Collect all unique badgeKey values across all sub-items (identity map).
  // Using a Set avoids the collision bug where multiple sub-items under the
  // same parent would overwrite each other.
  const allBadgeKeys = new Set();
  for (const item of items) {
    if (item.path) viewToPath[item.id] = item.path;
    if (item.meta) viewMeta[item.id] = item.meta;
    if (item.subItems) {
      for (const sub of item.subItems) {
        if (sub.path) viewToPath[sub.id] = sub.path;
        if (sub.meta) viewMeta[sub.id] = sub.meta;
        if (sub.badgeKey) allBadgeKeys.add(sub.badgeKey);
      }
    }
  }
  const quoteKeys = {};
  for (const key of allBadgeKeys) quoteKeys[key] = key;
  return { viewToPath, viewMeta, quoteKeys };
}

const { viewToPath, viewMeta, quoteKeys } = buildLookups(NAV_ITEMS);

export const VIEW_TO_PATH = viewToPath;

export const PATH_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([view, path]) => [path, view]),
);

export const VIEW_META = viewMeta;

export const QUOTE_STORAGE_KEYS = quoteKeys;

/**
 * Per-view permission requirements.
 * Used by SidebarNav (filter) and useRouting (redirect guard).
 *
 * type:
 *   "calculate" | "viewQuotes" | "editPrices"  → checked against user.permissions[calcKey][type]
 *   "manageUsers"                               → checked against canManageUsers()
 */
export const VIEW_PERMISSIONS = {
  gravure: { type: "calculate", calcKey: "gravure" },
  "gravure-quotes": { type: "viewQuotes", calcKey: "gravure" },
  "gravure-settings": { type: "editPrices", calcKey: "gravure" },
  "gravure-job-cost": { type: "calculate", calcKey: "job-cost" },
  "gravure-job-cost-quotes": { type: "viewQuotes", calcKey: "job-cost" },
  flexo: { type: "calculate", calcKey: "flexo" },
  "flexo-quotes": { type: "viewQuotes", calcKey: "flexo" },
  "flexo-settings": { type: "editPrices", calcKey: "flexo" },
  "flexo-job-cost": { type: "calculate", calcKey: "flexo-job-cost" },
  "flexo-job-cost-quotes": { type: "viewQuotes", calcKey: "flexo-job-cost" },
  roles: { type: "manageUsers" },
  users: { type: "manageUsers" },
};
