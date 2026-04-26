/**
 * REST API for saved quotes.
 * Mirrors the request() pattern in settingsApi.js.
 */

const API_ROOT = (
  import.meta.env.VITE_API_BASE || "http://localhost:3001"
).replace(/\/+$/, "");
const API_BASE = `${API_ROOT}/api/quotes`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) {
    return null;
  }

  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json",
  );
  const body = isJson ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    const err = new Error(body.error || `Request failed: ${res.status}`);
    err.status = res.status;
    if (res.status === 409) err.code = "DUPLICATE";
    throw err;
  }

  return body;
}

export function listQuotes(calcKey) {
  return request(`${API_BASE}/${encodeURIComponent(calcKey)}`);
}

export function countQuotes(calcKey) {
  return request(`${API_BASE}/${encodeURIComponent(calcKey)}/count`).then(
    (body) => body?.count ?? 0,
  );
}

export function createQuote(calcKey, payload) {
  return request(`${API_BASE}/${encodeURIComponent(calcKey)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteQuote(calcKey, id) {
  return request(
    `${API_BASE}/${encodeURIComponent(calcKey)}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
