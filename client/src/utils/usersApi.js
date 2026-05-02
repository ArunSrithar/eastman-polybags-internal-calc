import { refreshApi } from "./authApi";

const API_ROOT = (
  import.meta.env.VITE_API_BASE || "http://localhost:3001"
).replace(/\/+$/, "");
const API_BASE = `${API_ROOT}/api/users`;

async function request(url, options = {}, retry = true) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

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

export function getUsers() {
  return request(API_BASE);
}

export function createUser(data) {
  return request(API_BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUser(id, data) {
  return request(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id) {
  return request(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function resetUserPassword(id) {
  return request(`${API_BASE}/${encodeURIComponent(id)}/reset-password`, {
    method: "POST",
  });
}
