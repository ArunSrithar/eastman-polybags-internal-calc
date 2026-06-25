import * as service from "../services/gravureSettings.js";

export async function getSettings(_req, res, next) {
  try {
    res.json(await service.getSettings());
  } catch (err) {
    next(err);
  }
}

export async function updateMaterialPrice(req, res, next) {
  try {
    const result = await service.addMaterialPrice(
      req.params.materialKey,
      req.body.price,
      req.user?.userId,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addMaterialOption(req, res, next) {
  try {
    const result = await service.addMaterialOption(
      req.params.materialKey,
      req.body.type,
      req.body.value,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listCompanyPouches(req, res, next) {
  try {
    const pouches = await service.listCompanyPouches(req.params.companyId);
    res.json(pouches);
  } catch (err) {
    next(err);
  }
}

export async function createCompanyPouch(req, res, next) {
  try {
    const { length, breadth, types } = req.body;
    const pouch = await service.createPouch(
      req.params.companyId,
      length,
      breadth,
      types,
      req.user?.userId,
    );
    res.status(201).json(pouch);
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyPouch(req, res, next) {
  try {
    const pouch = await service.updatePouch(
      req.params.companyId,
      req.params.id,
      req.body,
      req.user?.userId,
    );
    if (!pouch) {
      return res
        .status(404)
        .json({ error: `Pouch ${req.params.id} not found` });
    }
    res.json(pouch);
  } catch (err) {
    next(err);
  }
}

export async function deleteCompanyPouch(req, res, next) {
  try {
    const deleted = await service.deletePouch(req.params.companyId, req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: `Pouch ${req.params.id} not found` });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function updateChargeRate(req, res, next) {
  try {
    const result = await service.addChargeRate(
      req.params.rateKey,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/* ── Companies ──────────────────────────────────────────────────────────── */

export async function getCompanies(req, res, next) {
  try {
    const companies = await service.getCompanies();
    res.json(companies);
  } catch (err) {
    next(err);
  }
}

export async function createCompanyHandler(req, res, next) {
  try {
    const { name } = req.body;
    const company = await service.createCompany(name);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyProcessHandler(req, res, next) {
  try {
    const { id, processKey } = req.params;
    const { price, isAvailable } = req.body;
    const company = await service.updateCompanyProcess(id, processKey, {
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
    const { id } = req.params;
    const company = await service.deleteCompany(id);
    res.json(company);
  } catch (err) {
    next(err);
  }
}

export async function restoreCompanyHandler(req, res, next) {
  try {
    const { id } = req.params;
    const company = await service.restoreCompany(id);
    res.json(company);
  } catch (err) {
    next(err);
  }
}

export async function permanentDeleteCompanyHandler(req, res, next) {
  try {
    const { id } = req.params;
    const result = await service.permanentDeleteCompany(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
