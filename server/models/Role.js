import mongoose from "mongoose";
import { permissionsSchema } from "./permissionsSchema.js";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    permissions: { type: permissionsSchema, default: () => ({}) },
  },
  {
    collection: "roles",
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true },
  },
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
