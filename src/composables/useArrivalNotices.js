// src/composables/useArrivalNotices.js
import { ref, computed } from "vue";

const LS_KEY = "arrival_notices_v1";

function safeParse(v, fallback) {
  try {
    const parsed = JSON.parse(v);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function loadState() {
  const raw = localStorage.getItem(LS_KEY);
  const init = safeParse(raw, null);
  if (!init || typeof init !== "object") {
    return { items: [], unread: 0, seenIds: [] };
  }
  return {
    items: Array.isArray(init.items) ? init.items : [],
    unread: Number.isFinite(init.unread) ? init.unread : 0,
    seenIds: Array.isArray(init.seenIds) ? init.seenIds : [],
  };
}

function saveState(state) {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({
      items: state.items,
      unread: state.unread,
      seenIds: state.seenIds,
    })
  );
}

// Singleton
const _state = ref(loadState());

export function useArrivalNotices() {
  const items = computed(() => _state.value.items);
  const unread = computed(() => _state.value.unread);

  function markAllRead() {
    _state.value.unread = 0;
    saveState(_state.value);
  }

  function clearAll() {
    _state.value.items = [];
    _state.value.unread = 0;
    _state.value.seenIds = [];
    saveState(_state.value);
  }

  function pushNotice(payload) {
    // payload: { busId, title, subtitle, meta }
    const now = Date.now();
    const item = {
      id: `${payload.busId}_${now}`,
      busId: payload.busId,
      title: payload.title,
      subtitle: payload.subtitle || "",
      meta: payload.meta || "",
      createdAt: now,
      read: false,
    };

    _state.value.items = [item, ..._state.value.items].slice(0, 50);
    _state.value.unread = Math.min(99, (_state.value.unread || 0) + 1);

    saveState(_state.value);
  }

  function registerNearbySnapshot(nearestBusesRef, locationEnabledRef) {
    // Call this inside your nearby component (or any place that has nearestBuses)
    // so notifications stay synced with actual nearby buses.
    const seen = new Set(_state.value.seenIds || []);

    function persistSeen() {
      _state.value.seenIds = Array.from(seen).slice(0, 200);
      saveState(_state.value);
    }

    function formatDistance(bus) {
      // bus.kmText already exists in your UI
      if (bus?.kmText) return bus.kmText;
      const km = Number(bus?.km ?? bus?.distance_km ?? 0);
      if (Number.isFinite(km) && km > 0) return `${km.toFixed(1)} km`;
      return "nearby";
    }

    // manual watcher (no import watch here to keep this composable simple)
    // We return a function you can call inside your component watch()
    function onNearestChanged(newList) {
      if (!locationEnabledRef.value) return;
      if (!Array.isArray(newList) || newList.length === 0) return;

      for (const bus of newList) {
        const id = String(bus?.id ?? "");
        if (!id) continue;

        // if bus newly appeared, notify
        if (!seen.has(id)) {
          seen.add(id);
          pushNotice({
            busId: id,
            title: "Bus entered your area",
            subtitle: `${bus.route || "Route"} • ${formatDistance(bus)} away`,
            meta: `Track #${bus.trackNo || "—"} • ${bus.plate_no || "—"}`,
          });
        }
      }

      persistSeen();
    }

    return { onNearestChanged };
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return {
    items,
    unread,
    markAllRead,
    clearAll,
    registerNearbySnapshot,
    formatTime,
  };
}