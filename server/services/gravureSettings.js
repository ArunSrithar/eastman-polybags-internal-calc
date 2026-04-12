import GravureMaterial from "../models/GravureMaterial.js";
import GravurePouch from "../models/GravurePouch.js";
import GravureChargeRate from "../models/GravureChargeRate.js";

const CHANGED_BY = "Admin";

function toMaterialResponse(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
}

function toPouchResponse(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

function toChargeRateResponse(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
}

function makeNotFoundError(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

/* ── Settings ───────────────────────────────────────────────────────────── */

export async function getSettings() {
  const [materialsDocs, pouchDocs, chargeRateDocs] = await Promise.all([
    GravureMaterial.find().lean(),
    GravurePouch.find().sort({ createdAt: 1 }).lean(),
    GravureChargeRate.find().lean(),
  ]);

  const materials = {};
  for (const doc of materialsDocs) {
    materials[doc._id] = toMaterialResponse(doc);
  }

  const chargeRates = {};
  for (const doc of chargeRateDocs) {
    chargeRates[doc._id] = toChargeRateResponse(doc);
  }

  return {
    materials,
    pouches: pouchDocs.map(toPouchResponse),
    ...chargeRates,
  };
}

/* ── Material prices ────────────────────────────────────────────────────── */

export async function addMaterialPrice(materialKey, price) {
  const updated = await GravureMaterial.findByIdAndUpdate(
    materialKey,
    {
      $push: {
        priceHistory: {
          $each: [
            {
              price,
              changedBy: CHANGED_BY,
              changedAt: new Date(),
            },
          ],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Material ${materialKey} not found`);
  }

  return toMaterialResponse(updated);
}

/* ── Material options (micron / qty) ────────────────────────────────────── */

export async function addMaterialOption(materialKey, type, value) {
  const arrKey = type === "micron" ? "micronOptions" : "qtyOptions";

  const updated = await GravureMaterial.findOneAndUpdate(
    {
      _id: materialKey,
      [`${arrKey}.value`]: { $ne: value },
    },
    {
      $push: {
        [arrKey]: {
          value,
          createdAt: new Date(),
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (updated) {
    return toMaterialResponse(updated);
  }

  const existing = await GravureMaterial.findById(materialKey).lean();
  if (!existing) {
    throw makeNotFoundError(`Material ${materialKey} not found`);
  }

  return toMaterialResponse(existing);
}

/* ── Pouches ────────────────────────────────────────────────────────────── */

export async function createPouch(length, breadth, rate) {
  const now = new Date();
  const created = await GravurePouch.create({
    length,
    breadth,
    rate,
    enabled: true,
    createdBy: CHANGED_BY,
    createdAt: now,
    modifiedBy: null,
    modifiedAt: null,
  });

  return toPouchResponse(created.toObject());
}

export async function updatePouch(id, fields) {
  const patch = {
    modifiedBy: CHANGED_BY,
    modifiedAt: new Date(),
  };

  if (fields.length !== undefined) patch.length = fields.length;
  if (fields.breadth !== undefined) patch.breadth = fields.breadth;
  if (fields.rate !== undefined) patch.rate = fields.rate;
  if (fields.enabled !== undefined) patch.enabled = !!fields.enabled;

  const updated = await GravurePouch.findByIdAndUpdate(
    id,
    { $set: patch },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) return null;
  return toPouchResponse(updated);
}

export async function deletePouch(id) {
  const deleted = await GravurePouch.findByIdAndDelete(id).lean();
  return !!deleted;
}

/* ── Charge rates ───────────────────────────────────────────────────────── */

export async function addChargeRate(rateKey, rate) {
  const updated = await GravureChargeRate.findByIdAndUpdate(
    rateKey,
    {
      $push: {
        history: {
          $each: [
            {
              rate,
              changedBy: CHANGED_BY,
              changedAt: new Date(),
            },
          ],
          $position: 0,
        },
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw makeNotFoundError(`Rate ${rateKey} not found`);
  }

  return toChargeRateResponse(updated);
}
