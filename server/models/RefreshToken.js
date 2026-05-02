import { randomBytes } from "crypto";
import mongoose from "mongoose";

function makeTokenId() {
  return randomBytes(32).toString("hex");
}

const refreshTokenSchema = new mongoose.Schema(
  {
    // The opaque token string sent to the client.
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: makeTokenId,
    },

    // Owner of this token.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    // All tokens from a single login share a family ID.
    // Reuse of a rotated token triggers deletion of the entire family (theft detection).
    family: { type: String, required: true, index: true },

    // Rotation tracking for reuse detection.
    used: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },

    // MongoDB TTL index auto-deletes expired documents.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    collection: "refresh_tokens",
    versionKey: false,
  },
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
