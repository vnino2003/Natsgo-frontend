// src/composables/useLiveBuses.js (UPDATED: includes terminal state + direction labels)
import { ref, onUnmounted } from "vue";
import { getLiveBuses } from "../services/api/commuterTrackingService";

export function useLiveBuses({ intervalMs = 1000 } = {}) {
  const loading = ref(false);
  const error = ref(null);
  const buses = ref([]);

  let timer = null;

  function isGpsActive(row) {
    return String(row?.gps_state || "").toLowerCase() === "active";
  }

  function isDeviceOk(row) {
    return String(row?.device_status || "").toLowerCase() === "online";
  }

  function isBusOk(row) {
    const s = String(row?.bus_status || "active").toLowerCase();
    return ["active", "online", "in_service"].includes(s);
  }

  function cleanName(v) {
    const s = String(v ?? "").trim();
    return s || null;
  }

  function normalize(row) {
    const capacity = Number(row.capacity ?? 0);
    const passengerCount = Number(row.passenger_count ?? 0);

    const route = row.bus_code
      ? `${row.bus_code} • ${row.plate_no || ""}`.trim()
      : row.plate_no || `Bus #${row.bus_id}`;

    const trackNo = row.bus_code || String(row.bus_id);

    const currentTerminalId = row.current_terminal_id != null ? Number(row.current_terminal_id) : null;
    const targetTerminalId = row.target_terminal_id != null ? Number(row.target_terminal_id) : null;

    const currentTerminalName = cleanName(row.current_terminal_name);
    const targetTerminalName = cleanName(row.target_terminal_name);

    const atTerminal = Number(row.at_terminal ?? 0) === 1;
    const distM = row.dist_m != null ? Number(row.dist_m) : null;

    // ✅ direction label for UI
    const directionLabel =
      currentTerminalName && targetTerminalName
        ? `${currentTerminalName} → ${targetTerminalName}`
        : currentTerminalName
          ? `${currentTerminalName} → (unknown)`
          : targetTerminalName
            ? `(unknown) → ${targetTerminalName}`
            : "Route: unknown";

    const terminalStateLabel = atTerminal
      ? (currentTerminalName ? `At ${currentTerminalName}` : "At terminal")
      : (currentTerminalName && targetTerminalName ? `On route: ${currentTerminalName} → ${targetTerminalName}` : "On route");

    return {
      id: row.bus_id,
      bus_id: row.bus_id,
      bus_code: row.bus_code,
      plate_no: row.plate_no,
      capacity,
      bus_status: row.bus_status,

      seats: passengerCount,
      passenger_count: passengerCount,
      in_total: Number(row.in_total ?? 0),
      out_total: Number(row.out_total ?? 0),
      last_event: row.last_event ?? null,
      last_event_at: row.last_event_at ?? null,

      route,
      trackNo,

      device_id: row.device_id,
      device_code: row.device_code,
      esp32_id: row.esp32_id,
      device_status: row.device_status,
      gps_state: row.gps_state,
      last_seen_at: row.last_seen_at,
      is_online: Number(row.is_online ?? 0) === 1,

      lat: Number(row.lat),
      lng: Number(row.lng),
      speedKmh: row.speed_kmh != null ? Number(row.speed_kmh) : null,
      altitudeM: row.altitude_m != null ? Number(row.altitude_m) : null,
      hdop: row.hdop != null ? Number(row.hdop) : null,
      sats: row.satellites != null ? Number(row.satellites) : null,
      updatedAt: row.updated_at ?? null,

      // ✅ terminal state (NEW)
      currentTerminalId,
      targetTerminalId,
      currentTerminalName,
      targetTerminalName,
      atTerminal,
      distM,
      directionLabel,
      terminalStateLabel,
    };
  }

  async function fetchOnce() {
    try {
      loading.value = true;
      error.value = null;

      const res = await getLiveBuses();
      const list = Array.isArray(res.data) ? res.data : [];

      buses.value = list
        .filter((x) => x && x.bus_id && x.lat != null && x.lng != null)
        .filter((x) => isGpsActive(x) && isDeviceOk(x) && isBusOk(x))
        .map(normalize);
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to load live buses";
    } finally {
      loading.value = false;
    }
  }

  function start() {
    stop();
    fetchOnce();
    timer = setInterval(fetchOnce, intervalMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  onUnmounted(() => stop());

  return {
    buses,
    loading,
    error,
    fetchOnce,
    start,
    stop,
  };
}