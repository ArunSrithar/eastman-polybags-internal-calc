/**
 * Constants for Flexo Rate Calculator.
 * Rates will be replaced by DB/backend values in a later phase.
 * All monetary values are in ₹.
 */

// ── Fixed toggle rates ───────────────────────────────────────────────────
export const PUNCHING_RATE = 72.31;
export const OPACK_RATE = 87.3;

// ── Conversion material types ────────────────────────────────────────────
export const CONVERSION_MATERIAL_TYPES = ["PP", "HM", "LD"];

// ── Printing color options ───────────────────────────────────────────────
export const PRINTING_COLORS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"];

// ── Conversion rate lookup: materialType × rollSize → ₹ (placeholder values) ─
export const CONVERSION_RATES = {
  PP: {
    "4x3": 10.0,
    "6x4": 14.0,
    "8x6": 18.0,
    "10x8": 24.0,
    "12x10": 30.0,
    "14x12": 36.0,
  },
  HM: {
    "4x3": 12.0,
    "6x4": 16.0,
    "8x6": 21.0,
    "10x8": 28.0,
    "12x10": 34.0,
    "14x12": 42.0,
  },
  LD: {
    "4x3": 14.0,
    "6x4": 19.0,
    "8x6": 25.0,
    "10x8": 32.0,
    "12x10": 40.0,
    "14x12": 48.0,
  },
};

// ── Printing rate lookup: coverSize × numColors → ₹ (placeholder values) ─
export const PRINTING_RATES = {
  "8x10": { 1: 8.0, 2: 14.0, 3: 20.0, 4: 26.0 },
  "10x12": { 1: 10.0, 2: 18.0, 3: 25.0, 4: 32.0 },
  "12x14": { 1: 12.0, 2: 22.0, 3: 30.0, 4: 38.0 },
  "14x16": { 1: 14.0, 2: 26.0, 3: 35.0, 4: 44.0 },
  "16x18": { 1: 16.0, 2: 30.0, 3: 40.0, 4: 50.0 },
  "18x20": { 1: 18.0, 2: 34.0, 3: 45.0, 4: 56.0 },
};

// ── Gusset rate lookup: coverSize → ₹ (placeholder values) ──────────────
export const GUSSET_RATES = {
  "8x10": 30.0,
  "10x12": 36.0,
  "12x14": 42.0,
  "14x16": 48.0,
  "16x18": 54.0,
  "18x20": 60.0,
};

// ── Cover size preset options (informational only — no rates) ────────────
export const COVER_SIZE_OPTIONS = [
  "8x10",
  "10x12",
  "12x14",
  "14x16",
  "16x18",
  "18x20",
];

// ── Cutting rate → per cover size (same keys as GUSSET_RATES) ──────────────────
export const CUTTING_RATES = {
  "8x10": 0,
  "10x12": 0,
  "12x14": 0,
  "14x16": 0,
  "16x18": 0,
  "18x20": 0,
};

// ── Wastage preset options ───────────────────────────────────────────────
export const WASTAGE_OPTIONS = ["0", "1", "2", "3", "4", "5"];
