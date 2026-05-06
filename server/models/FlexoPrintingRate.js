import mongoose from "mongoose";

const rateEntrySchema = new mongoose.Schema(
  {
    rate: { type: Number, required: true, min: 0 },
    changedBy: { type: String, required: true, trim: true },
    changedAt: { type: Date, required: true },
  },
  { _id: false },
);

const colorRateSchema = new mongoose.Schema(
  {
    history: {
      type: [rateEntrySchema],
      default: [],
    },
  },
  { _id: false },
);

const colorRatesSchema = new mongoose.Schema(
  {
    1: { type: colorRateSchema, required: true },
    2: { type: colorRateSchema, required: true },
    3: { type: colorRateSchema, required: true },
    4: { type: colorRateSchema, required: true },
    5: { type: colorRateSchema, required: true },
    6: { type: colorRateSchema, required: true },
    7: { type: colorRateSchema, required: true },
    8: { type: colorRateSchema, required: true },
  },
  { _id: false },
);

const flexoPrintingRateSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    createdBy: { type: String, default: "Admin" },
    createdAt: { type: Date, default: Date.now },
    colors: { type: colorRatesSchema, required: true },
  },
  {
    collection: "flexoPrintingRates",
    versionKey: false,
  },
);

const FlexoPrintingRate = mongoose.model(
  "FlexoPrintingRate",
  flexoPrintingRateSchema,
);

export default FlexoPrintingRate;
