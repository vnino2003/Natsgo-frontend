// src/services/api/terminalStateService.js
import api from "./http";

/**
 * GET /api/admin/terminal-state/summary
 * -> { terminals: [...] }
 */
export function getAdminTerminalStateSummary(params = {}) {
  return api.get("/admin/terminal-state/summary", { params });
}

/**
 * GET /api/admin/terminal-state/devices
 * -> [ ...device states... ]
 */
export function getAdminTerminalStateDevices(params = {}) {
  return api.get("/admin/terminal-state/devices", { params });
}

/**
 * GET /api/admin/terminal-state/by-devices?ids=1,2,3
 * -> { states: { [device_id]: state } }
 */
export function getAdminTerminalStateByDevices(deviceIds = []) {
  const ids = (deviceIds || []).filter(Boolean);
  const params = { ids: ids.join(",") };
  return api.get("/admin/terminal-state/by-devices", { params });
}

/**
 * POST /api/admin/terminal-state/recompute
 * body: { arrival_m?: number, depart_m?: number }
 */
export function recomputeAdminTerminalState(payload = {}) {
  return api.post("/admin/terminal-state/recompute", payload);
}