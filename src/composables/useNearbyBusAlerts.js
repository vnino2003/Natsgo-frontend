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
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// small helper so we don't spam for tiny changes
function roundKm(km, step = 0.1) {
  const n = Number(km);
  if (!Number.isFinite(n)) return null;
  return Math.round(n / step) * step; // 0.1 km steps
}

export function useNearbyBusAlerts({
  intervalMs = 1500,
  maxNearest = 4,

  // Notification behavior
  nearKm = 1.0, // bus must be <= this distance to create notif
  cooldownMs = 2 * 60 * 1000, // ✅ default 2 mins now (change if you want)
  distanceStepKm = 0.1, // significant distance change threshold for repeat notifs
} = {}) {
  const { coords, hasLocation, status, startLocation } = useUserLocation();
  const { buses, start, stop, fetchOnce, loading, error } = useLiveBuses({ intervalMs });

  // ✅ Persist notifications list
  const notifKey = "near_bus_notifs_items";
  const initialNotifs = safeJsonParse(localStorage.getItem(notifKey)) || [];
  const notifications = ref(Array.isArray(initialNotifs) ? initialNotifs : []);
  function saveNotifs() {
    localStorage.setItem(notifKey, JSON.stringify(notifications.value));
  }

  // ✅ Per-bus notification memory (persisted)
  // We store:
  // { [busId]: { lastAt, everNotified, lastKmBucket, lastSeats, lastCap } }
  const storageKey = "near_bus_notif_state_v2";
  const initialState = safeJsonParse(localStorage.getItem(storageKey)) || {};
  const notifState = ref(initialState && typeof initialState === "object" ? initialState : {});
  function saveNotifState() {
    localStorage.setItem(storageKey, JSON.stringify(notifState.value));
  }

  // ✅ Unread count for bell badge
  const unreadCount = computed(() =>
    (notifications.value || []).reduce((acc, n) => acc + (n.read ? 0 : 1), 0)
  );

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

  function addNotif({ bus, title, msg, now }) {
    const key = String(bus.id);
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

    // keep list small
    if (notifications.value.length > 30) {
      notifications.value = notifications.value.slice(0, 30);
    }

    saveNotifs();
  }

  // ✅ Recommended behavior:
  // - first time: "Bus is near"
  // - repeat (after cooldown): "Bus is still nearby"
  // Repeat only if:
  //   - still near
  //   - cooldown passed
  //   - AND (distance bucket changed OR seats changed OR capacity changed)
  //     (this avoids spam if nothing changed at all)
  function maybeCreateNearBusNotifs(list) {
    const now = Date.now();

    for (const bus of list) {
      if (!(bus.km <= nearKm)) continue;

      const busId = String(bus.id);
      if (!busId) continue;

      const state = notifState.value[busId] || {
        lastAt: 0,
        everNotified: false,
        lastKmBucket: null,
        lastSeats: null,
        lastCap: null,
      };

      const kmBucket = roundKm(bus.km, distanceStepKm);
      const seats = Number.isFinite(Number(bus.seats)) ? Number(bus.seats) : null;
      const cap = Number.isFinite(Number(bus.capacity)) ? Number(bus.capacity) : null;

      const cooldownPassed = !state.lastAt || now - state.lastAt >= cooldownMs;

      // detect meaningful change
      const distChanged = kmBucket != null && state.lastKmBucket != null && kmBucket !== state.lastKmBucket;
      const seatsChanged = seats != null && state.lastSeats != null && seats !== state.lastSeats;
      const capChanged = cap != null && state.lastCap != null && cap !== state.lastCap;

      // FIRST TIME notif (no cooldown needed)
      if (!state.everNotified) {
        const title = `${bus.trackNo || bus.bus_code || "Bus"} is near`;
        const msg = `${bus.kmText} away • ${bus.route || bus.plate_no || `Bus #${bus.id}`}`;
        addNotif({ bus, title, msg, now });

        notifState.value[busId] = {
          lastAt: now,
          everNotified: true,
          lastKmBucket: kmBucket,
          lastSeats: seats,
          lastCap: cap,
        };
        saveNotifState();
        continue;
      }

      // REPEAT notif only after cooldown and when something changed
      if (cooldownPassed && (distChanged || seatsChanged || capChanged)) {
        const title = `${bus.trackNo || bus.bus_code || "Bus"} is still nearby`;
        const msg = `${bus.kmText} away • ${bus.route || bus.plate_no || `Bus #${bus.id}`}`;
        addNotif({ bus, title, msg, now });

        notifState.value[busId] = {
          ...state,
          lastAt: now,
          lastKmBucket: kmBucket,
          lastSeats: seats,
          lastCap: cap,
        };
        saveNotifState();
      } else {
        // update stored snapshot silently (so next time we can detect change)
        notifState.value[busId] = {
          ...state,
          lastKmBucket: kmBucket,
          lastSeats: seats,
          lastCap: cap,
        };
        // no need to save each loop heavily, but okay — we’ll save once after loop
      }
    }

    saveNotifState();
  }

  // Update time labels every refresh tick
  function refreshTimes() {
    notifications.value = notifications.value.map((n) => {
      const t = String(n.id).split("-").pop();
      const ms = Number(t);
      if (!Number.isFinite(ms)) return n;
      return { ...n, time: fmtTimeAgo(new Date(ms)) };
    });
    saveNotifs();
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
    saveNotifs();
  }

  function markRead(id) {
    notifications.value = notifications.value.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifs();
  }

  function dismiss(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
    saveNotifs();
  }

  function clear() {
    notifications.value = [];
    saveNotifs();

    // optional: also reset per-bus state to allow "first time" again
    notifState.value = {};
    saveNotifState();
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
    unreadCount,
    markRead,
    markAllRead,
    dismiss,
    clear,
  };
}