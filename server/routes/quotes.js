import { Router } from "express";
import * as ctrl from "../controllers/quotes.js";
import {
  validateQuoteCalcKey,
  validateQuotePayload,
} from "../middleware/validate.js";
import { requireCalcPermission } from "../middleware/authorize.js";

const router = Router();

router.use("/:calcKey", validateQuoteCalcKey);

router.get("/:calcKey", requireCalcPermission("viewQuotes"), ctrl.list);
router.get("/:calcKey/count", requireCalcPermission("viewQuotes"), ctrl.count);
router.post(
  "/:calcKey",
  validateQuotePayload,
  requireCalcPermission("saveQuote"),
  ctrl.create,
);
router.delete("/:calcKey/:id", requireCalcPermission("saveQuote"), ctrl.remove);

export default router;
