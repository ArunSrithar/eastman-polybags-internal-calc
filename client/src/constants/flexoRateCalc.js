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
export const PRINTING_COLORS_OPTIONS = ["1", "2", "3", "4"];

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

// ── Cutting size → rate lookup (₹) ──────────────────────────────────────
export const CUTTING_SIZE_RATES = {
  4: 5.0,
  5: 6.5,
  6: 8.0,
  7: 9.5,
  8: 11.0,
  9: 12.5,
  10: 14.0,
  11: 15.5,
  12: 17.0,
  14: 20.0,
};

// ── Wastage preset options ───────────────────────────────────────────────
export const WASTAGE_OPTIONS = ["0", "1", "2", "3", "4", "5"];

// ── Sample quotes (seed data — replace with DB fetch when backend is ready) ──
export const SAMPLE_QUOTES = [
  {
    id: "sample-1",
    savedAt: "2026-02-20T10:30:00.000Z",
    savedBy: "Arun",
    quoteName: "Mehta Stores — Gusset Pack",
    coverSize: "10x12",
    totalRate: 329.91,
    form: {
      quoteName: "Mehta Stores — Gusset Pack",
      materialPrice: "150",
      conversionMaterial: "PP",
      coverSize: "10x12",
      rollSize: "8x6",
      printingColors: "2",
      gusset: true,
      punching: false,
      opack: true,
      cuttingSize: "8",
      wastage: "3",
    },
  },
  {
    id: "sample-2",
    savedAt: "2026-02-22T14:15:00.000Z",
    savedBy: "Arun",
    quoteName: "Sharma Foods — Plain",
    coverSize: "12x14",
    totalRate: 220.32,
    form: {
      quoteName: "Sharma Foods — Plain",
      materialPrice: "180",
      conversionMaterial: "HM",
      coverSize: "12x14",
      rollSize: "6x4",
      printingColors: "1",
      gusset: false,
      punching: false,
      opack: false,
      cuttingSize: "6",
      wastage: "2",
    },
  },
  {
    id: "sample-3",
    savedAt: "2026-02-25T09:00:00.000Z",
    savedBy: "Arun",
    quoteName: "Royal Packaging — Full Options",
    coverSize: "14x16",
    totalRate: 513.04,
    form: {
      quoteName: "Royal Packaging — Full Options",
      materialPrice: "200",
      conversionMaterial: "LD",
      coverSize: "14x16",
      rollSize: "10x8",
      printingColors: "3",
      gusset: true,
      punching: true,
      opack: true,
      cuttingSize: "10",
      wastage: "5",
    },
  },
  {
    id: "sample-4",
    savedAt: "2026-03-01T16:45:00.000Z",
    savedBy: "Arun",
    quoteName: "Patel Brothers — Small",
    coverSize: "8x10",
    totalRate: 198.78,
    form: {
      quoteName: "Patel Brothers — Small",
      materialPrice: "100",
      conversionMaterial: "PP",
      coverSize: "8x10",
      rollSize: "4x3",
      printingColors: "1",
      gusset: false,
      punching: true,
      opack: false,
      cuttingSize: "5",
      wastage: "1",
    },
  },
  {
    id: "sample-5",
    savedAt: "2026-03-04T11:20:00.000Z",
    savedBy: "Arun",
    quoteName: "Krishna Traders — Punched",
    coverSize: "16x18",
    totalRate: 362.24,
    form: {
      quoteName: "Krishna Traders — Punched",
      materialPrice: "175",
      conversionMaterial: "HM",
      coverSize: "16x18",
      rollSize: "12x10",
      printingColors: "4",
      gusset: false,
      punching: true,
      opack: false,
      cuttingSize: "12",
      wastage: "4",
    },
  },
  {
    id: "sample-6",
    savedAt: "2026-03-06T08:10:00.000Z",
    savedBy: "Arun",
    quoteName: "Deepak Polymers — Opack",
    coverSize: "18x20",
    totalRate: 452.48,
    form: {
      quoteName: "Deepak Polymers — Opack",
      materialPrice: "190",
      conversionMaterial: "LD",
      coverSize: "18x20",
      rollSize: "14x12",
      printingColors: "2",
      gusset: true,
      punching: false,
      opack: true,
      cuttingSize: "14",
      wastage: "3",
    },
  },
];
