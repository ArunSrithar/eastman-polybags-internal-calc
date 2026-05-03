import * as rolesService from "../services/roles.js";

export async function getRoles(req, res, next) {
  try {
    const roles = await rolesService.listRoles();
    res.json(roles);
  } catch (err) {
    next(err);
  }
}

export async function getRoleById(req, res, next) {
  try {
    const role = await rolesService.getRole(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(role);
  } catch (err) {
    next(err);
  }
}

export async function postRole(req, res, next) {
  try {
    const role = await rolesService.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
}

export async function putRole(req, res, next) {
  try {
    const role = await rolesService.updateRole(req.params.id, req.body);
    res.json(role);
  } catch (err) {
    next(err);
  }
}

export async function removeRole(req, res, next) {
  try {
    await rolesService.deleteRole(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
