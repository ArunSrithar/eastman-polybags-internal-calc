import { Router } from "express";
import * as ctrl from "../controllers/flexoSettings.js";
import {
  validateFlexoMaterial,
  validateConversionMaterial,
  validateRollSize,
  validateColorCount,
  validateCuttingSize,
  validateFlexoRateKey,
  validateNumber,
  validateString,
} from "../middleware/validate.js";
import { requirePermission } from "../middleware/authorize.js";

// Reusable permission middlewares for this fixed-calc router
const needCalculate = requirePermission("flexo.calculate");
const needEditPrices = requirePermission("flexo.editPrices");

const router = Router();

// Settings
router.get("/settings", needCalculate, ctrl.getSettings);

// Material prices (PP / HM / LD)
router.put(
  "/materials/:material/price",
  needEditPrices,
  validateFlexoMaterial,
  validateNumber("price"),
  ctrl.updateMaterialPrice,
);

// Conversion rates (material × rollSize)
router.put(
  "/conversion-rates/:material/:rollSize",
  needEditPrices,
  validateConversionMaterial,
  validateRollSize,
  validateNumber("rate"),
  ctrl.updateConversionRate,
);

// Printing rates (coverSize × colorCount)
router.put(
  "/printing-rates/:coverSize/:colorCount",
  needEditPrices,
  validateColorCount,
  validateNumber("rate"),
  ctrl.updatePrintingRate,
);

// Add a new cover size row to printing rates
router.post(
  "/printing-rows",
  needEditPrices,
  validateString("coverSize"),
  ctrl.addPrintingCoverSize,
);

// Delete a cover size row from printing rates
router.delete(
  "/printing-rows/:coverSize",
  needEditPrices,
  ctrl.deletePrintingCoverSize,
);

// Toggle enabled state of a cover size row
router.put(
  "/printing-rows/:coverSize/enabled",
  needEditPrices,
  ctrl.togglePrintingCoverSize,
);

// Gusset rates (coverSize)
router.put(
  "/gusset-rates/:coverSize",
  needEditPrices,
  validateNumber("rate"),
  ctrl.updateGussetRate,
);

// Cutting rates (size)
router.put(
  "/cutting-rates/:size",
  needEditPrices,
  validateCuttingSize,
  validateNumber("rate"),
  ctrl.updateCuttingRate,
);

// Charge rates (punchingRate / opackRate)
router.put(
  "/charge-rates/:rateKey",
  needEditPrices,
  validateFlexoRateKey,
  validateNumber("rate"),
  ctrl.updateChargeRate,
);

// Roll size rates (material × width)
router.put(
  "/roll-size-rates/:material/:rollSize",
  needEditPrices,
  validateConversionMaterial,
  validateNumber("rate"),
  ctrl.updateRollSizeRate,
);
router.post(
  "/roll-size-rows/:material",
  needEditPrices,
  validateConversionMaterial,
  validateString("rollSize"),
  ctrl.addRollSizeRow,
);
router.delete(
  "/roll-size-rows/:material/:rollSize",
  needEditPrices,
  validateConversionMaterial,
  ctrl.deleteRollSizeRow,
);
router.put(
  "/roll-size-rows/:material/:rollSize/enabled",
  needEditPrices,
  validateConversionMaterial,
  ctrl.toggleRollSizeEnabled,
);

export default router;
