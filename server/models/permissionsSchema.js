import mongoose from "mongoose";

export const CALC_PERMISSION_KEYS = ["gravure", "flexo", "jobCost"];

export const calcPermissionSchema = new mongoose.Schema(
  {
    calculate: { type: Boolean, default: false },
    saveQuote: { type: Boolean, default: false },
    viewQuotes: { type: Boolean, default: false },
    editPrices: { type: Boolean, default: false },
  },
  { _id: false },
);

export const permissionsSchema = new mongoose.Schema(
  {
    gravure: { type: calcPermissionSchema, default: () => ({}) },
    flexo: { type: calcPermissionSchema, default: () => ({}) },
    jobCost: { type: calcPermissionSchema, default: () => ({}) },
    manageUsers: { type: Boolean, default: false },
  },
  { _id: false },
);

export function makePermissions(allEnabled = false) {
  const value = Boolean(allEnabled);
  const full = {
    calculate: value,
    saveQuote: value,
    viewQuotes: value,
    editPrices: value,
  };
  return {
    gravure: { ...full },
    flexo: { ...full },
    jobCost: { ...full },
    manageUsers: value,
  };
}

export function normalizePermissions(input) {
  const base = makePermissions(false);
  if (!input || typeof input !== "object") return base;
  return {
    gravure: { ...base.gravure, ...(input.gravure || {}) },
    flexo: { ...base.flexo, ...(input.flexo || {}) },
    jobCost: { ...base.jobCost, ...(input.jobCost || {}) },
    manageUsers: Boolean(input.manageUsers),
  };
}

export function mergePermissions(permissionSets) {
  const merged = makePermissions(false);
  for (const set of permissionSets || []) {
    const current = normalizePermissions(set);
    for (const calcKey of CALC_PERMISSION_KEYS) {
      merged[calcKey].calculate ||= Boolean(current[calcKey]?.calculate);
      merged[calcKey].saveQuote ||= Boolean(current[calcKey]?.saveQuote);
      merged[calcKey].viewQuotes ||= Boolean(current[calcKey]?.viewQuotes);
      merged[calcKey].editPrices ||= Boolean(current[calcKey]?.editPrices);
    }
    merged.manageUsers ||= Boolean(current.manageUsers);
  }
  return merged;
}
