// Shared utilities for "LxB" dimension keys (e.g. "8x10", "12x14")

// Split "8x10", "8X10", "8×10" → [8, 10]
export function parseDimension(key) {
  const parts = key.split(/[xX×]/);
  return [parseFloat(parts[0]) || 0, parseFloat(parts[1]) || 0];
}

// "8x10" → "8 x 10"  (handles ×, X, surrounding spaces)
export function formatDimension(key) {
  return key.replace(/\s*[xX×]\s*/, " x ");
}

// Comparator for Array.sort() — ascending by L, then B
export function compareDimensions(a, b) {
  const [aL, aB] = parseDimension(a);
  const [bL, bB] = parseDimension(b);
  return aL !== bL ? aL - bL : aB - bB;
}

// Returns a new sorted copy of a dimension key array
export function sortDimensionKeys(keys) {
  return [...keys].sort(compareDimensions);
}
