import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const BCRYPT_ROUNDS = 12;

const calcPermissionSchema = new mongoose.Schema(
  {
    calculate: { type: Boolean, default: false },
    saveQuote: { type: Boolean, default: false },
    viewQuotes: { type: Boolean, default: false },
    editPrices: { type: Boolean, default: false },
  },
  { _id: false },
);

const permissionsSchema = new mongoose.Schema(
  {
    gravure: { type: calcPermissionSchema, default: () => ({}) },
    flexo: { type: calcPermissionSchema, default: () => ({}) },
    jobCost: { type: calcPermissionSchema, default: () => ({}) },
    manageUsers: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    mustChangePassword: { type: Boolean, default: true },
    permissions: { type: permissionsSchema, default: () => ({}) },
  },
  {
    collection: "users",
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Hash password before saving — only when the plain-text password field is set.
// Callers must set user.password (virtual) or hash manually via User.hashPassword().
userSchema.virtual("password").set(function (plain) {
  this._plainPassword = plain;
});

userSchema.pre("save", async function () {
  if (!this._plainPassword) return;
  this.passwordHash = await bcrypt.hash(this._plainPassword, BCRYPT_ROUNDS);
  this._plainPassword = undefined;
});

// Compare a plain-text password against the stored hash.
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Convenience static: hash a plain password without a model instance.
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
};

// Return all permissions set to true (used when seeding admin).
userSchema.statics.allPermissions = function () {
  const full = {
    calculate: true,
    saveQuote: true,
    viewQuotes: true,
    editPrices: true,
  };
  return {
    gravure: { ...full },
    flexo: { ...full },
    jobCost: { ...full },
    manageUsers: true,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
