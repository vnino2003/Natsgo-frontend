// src/services/api/busService.js
import api from "./http";

// GET list
export function getBuses(params = {}) {
  // params: { q, status, device }
  return api.get("/admin/buses", { params });
}

// GET one
export function getBusById(id) {
  return api.get(`/admin/buses/${id}`);
}

// POST create
export function createBus(payload) {
  // payload: { plate_no, capacity, bus_status?, notes?, device_id? }
  return api.post("/admin/buses", payload);
}

// PUT update
export function updateBus(id, payload) {
  // payload: { plate_no?, capacity?, bus_status?, notes?, device_id? }
  return api.put(`/admin/buses/${id}`, payload);
}

// DELETE
export function deleteBus(id) {
  return api.delete(`/admin/buses/${id}`);
}
