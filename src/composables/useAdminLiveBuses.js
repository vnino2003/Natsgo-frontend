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

    // ✅ use backend status if present, else fallback compute
    const status =
      r.status ||
      (Number(r.is_online) === 1
        ? ["searching", "disconnected", "disabled"].includes(String(r.gps_state || "").toLowerCase())
          ? "Warning"
          : "Online"
        : "Offline");

    return {
      id: r.bus_id,              // page expects b.id
      deviceId: r.device_id,

      code: r.bus_code || "—",
      plate: r.plate_no || "—",
      route: r.bus_status || "—",

      capacity: Number(r.capacity ?? 0),
      passengerCount: Number(r.passenger_count ?? 0),

      lat,
      lng,
      speed: r.speed_kmh != null ? Number(r.speed_kmh) : 0,

      status,

      gpsBadge: r.gps_badge || "GPS —",
      gpsState: r.gps_state || "searching",

      signal: r.device_status ? String(r.device_status) : "—",

      lastSeen: formatTimeAgo(r.last_seen_at),
      updatedAt: r.updated_at,

      raw: r,
    };
  }

  async function fetchOnce() {
    try {
      loading.value = true;
      error.value = null;

      const res = await getAdminLiveBuses();
      const list = Array.isArray(res.data) ? res.data : [];

      // ✅ IMPORTANT: don't filter out all records accidentally
      // We'll keep them, but map markers will only be created if lat/lng valid.
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
    fetchOnce(); // ✅ fetch immediately
    timer = setInterval(fetchOnce, intervalMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  onUnmounted(stop);

  return { buses, loading, error, fetchOnce, start, stop };
}