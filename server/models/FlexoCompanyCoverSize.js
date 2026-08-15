import { randomBytes } from "crypto";
import mongoose from "mongoose";

function makeCoverSizeId() {
  return `fcs-${randomBytes(4).toString("hex")}`;
}

const rateCellSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true, default: 0, min: 0 },
    isAvailable: { type: Boolean, required: true, default: true },
  },
  { _id: false },
);

const flexoCompanyCoverSizeSchema = new mongoose.Schema(
  {
    _id: { type: String, default: makeCoverSizeId },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlexoCompany",
      required: true,
      index: true,
    },
    coverSize: { type: String, required: true, trim: true },
    enabled: { type: Boolean, required: true, default: true },
    printingColors: {
      1: { type: rateCellSchema, required: true },
      2: { type: rateCellSchema, required: true },
      3: { type: rateCellSchema, required: true },
      4: { type: rateCellSchema, required: true },
      5: { type: rateCellSchema, required: true },
      6: { type: rateCellSchema, required: true },
      7: { type: rateCellSchema, required: true },
      8: { type: rateCellSchema, required: true },
    },
    gussetRate: { type: rateCellSchema, required: true },
    cuttingRate: { type: rateCellSchema, required: true },
    createdBy: { type: String, required: true, trim: true },
    createdAt: { type: Date, required: true },
    modifiedBy: { type: String, default: null },
    modifiedAt: { type: Date, default: null },
  },
  {
    collection: "flexoCompanyCoverSizes",
    versionKey: false,
  },
);

flexoCompanyCoverSizeSchema.index(
  { companyId: 1, coverSize: 1 },
  { unique: true },
);

const FlexoCompanyCoverSize = mongoose.model(
  "FlexoCompanyCoverSize",
  flexoCompanyCoverSizeSchema,
);

export default FlexoCompanyCoverSize;
