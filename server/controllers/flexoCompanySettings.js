import * as service from "../services/flexoCompanySettings.js";

/* ── Companies ──────────────────────────────────────────────────────────── */

export async function getCompanies(req, res, next) {
  try {
    const companies = await service.getFlexoCompanies();
    res.json(companies);
  } catch (err) {
    next(err);
  }
}

export async function createCompanyHandler(req, res, next) {
  try {
    const { name } = req.body;
    const company = await service.createFlexoCompany(name);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyChargeHandler(req, res, next) {
  try {
    const { id, chargeKey } = req.params;
    const { price, isAvailable } = req.body;
    const company = await service.updateFlexoCompanyCharge(id, chargeKey, {
      price,
      isAvailable,
    });
    res.json(company);
  } catch (err) {
    next(err);
  }
}

export async function deleteCompanyHandler(req, res, next) {
  try {
    const company = await service.deleteFlexoCompany(req.params.id);
    res.json(company);
  } catch (err) {
    next(err);
  }
}

export async function restoreCompanyHandler(req, res, next) {
  try {
    const company = await service.restoreFlexoCompany(req.params.id);
    res.json(company);
  } catch (err) {
    next(err);
  }
}

export async function permanentDeleteCompanyHandler(req, res, next) {
  try {
    const result = await service.permanentDeleteFlexoCompany(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/* ── Company-scoped cover sizes ─────────────────────────────────────────── */

export async function listCompanyCoverSizes(req, res, next) {
  try {
    const coverSizes = await service.getCompanyCoverSizes(
      req.params.companyId,
    );
    res.json(coverSizes);
  } catch (err) {
    next(err);
  }
}

export async function addCompanyCoverSize(req, res, next) {
  try {
    const result = await service.addCompanyCoverSize(
      req.params.companyId,
      req.body.coverSize,
      req.user?.userId,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteCompanyCoverSize(req, res, next) {
  try {
    const result = await service.deleteCompanyCoverSize(
      req.params.companyId,
      req.params.id,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function toggleCompanyCoverSize(req, res, next) {
  try {
    const result = await service.toggleCompanyCoverSize(
      req.params.companyId,
      req.params.id,
      req.body.enabled,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyCoverSizeRate(req, res, next) {
  try {
    const { category, colorCount, price, isAvailable } = req.body;
    const result = await service.updateCompanyCoverSizeRate(
      req.params.companyId,
      req.params.id,
      { category, colorCount, price, isAvailable },
      req.user?.userId,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
