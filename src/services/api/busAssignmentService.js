// src/services/api/busAssignmentService.js
import api from "./http";

// GET current assignment list (buses + assigned device info)
export function getCurrentAssignments() {
  return api.get("/admin/bus-assignments/current");
}

// GET history (optional filters: bus_id, device_id)
export function getAssignmentHistory(params = {}) {
  // params: { bus_id, device_id }
  return api.get("/admin/bus-assignments/history", { params });
}

// POST assign device to bus
export function assignDeviceToBus(payload) {
  // payload: { bus_id, device_id, note? }
  return api.post("/admin/bus-assignments/assign", payload);
}

// POST unassign device from bus
export function unassignDeviceFromBus(payload) {
  // payload: { bus_id, note? }
  return api.post("/admin/bus-assignments/unassign", payload);
}
