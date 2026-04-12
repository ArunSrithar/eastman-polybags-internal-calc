import mongoose from "mongoose";

const rateEntrySchema = new mongoose.Schema(
  {
    rate: { type: Number, required: true, min: 0 },
    changedBy: { type: String, required: true, trim: true },
    changedAt: { type: Date, required: true },
  },
  { _id: false },
);

const flexoConversionRateSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    material: { type: String, required: true, trim: true },
    rollSize: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    history: {
      type: [rateEntrySchema],
      default: [],
    },
  },
  {
    collection: "flexoConversionRates",
    versionKey: false,
  },
);

const FlexoConversionRate = mongoose.model(
  "FlexoConversionRate",
  flexoConversionRateSchema,
);

export default FlexoConversionRate;