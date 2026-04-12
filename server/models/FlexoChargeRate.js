import mongoose from "mongoose";

const chargeRateEntrySchema = new mongoose.Schema(
  {
    rate: { type: Number, required: true, min: 0 },
    changedBy: { type: String, required: true, trim: true },
    changedAt: { type: Date, required: true },
  },
  { _id: false },
);

const flexoChargeRateSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    history: {
      type: [chargeRateEntrySchema],
      default: [],
    },
  },
  {
    collection: "flexoChargeRates",
    versionKey: false,
  },
);

const FlexoChargeRate = mongoose.model("FlexoChargeRate", flexoChargeRateSchema);

export default FlexoChargeRate;