import { Router } from "express";
import * as ctrl from "../controllers/gravureSettings.js";
import {
  validateMaterial,
  validateRateKey,
  validateNumber,
  validateString,
  validateOptionType,
  validateObject,
  validatePouchTypes,
} from "../middleware/validate.js";
import { requirePermission } from "../middleware/authorize.js";

// Reusable permission middlewares for this fixed-calc router
const needCalculate = requirePermission("gravure.calculate");
const needEditPrices = requirePermission("gravure.editPrices");

const router = Router();

// Settings
router.get("/settings", needCalculate, ctrl.getSettings);

// Material prices
router.put(
  "/materials/:materialKey/price",
  needEditPrices,
  validateMaterial,
  validateNumber("price"),
  ctrl.updateMaterialPrice,
);

// Material options (micron / qty)
router.post(
  "/materials/:materialKey/options",
  needEditPrices,
  validateMaterial,
  validateOptionType,
  ctrl.addMaterialOption,
);

// Pouches (company-scoped)
router.get(
  "/companies/:companyId/pouches",
  needCalculate,
  ctrl.listCompanyPouches,
);

router.post(
  "/companies/:companyId/pouches",
  needEditPrices,
  validateString("length"),
  validateString("breadth"),
  validateObject("types"),
  validatePouchTypes,
  ctrl.createCompanyPouch,
);

router.put(
  "/companies/:companyId/pouches/:id",
  needEditPrices,
  validateObject("types"),
  validatePouchTypes,
  ctrl.updateCompanyPouch,
);

router.delete(
  "/companies/:companyId/pouches/:id",
  needEditPrices,
  ctrl.deleteCompanyPouch,
);

// Charge rates
router.put(
  "/charge-rates/:rateKey",
  needEditPrices,
  validateRateKey,
  validateNumber("rate"),
  ctrl.updateChargeRate,
);

// Companies
router.get("/companies", needCalculate, ctrl.getCompanies);

router.post(
  "/companies",
  needEditPrices,
  validateString("name"),
  ctrl.createCompanyHandler,
);

router.put(
  "/companies/:id/process/:processKey",
  needEditPrices,
  ctrl.updateCompanyProcessHandler,
);

router.delete("/companies/:id", needEditPrices, ctrl.deleteCompanyHandler);

router.patch("/companies/:id/restore", needEditPrices, ctrl.restoreCompanyHandler);

router.delete("/companies/:id/permanent", needEditPrices, ctrl.permanentDeleteCompanyHandler);

export default router;
