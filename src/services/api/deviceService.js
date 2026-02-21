// src/services/api/deviceService.js
import api from "./http";

// ================== GET ALL DEVICES ==================
// params: { new_only=1, new_hours=24 }
export function getDevices(params = {}) {
  return api.get("/admin/devices", { params });
}

// ================== GET SINGLE DEVICE ==================
export function getDeviceById(id) {
  return api.get(`/admin/devices/${id}`);
}
