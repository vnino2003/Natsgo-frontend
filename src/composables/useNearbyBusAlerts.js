// src/composables/useNearbyBusAlerts.js
import { computed, ref, watch } from "vue";
import { useUserLocation } from "@/composables/useUserLocation";
import { useLiveBuses } from "@/composables/useLiveBuses";

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function fmtTimeAgo(d) {
  const diff = Math.max(0, Date.now() - d.getTime());
  const s = Math.floor(diff / 1000);
  if (s < 20) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m > 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  return `${h} hr${h > 1 ? "s" : ""} ago`;
}

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

export function useNearbyBusAlerts({
  intervalMs = 1500,
  maxNearest = 4,

  // Notification behavior
  nearKm = 1.0,         // bus must be <= this distance to create notif
  cooldownMs = 5 * 60 * 1000, // per-bus notif cooldown
} = {}) {
  const { coords, hasLocation, status, startLocation } = useUserLocation();
  const { buses, start, stop, fetchOnce, loading, error } = useLiveBuses({ intervalMs });

  // Notifications list
  const notifications = ref([]);

  // per-bus last notified timestamp (persisted)
  const storageKey = "near_bus_notif_last";
  const lastMap = ref(safeJsonParse(localStorage.getItem(storageKey)) || {}); // { [busId]: number }

  function saveLastMap() {
    localStorage.setItem(storageKey, JSON.stringify(lastMap.value));
  }

  // Compute nearest buses
  const nearestBuses = computed(() => {
    if (!hasLocation.value || !coords.value) return [];

    const user = coords.value;

    const list = (buses.value || [])
      .filter((b) => Number.isFinite(b.lat) && Number.isFinite(b.lng))
      .map((b) => {
        const km = haversineKm(user, { lat: b.lat, lng: b.lng });
        return {
          ...b,
          km,
          kmText: km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`,
        };
      })
      .sort((a, b) => a.km - b.km);

    return list.slice(0, maxNearest);
  });

  // Generate notifications when near
  function maybeCreateNearBusNotifs(list) {
    const now = Date.now();

    for (const bus of list) {
      if (!(bus.km <= nearKm)) continue;

      const key = String(bus.id);
      const last = Number(lastMap.value[key] || 0);

      // cooldown per bus
      if (last && now - last < cooldownMs) continue;

      lastMap.value[key] = now;
      saveLastMap();

      const title = `${bus.trackNo || bus.bus_code || "Bus"} is near`;
      const msg = `${bus.kmText} away • ${bus.route || bus.plate_no || `Bus #${bus.id}`}`;

      notifications.value.unshift({
        id: `near-${key}-${now}`,
        type: "bus",
        title,
        message: msg,
        time: "Just now",
        read: false,
        meta: {
          bus_id: bus.id,
          km: bus.km,
          lat: bus.lat,
          lng: bus.lng,
        },
      });
    }

    // keep list small
    if (notifications.value.length > 30) {
      notifications.value = notifications.value.slice(0, 30);
    }
  }

  // Update time labels every refresh tick
  function refreshTimes() {
    notifications.value = notifications.value.map((n) => {
      // try parse timestamp from id
      const t = String(n.id).split("-").pop();
      const ms = Number(t);
      if (!Number.isFinite(ms)) return n;
      return { ...n, time: fmtTimeAgo(new Date(ms)) };
    });
  }

  watch(
    nearestBuses,
    (list) => {
      if (!hasLocation.value) return;
      maybeCreateNearBusNotifs(list);
      refreshTimes();
    },
    { deep: true }
  );

  function enableLocation() {
    startLocation({ highAccuracy: true });
  }

  function markAllRead() {
    notifications.value = notifications.value.map((n) => ({ ...n, read: true }));
  }

  function dismiss(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function clear() {
    notifications.value = [];
  }

  // Start/Stop live buses only when location is ON
  watch(
    hasLocation,
    (on) => {
      if (on) start();
      else stop();
    },
    { immediate: true }
  );

  return {
    // location
    coords,
    hasLocation,
    status,
    enableLocation,

    // buses
    buses,
    nearestBuses,
    loading,
    error,
    fetchOnce,

    // notifications
    notifications,
    markAllRead,
    dismiss,
    clear,
  };
}