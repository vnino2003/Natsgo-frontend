// src/services/api/commuterTrackingService.js
import api from "./http";

// ✅ GET: buses with assigned device + latest gps_logs
export function getLiveBuses() {
  return api.get("/track/buses/live");
}
