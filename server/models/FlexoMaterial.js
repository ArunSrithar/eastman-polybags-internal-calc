import mongoose from "mongoose";

const materialPriceSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true, min: 0 },
    changedBy: { type: String, required: true, trim: true },
    changedAt: { type: Date, required: true },
  },
  { _id: false },
);

const flexoMaterialSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    priceHistory: {
      type: [materialPriceSchema],
      default: [],
    },
  },
  {
    collection: "flexoMaterials",
    versionKey: false,
  },
);

const FlexoMaterial = mongoose.model("FlexoMaterial", flexoMaterialSchema);

export default FlexoMaterial;