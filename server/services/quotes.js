import Quote from "../models/Quote.js";

function toResponse(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    savedAt:
      doc.savedAt instanceof Date ? doc.savedAt.toISOString() : doc.savedAt,
    savedBy: doc.savedBy,
    quoteName: doc.quoteName,
    pouchSize: doc.pouchSize ?? null,
    pricePerKg: doc.pricePerKg,
    form: doc.form,
  };
}

function normalizeName(name) {
  return String(name).trim().toLowerCase();
}

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function listQuotes(calcKey) {
  const docs = await Quote.find({ calcKey }).sort({ savedAt: -1 }).lean();
  return docs.map(toResponse);
}

export async function countQuotes(calcKey) {
  return Quote.countDocuments({ calcKey });
}

export async function createQuote(calcKey, payload) {
  const quoteName = String(payload.quoteName || "").trim();
  const normalized = normalizeName(quoteName);

  try {
    const doc = await Quote.create({
      calcKey,
      quoteName,
      normalizedName: normalized,
      pouchSize: payload.pouchSize ?? null,
      pricePerKg: payload.pricePerKg,
      savedBy: payload.savedBy || "Admin",
      form: payload.form,
      savedAt: new Date(),
    });
    return toResponse(doc.toObject());
  } catch (err) {
    if (err && err.code === 11000) {
      throw makeError(
        409,
        `A quote named "${quoteName}" already exists for ${calcKey}.`,
      );
    }
    throw err;
  }
}

export async function deleteQuote(calcKey, id) {
  const result = await Quote.deleteOne({ _id: id, calcKey });
  return result.deletedCount > 0;
}
