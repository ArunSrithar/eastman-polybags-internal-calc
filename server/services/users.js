import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import Role from "../models/Role.js";
import { normalizePermissions } from "../models/permissionsSchema.js";
import { resolveEffectivePermissions } from "./permissionResolver.js";

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Sanitise a permissions object so non-admins cannot escalate their own
 * role or grant themselves manageUsers.
 */
function sanitisePermissions(permissions, requestingRole) {
  if (!permissions || typeof permissions !== "object") return undefined;
  if (requestingRole === "admin") return permissions;

  // Non-admins cannot grant manageUsers
  const sanitised = { ...permissions };
  if (sanitised.manageUsers) sanitised.manageUsers = false;
  return sanitised;
}

async function resolveRoleIds(input) {
  if (input === undefined) return undefined;
  const ids = Array.isArray(input) ? input.map(String).filter(Boolean) : [];
  if (ids.length === 0) return [];

  let roles;
  try {
    roles = await Role.find({ _id: { $in: ids } }).select("_id").lean();
  } catch {
    const err = new Error("Invalid role id in roles[]");
    err.status = 400;
    throw err;
  }

  if (roles.length !== new Set(ids).size) {
    const err = new Error("One or more roles do not exist");
    err.status = 400;
    throw err;
  }

  return roles.map((r) => r._id);
}

function firstWord(str) {
  return (str || "").trim().split(/\s+/)[0] || "";
}

function mapDuplicateKeyError(err) {
  if (err?.code !== 11000) return err;

  const field = Object.keys(err?.keyPattern || {})[0] || "field";
  const value = err?.keyValue?.[field];
  const conflict = new Error(
    value ? `${field} "${value}" already exists` : `${field} already exists`,
  );
  conflict.status = 409;
  return conflict;
}

/**
 * Map a Mongoose User document to a safe response object (no passwordHash).
 */
function toUserResponse(user) {
  const effectivePermissions = resolveEffectivePermissions(user);
  const roles = (user.roles || []).map((role) => ({
    id: role?._id || role?.id,
    name: role?.name,
  }));

  return {
    id: user._id,
    username: user.username,
    fullName: user.fullName,
    displayName: user.displayName,
    email: user.email,
    isActive: user.isActive ?? true,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    roles,
    permissions: effectivePermissions,
    effectivePermissions,
    legacyPermissions: normalizePermissions(user.permissions),
    createdAt: user.createdAt,
  };
}

/**
 * Invalidate all active sessions for a user by removing their refresh tokens.
 * Used after a forced permission/role change.
 */
async function invalidateSessions(userId) {
  await RefreshToken.deleteMany({ userId });
}

// ── Service functions ──────────────────────────────────────────────────────

/**
 * listUsers()
 * Returns all users as safe response objects, sorted by createdAt ascending.
 */
export async function listUsers() {
  const users = await User.find({})
    .sort({ createdAt: 1 })
    .populate("roles", "name permissions")
    .lean();
  return users.map(toUserResponse);
}

/**
 * getUser(id)
 * Returns a single user or null.
 */
export async function getUser(id) {
  const user = await User.findById(id).populate("roles", "name permissions").lean();
  return user ? toUserResponse(user) : null;
}

/**
 * createUser(data, requestingUser)
 * Creates a new user. Password is set to the username by default.
 * Non-admins cannot create admin-role users or grant manageUsers.
 *
 * data: { username, email?, role?, permissions? }
 * requestingUser: { userId, role }
 */
export async function createUser(data, requestingUser) {
  const { username, email, fullName, displayName, role, permissions, roles } = data;

  if (!username || typeof username !== "string") {
    const err = new Error("username is required");
    err.status = 400;
    throw err;
  }

  // Non-admins cannot create admin-role accounts
  const assignedRole =
    requestingUser.role !== "admin" ? "user" : (role ?? "user");

  const sanitisedPerms = sanitisePermissions(permissions, requestingUser.role);
  const roleIds = await resolveRoleIds(roles);

  const defaultPassword = username.trim().toLowerCase();
  const passwordHash = await User.hashPassword(defaultPassword);

  const trimmedFullName = fullName?.trim() || undefined;
  const resolvedDisplayName =
    displayName?.trim() || firstWord(trimmedFullName) || undefined;

  const user = new User({
    username: username.trim().toLowerCase(),
    fullName: trimmedFullName,
    displayName: resolvedDisplayName,
    email: email?.trim().toLowerCase() || undefined,
    role: assignedRole,
    mustChangePassword: true,
    roles: roleIds || [],
    permissions: sanitisedPerms,
    passwordHash,
  });

  try {
    await user.save();
  } catch (err) {
    throw mapDuplicateKeyError(err);
  }

  const hydrated = await User.findById(user._id)
    .populate("roles", "name permissions")
    .lean();
  return toUserResponse(hydrated);
}

