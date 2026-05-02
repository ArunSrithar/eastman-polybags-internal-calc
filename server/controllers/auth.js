import * as service from "../services/auth.js";
import { getServerConfig } from "../config/env.js";

const IS_PROD = process.env.NODE_ENV === "production";

// ── Cookie helpers ─────────────────────────────────────────────────────────

function setAccessTokenCookie(res, token) {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });
}

function setRefreshTokenCookie(res, token) {
  const { refreshExpiresIn } = getServerConfig();
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    maxAge: parseExpiresInMs(refreshExpiresIn), // default 7d
    path: "/api/auth",
  });
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/api/auth",
  });
}

function parseExpiresInMs(str) {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = String(str).match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86_400_000; // fallback 7d
  return Number(match[1]) * units[match[2]];
}

// ── Controllers ────────────────────────────────────────────────────────────

export async function postLogin(req, res, next) {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const { user, accessToken, refreshToken } = await service.login(
      String(username).trim(),
      String(password),
    );

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function postLogout(req, res, next) {
  try {
    await service.logout(req.cookies?.refreshToken);
    clearAuthCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function postRefresh(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await service.refresh(
      req.cookies?.refreshToken,
    );

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await service.getMe(req.user.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function putChangePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body ?? {};

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "oldPassword and newPassword are required" });
    }

    const user = await service.changePassword(
      req.user.userId,
      String(oldPassword),
      String(newPassword),
      req.cookies?.refreshToken,
    );

    res.json({ user });
  } catch (err) {
    next(err);
  }
}
