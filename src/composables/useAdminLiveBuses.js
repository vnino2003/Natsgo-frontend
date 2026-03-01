// src/composables/useAdminLiveBuses.js
import { ref, onUnmounted } from "vue";
import { getAdminLiveBuses } from "@/services/api/adminTrackingService";

function formatTimeAgo(ts) {
  if (!ts) return "—";
  const t = new Date(ts).getTime();
  if (!Number.isFinite(t)) return "—";

  const diff = Date.now() - t;
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function useAdminLiveBuses({ intervalMs = 2000 } = {}) {
  const buses = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let timer = null;

  function normalize(r) {
    const lat = safeNum(r.lat);
    const lng = safeNum(r.lng);

    // ✅ backend gives status already, fallback compute
    const status =
      r.status ||
      (Number(r.is_online) === 1
        ? ["searching", "disconnected", "disabled"].includes(String(r.gps_state || "").toLowerCase())
          ? "Warning"
          : "Online"
        : "Offline");

    const ts = r.terminal_state || {};
    const route =
      r.route_label ||
      (ts.current_terminal_name || ts.target_terminal_name
        ? `${ts.current_terminal_name || "—"} → ${ts.target_terminal_name || "—"}`
        : "Unknown route");

    const capacity = Number(r.capacity ?? 0);
    const passengerCount = Number(r.passenger_count ?? 0);
    const occPct = capacity > 0 ? Math.round((passengerCount / capacity) * 100) : null;

    return {
      // IDs
      id: r.bus_id,
      deviceId: r.device_id,

      // Display
      code: r.bus_code || "—",
      plate: r.plate_no || "—",
      route,

      // Occupancy
      capacity,
      passengerCount,
      occPct: occPct != null ? Math.max(0, Math.min(100, occPct)) : null,

      // GPS
      lat,
      lng,
      speed: r.speed_kmh != null ? Math.max(0, Math.round(Number(r.speed_kmh))) : 0,

      // Status
      status,
      gpsBadge: r.gps_badge || "GPS —",
      gpsState: r.gps_state || "searching",

      // Signal (prefer device_status)
      signal: r.device_status ? String(r.device_status) : (r.device_code || "—"),

      // Timing
      lastSeen: formatTimeAgo(r.last_seen_at),
      updatedAt: r.updated_at,

      // Terminal state
      terminalAt: Number(ts.at_terminal) === 1,
      distM: ts.dist_m != null ? Number(ts.dist_m) : null,

      // raw payload
      raw: r,
    };
  }

  async function fetchOnce() {
    try {
      loading.value = true;
      error.value = null;

      const res = await getAdminLiveBuses();
      const list = Array.isArray(res.data) ? res.data : [];
      buses.value = list.map(normalize);
    } catch (e) {
      error.value =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load admin live buses";
      buses.value = [];
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

  onUnmounted(stop);

  return { buses, loading, error, fetchOnce, start, stop };
}