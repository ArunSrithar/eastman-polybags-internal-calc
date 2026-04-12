import mongoose from "mongoose";

const rateEntrySchema = new mongoose.Schema(
  {
    rate: { type: Number, required: true, min: 0 },
    changedBy: { type: String, required: true, trim: true },
    changedAt: { type: Date, required: true },
  },
  { _id: false },
);

const flexoRollSizeRateSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    material: { type: String, required: true, trim: true },
    rollSize: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    history: {
      type: [rateEntrySchema],
      default: [],
    },
  },
  {
    collection: "flexoRollSizeRates",
    versionKey: false,
  },
);

const FlexoRollSizeRate = mongoose.model(
  "FlexoRollSizeRate",
  flexoRollSizeRateSchema,
);

export default FlexoRollSizeRate;