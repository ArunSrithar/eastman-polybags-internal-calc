import { Router } from "express";
import { requirePermission, requireRole } from "../middleware/authorize.js";
import {
  getUsers,
  postUser,
  putUser,
  deleteUser,
  postResetPassword,
} from "../controllers/users.js";

const router = Router();

// All routes require authentication (already enforced by requireAuth in index.js)
// GET /api/users — list users (manageUsers or admin)
router.get("/", requirePermission("manageUsers"), getUsers);

// POST /api/users — create user (manageUsers or admin)
router.post("/", requirePermission("manageUsers"), postUser);

// PUT /api/users/:id — update user (manageUsers or admin)
router.put("/:id", requirePermission("manageUsers"), putUser);

// DELETE /api/users/:id — delete user (admin only)
router.delete("/:id", requireRole("admin"), deleteUser);

// POST /api/users/:id/reset-password — reset to username (manageUsers or admin)
router.post(
  "/:id/reset-password",
  requirePermission("manageUsers"),
  postResetPassword,
);

export default router;
