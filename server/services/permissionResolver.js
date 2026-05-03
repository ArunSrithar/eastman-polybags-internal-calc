import { mergePermissions, normalizePermissions } from "../models/permissionsSchema.js";

function toPlainPermissions(permissionDoc) {
  if (!permissionDoc) return null;
  if (permissionDoc.toObject) return permissionDoc.toObject();
  return permissionDoc;
}

export function resolveEffectivePermissions(user) {
  if (!user) return normalizePermissions(null);

  const rolePermissions = (user.roles || [])
    .map((role) => toPlainPermissions(role?.permissions))
    .filter(Boolean);

  // Transitional fallback: if no role permissions are available yet,
  // use the inline user.permissions object.
  if (rolePermissions.length === 0) {
    return normalizePermissions(toPlainPermissions(user.permissions));
  }

  return mergePermissions(rolePermissions);
}

export function hasDotPermission(permissions, permKey) {
  const keys = String(permKey || "").split(".");
  let value = permissions;
  for (const key of keys) value = value?.[key];
  return Boolean(value);
}
