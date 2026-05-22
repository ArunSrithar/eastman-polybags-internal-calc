import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as ctrl from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

// ── Rate limiters ──────────────────────────────────────────────────────────

const LOGIN_ATTEMPT_WINDOW_MS = 60 * 1000;
const LOGIN_ATTEMPT_MAX = 5;
const LOGIN_COOLDOWN_MS = 5 * 60 * 1000;
const loginCooldownByIp = new Map();
const loginCooldownByUsername = new Map();

function setCooldown(map, key) {
  map.set(key, Date.now() + LOGIN_COOLDOWN_MS);
}

function getRetryAfterSeconds(untilTs) {
  return Math.max(1, Math.ceil((untilTs - Date.now()) / 1000));
}

function checkCooldown(map, key) {
  const untilTs = map.get(key);
  if (!untilTs) return null;

  if (untilTs <= Date.now()) {
    map.delete(key);
    return null;
  }

  return untilTs;
}

function getNormalizedUsername(req) {
  return String(req.body?.username || "")
    .trim()
    .toLowerCase();
}

function enforceLoginCooldown(req, res, next) {
  const usernameKey = getNormalizedUsername(req);
  const ipCooldownUntil = checkCooldown(loginCooldownByIp, req.ip);
  const usernameCooldownUntil = usernameKey
    ? checkCooldown(loginCooldownByUsername, usernameKey)
    : null;
  const cooldownUntil = Math.max(
    ipCooldownUntil || 0,
    usernameCooldownUntil || 0,
  );

  if (!cooldownUntil) {
    next();
    return;
  }

  res.set("Retry-After", String(getRetryAfterSeconds(cooldownUntil)));
  res.status(429).json({
    error: "Too many login attempts. Please try again in 5 minutes.",
  });
}

// Login: 5 attempts per minute; if exceeded, cooldown for 5 minutes.
const loginByIpLimiter = rateLimit({
  windowMs: LOGIN_ATTEMPT_WINDOW_MS,
  max: LOGIN_ATTEMPT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    setCooldown(loginCooldownByIp, req.ip);
    res.set("Retry-After", String(Math.ceil(LOGIN_COOLDOWN_MS / 1000)));
    res.status(429).json({
      error: "Too many login attempts. Please try again in 5 minutes.",
    });
  },
});

const loginByUsernameLimiter = rateLimit({
  windowMs: LOGIN_ATTEMPT_WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getNormalizedUsername(req) || req.ip,
  handler: (req, res) => {
    const usernameKey = getNormalizedUsername(req) || req.ip;
    setCooldown(loginCooldownByUsername, usernameKey);
    res.set("Retry-After", String(Math.ceil(LOGIN_COOLDOWN_MS / 1000)));
    res.status(429).json({
      error:
        "Too many login attempts for this account. Please try again in 5 minutes.",
    });
  },
});

// Refresh: 30 per IP per minute.
const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: "Too many refresh requests. Please try again later." },
});

// ── Routes ─────────────────────────────────────────────────────────────────

const router = Router();

// Public
router.post(
  "/login",
  enforceLoginCooldown,
  loginByIpLimiter,
  loginByUsernameLimiter,
  ctrl.postLogin,
);
router.post("/refresh", refreshLimiter, ctrl.postRefresh);

// Authenticated
router.post("/logout", requireAuth, ctrl.postLogout);
router.get("/me", requireAuth, ctrl.getMe);
router.put("/change-password", requireAuth, ctrl.putChangePassword);

export default router;
