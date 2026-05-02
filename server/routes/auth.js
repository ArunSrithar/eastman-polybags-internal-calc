import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as ctrl from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

// ── Rate limiters ──────────────────────────────────────────────────────────

// Login: 5 attempts per IP per 15 min + 10 per username per 15 min.
const loginByIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: "Too many login attempts. Please try again later." },
});

const loginByUsernameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    String(req.body?.username || "")
      .trim()
      .toLowerCase() || req.ip,
  message: {
    error: "Too many login attempts for this account. Please try again later.",
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
router.post("/login", loginByIpLimiter, loginByUsernameLimiter, ctrl.postLogin);
router.post("/refresh", refreshLimiter, ctrl.postRefresh);

// Authenticated
router.post("/logout", requireAuth, ctrl.postLogout);
router.get("/me", requireAuth, ctrl.getMe);
router.put("/change-password", requireAuth, ctrl.putChangePassword);

export default router;
