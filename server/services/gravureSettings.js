import GravureMaterial from "../models/GravureMaterial.js";
import GravurePouch from "../models/GravurePouch.js";
import GravureChargeRate from "../models/GravureChargeRate.js";
import GravureCompany from "../models/GravureCompany.js";
import User from "../models/User.js";

const CHANGED_BY = "Admin";
const DEFAULT_COMPANY_NAME = "Eastman Color Printers";
const DEFAULT_COMPANY_PROCESSES = {
  normalColor: { price: 0, isAvailable: true },
  metallicColor: { price: 0, isAvailable: true },
  mattFinish: { price: 0, isAvailable: true },
  singleLamination: { price: 0, isAvailable: true },
  doubleLamination: { price: 0, isAvailable: true },
  slitting: { price: 0, isAvailable: true },
};
const DEFAULT_COMPANY_RATE_IDS = {
  normalColor: "normalColorRate",
  metallicColor: "metallicColorRate",
  mattFinish: "mattFinishRate",
  singleLamination: "singleLamRate",
  doubleLamination: "doubleLamRate",
  slitting: "slittingRate",
};
const POUCH_TYPE_KEYS = [
  "normalPouch",
  "normalWithZipLock",
  "standUpPouch",
  "standUpWithZipLock",
];

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

function toCompanyResponse(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    isActive: doc.isActive,
    processes: doc.processes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function makeNotFoundError(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

async function resolveChangedBy(userId) {
  if (!userId) return CHANGED_BY;

  const user = await User.findById(userId)
    .select("displayName fullName username email")
    .lean();

  if (!user) return CHANGED_BY;

  return (
    user.displayName ||
    user.fullName ||
    user.username ||
    user.email ||
    CHANGED_BY
  );
}

async function ensureDefaultCompany() {
  const existing = await GravureCompany.findOne({ name: DEFAULT_COMPANY_NAME })
    .select("_id")
    .lean();

  if (existing) {
    await GravureCompany.findByIdAndUpdate(existing._id, {
      $set: { isActive: true },
    });
    return;
  }

  const chargeRates = await GravureChargeRate.find({
    _id: { $in: Object.values(DEFAULT_COMPANY_RATE_IDS) },
  }).lean();

  const chargeRateMap = new Map(chargeRates.map((rate) => [rate._id, rate]));
  const processes = Object.entries(DEFAULT_COMPANY_RATE_IDS).reduce(
    (acc, [processKey, rateId]) => {
      const rate = chargeRateMap.get(rateId)?.history?.[0]?.rate ?? 0;
      acc[processKey] = { price: rate, isAvailable: true };
      return acc;
    },
    {},
  );

  await GravureCompany.create({
    name: DEFAULT_COMPANY_NAME,
    isActive: true,
    processes: { ...DEFAULT_COMPANY_PROCESSES, ...processes },
  });
}

/* ── Settings ───────────────────────────────────────────────────────────── */

export async function getSettings() {
  await ensureDefaultCompany();

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
    pouches: pouchDocs
      .filter((doc) => doc.companyId)
      .map((doc) => ({
        ...toPouchResponse(doc),
        companyId: doc.companyId?.toString?.() ?? doc.companyId,
      })),
    ...chargeRates,
  };
}

/* ── Material prices ────────────────────────────────────────────────────── */

export async function addMaterialPrice(materialKey, price, userId) {
  const changedBy = await resolveChangedBy(userId);

  const updated = await GravureMaterial.findByIdAndUpdate(
    materialKey,
    {
      $push: {
        priceHistory: {
          $each: [
            {
              price,
              changedBy,
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

export async function createPouch(companyId, length, breadth, types, userId) {
  const company = await GravureCompany.findOne({
    _id: companyId,
    isActive: true,
  })
    .select("_id")
    .lean();

  if (!company) {
    throw makeNotFoundError("Company not found");
  }

  const changedBy = await resolveChangedBy(userId);
  const now = new Date();

  const normalizedTypes = POUCH_TYPE_KEYS.reduce((acc, key) => {
    const src = types?.[key] ?? {};
    const nextPrice = Number(src.price);
    acc[key] = {
      price: Number.isFinite(nextPrice) && nextPrice >= 0 ? nextPrice : 0,
      isAvailable: src.isAvailable !== false,
    };
    return acc;
  }, {});

  const created = await GravurePouch.create({
    companyId,
    length,
    breadth,
    types: normalizedTypes,
    createdBy: changedBy,
    createdAt: now,
    modifiedBy: null,
    modifiedAt: null,
  });

  const doc = created.toObject();
  return {
    ...toPouchResponse(doc),
    companyId: doc.companyId?.toString?.() ?? doc.companyId,
  };
}

export async function updatePouch(companyId, id, fields, userId) {
  const changedBy = await resolveChangedBy(userId);
  const patch = {
    modifiedBy: changedBy,
    modifiedAt: new Date(),
  };

  if (fields.types && typeof fields.types === "object") {
    for (const key of POUCH_TYPE_KEYS) {
      const typePatch = fields.types[key];
      if (!typePatch || typeof typePatch !== "object") continue;

      if (typePatch.price !== undefined) {
        patch[`types.${key}.price`] = Number(typePatch.price);
      }
      if (typePatch.isAvailable !== undefined) {
        patch[`types.${key}.isAvailable`] = !!typePatch.isAvailable;
      }
    }
  }

  if (Object.keys(patch).length === 2) {
    const err = new Error("At least one pouch type field is required");
    err.status = 400;
    throw err;
  }

  const updated = await GravurePouch.findOneAndUpdate(
    { _id: id, companyId },
    { $set: patch },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) return null;
  return {
    ...toPouchResponse(updated),
    companyId: updated.companyId?.toString?.() ?? updated.companyId,
  };
}

export async function deletePouch(companyId, id) {
  const deleted = await GravurePouch.findOneAndDelete({
    _id: id,
    companyId,
  }).lean();
  return !!deleted;
}

export async function listCompanyPouches(companyId) {
  const docs = await GravurePouch.find({ companyId }).sort({ createdAt: 1 }).lean();
  return docs.map((doc) => ({
    ...toPouchResponse(doc),
    companyId: doc.companyId?.toString?.() ?? doc.companyId,
  }));
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

/* ── Companies ──────────────────────────────────────────────────────────── */

export async function getCompanies() {
  await ensureDefaultCompany();

  const docs = await GravureCompany.find()
    .sort({ isActive: -1, name: 1 })
    .lean();

  return docs.map(toCompanyResponse);
}

export async function createCompany(name) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    const err = new Error("Company name is required");
    err.status = 400;
    throw err;
  }

  const trimmed = name.trim();

  if (trimmed.toLowerCase() === DEFAULT_COMPANY_NAME.toLowerCase()) {
    const err = new Error(`Company "${DEFAULT_COMPANY_NAME}" already exists`);
    err.status = 409;
    throw err;
  }

  // Check if company already exists
  const existing = await GravureCompany.findOne({
    name: { $regex: `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  }).lean();
  if (existing) {
    const err = new Error(`Company "${trimmed}" already exists`);
    err.status = 409;
    throw err;
  }

  // Create with all 6 processes initialized to 0 and available
  const company = await GravureCompany.create({
    name: trimmed,
    isActive: true,
    processes: DEFAULT_COMPANY_PROCESSES,
  });

  return toCompanyResponse(company);
}

export async function updateCompanyProcess(
  companyId,
  processKey,
  { price, isAvailable },
) {
  // Validate processKey
  const validProcesses = [
    "normalColor",
    "metallicColor",
    "mattFinish",
    "singleLamination",
    "doubleLamination",
    "slitting",
  ];
  if (!validProcesses.includes(processKey)) {
    const err = new Error(`Invalid process key: ${processKey}`);
    err.status = 400;
    throw err;
  }

  if (price === undefined && isAvailable === undefined) {
    const err = new Error("At least one of price or isAvailable is required");
    err.status = 400;
    throw err;
  }

  const patch = {};

  if (price !== undefined) {
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      const err = new Error("Price must be a non-negative number");
      err.status = 400;
      throw err;
    }
    patch[`processes.${processKey}.price`] = numPrice;
  }

  if (isAvailable !== undefined) {
    patch[`processes.${processKey}.isAvailable`] = !!isAvailable;
  }

  const updated = await GravureCompany.findByIdAndUpdate(
    companyId,
    { $set: patch },
    { new: true, lean: true },
  );

  if (!updated) {
    throw makeNotFoundError(`Company not found`);
  }

  return toCompanyResponse(updated);
}

export async function deleteCompany(companyId) {
  // Check if it's the default company
  const company = await GravureCompany.findById(companyId).lean();
  if (!company) {
    throw makeNotFoundError("Company not found");
  }

  if (company.name === DEFAULT_COMPANY_NAME) {
    const err = new Error(
      `Cannot delete the default company (${DEFAULT_COMPANY_NAME})`,
    );
    err.status = 400;
    throw err;
  }

  // Soft delete: set isActive to false
  const updated = await GravureCompany.findByIdAndUpdate(
    companyId,
    { $set: { isActive: false } },
    { new: true, lean: true },
  );

  return toCompanyResponse(updated);
}

export async function restoreCompany(companyId) {
  const updated = await GravureCompany.findByIdAndUpdate(
    companyId,
    { $set: { isActive: true } },
    { new: true, lean: true },
  );

  if (!updated) {
    throw makeNotFoundError("Company not found");
  }

  return toCompanyResponse(updated);
}

export async function permanentDeleteCompany(companyId) {
  const company = await GravureCompany.findById(companyId).lean();
  if (!company) {
    throw makeNotFoundError("Company not found");
  }

  if (company.name === DEFAULT_COMPANY_NAME) {
    const err = new Error(
      `Cannot permanently delete the default company (${DEFAULT_COMPANY_NAME})`,
    );
    err.status = 400;
    throw err;
  }

  await GravureCompany.findByIdAndDelete(companyId);
  return { id: companyId, deleted: true };
}
