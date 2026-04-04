import { Router } from "express";
import * as ctrl from "../controllers/flexoSettings.js";
import {
  validateFlexoMaterial,
  validateConversionMaterial,
  validateRollSize,
  validateCoverSize,
  validateColorCount,
  validateCuttingSize,
  validateFlexoRateKey,
  validateNumber,
  validateString,
} from "../middleware/validate.js";

const router = Router();

// Settings
router.get("/settings", ctrl.getSettings);

// Material prices (PP / HM / LD)
router.put(
  "/materials/:material/price",
  validateFlexoMaterial,
  validateNumber("price"),
  ctrl.updateMaterialPrice,
);

// Conversion rates (material × rollSize)
router.put(
  "/conversion-rates/:material/:rollSize",
  validateConversionMaterial,
  validateRollSize,
  validateNumber("rate"),
  ctrl.updateConversionRate,
);

// Printing rates (coverSize × colorCount) — coverSize validated dynamically in service
router.put(
  "/printing-rates/:coverSize/:colorCount",
  validateColorCount,
  validateNumber("rate"),
  ctrl.updatePrintingRate,
);

// Add a new cover size row to printing rates
router.post(
  "/printing-rows",
  validateString("coverSize"),
  ctrl.addPrintingCoverSize,
);

// Delete a cover size row from printing rates
router.delete("/printing-rows/:coverSize", ctrl.deletePrintingCoverSize);

// Toggle enabled state of a cover size row
router.put("/printing-rows/:coverSize/enabled", ctrl.togglePrintingCoverSize);

// Gusset rates (coverSize)
router.put(
  "/gusset-rates/:coverSize",
  validateCoverSize,
  validateNumber("rate"),
  ctrl.updateGussetRate,
);

// Cutting rates (size)
router.put(
  "/cutting-rates/:size",
  validateCuttingSize,
  validateNumber("rate"),
  ctrl.updateCuttingRate,
);

// Charge rates (punchingRate / opackRate)
router.put(
  "/charge-rates/:rateKey",
  validateFlexoRateKey,
  validateNumber("rate"),
  ctrl.updateChargeRate,
);

// Roll size rates (material × width)
router.put(
  "/roll-size-rates/:material/:rollSize",
  validateConversionMaterial,
  validateNumber("rate"),
  ctrl.updateRollSizeRate,
);
router.post(
  "/roll-size-rows/:material",
  validateConversionMaterial,
  validateString("rollSize"),
  ctrl.addRollSizeRow,
);
router.delete(
  "/roll-size-rows/:material/:rollSize",
  validateConversionMaterial,
  ctrl.deleteRollSizeRow,
);
router.put(
  "/roll-size-rows/:material/:rollSize/enabled",
  validateConversionMaterial,
  ctrl.toggleRollSizeEnabled,
);

export default router;
