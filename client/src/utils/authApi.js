const API_ROOT = (
  import.meta.env.VITE_API_BASE || "http://localhost:3001"
).replace(/\/+$/, "");
const AUTH_BASE = `${API_ROOT}/api/auth`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json",
  );
  const body = isJson ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    const err = new Error(body.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return body;
}

export function loginApi(username, password) {
  return request(`${AUTH_BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutApi() {
  return request(`${AUTH_BASE}/logout`, { method: "POST" });
}

export function refreshApi() {
  return request(`${AUTH_BASE}/refresh`, { method: "POST" });
}

export function getMeApi() {
  return request(`${AUTH_BASE}/me`);
}

export function changePasswordApi(oldPassword, newPassword) {
  return request(`${AUTH_BASE}/change-password`, {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}
