// src/services/api/terminalService.js
import api from "./http";

export function getAdminTerminals(params = {}) {
  return api.get("/admin/terminals", { params });
}

export function createTerminal(payload) {
  return api.post("/admin/terminals", payload);
}

export function updateTerminal(id, payload) {
  return api.put(`/admin/terminals/${id}`, payload);
}

export function deleteTerminal(id) {
  return api.delete(`/admin/terminals/${id}`);
}

export function getPublicTerminals() {
  return api.get("/terminals");
}