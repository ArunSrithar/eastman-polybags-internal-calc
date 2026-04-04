const API_BASE = "http://localhost:3001/api/gravure";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
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
