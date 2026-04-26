import { Router } from "express";
import * as ctrl from "../controllers/quotes.js";
import {
  validateQuoteCalcKey,
  validateQuotePayload,
} from "../middleware/validate.js";

const router = Router();

router.use("/:calcKey", validateQuoteCalcKey);

router.get("/:calcKey", ctrl.list);
router.get("/:calcKey/count", ctrl.count);
router.post("/:calcKey", validateQuotePayload, ctrl.create);
router.delete("/:calcKey/:id", ctrl.remove);

export default router;
