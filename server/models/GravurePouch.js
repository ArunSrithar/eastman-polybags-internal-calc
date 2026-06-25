import { randomBytes } from "crypto";
import mongoose from "mongoose";

function makePouchId() {
  return `ps-${randomBytes(4).toString("hex")}`;
}

const pouchTypeSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true, default: 0, min: 0 },
    isAvailable: { type: Boolean, required: true, default: true },
  },
  { _id: false },
);

const gravurePouchSchema = new mongoose.Schema(
  {
    _id: { type: String, default: makePouchId },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GravureCompany",
      required: true,
      index: true,
    },
    length: { type: String, required: true, trim: true },
    breadth: { type: String, required: true, trim: true },
    types: {
      normalPouch: { type: pouchTypeSchema, required: true },
      normalWithZipLock: { type: pouchTypeSchema, required: true },
      standUpPouch: { type: pouchTypeSchema, required: true },
      standUpWithZipLock: { type: pouchTypeSchema, required: true },
    },
    createdBy: { type: String, required: true, trim: true },
    createdAt: { type: Date, required: true },
    modifiedBy: { type: String, default: null },
    modifiedAt: { type: Date, default: null },
  },
  {
    collection: "gravurePouches",
    versionKey: false,
  },
);

gravurePouchSchema.index(
  { companyId: 1, length: 1, breadth: 1 },
  { unique: true },
);

const GravurePouch = mongoose.model("GravurePouch", gravurePouchSchema);

export default GravurePouch;
