import Role from "../models/Role.js";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { normalizePermissions } from "../models/permissionsSchema.js";

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toRoleResponse(role, userCount = 0) {
  return {
    id: role._id,
    name: role.name,
    description: role.description,
    permissions: normalizePermissions(role.permissions),
    userCount,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

async function invalidateSessionsForRole(roleId) {
  const users = await User.find({ roles: roleId }).select("_id").lean();
  if (users.length === 0) return;
  await RefreshToken.deleteMany({ userId: { $in: users.map((u) => u._id) } });
}

export async function listRoles() {
  const [roles, counts] = await Promise.all([
    Role.find({}).sort({ name: 1 }).lean(),
    User.aggregate([
      { $unwind: "$roles" },
      { $group: { _id: "$roles", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(counts.map((row) => [String(row._id), row.count]));
  return roles.map((role) =>
    toRoleResponse(role, countMap.get(String(role._id)) || 0),
  );
}

export async function getRole(id) {
  const role = await Role.findById(id).lean();
  if (!role) return null;
  const userCount = await User.countDocuments({ roles: role._id });
  return toRoleResponse(role, userCount);
}

export async function createRole(data) {
  const name = String(data?.name || "").trim();
  if (!name) throw makeError(400, "Role name is required");

  const existing = await Role.findOne({ name });
  if (existing) throw makeError(409, `Role \"${name}\" already exists`);

  const role = await Role.create({
    name,
    description: data?.description?.trim() || undefined,
    permissions: normalizePermissions(data?.permissions),
  });

  return toRoleResponse(role, 0);
}

export async function updateRole(id, data) {
  const role = await Role.findById(id);
  if (!role) throw makeError(404, "Role not found");

  if (data?.name !== undefined) {
    const name = String(data.name || "").trim();
    if (!name) throw makeError(400, "Role name is required");

    const duplicate = await Role.findOne({ name, _id: { $ne: role._id } });
    if (duplicate) throw makeError(409, `Role \"${name}\" already exists`);
    role.name = name;
  }

  if (data?.description !== undefined) {
    role.description = data.description?.trim() || undefined;
  }

  if (data?.permissions !== undefined) {
    role.permissions = normalizePermissions(data.permissions);
  }

  await role.save();

  if (data?.permissions !== undefined) {
    await invalidateSessionsForRole(role._id);
  }

  const userCount = await User.countDocuments({ roles: role._id });
  return toRoleResponse(role, userCount);
}

export async function deleteRole(id) {
  const role = await Role.findById(id);
  if (!role) throw makeError(404, "Role not found");

  const assignedCount = await User.countDocuments({ roles: role._id });
  if (assignedCount > 0) {
    throw makeError(
      409,
      `Cannot delete role \"${role.name}\" because it is assigned to ${assignedCount} user(s)`,
    );
  }

  await Role.deleteOne({ _id: role._id });
}
