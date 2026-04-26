/**
 * Constants for Gravure Rate Calculator.
 * Rates will be replaced by DB/backend values in a later phase.
 * All monetary values are in ₹.
 */

// ── Material display names (keyed by form field key) ─────────────────────
export const MATERIAL_NAMES = {
  polyester: "Polyester",
  silverPet: "Silver PET",
  ldRoll: "L.D. Roll",
  bopp: "B.O.P.P.",
};

// ── Printing ──────────────────────────────────────────────────────────────
export const NORMAL_COLOR_RATE = 5; // ₹ per color per kg of total material
export const METALLIC_COLOR_RATE = 8; // ₹ per metallic color per kg
export const MATT_FINISH_RATE = 3; // ₹ per kg

// ── Lamination ────────────────────────────────────────────────────────────
export const SINGLE_LAM_RATE = 12; // ₹ per kg
export const DOUBLE_LAM_RATE = 20; // ₹ per kg

// ── Slitting ──────────────────────────────────────────────────────────────
export const SLITTING_RATE = 4; // ₹ per kg

// ── Pouch rates by size string (₹ per kg) ────────────────────────────────
export const POUCH_RATE_BY_SIZE = {
  "4 x 6": 15,
  "5 x 7": 18,
  "6 x 8": 20,
  "7 x 10": 25,
};
export const DEFAULT_POUCH_RATE = 15; // fallback for unknown sizes

