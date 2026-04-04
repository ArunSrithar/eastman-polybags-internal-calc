import * as service from "../services/flexoSettings.js";

export function getSettings(_req, res, next) {
  try {
    res.json(service.getSettings());
  } catch (err) {
    next(err);
  }
}

export function updateMaterialPrice(req, res, next) {
  try {
    const result = service.addMaterialPrice(
      req.params.material,
      req.body.price,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function updateConversionRate(req, res, next) {
  try {
    const result = service.updateConversionRate(
      req.params.material,
      req.params.rollSize,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function updatePrintingRate(req, res, next) {
  try {
    const result = service.updatePrintingRate(
      req.params.coverSize,
      req.params.colorCount,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function addPrintingCoverSize(req, res, next) {
  try {
    const result = service.addPrintingCoverSize(req.body.coverSize);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export function deletePrintingCoverSize(req, res, next) {
  try {
    const result = service.deletePrintingCoverSize(
      decodeURIComponent(req.params.coverSize),
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function updateGussetRate(req, res, next) {
  try {
    const result = service.updateGussetRate(
      req.params.coverSize,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function updateCuttingRate(req, res, next) {
  try {
    const result = service.updateCuttingRate(req.params.size, req.body.rate);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function updateChargeRate(req, res, next) {
  try {
    const result = service.updateChargeRate(req.params.rateKey, req.body.rate);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function updateRollSizeRate(req, res, next) {
  try {
    const result = service.updateRollSizeRate(
      req.params.material,
      req.params.rollSize,
      req.body.rate,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function addRollSizeRow(req, res, next) {
  try {
    const result = service.addRollSizeRow(
      req.params.material,
      req.body.rollSize,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export function togglePrintingCoverSize(req, res, next) {
  try {
    const result = service.togglePrintingCoverSize(
      decodeURIComponent(req.params.coverSize),
      req.body.enabled,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function deleteRollSizeRow(req, res, next) {
  try {
    const result = service.deleteRollSizeRow(
      req.params.material,
      req.params.rollSize,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function toggleRollSizeEnabled(req, res, next) {
  try {
    const result = service.toggleRollSizeEnabled(
      req.params.material,
      req.params.rollSize,
      req.body.enabled,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
