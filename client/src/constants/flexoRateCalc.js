/**
 * Constants for Flexo Rate Calculator.
 * Rates will be replaced by DB/backend values in a later phase.
 * All monetary values are in ₹.
 */

// ── Fixed toggle rates ───────────────────────────────────────────────────
export const GUSSET_RATE = 43.83;
export const PUNCHING_RATE = 72.31;
export const OPACK_RATE = 87.3;

// ── Roll size → rate lookup (₹) ─────────────────────────────────────────
export const ROLL_SIZE_RATES = {
  "4x3": 12.5,
  "6x4": 18.0,
  "8x6": 24.5,
  "10x8": 32.0,
  "12x10": 40.0,
  "14x12": 48.5,
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
    totalRate: 385.6,
    form: {
      quoteName: "Mehta Stores — Gusset Pack",
      materialPrice: "150",
      coverSize: "10x12",
      rollSize: "8x6",
      printingRate: "25",
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
    totalRate: 218.0,
    form: {
      quoteName: "Sharma Foods — Plain",
      materialPrice: "180",
      coverSize: "12x14",
      rollSize: "6x4",
      printingRate: "15",
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
    totalRate: 512.45,
    form: {
      quoteName: "Royal Packaging — Full Options",
      materialPrice: "200",
      coverSize: "14x16",
      rollSize: "10x8",
      printingRate: "30",
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
    totalRate: 142.8,
    form: {
      quoteName: "Patel Brothers — Small",
      materialPrice: "100",
      coverSize: "8x10",
      rollSize: "4x3",
      printingRate: "10",
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
    totalRate: 345.25,
    form: {
      quoteName: "Krishna Traders — Punched",
      materialPrice: "175",
      coverSize: "16x18",
      rollSize: "12x10",
      printingRate: "20",
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
    totalRate: 428.9,
    form: {
      quoteName: "Deepak Polymers — Opack",
      materialPrice: "190",
      coverSize: "18x20",
      rollSize: "14x12",
      printingRate: "28",
      gusset: true,
      punching: false,
      opack: true,
      cuttingSize: "14",
      wastage: "3",
    },
  },
];
