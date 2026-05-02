import jwt from "jsonwebtoken";
import { getServerConfig } from "../config/env.js";

/**
 * requireAuth — verifies the accessToken httpOnly cookie and attaches
 * `{ userId, role }` to `req.user`.
 *
 * Returns 401 if the token is missing, invalid, or expired.
 * The client should call POST /api/auth/refresh when it receives a 401.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { jwtSecret } = getServerConfig();

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Session expired — please log in again" });
  }
}
