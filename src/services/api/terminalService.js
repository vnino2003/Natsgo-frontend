// src/services/api/terminalService.js
import api from "./http";

// ✅ Admin list (with bus_count)
export function getAdminTerminals(params = {}) {
  // params: { q, active }
  return api.get("/admin/terminals", { params });
}

// ✅ Admin CRUD
export function createTerminal(payload) {
  return api.post("/admin/terminals", payload);
}

export function updateTerminal(id, payload) {
  return api.put(`/admin/terminals/${id}`, payload);
}

export function deleteTerminal(id) {
  return api.delete(`/admin/terminals/${id}`);
}

// ✅ (optional) Public list for commuter/track page
export function getPublicTerminals() {
  return api.get("/terminals");
}
