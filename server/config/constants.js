export const VALID_MATERIALS = ["polyester", "silverPet", "ldRoll", "bopp"];

export const VALID_RATE_KEYS = [
  "normalColorRate",
  "metallicColorRate",
  "mattFinishRate",
  "singleLamRate",
  "doubleLamRate",
  "slittingRate",
];

export const VALID_OPTION_TYPES = ["micron", "qty"];

// ── Flexo ──────────────────────────────────────────────────────────────────
export const VALID_FLEXO_MATERIALS = ["PP", "HM", "LD"];
export const VALID_CONVERSION_MATERIALS = VALID_FLEXO_MATERIALS;

export const VALID_ROLL_SIZES = ["4x3", "6x4", "8x6", "10x8", "12x10", "14x12"];

export const VALID_COLOR_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const VALID_CUTTING_SIZES = [
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
];

export const VALID_FLEXO_CHARGE_RATE_KEYS = ["punchingRate", "opackRate"];

// ── Quotes ─────────────────────────────────────────────────────────────────
// Allow-list of calcKeys whose quotes are persisted via /api/quotes/:calcKey.
// Add "job-cost" here once that calculator migrates.
export const VALID_QUOTE_CALC_KEYS = ["gravure", "flexo-rate-calc"];
