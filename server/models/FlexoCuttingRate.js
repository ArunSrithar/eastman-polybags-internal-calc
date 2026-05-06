import mongoose from "mongoose";

const rateEntrySchema = new mongoose.Schema(
  {
    rate: { type: Number, required: true, min: 0 },
    changedBy: { type: String, required: true, trim: true },
    changedAt: { type: Date, required: true },
  },
  { _id: false },
);

const flexoCuttingRateSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    history: {
      type: [rateEntrySchema],
      default: [],
    },
  },
  {
    collection: "flexoCuttingRates",
    versionKey: false,
  },
);

const FlexoCuttingRate = mongoose.model(
  "FlexoCuttingRate",
  flexoCuttingRateSchema,
);

export default FlexoCuttingRate;
