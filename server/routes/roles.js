import { Router } from "express";
import { requirePermission } from "../middleware/authorize.js";
import {
  getRoles,
  getRoleById,
  postRole,
  putRole,
  removeRole,
} from "../controllers/roles.js";

const router = Router();

router.get("/", requirePermission("manageUsers"), getRoles);
router.get("/:id", requirePermission("manageUsers"), getRoleById);
router.post("/", requirePermission("manageUsers"), postRole);
router.put("/:id", requirePermission("manageUsers"), putRole);
router.delete("/:id", requirePermission("manageUsers"), removeRole);

export default router;
