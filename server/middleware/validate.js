import {
  VALID_MATERIALS,
  VALID_RATE_KEYS,
  VALID_OPTION_TYPES,
  VALID_FLEXO_MATERIALS,
  VALID_CONVERSION_MATERIALS,
  VALID_ROLL_SIZES,
  VALID_COLOR_COUNTS,
  VALID_CUTTING_SIZES,
  VALID_FLEXO_CHARGE_RATE_KEYS,
  VALID_QUOTE_CALC_KEYS,
} from "../config/constants.js";

/**
 * Validate req.params.materialKey against allowed materials.
 */
export function validateMaterial(req, res, next) {
  if (!VALID_MATERIALS.includes(req.params.materialKey)) {
    return res
      .status(400)
      .json({ error: `Invalid material: ${req.params.materialKey}` });
  }
  next();
}

/**
 * Validate req.params.rateKey against allowed rate keys.
 */
export function validateRateKey(req, res, next) {
  if (!VALID_RATE_KEYS.includes(req.params.rateKey)) {
    return res
      .status(400)
      .json({ error: `Invalid rate key: ${req.params.rateKey}` });
  }
  next();
}

/**
 * Validate req.body has a non-negative number field.
 * Usage: validateNumber("price"), validateNumber("rate")
 */
export function validateNumber(field) {
  return (req, res, next) => {
    const val = req.body[field];
    if (val == null || typeof val !== "number" || val < 0) {
      return res
        .status(400)
        .json({ error: `${field} must be a non-negative number` });
    }
    next();
  };
}

/**
 * Validate req.body has a non-empty string field.
 * Usage: validateString("length"), validateString("breadth")
 */
export function validateString(field) {
  return (req, res, next) => {
    const val = req.body[field];
    if (!val || typeof val !== "string") {
      return res
        .status(400)
        .json({ error: `${field} must be a non-empty string` });
    }
    next();
  };
}

// ── Flexo validators ───────────────────────────────────────────────────────

export function validateFlexoMaterial(req, res, next) {
  if (!VALID_FLEXO_MATERIALS.includes(req.params.material)) {
    return res
      .status(400)
      .json({ error: `Invalid material: ${req.params.material}` });
  }
  next();
}

export function validateConversionMaterial(req, res, next) {
  if (!VALID_CONVERSION_MATERIALS.includes(req.params.material)) {
    return res
      .status(400)
      .json({ error: `Invalid material: ${req.params.material}` });
  }
  next();
}

export function validateRollSize(req, res, next) {
  if (!VALID_ROLL_SIZES.includes(req.params.rollSize)) {
    return res
      .status(400)
      .json({ error: `Invalid roll size: ${req.params.rollSize}` });
  }
  next();
}

export function validateColorCount(req, res, next) {
  if (!VALID_COLOR_COUNTS.includes(req.params.colorCount)) {
    return res
      .status(400)
      .json({ error: `Invalid color count: ${req.params.colorCount}` });
  }
  next();
}

export function validateCuttingSize(req, res, next) {
  if (!VALID_CUTTING_SIZES.includes(req.params.size)) {
    return res
      .status(400)
      .json({ error: `Invalid cutting size: ${req.params.size}` });
  }
  next();
}

export function validateFlexoRateKey(req, res, next) {
  if (!VALID_FLEXO_CHARGE_RATE_KEYS.includes(req.params.rateKey)) {
    return res
      .status(400)
      .json({ error: `Invalid rate key: ${req.params.rateKey}` });
  }
  next();
}

/**
 * Validate option type in req.body.type.
 */
export function validateOptionType(req, res, next) {
  if (!VALID_OPTION_TYPES.includes(req.body.type)) {
    return res
      .status(400)
      .json({ error: `type must be one of: ${VALID_OPTION_TYPES.join(", ")}` });
  }
  if (!req.body.value || typeof req.body.value !== "string") {
    return res.status(400).json({ error: "value must be a non-empty string" });
  }
  next();
}

// ── Quotes ─────────────────────────────────────────────────────────────────

export function validateQuoteCalcKey(req, res, next) {
  if (!VALID_QUOTE_CALC_KEYS.includes(req.params.calcKey)) {
    return res
      .status(400)
      .json({ error: `Quotes are not enabled for: ${req.params.calcKey}` });
  }
  next();
}

const MAX_QUOTE_NAME = 200;

function isPlainObject(value) {
  return (
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export function validateQuotePayload(req, res, next) {
  const { quoteName, pricePerKg, form, pouchSize } = req.body || {};

  if (typeof quoteName !== "string" || !quoteName.trim()) {
    return res
      .status(400)
      .json({ error: "quoteName must be a non-empty string" });
  }
  if (quoteName.trim().length > MAX_QUOTE_NAME) {
    return res
      .status(400)
      .json({ error: `quoteName must be ≤ ${MAX_QUOTE_NAME} characters` });
  }
  if (
    typeof pricePerKg !== "number" ||
    !Number.isFinite(pricePerKg) ||
    pricePerKg < 0
  ) {
    return res
      .status(400)
      .json({ error: "pricePerKg must be a non-negative number" });
  }
  if (!isPlainObject(form)) {
    return res.status(400).json({ error: "form must be an object" });
  }
  if (pouchSize != null && typeof pouchSize !== "string") {
    return res.status(400).json({ error: "pouchSize must be a string" });
  }
  next();
}
