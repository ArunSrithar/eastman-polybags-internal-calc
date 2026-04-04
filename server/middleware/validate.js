import {
  VALID_MATERIALS,
  VALID_RATE_KEYS,
  VALID_OPTION_TYPES,
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
