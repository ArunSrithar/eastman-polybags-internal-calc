import * as usersService from "../services/users.js";

export async function getUsers(req, res, next) {
  try {
    const users = await usersService.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function postUser(req, res, next) {
  try {
    const user = await usersService.createUser(req.body, req.user);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function putUser(req, res, next) {
  try {
    const user = await usersService.updateUser(
      req.params.id,
      req.body,
      req.user,
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await usersService.deleteUser(req.params.id, req.user);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function postResetPassword(req, res, next) {
  try {
    const user = await usersService.resetPassword(req.params.id, req.user);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
