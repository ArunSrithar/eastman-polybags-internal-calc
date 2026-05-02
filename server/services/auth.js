import { randomUUID, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { getServerConfig } from "../config/env.js";

// Grace window (ms) — a rotated token used within this period is treated as a
// concurrent request rather than theft (e.g. two browser tabs refreshing at
// the same time).
const ROTATION_GRACE_MS = 30_000;

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toUserResponse(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    permissions: user.permissions.toObject
      ? user.permissions.toObject()
      : user.permissions,
  };
}

function signAccessToken(userId, role) {
  const { jwtSecret, jwtExpiresIn } = getServerConfig();
  // Minimal payload — only sub + role. Full user data returned in response body.
  return jwt.sign({ sub: userId.toString(), role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

function generateRefreshToken() {
  const { refreshExpiresIn } = getServerConfig();
  const ms = parseExpiresIn(refreshExpiresIn);
  return {
    token: randomBytes(40).toString("hex"),
    expiresAt: new Date(Date.now() + ms),
  };
}

function parseExpiresIn(str) {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = String(str).match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiresIn format: ${str}`);
  return Number(match[1]) * units[match[2]];
}

// ── login ──────────────────────────────────────────────────────────────────

export async function login(username, password) {
  const normalized = String(username || "")
    .trim()
    .toLowerCase();

  // Fetch user — use a generic error to avoid username enumeration.
  const user = await User.findOne({ username: normalized });
  const isValid = user ? await user.comparePassword(password) : false;

  if (!isValid) {
    throw makeError(401, "Invalid username or password");
  }

  const accessToken = signAccessToken(user._id, user.role);
  const family = randomUUID();
  const { token: refreshTokenValue, expiresAt } = generateRefreshToken();

  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user._id,
    family,
    expiresAt,
  });

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken: refreshTokenValue,
  };
}

// ── refresh ────────────────────────────────────────────────────────────────

export async function refresh(refreshToken) {
  if (!refreshToken) throw makeError(401, "No refresh token");

  const stored = await RefreshToken.findOne({ token: refreshToken });

  if (!stored) {
    throw makeError(401, "Invalid or expired refresh token");
  }

  // Reuse detection — token was already rotated.
  if (stored.used) {
    const ageMs = Date.now() - (stored.usedAt?.getTime() ?? 0);

    if (ageMs > ROTATION_GRACE_MS) {
      // Outside grace window → potential theft → invalidate entire family.
      await RefreshToken.deleteMany({ family: stored.family });
      throw makeError(
        401,
        "Refresh token reuse detected — please log in again",
      );
    }
    // Within grace window → concurrent request → fall through and issue new tokens.
  }

  // Fetch user.
  const user = await User.findById(stored.userId);
  if (!user) {
    await RefreshToken.deleteMany({ family: stored.family });
    throw makeError(401, "User not found");
  }

  // Mark current token as used.
  stored.used = true;
  stored.usedAt = new Date();
  await stored.save();

  // Issue new tokens in the same family.
  const accessToken = signAccessToken(user._id, user.role);
  const { token: newRefreshToken, expiresAt } = generateRefreshToken();

  await RefreshToken.create({
    token: newRefreshToken,
    userId: user._id,
    family: stored.family,
    expiresAt,
  });

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken: newRefreshToken,
  };
}

// ── logout ─────────────────────────────────────────────────────────────────

export async function logout(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.deleteOne({ token: refreshToken });
}

// ── changePassword ─────────────────────────────────────────────────────────

export async function changePassword(
  userId,
  oldPassword,
  newPassword,
  currentRefreshToken,
) {
  if (!newPassword || newPassword.length < 8 || newPassword.length > 72) {
    throw makeError(400, "Password must be between 8 and 72 characters");
  }

  const user = await User.findById(userId);
  if (!user) throw makeError(404, "User not found");

  const isValid = await user.comparePassword(oldPassword);
  if (!isValid) throw makeError(401, "Current password is incorrect");

  user.password = newPassword; // triggers pre-save hash via virtual
  user.mustChangePassword = false;
  await user.save();

  // Invalidate all other sessions — keep only the current refresh token.
  const query = { userId };
  if (currentRefreshToken) {
    query.token = { $ne: currentRefreshToken };
  }
  await RefreshToken.deleteMany(query);

  return toUserResponse(user);
}

// ── getMe ──────────────────────────────────────────────────────────────────

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw makeError(404, "User not found");
  return toUserResponse(user);
}
