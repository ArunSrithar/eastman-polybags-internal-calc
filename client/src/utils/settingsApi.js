import { refreshApi } from "./authApi";

const API_ROOT = (
  import.meta.env.VITE_API_BASE || "http://localhost:3001"
).replace(/\/+$/, "");
const API_BASE = `${API_ROOT}/api/gravure`;
const FLEXO_API_BASE = `${API_ROOT}/api/flexo`;

async function request(url, options = {}, retry = true) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Auto-refresh on 401 — attempt once, then give up.
  if (res.status === 401 && retry) {
    try {
      await refreshApi();
      return request(url, options, false);
    } catch {
      window.dispatchEvent(new CustomEvent("auth:logout"));
      const err = new Error("Session expired — please log in again");
      err.status = 401;
      throw err;
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Read ───────────────────────────────────────────────────────────────────
export function fetchGravureSettings() {
  return request(`${API_BASE}/settings`);
}

// ── Material prices ────────────────────────────────────────────────────────
export function updateMaterialPrice(materialKey, price) {
  return request(`${API_BASE}/materials/${materialKey}/price`, {
    method: "PUT",
    body: JSON.stringify({ price }),
  });
}

// ── Material dropdown options (micron/qty) ─────────────────────────────────
export function addMaterialOption(materialKey, type, value) {
  return request(`${API_BASE}/materials/${materialKey}/options`, {
    method: "POST",
    body: JSON.stringify({ type, value }),
  });
}

// ── Pouches CRUD ───────────────────────────────────────────────────────────
export function addPouch(length, breadth, rate) {
  return request(`${API_BASE}/pouches`, {
    method: "POST",
    body: JSON.stringify({ length, breadth, rate }),
  });
}

export function updatePouch(id, fields) {
  return request(`${API_BASE}/pouches/${id}`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}

export function deletePouch(id) {
  return request(`${API_BASE}/pouches/${id}`, { method: "DELETE" });
}

// ── Charge rates ───────────────────────────────────────────────────────────
export function updateChargeRate(rateKey, rate) {
  return request(`${API_BASE}/charge-rates/${rateKey}`, {
    method: "PUT",
    body: JSON.stringify({ rate }),
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Flexo Settings API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function fetchFlexoSettings() {
  return request(`${FLEXO_API_BASE}/settings`);
}

export function updateFlexoMaterialPrice(material, price) {
  return request(`${FLEXO_API_BASE}/materials/${material}/price`, {
    method: "PUT",
    body: JSON.stringify({ price }),
  });
}

export function updateFlexoConversionRate(material, rollSize, rate) {
  return request(`${FLEXO_API_BASE}/conversion-rates/${material}/${rollSize}`, {
    method: "PUT",
    body: JSON.stringify({ rate }),
  });
}

export function updateFlexoPrintingRate(coverSize, colorCount, rate) {
  return request(
    `${FLEXO_API_BASE}/printing-rates/${coverSize}/${colorCount}`,
    { method: "PUT", body: JSON.stringify({ rate }) },
  );
}

export function updateFlexoGussetRate(coverSize, rate) {
  return request(`${FLEXO_API_BASE}/gusset-rates/${coverSize}`, {
    method: "PUT",
    body: JSON.stringify({ rate }),
  });
}

export function updateFlexoCuttingRate(size, rate) {
  return request(`${FLEXO_API_BASE}/cutting-rates/${size}`, {
    method: "PUT",
    body: JSON.stringify({ rate }),
  });
}

export function updateFlexoChargeRate(rateKey, rate) {
  return request(`${FLEXO_API_BASE}/charge-rates/${rateKey}`, {
    method: "PUT",
    body: JSON.stringify({ rate }),
  });
}

export function addFlexoPrintingRow(coverSize) {
  return request(`${FLEXO_API_BASE}/printing-rows`, {
    method: "POST",
    body: JSON.stringify({ coverSize }),
  });
}

export function deleteFlexoPrintingRow(coverSize) {
  return request(
    `${FLEXO_API_BASE}/printing-rows/${encodeURIComponent(coverSize)}`,
    { method: "DELETE" },
  );
}

export function toggleFlexoPrintingRow(coverSize, enabled) {
  return request(
    `${FLEXO_API_BASE}/printing-rows/${encodeURIComponent(coverSize)}/enabled`,
    { method: "PUT", body: JSON.stringify({ enabled }) },
  );
}

export function updateFlexoRollSizeRate(material, rollSize, rate) {
  return request(`${FLEXO_API_BASE}/roll-size-rates/${material}/${rollSize}`, {
    method: "PUT",
    body: JSON.stringify({ rate }),
  });
}

export function addFlexoRollSizeRow(material, rollSize) {
  return request(`${FLEXO_API_BASE}/roll-size-rows/${material}`, {
    method: "POST",
    body: JSON.stringify({ rollSize }),
  });
}

export function deleteFlexoRollSizeRow(material, rollSize) {
  return request(`${FLEXO_API_BASE}/roll-size-rows/${material}/${rollSize}`, {
    method: "DELETE",
  });
}

export function toggleFlexoRollSizeEnabled(material, rollSize, enabled) {
  return request(
    `${FLEXO_API_BASE}/roll-size-rows/${material}/${rollSize}/enabled`,
    { method: "PUT", body: JSON.stringify({ enabled }) },
  );
}