/**
 * updateUser(id, data, requestingUser)
 * Updates a user's role, email, permissions, mustChangePassword.
 * - Self-modification of role or permissions is blocked.
 * - Non-admins cannot edit admin users.
 * - On role/permission change, all target sessions are invalidated.
 *
 * data: { email?, role?, permissions?, mustChangePassword? }
 * requestingUser: { userId, role }
 */
export async function updateUser(id, data, requestingUser) {
  const target = await User.findById(id);
  if (!target) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // Block self-modification of role / permissions
  const isSelf = String(target._id) === String(requestingUser.userId);
  if (
    isSelf &&
    (data.role !== undefined ||
      data.permissions !== undefined ||
      data.roles !== undefined)
  ) {
    const err = new Error("You cannot change your own role or permissions");
    err.status = 403;
    throw err;
  }

  // Non-admins cannot edit admin accounts
  if (requestingUser.role !== "admin" && target.role === "admin") {
    const err = new Error("You cannot edit an admin account");
    err.status = 403;
    throw err;
  }

  let sessionsInvalidated = false;

  if (data.fullName !== undefined) {
    target.fullName = data.fullName?.trim() || undefined;
  }
  if (data.displayName !== undefined) {
    target.displayName = data.displayName?.trim() || undefined;
  }
  if (data.isActive !== undefined && !isSelf) {
    target.isActive = Boolean(data.isActive);
    // Disabled users should lose all active sessions immediately
    if (!target.isActive) sessionsInvalidated = true;
  }
  if (data.email !== undefined) {
    const normalizedEmail = data.email?.trim().toLowerCase();
    target.email = normalizedEmail || undefined;
  }
  if (data.mustChangePassword !== undefined) {
    target.mustChangePassword = Boolean(data.mustChangePassword);
  }
  if (data.role !== undefined && requestingUser.role === "admin") {
    target.role = data.role;
    sessionsInvalidated = true;
  }
  if (data.permissions !== undefined) {
    const sanitised = sanitisePermissions(
      data.permissions,
      requestingUser.role,
    );
    target.permissions = sanitised ?? target.permissions;
    sessionsInvalidated = true;
  }
  if (data.roles !== undefined) {
    const roleIds = await resolveRoleIds(data.roles);
    target.roles = roleIds;
    sessionsInvalidated = true;
  }

  try {
    await target.save();
  } catch (err) {
    throw mapDuplicateKeyError(err);
  }

  // Force re-login on role/permission changes so stale JWTs are cleared
  if (sessionsInvalidated) {
    await invalidateSessions(target._id);
  }

  const hydrated = await User.findById(target._id)
    .populate("roles", "name permissions")
    .lean();
  return toUserResponse(hydrated);
}

/**
 * deleteUser(id, requestingUser)
 * Deletes a user and all their refresh tokens.
 * - Cannot delete yourself.
 * - Cannot delete the last admin account.
 *
 * requestingUser: { userId, role }
 */
export async function deleteUser(id, requestingUser) {
  const target = await User.findById(id);
  if (!target) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // Cannot delete yourself
  if (String(target._id) === String(requestingUser.userId)) {
    const err = new Error("You cannot delete your own account");
    err.status = 403;
    throw err;
  }

  // Prevent deleting the last admin
  if (target.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      const err = new Error("Cannot delete the last admin account");
      err.status = 409;
      throw err;
    }
  }

  await invalidateSessions(target._id);
  await User.findByIdAndDelete(id);
}

/**
 * resetPassword(id, requestingUser)
 * Resets a user's password to their username and forces mustChangePassword.
 * - Non-admins cannot reset admin passwords.
 */
export async function resetPassword(id, requestingUser) {
  const target = await User.findById(id);
  if (!target) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (requestingUser.role !== "admin" && target.role === "admin") {
    const err = new Error("You cannot reset an admin's password");
    err.status = 403;
    throw err;
  }

  target.password = target.username; // triggers bcrypt pre-save hook
  target.mustChangePassword = true;
  await target.save();

  await invalidateSessions(target._id);
  const hydrated = await User.findById(target._id)
    .populate("roles", "name permissions")
    .lean();
  return toUserResponse(hydrated);
}
