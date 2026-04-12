import mongoose from "mongoose";

const materialPriceSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true, min: 0 },
    changedBy: { type: String, required: true, trim: true },
    changedAt: { type: Date, required: true },
  },
  { _id: false },
);

const materialOptionSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false },
);

const gravureMaterialSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    priceHistory: {
      type: [materialPriceSchema],
      default: [],
    },
    micronOptions: {
      type: [materialOptionSchema],
      default: [],
    },
    qtyOptions: {
      type: [materialOptionSchema],
      default: [],
    },
  },
  {
    collection: "gravureMaterials",
    versionKey: false,
  },
);

const GravureMaterial = mongoose.model("GravureMaterial", gravureMaterialSchema);

export default GravureMaterial;
