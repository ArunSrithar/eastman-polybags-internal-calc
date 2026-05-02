import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

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

/**
 * Map a Mongoose User document to a safe response object (no passwordHash).
 */
function toUserResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    permissions: user.permissions,
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
  const users = await User.find({}).sort({ createdAt: 1 }).lean();
  return users.map(toUserResponse);
}

/**
 * getUser(id)
 * Returns a single user or null.
 */
export async function getUser(id) {
  const user = await User.findById(id).lean();
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
  const { username, email, role, permissions } = data;

  if (!username || typeof username !== "string") {
    const err = new Error("username is required");
    err.status = 400;
    throw err;
  }

  // Non-admins cannot create admin-role accounts
  const assignedRole =
    requestingUser.role !== "admin" ? "user" : (role ?? "user");

  const sanitisedPerms = sanitisePermissions(permissions, requestingUser.role);

  const user = new User({
    username: username.trim().toLowerCase(),
    email: email?.trim().toLowerCase(),
    role: assignedRole,
    mustChangePassword: true,
    permissions: sanitisedPerms,
  });

  // Default password is the username (must change on first login)
  user.password = username.trim().toLowerCase();

  await user.save();
  return toUserResponse(user);
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
  if (isSelf && (data.role !== undefined || data.permissions !== undefined)) {
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

  if (data.email !== undefined) {
    target.email = data.email.trim().toLowerCase();
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

  await target.save();

  // Force re-login on role/permission changes so stale JWTs are cleared
  if (sessionsInvalidated) {
    await invalidateSessions(target._id);
  }

  return toUserResponse(target);
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
  return toUserResponse(target);
}
