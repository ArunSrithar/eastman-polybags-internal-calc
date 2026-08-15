import FlexoCompany from "../models/FlexoCompany.js";
import FlexoCompanyCoverSize from "../models/FlexoCompanyCoverSize.js";
import FlexoPrintingRate from "../models/FlexoPrintingRate.js";
import FlexoGussetRate from "../models/FlexoGussetRate.js";
import FlexoCuttingRate from "../models/FlexoCuttingRate.js";
import FlexoChargeRate from "../models/FlexoChargeRate.js";
import User from "../models/User.js";

const CHANGED_BY = "Admin";
const DEFAULT_COMPANY_NAME = "Eastman Color Printers";
const COLOR_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const CHARGE_KEYS = ["punching", "opack"];
const CHARGE_RATE_IDS = {
  punching: "punchingRate",
  opack: "opackRate",
};

function makeDefaultCharges() {
  return {
    punching: { price: 0, isAvailable: true },
    opack: { price: 0, isAvailable: true },
  };
}

function makeDefaultPrintingColors() {
  const colors = {};
  for (const colorCount of COLOR_COUNTS) {
    colors[colorCount] = { price: 0, isAvailable: true };
  }
  return colors;
}

function makeNotFoundError(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function makeBadRequestError(message) {
  const err = new Error(message);
  err.status = 400;
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

function toCompanyResponse(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    isActive: doc.isActive,
    charges: doc.charges,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toCoverSizeResponse(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    companyId: doc.companyId?.toString?.() ?? doc.companyId,
    coverSize: doc.coverSize,
    enabled: doc.enabled,
    printingColors: doc.printingColors,
    gussetRate: doc.gussetRate,
    cuttingRate: doc.cuttingRate,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    modifiedBy: doc.modifiedBy,
    modifiedAt: doc.modifiedAt,
  };
}

/* ── One-time migration: seed a default company from existing global rates ── */

async function ensureDefaultFlexoCompany() {
  const existing = await FlexoCompany.findOne({ name: DEFAULT_COMPANY_NAME })
    .select("_id")
    .lean();

  if (existing) {
    await FlexoCompany.findByIdAndUpdate(existing._id, {
      $set: { isActive: true },
    });
    return;
  }

  const [printingDocs, gussetDocs, cuttingDocs, chargeDocs] =
    await Promise.all([
      FlexoPrintingRate.find().sort({ _id: 1 }).lean(),
      FlexoGussetRate.find().sort({ _id: 1 }).lean(),
      FlexoCuttingRate.find().sort({ _id: 1 }).lean(),
      FlexoChargeRate.find({
        _id: { $in: Object.values(CHARGE_RATE_IDS) },
      }).lean(),
    ]);

  const chargeMap = new Map(chargeDocs.map((doc) => [doc._id, doc]));
  const charges = makeDefaultCharges();
  for (const chargeKey of CHARGE_KEYS) {
    const rateId = CHARGE_RATE_IDS[chargeKey];
    const rate = chargeMap.get(rateId)?.history?.[0]?.rate ?? 0;
    charges[chargeKey] = { price: rate, isAvailable: true };
  }

  const company = await FlexoCompany.create({
    name: DEFAULT_COMPANY_NAME,
    isActive: true,
    charges,
  });

  const gussetMap = new Map(gussetDocs.map((doc) => [doc._id, doc]));
  const cuttingMap = new Map(cuttingDocs.map((doc) => [doc._id, doc]));
  const now = new Date();

  const coverSizeDocs = printingDocs.map((printingDoc) => {
    const coverSize = printingDoc._id;
    const gussetDoc = gussetMap.get(coverSize);
    const cuttingDoc = cuttingMap.get(coverSize);

    const printingColors = {};
    for (const colorCount of COLOR_COUNTS) {
      const rate = printingDoc.colors?.[colorCount]?.history?.[0]?.rate ?? 0;
      printingColors[colorCount] = { price: rate, isAvailable: true };
    }

    return {
      companyId: company._id,
      coverSize,
      enabled: printingDoc.enabled !== false,
      printingColors,
      gussetRate: {
        price: gussetDoc?.history?.[0]?.rate ?? 0,
        isAvailable: true,
      },
      cuttingRate: {
        price: cuttingDoc?.history?.[0]?.rate ?? 0,
        isAvailable: true,
      },
      createdBy: CHANGED_BY,
      createdAt: now,
      modifiedBy: null,
      modifiedAt: null,
    };
  });

  if (coverSizeDocs.length > 0) {
    await FlexoCompanyCoverSize.insertMany(coverSizeDocs);
  }
}

/* ── Companies ──────────────────────────────────────────────────────────── */

export async function getFlexoCompanies() {
  await ensureDefaultFlexoCompany();

  const docs = await FlexoCompany.find()
    .sort({ isActive: -1, name: 1 })
    .lean();

  return docs.map(toCompanyResponse);
}

export async function createFlexoCompany(name) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw makeBadRequestError("Company name is required");
  }

  const trimmed = name.trim();

  const existing = await FlexoCompany.findOne({
    name: {
      $regex: `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
  }).lean();
  if (existing) {
    const err = new Error(`Company "${trimmed}" already exists`);
    err.status = 409;
    throw err;
  }

  const company = await FlexoCompany.create({
    name: trimmed,
    isActive: true,
    charges: makeDefaultCharges(),
  });

  return toCompanyResponse(company);
}

export async function updateFlexoCompanyCharge(
  companyId,
  chargeKey,
  { price, isAvailable },
) {
  if (!CHARGE_KEYS.includes(chargeKey)) {
    throw makeBadRequestError(`Invalid charge key: ${chargeKey}`);
  }

  if (price === undefined && isAvailable === undefined) {
    throw makeBadRequestError(
      "At least one of price or isAvailable is required",
    );
  }

  const patch = {};

  if (price !== undefined) {
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      throw makeBadRequestError("Price must be a non-negative number");
    }
    patch[`charges.${chargeKey}.price`] = numPrice;
  }

  if (isAvailable !== undefined) {
    patch[`charges.${chargeKey}.isAvailable`] = !!isAvailable;
  }

  const updated = await FlexoCompany.findByIdAndUpdate(
    companyId,
    { $set: patch },
    { new: true, lean: true },
  );

  if (!updated) {
    throw makeNotFoundError("Company not found");
  }

  return toCompanyResponse(updated);
}

export async function deleteFlexoCompany(companyId) {
  const company = await FlexoCompany.findById(companyId).lean();
  if (!company) {
    throw makeNotFoundError("Company not found");
  }

  if (company.name === DEFAULT_COMPANY_NAME) {
    throw makeBadRequestError(
      `Cannot delete the default company (${DEFAULT_COMPANY_NAME})`,
    );
  }

  const updated = await FlexoCompany.findByIdAndUpdate(
    companyId,
    { $set: { isActive: false } },
    { new: true, lean: true },
  );

  return toCompanyResponse(updated);
}

export async function restoreFlexoCompany(companyId) {
  const updated = await FlexoCompany.findByIdAndUpdate(
    companyId,
    { $set: { isActive: true } },
    { new: true, lean: true },
  );

  if (!updated) {
    throw makeNotFoundError("Company not found");
  }

  return toCompanyResponse(updated);
}

export async function permanentDeleteFlexoCompany(companyId) {
  const company = await FlexoCompany.findById(companyId).lean();
  if (!company) {
    throw makeNotFoundError("Company not found");
  }

  if (company.name === DEFAULT_COMPANY_NAME) {
    throw makeBadRequestError(
      `Cannot permanently delete the default company (${DEFAULT_COMPANY_NAME})`,
    );
  }

  await FlexoCompany.findByIdAndDelete(companyId);
  await FlexoCompanyCoverSize.deleteMany({ companyId });

  return { id: companyId, deleted: true };
}

/* ── Company-scoped cover sizes ─────────────────────────────────────────── */

export async function getCompanyCoverSizes(companyId) {
  const docs = await FlexoCompanyCoverSize.find({ companyId })
    .sort({ createdAt: 1 })
    .lean();

  return docs.map(toCoverSizeResponse);
}

export async function addCompanyCoverSize(companyId, coverSize, userId) {
  const company = await FlexoCompany.findOne({ _id: companyId, isActive: true })
    .select("_id")
    .lean();
  if (!company) {
    throw makeNotFoundError("Company not found");
  }

  const existing = await FlexoCompanyCoverSize.exists({
    companyId,
    coverSize,
  });
  if (existing) {
    throw makeBadRequestError(
      `Cover size "${coverSize}" already exists for this company`,
    );
  }

  const changedBy = await resolveChangedBy(userId);
  const now = new Date();

  const created = await FlexoCompanyCoverSize.create({
    companyId,
    coverSize,
    enabled: true,
    printingColors: makeDefaultPrintingColors(),
    gussetRate: { price: 0, isAvailable: true },
    cuttingRate: { price: 0, isAvailable: true },
    createdBy: changedBy,
    createdAt: now,
    modifiedBy: null,
    modifiedAt: null,
  });

  return getCompanyCoverSizes(companyId);
}

export async function deleteCompanyCoverSize(companyId, coverSizeId) {
  const deleted = await FlexoCompanyCoverSize.findOneAndDelete({
    _id: coverSizeId,
    companyId,
  }).lean();

  if (!deleted) {
    throw makeNotFoundError(`Cover size not found`);
  }

  return getCompanyCoverSizes(companyId);
}

export async function toggleCompanyCoverSize(companyId, coverSizeId, enabled) {
  const updated = await FlexoCompanyCoverSize.findOneAndUpdate(
    { _id: coverSizeId, companyId },
    { $set: { enabled: !!enabled } },
    { new: true, lean: true },
  );

  if (!updated) {
    throw makeNotFoundError(`Cover size not found`);
  }

  return getCompanyCoverSizes(companyId);
}

export async function updateCompanyCoverSizeRate(
  companyId,
  coverSizeId,
  { category, colorCount, price, isAvailable },
  userId,
) {
  let priceField;
  if (category === "printing") {
    if (!COLOR_COUNTS.includes(String(colorCount))) {
      throw makeBadRequestError(`Invalid color count: ${colorCount}`);
    }
    priceField = `printingColors.${colorCount}`;
  } else if (category === "gusset") {
    priceField = "gussetRate";
  } else if (category === "cutting") {
    priceField = "cuttingRate";
  } else {
    throw makeBadRequestError(`Invalid category: ${category}`);
  }

  if (price === undefined && isAvailable === undefined) {
    throw makeBadRequestError(
      "At least one of price or isAvailable is required",
    );
  }

  const changedBy = await resolveChangedBy(userId);
  const patch = {
    modifiedBy: changedBy,
    modifiedAt: new Date(),
  };

  if (price !== undefined) {
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      throw makeBadRequestError("Price must be a non-negative number");
    }
    patch[`${priceField}.price`] = numPrice;
  }

  if (isAvailable !== undefined) {
    patch[`${priceField}.isAvailable`] = !!isAvailable;
  }

  const updated = await FlexoCompanyCoverSize.findOneAndUpdate(
    { _id: coverSizeId, companyId },
    { $set: patch },
    { new: true, lean: true },
  );

  if (!updated) {
    throw makeNotFoundError(`Cover size not found`);
  }

  return toCoverSizeResponse(updated);
}
