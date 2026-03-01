// src/services/api/routeService.js
import api from "./http";

/* ADMIN */
export function getAdminRoutes(params = {}) {
  return api.get("/admin/routes", { params });
}
export function getAdminRouteById(id) {
  return api.get(`/admin/routes/${id}`);
}
export function createAdminRoute(payload) {
  return api.post("/admin/routes", payload);
}
export function updateAdminRoute(id, payload) {
  return api.put(`/admin/routes/${id}`, payload);
}
export function deleteAdminRoute(id) {
  return api.delete(`/admin/routes/${id}`);
}

/* PUBLIC */
export function getPublicRoute() {
  return api.get("/routes");
}