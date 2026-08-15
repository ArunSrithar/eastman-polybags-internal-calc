import { Router } from "express";
import * as ctrl from "../controllers/flexoSettings.js";
import * as companyCtrl from "../controllers/flexoCompanySettings.js";
import {
  validateFlexoMaterial,
  validateConversionMaterial,
  validateRollSize,
  validateColorCount,
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

// Cutting rates (coverSize)
router.put(
  "/cutting-rates/:coverSize",
  needEditPrices,
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

// Companies
router.get("/companies", needCalculate, companyCtrl.getCompanies);

router.post(
  "/companies",
  needEditPrices,
  validateString("name"),
  companyCtrl.createCompanyHandler,
);

router.put(
  "/companies/:id/charge/:chargeKey",
  needEditPrices,
  companyCtrl.updateCompanyChargeHandler,
);

router.delete("/companies/:id", needEditPrices, companyCtrl.deleteCompanyHandler);

router.patch(
  "/companies/:id/restore",
  needEditPrices,
  companyCtrl.restoreCompanyHandler,
);

router.delete(
  "/companies/:id/permanent",
  needEditPrices,
  companyCtrl.permanentDeleteCompanyHandler,
);

// Company-scoped cover sizes
router.get(
  "/companies/:companyId/cover-sizes",
  needCalculate,
  companyCtrl.listCompanyCoverSizes,
);

router.post(
  "/companies/:companyId/cover-sizes",
  needEditPrices,
  validateString("coverSize"),
  companyCtrl.addCompanyCoverSize,
);

router.delete(
  "/companies/:companyId/cover-sizes/:id",
  needEditPrices,
  companyCtrl.deleteCompanyCoverSize,
);

router.put(
  "/companies/:companyId/cover-sizes/:id/enabled",
  needEditPrices,
  companyCtrl.toggleCompanyCoverSize,
);

router.put(
  "/companies/:companyId/cover-sizes/:id/rate",
  needEditPrices,
  companyCtrl.updateCompanyCoverSizeRate,
);

export default router;
