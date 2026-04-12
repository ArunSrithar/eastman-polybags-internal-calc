import * as service from "../services/flexoSettings.js";

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
      req.params.material,
      req.body.price,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateConversionRate(req, res, next) {
  try {
    const result = await service.updateConversionRate(
      req.params.material,
      req.params.rollSize,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updatePrintingRate(req, res, next) {
  try {
    const result = await service.updatePrintingRate(
      req.params.coverSize,
      req.params.colorCount,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addPrintingCoverSize(req, res, next) {
  try {
    const result = await service.addPrintingCoverSize(req.body.coverSize);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deletePrintingCoverSize(req, res, next) {
  try {
    const result = await service.deletePrintingCoverSize(
      decodeURIComponent(req.params.coverSize),
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateGussetRate(req, res, next) {
  try {
    const result = await service.updateGussetRate(
      req.params.coverSize,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateCuttingRate(req, res, next) {
  try {
    const result = await service.updateCuttingRate(req.params.size, req.body.rate);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateChargeRate(req, res, next) {
  try {
    const result = await service.updateChargeRate(req.params.rateKey, req.body.rate);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateRollSizeRate(req, res, next) {
  try {
    const result = await service.updateRollSizeRate(
      req.params.material,
      req.params.rollSize,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addRollSizeRow(req, res, next) {
  try {
    const result = await service.addRollSizeRow(
      req.params.material,
      req.body.rollSize,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function togglePrintingCoverSize(req, res, next) {
  try {
    const result = await service.togglePrintingCoverSize(
      decodeURIComponent(req.params.coverSize),
      req.body.enabled,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteRollSizeRow(req, res, next) {
  try {
    const result = await service.deleteRollSizeRow(
      req.params.material,
      req.params.rollSize,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function toggleRollSizeEnabled(req, res, next) {
  try {
    const result = await service.toggleRollSizeEnabled(
      req.params.material,
      req.params.rollSize,
      req.body.enabled,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
