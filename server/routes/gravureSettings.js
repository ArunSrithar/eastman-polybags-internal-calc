import { Router } from "express";
import * as ctrl from "../controllers/gravureSettings.js";
import {
  validateMaterial,
  validateRateKey,
  validateNumber,
  validateString,
  validateOptionType,
} from "../middleware/validate.js";

const router = Router();

// Settings
router.get("/settings", ctrl.getSettings);

// Material prices
router.put(
  "/materials/:materialKey/price",
  validateMaterial,
  validateNumber("price"),
  ctrl.updateMaterialPrice,
);

// Material options (micron / qty)
router.post(
  "/materials/:materialKey/options",
  validateMaterial,
  validateOptionType,
  ctrl.addMaterialOption,
);

// Pouches
router.post(
  "/pouches",
  validateString("length"),
  validateString("breadth"),
  validateNumber("rate"),
  ctrl.createPouch,
);

router.put("/pouches/:id", ctrl.updatePouch);

router.delete("/pouches/:id", ctrl.deletePouch);

// Charge rates
router.put(
  "/charge-rates/:rateKey",
  validateRateKey,
  validateNumber("rate"),
  ctrl.updateChargeRate,
);

export default router;
