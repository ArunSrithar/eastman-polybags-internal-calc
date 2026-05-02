import User from "../models/User.js";

// ── calcKey mapping ────────────────────────────────────────────────────────
// Translates app-level calcKeys (kebab-case) to permission keys (camelCase).
export const CALC_KEY_TO_PERMISSION = {
  gravure: "gravure",
  flexo: "flexo",
  "flexo-rate-calc": "flexo",
  "job-cost": "jobCost",
};

/**
 * requireRole(...roles)
 * Middleware factory — passes if req.user.role is in the allowed list.
 * Admin always passes regardless of the provided roles list.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user.role === "admin" || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: "Insufficient permissions" });
  };
}

/**
 * requirePermission(permKey)
 * Middleware factory — fetches the full user from DB and checks
 * permissions[permKey]. Admin always passes.
 *
 * permKey examples: "manageUsers", "gravure.calculate"
 */
export function requirePermission(permKey) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user.role === "admin") return next();

    try {
      const user = await User.findById(req.user.userId).lean();
      if (!user) return res.status(401).json({ error: "User not found" });

      const keys = permKey.split(".");
      let val = user.permissions;
      for (const k of keys) val = val?.[k];

      if (val) return next();
      return res.status(403).json({ error: "Insufficient permissions" });
    } catch (err) {
      next(err);
    }
  };
}

/**
 * requireCalcPermission(permType)
 * Reads calcKey from req.params.calcKey, req.body.calcKey, or req.query.calcKey,
 * maps it to the permission key, then checks user.permissions[calcKey][permType].
 * Admin always passes.
 */
export function requireCalcPermission(permType) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user.role === "admin") return next();

    const rawKey =
      req.params.calcKey ?? req.body?.calcKey ?? req.query?.calcKey;
    const permKey = CALC_KEY_TO_PERMISSION[rawKey];

    if (!permKey) {
      return res.status(400).json({ error: `Unknown calcKey: ${rawKey}` });
    }

    try {
      const user = await User.findById(req.user.userId).lean();
      if (!user) return res.status(401).json({ error: "User not found" });

      const allowed = user.permissions?.[permKey]?.[permType];
      if (allowed) return next();
      return res.status(403).json({ error: "Insufficient permissions" });
    } catch (err) {
      next(err);
    }
  };
}
