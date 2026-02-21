// src/composables/useLiveBuses.js
import { ref, onUnmounted } from "vue";
import { getLiveBuses } from "../services/api/commuterTrackingService";

export function useLiveBuses({ intervalMs = 1000 } = {}) {
  const loading = ref(false);
  const error = ref(null);
  const buses = ref([]);

  let timer = null;

  function normalize(row) {
    const capacity = Number(row.capacity ?? 0);

    // ✅ passenger_count from ir_status (backend should COALESCE to 0)
    const passengerCount = Number(row.passenger_count ?? 0);

    // ✅ map to UI fields expected by TrackBusPage
    const route = row.bus_code
      ? `${row.bus_code} • ${row.plate_no || ""}`.trim()
      : row.plate_no || `Bus #${row.bus_id}`;

    const trackNo = row.bus_code || String(row.bus_id);

    return {
      // identity
      id: row.bus_id,
      bus_id: row.bus_id,
      bus_code: row.bus_code,
      plate_no: row.plate_no,
      capacity,
      bus_status: row.bus_status,

      // ✅ seats used in UI
      seats: passengerCount,
      passenger_count: passengerCount,
      in_total: Number(row.in_total ?? 0),
      out_total: Number(row.out_total ?? 0),
      last_event: row.last_event ?? null,
      last_event_at: row.last_event_at ?? null,

      // ✅ UI display fields
      route,
      trackNo,

      // assigned device
      device_id: row.device_id,
      device_code: row.device_code,
      esp32_id: row.esp32_id,
      device_status: row.device_status,
      gps_state: row.gps_state,
      last_seen_at: row.last_seen_at,

      // latest GPS
      lat: Number(row.lat),
      lng: Number(row.lng),
      speedKmh: row.speed_kmh != null ? Number(row.speed_kmh) : null,
      altitudeM: row.altitude_m != null ? Number(row.altitude_m) : null,
      hdop: row.hdop != null ? Number(row.hdop) : null,
      sats: row.satellites != null ? Number(row.satellites) : null,
      updatedAt: row.updated_at ?? null,
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
        