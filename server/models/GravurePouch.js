import { randomBytes } from "crypto";
import mongoose from "mongoose";

function makePouchId() {
  return `ps-${randomBytes(4).toString("hex")}`;
}

const gravurePouchSchema = new mongoose.Schema(
  {
    _id: { type: String, default: makePouchId },
    length: { type: String, required: true, trim: true },
    breadth: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, default: true },
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

const GravurePouch = mongoose.model("GravurePouch", gravurePouchSchema);

export default GravurePouch;
