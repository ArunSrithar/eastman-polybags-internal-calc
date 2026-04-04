import * as service from "../services/gravureSettings.js";

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
      req.params.materialKey,
      req.body.price,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function addMaterialOption(req, res, next) {
  try {
    const result = service.addMaterialOption(
      req.params.materialKey,
      req.body.type,
      req.body.value,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function createPouch(req, res, next) {
  try {
    const { length, breadth, rate } = req.body;
    const pouch = service.createPouch(length, breadth, rate);
    res.status(201).json(pouch);
  } catch (err) {
    next(err);
  }
}

export function updatePouch(req, res, next) {
  try {
    const pouch = service.updatePouch(req.params.id, req.body);
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

export function deletePouch(req, res, next) {
  try {
    const deleted = service.deletePouch(req.params.id);
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

export function updateChargeRate(req, res, next) {
  try {
    const result = service.addChargeRate(req.params.rateKey, req.body.rate);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
