// src/services/api/gpsService.js
import api from "./http";

// ================== ESP32 → SEND TELEMETRY ==================
export function postTelemetry(payload) {
  // payload example:
  // {
  //  device_code, esp32_id, gps_enabled,
  //  lat, lng, speed_kmh, altitude_m, hdop, satellites, recorded_at
  // }
  return api.post("/gps/telemetry", payload);
}
