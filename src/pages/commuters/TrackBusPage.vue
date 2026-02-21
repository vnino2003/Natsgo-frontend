<!-- src/pages/commuters/TrackBusPage.vue
  ✅ Applied:
  - Uses composable useLiveBuses() (NO direct axios here)
  - Fetches ONLY buses with assigned device + latest gps
  - Draws bus markers + terminal markers
  - Shows route direction (current → target) + at_terminal + dist_m
  - Keeps your location gate + bottom sheet + UI intact
-->

<template>
  <div class="tb-page">
    <!-- ✅ Location Gate Overlay -->
    <Transition name="fade">
      <div v-if="showLocationGate" class="tb-permission-overlay">
        <div class="tb-permission-card">
          <div class="tb-permission-icon">
            <i class="fas fa-location-dot"></i>
          </div>

          <h2 class="tb-permission-title">{{ gateTitle }}</h2>
          <p class="tb-permission-text">{{ gateText }}</p>

          <div class="tb-gate-status" :class="gateStatusClass">
            <span v-if="gateStatus === 'idle'">
              <i class="fas fa-circle-info"></i> Tap to request location
            </span>
            <span v-else-if="gateStatus === 'requesting'">
              <i class="fas fa-spinner fa-spin"></i> Requesting permission…
            </span>
            <span v-else-if="gateStatus === 'connecting'">
              <i class="fas fa-signal"></i> Waiting for GPS fix…
            </span>
            <span v-else-if="gateStatus === 'connected'">
              <i class="fas fa-check"></i> Location Connected
            </span>
            <span v-else>
              <i class="fas fa-triangle-exclamation"></i> Blocked / unavailable
            </span>
          </div>

          <button
            class="tb-btn tb-btn-primary"
            @click="startLocationFlow"
            :disabled="gateStatus === 'requesting' || gateStatus === 'connecting'"
            type="button"
          >
            <i class="fas fa-check"></i>
            Turn On Location
          </button>

          <button class="tb-btn tb-btn-ghost" @click="skipLocation" type="button">
            Use Without Location
          </button>

          <div v-if="gateStatus === 'error'" class="tb-gate-help">
            <div class="tb-gate-help-title">
              <i class="fas fa-gear"></i> How to fix
            </div>
            <ul class="tb-gate-help-list">
              <li>Chrome: 🔒 icon → Site settings → Location → Allow</li>
              <li>Make sure Location is ON in device settings</li>
              <li>Refresh page and tap “Turn On Location” again</li>
              <li>⚠️ Geolocation needs HTTPS (or localhost)</li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Map -->
    <div class="tb-map-wrap">
      <div class="tb-map" ref="mapEl"></div>

      <!-- Quick actions -->
      <div class="tb-fab-stack">
        <button class="tb-fab" type="button" @click="centerOnUser" aria-label="Center on me">
          <i class="fas fa-crosshairs"></i>
        </button>

        <button class="tb-fab" type="button" @click="openSheetMid" aria-label="Open list">
          <i class="fas fa-list"></i>
        </button>
      </div>

      <!-- Selected bus card -->
      <Transition name="slide-up">
        <div v-if="selectedBus" class="tb-bus-card" aria-hidden="false">
          <div class="tb-bus-card-top">
            <div class="tb-bus-route">{{ selectedBus.route }}</div>

            <button class="tb-bus-close" @click="closeSelected" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- ✅ Route direction + terminal status -->
          <div class="tb-route-line">
            <span class="tb-route-pill">
              <i class="fas fa-route"></i>
              {{ selectedBus.routeDir ?? "—" }}
            </span>

            <span class="tb-route-pill" :class="selectedBus.at_terminal ? 'ok' : 'warn'">
              <i class="fas" :class="selectedBus.at_terminal ? 'fa-location-dot' : 'fa-road'"></i>
              {{ selectedBus.at_terminal ? "At terminal" : "En route" }}
            </span>

            <span v-if="selectedBus.dist_m != null" class="tb-route-pill">
              <i class="fas fa-ruler"></i>
              {{ Math.round(selectedBus.dist_m) }} m to target
            </span>
          </div>

          <div class="tb-bus-meta">
            {{ hasUserLocation ? formatKm(distanceKm(selectedBus)) : "—" }}
            away • Track #{{ selectedBus.trackNo }}
          </div>

          <div class="tb-bus-sub">
            ETA:
            {{ hasUserLocation ? formatEta(etaMinutes(selectedBus)) : "—" }}
            • Speed: {{ selectedBus.speedKmh ?? "—" }} km/h
          </div>

          <div class="tb-chipline">
            <span class="tb-chip-mini" :class="occClass(selectedBus)">
              <i class="fas fa-user"></i>
              {{ seatsLabel(selectedBus) }}
            </span>
          </div>

          <div class="tb-mini-actions">
            <button class="tb-mini-btn" @click="focusBus(selectedBus)" type="button">
              <i class="fas fa-location-arrow"></i> Focus
            </button>
            <button class="tb-mini-btn" @click="centerOnUser" type="button">
              <i class="fas fa-user"></i> Me
            </button>
            <button class="tb-mini-btn" @click="openSheetMid" type="button">
              <i class="fas fa-list"></i> List
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Bottom Sheet -->
    <div class="tb-sheet" ref="sheetEl" :class="{ dragging: isDragging }" :style="sheetStyle">
      <div class="tb-sheet-handle" ref="sheetHandleEl" @pointerdown="onSheetPointerDown">
        <div class="tb-sheet-pill"></div>

        <div class="tb-sheet-topline">
          <h3 class="tb-sheet-title">
            Buses
            <span class="tb-live">
              <span class="tb-live-dot"></span> Live
            </span>
          </h3>

          <span class="tb-sheet-count">{{ filteredBuses.length }}</span>
        </div>

        <div class="tb-sheet-controls">
          <div class="tb-search">
            <i class="fas fa-magnifying-glass"></i>
            <input
              v-model="query"
              class="tb-search-input"
              type="text"
              placeholder="Search bus code / plate / id..."
              @pointerdown.stop
            />
            <button
              v-if="query"
              class="tb-search-clear"
              @click.stop="query = ''"
              aria-label="Clear"
              type="button"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="tb-chips" @pointerdown.stop>
            <button class="tb-chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">
              All
            </button>

            <button
              class="tb-chip"
              :class="{ active: filter === 'nearby' }"
              @click="filter = 'nearby'"
              :disabled="!hasUserLocation"
              :title="!hasUserLocation ? 'Turn on location to use Nearby + ETA' : 'Nearby buses'"
            >
              Nearby
            </button>
          </div>
        </div>
      </div>

      <div class="tb-sheet-content" ref="sheetContentEl">
        <div class="tb-sheet-list">
          <TransitionGroup name="list" tag="div" class="tb-list-wrap">
            <div
              v-for="bus in filteredBuses"
              :key="bus.id"
              class="tb-bus-row"
              :class="{ selected: selectedBus?.id === bus.id }"
              @click="selectBus(bus)"
            >
              <div class="tb-bus-badge" :class="occClass(bus)">
                <div class="tb-bus-badge-top">{{ bus.trackNo }}</div>
                <div class="tb-bus-badge-sub">TRK</div>
              </div>

              <div class="tb-bus-row-main">
                <div class="tb-row-line1">
                  <p class="tb-bus-row-title">{{ bus.route }}</p>
                </div>

                <!-- ✅ show route direction in list -->
                <div class="tb-row-line2">
                  <span class="tb-metric tb-muted">
                    <i class="fas fa-route"></i>
                    {{ bus.routeDir ?? "—" }}
                  </span>

                  <span class="tb-dotsep">•</span>

                  <span class="tb-metric">
                    <i class="fas fa-location-dot"></i>
                    {{ hasUserLocation ? formatKm(distanceKm(bus)) : "—" }}
                  </span>

                  <span class="tb-dotsep">•</span>

                  <span class="tb-metric">
                    <i class="fas fa-clock"></i>
                    {{ hasUserLocation ? formatEta(etaMinutes(bus)) : "—" }}
                  </span>

                  <span class="tb-dotsep">•</span>

                  <span class="tb-metric tb-muted">
                    <i class="fas fa-signal"></i>
                    Sats {{ bus.sats ?? "—" }} • HDOP {{ bus.hdop ?? "—" }}
                  </span>

                  <span class="tb-dotsep">•</span>
                  <span class="tb-metric tb-muted">ID {{ bus.id }}</span>
                </div>
              </div>

              <div class="tb-bus-row-right">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="filteredBuses.length === 0" class="tb-empty">
            <i class="fas fa-bus"></i>
            <p>No buses found.</p>
            <div class="tb-empty-actions">
              <button class="tb-mini-btn" @click="query = ''" type="button">Clear search</button>
              <button class="tb-mini-btn" @click="filter = 'all'" type="button">Show all</button>
            </div>
          </div>

          <div class="tb-footnote">
            <i class="fas fa-circle-info"></i>
            <span v-if="hasUserLocation">
              Sorted by nearest distance. Nearby + ETA available.
            </span>
            <span v-else>
              Turn on location to enable Nearby + Distance + ETA.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import L from "leaflet";
import { useLiveBuses } from "../../composables/useLiveBuses";

/* ========= NEW: terminals fetch (simple, no extra file needed) ========= */
async function fetchPublicTerminals() {
  // uses your existing axios instance in http.js baseURL
  // IMPORTANT: route must exist -> GET /api/terminals
  const api = (await import("../../services/api/http")).default;
  return api.get("/terminals");
}

/* ========= State ========= */
const FALLBACK_VIEW = { lat: 12.8797, lng: 121.774 }; // PH center-ish

const mapEl = ref(null);
const sheetEl = ref(null);
const sheetHandleEl = ref(null);
const sheetContentEl = ref(null);

// User position is null until enabled
const currentPos = ref(null); // {lat,lng} | null
const hasUserLocation = ref(false);

const selectedBus = ref(null);

// ✅ buses comes from composable
const { buses, start: startLive, stop: stopLive, fetchOnce } = useLiveBuses({ intervalMs: 1000 });

const query = ref("");
const filter = ref("nearby");

/* ========= NEW: terminals state ========= */
const terminals = ref([]);
let terminalTimer = null;

/* ========= Location Gate ========= */
const gateStatus = ref("idle"); // idle | requesting | connecting | connected | error
const usingWithoutLocation = ref(false);

const showLocationGate = computed(() => {
  if (usingWithoutLocation.value) return false;
  return gateStatus.value !== "connected";
});

const gateTitle = computed(() => {
  if (gateStatus.value === "connected") return "Location Connected";
  if (gateStatus.value === "requesting") return "Requesting Permission…";
  if (gateStatus.value === "connecting") return "Connecting…";
  if (gateStatus.value === "error") return "Enable Location";
  return "Turn On Location";
});

const gateText = computed(() => {
  if (gateStatus.value === "connected") return "Thanks! You can now use Nearby, Distance, and ETA.";
  if (gateStatus.value === "requesting") return "Please allow location permission in your browser.";
  if (gateStatus.value === "connecting") return "Waiting for GPS fix. Please stay still for a moment.";
  if (gateStatus.value === "error")
    return "Location is needed for Nearby, Distance, and ETA. You can still view buses without it.";
  return "Turn on location to show Nearby buses and compute distance + ETA.";
});

const gateStatusClass = computed(() => {
  if (gateStatus.value === "connected") return "ok";
  if (gateStatus.value === "error") return "bad";
  if (gateStatus.value === "requesting" || gateStatus.value === "connecting") return "warn";
  return "";
});

let geoWatchId = null;

function startLocationFlow() {
  if (!navigator.geolocation) {
    gateStatus.value = "error";
    hasUserLocation.value = false;
    currentPos.value = null;
    removeUserMarker();
    return;
  }

  gateStatus.value = "requesting";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      gateStatus.value = "connecting";
      hasUserLocation.value = true;
      currentPos.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      ensureUserMarker();

      geoWatchId = navigator.geolocation.watchPosition(
        (p) => {
          hasUserLocation.value = true;
          currentPos.value = { lat: p.coords.latitude, lng: p.coords.longitude };
          gateStatus.value = "connected";
          ensureUserMarker();
          updateUserMarker();
        },
        () => {
          gateStatus.value = "error";
          hasUserLocation.value = false;
          currentPos.value = null;
          removeUserMarker();
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
      );
    },
    () => {
      gateStatus.value = "error";
      hasUserLocation.value = false;
      currentPos.value = null;
      removeUserMarker();
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
}

function skipLocation() {
  usingWithoutLocation.value = true;
  filter.value = "all";
  hasUserLocation.value = false;
  currentPos.value = null;
  removeUserMarker();
}

watch(hasUserLocation, (val) => {
  if (!val && filter.value === "nearby") filter.value = "all";
});

/* ========= Leaflet ========= */
let map = null;
let userMarker = null;

const busMarkers = new Map();
const terminalMarkers = new Map();

function initLeaflet() {
  if (!mapEl.value || map) return;

  map = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: false,
    tap: true,
  }).setView([FALLBACK_VIEW.lat, FALLBACK_VIEW.lng], 6);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
  }).addTo(map);

  map.on("click", (e) => {
    if (e?.originalEvent?.target?.closest?.(".tb-leaflet-bus-pill")) return;
    selectedBus.value = null;
    refreshAllBusMarkerIcons();
    collapseSheet();
  });

  requestAnimationFrame(() => map && map.invalidateSize());
  setTimeout(() => map && map.invalidateSize(), 350);
}

function makeUserDivIcon() {
  return L.divIcon({
    className: "tb-leaflet-user-icon",
    html: `<div class="tb-leaflet-user-dot"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function ensureUserMarker() {
  if (!map || !hasUserLocation.value || !currentPos.value) return;
  if (userMarker) return;

  userMarker = L.marker([currentPos.value.lat, currentPos.value.lng], {
    icon: makeUserDivIcon(),
    interactive: false,
  }).addTo(map);
}

function updateUserMarker() {
  if (!map || !userMarker || !currentPos.value) return;
  userMarker.setLatLng([currentPos.value.lat, currentPos.value.lng]);
}

function removeUserMarker() {
  if (!map || !userMarker) return;
  map.removeLayer(userMarker);
  userMarker = null;
}

/* ===== Bus marker ===== */
function makeBusDivIcon(bus, isSelected = false) {
  const cls = occClass(bus);
  const sel = isSelected ? "selected" : "";
  return L.divIcon({
    className: "tb-leaflet-bus-icon",
    html: `
      <div class="tb-leaflet-bus-pill ${cls} ${sel}">
        <i class="fas fa-bus"></i>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function addOrUpdateBusMarker(bus) {
  if (!map) return;

  const pos = [bus.lat, bus.lng];
  const existing = busMarkers.get(bus.id);

  if (existing) {
    existing.setLatLng(pos);
    existing.setIcon(makeBusDivIcon(bus, selectedBus.value?.id === bus.id));
    return;
  }

  const m = L.marker(pos, { icon: makeBusDivIcon(bus, selectedBus.value?.id === bus.id) }).addTo(map);
  m.on("click", () => selectBus(bus));
  busMarkers.set(bus.id, m);
}

function removeMarker(id) {
  const m = busMarkers.get(id);
  if (m && map) map.removeLayer(m);
  busMarkers.delete(id);
}

function refreshAllBusMarkerIcons() {
  for (const b of buses.value) {
    const m = busMarkers.get(b.id);
    if (!m) continue;
    m.setIcon(makeBusDivIcon(b, selectedBus.value?.id === b.id));
  }
}

/* ===== Terminal markers ===== */
function makeTerminalDivIcon(t) {
  const count = Number(t.bus_count ?? 0);
  return L.divIcon({
    className: "tb-leaflet-terminal-icon",
    html: `
      <div class="tb-terminal-pill">
        <i class="fas fa-location-dot"></i>
        <span class="tb-terminal-badge">${count}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function syncTerminalMarkers() {
  if (!map) return;

  const list = terminals.value || [];
  const nextIds = new Set(list.map((t) => t.terminal_id));

  // remove old
  for (const id of terminalMarkers.keys()) {
    if (!nextIds.has(id)) {
      const m = terminalMarkers.get(id);
      if (m) map.removeLayer(m);
      terminalMarkers.delete(id);
    }
  }

  // add/update
  for (const t of list) {
    if (t.lat == null || t.lng == null) continue;

    const id = t.terminal_id;
    const pos = [Number(t.lat), Number(t.lng)];

    const popupHtml = `
      <div style="font-weight:900; margin-bottom:4px;">${t.terminal_name}</div>
      <div style="font-weight:800; color:#555;">${t.city}</div>
      <div style="margin-top:6px; font-weight:900;">Buses here: ${Number(t.bus_count ?? 0)}</div>
    `;

    const existing = terminalMarkers.get(id);
    if (existing) {
      existing.setLatLng(pos);
      existing.setIcon(makeTerminalDivIcon(t));
      existing.setPopupContent(popupHtml);
    } else {
      const m = L.marker(pos, { icon: makeTerminalDivIcon(t) }).addTo(map);
      m.bindPopup(popupHtml);
      terminalMarkers.set(id, m);
    }
  }
}

/* ===== View helpers ===== */
function focusBus(bus) {
  if (!map) return;
  map.flyTo([bus.lat, bus.lng], Math.max(map.getZoom(), 16), { duration: 0.5 });
}

function centerOnUser() {
  if (!map) return;

  if (!hasUserLocation.value || !currentPos.value) {
    alert("Location is off. Tap “Turn On Location” to center on you.");
    return;
  }

  map.flyTo([currentPos.value.lat, currentPos.value.lng], 16, { duration: 0.5 });
}

function fitToBusesIfAny() {
  if (!map) return;
  const pts = buses.value
    .filter((b) => isFinite(b.lat) && isFinite(b.lng))
    .map((b) => [b.lat, b.lng]);

  if (pts.length === 0) return;

  const bounds = L.latLngBounds(pts);
  map.fitBounds(bounds, { padding: [40, 40] });
}

/* ========= Selection ========= */
function selectBus(bus) {
  selectedBus.value = bus;
  refreshAllBusMarkerIcons();
  collapseSheet();
  focusBus(bus);
}
function closeSelected() {
  selectedBus.value = null;
  refreshAllBusMarkerIcons();
  openSheetMid();
}

/* ========= Distance + ETA ========= */
function distanceKm(bus) {
  if (!hasUserLocation.value || !currentPos.value) return Infinity;

  const a = currentPos.value;
  const b = { lat: bus.lat, lng: bus.lng };

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

function formatKm(n) {
  if (!isFinite(n)) return "—";
  if (n < 1) return `${Math.round(n * 1000)} m`;
  return `${n.toFixed(1)} km`;
}

const AVG_SPEED_KMH = 18;
const BASE_DELAY_MIN = 1.5;

function etaMinutes(bus) {
  if (!hasUserLocation.value || !currentPos.value) return Infinity;
  const km = distanceKm(bus);
  if (!isFinite(km)) return Infinity;
  const travelMin = (km / AVG_SPEED_KMH) * 60;
  return Math.max(1, Math.round(travelMin + BASE_DELAY_MIN));
}

function formatEta(mins) {
  if (!isFinite(mins)) return "—";
  if (mins <= 1) return "1 min";
  if (mins < 60) return `${mins} mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

/* ========= Occupancy UI helpers ========= */
function seatsLabel(bus) {
  const cap = Number(bus.capacity ?? 0);
  const used = Number(bus.seats ?? 0);
  if (!cap || cap < 1) return "—";
  return `${used}/${cap} seats`;
}
function occRatio(bus) {
  const cap = Number(bus.capacity ?? 0);
  const used = Number(bus.seats ?? 0);
  if (!cap || cap < 1) return 0;
  return Math.max(0, Math.min(1, used / cap));
}
function occClass(bus) {
  const r = occRatio(bus);
  if (r >= 0.85) return "full";
  if (r >= 0.55) return "mid";
  return "low";
}

/* ========= Filtered list ========= */
const NEARBY_KM = 3;

const filteredBuses = computed(() => {
  const q = query.value.trim().toLowerCase();

  let list = [...buses.value].map((b) => ({ ...b, _km: distanceKm(b) }));
  if (hasUserLocation.value) list.sort((a, b) => a._km - b._km);

  if (filter.value === "nearby") {
    if (!hasUserLocation.value) return list;
    list = list.filter((b) => isFinite(b._km) && b._km <= NEARBY_KM);
  }

  if (!q) return list;

  return list.filter((b) => {
    const idStr = String(b.id || "").toLowerCase();
    const codeStr = String(b.bus_code || b.trackNo || "").toLowerCase();
    const plateStr = String(b.plate_no || "").toLowerCase();
    return idStr.includes(q) || codeStr.includes(q) || plateStr.includes(q);
  });
});

/* =========================================================
   Bottom Sheet Drag
   ========================================================= */
const isDragging = ref(false);
const sheetY = ref(0);
const sheetAnimating = ref(true);

let startY = 0;
let startSheetY = 0;
let lastY = 0;
let lastT = 0;
let velocity = 0;
let raf = 0;

function sheetHeightPx() {
  const el = sheetEl.value;
  if (!el) return 0;
  return el.getBoundingClientRect().height;
}
function snapPoints() {
  const h = sheetHeightPx();
  const peek = 150;
  const collapsed = Math.max(0, h - peek);
  const mid = Math.max(0, Math.round(h * 0.45));
  const expanded = 0;
  return { expanded, mid, collapsed };
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
const sheetStyle = computed(() => ({
  transform: `translate3d(0, ${sheetY.value}px, 0)`,
  transition: sheetAnimating.value ? "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
}));

function setSheetY(px) {
  const { expanded, collapsed } = snapPoints();
  sheetY.value = clamp(px, expanded, collapsed);
}
function nearestSnap(targetY) {
  const { expanded, mid, collapsed } = snapPoints();
  const points = [expanded, mid, collapsed];
  let best = points[0];
  let bestDist = Math.abs(targetY - best);
  for (const p of points) {
    const d = Math.abs(targetY - p);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}
function snapTo(y) {
  sheetAnimating.value = true;
  setSheetY(y);

  const { collapsed } = snapPoints();
  if (y >= collapsed - 2 && sheetContentEl.value) sheetContentEl.value.scrollTop = 0;

  requestAnimationFrame(() => map?.invalidateSize());
  setTimeout(() => map?.invalidateSize(), 320);
}
function openSheetMid() {
  snapTo(snapPoints().mid);
}
function collapseSheet() {
  snapTo(snapPoints().collapsed);
}

function onSheetPointerDown(e) {
  if (e.button != null && e.button !== 0) return;

  const content = sheetContentEl.value;
  const handle = sheetHandleEl.value;
  const inHandle = handle && handle.contains(e.target);

  if (!inHandle && content) {
    const atTop = content.scrollTop <= 0;
    if (!atTop) return;
  }

  isDragging.value = true;
  sheetAnimating.value = false;

  startY = e.clientY;
  startSheetY = sheetY.value;

  lastY = e.clientY;
  lastT = performance.now();
  velocity = 0;

  sheetEl.value?.setPointerCapture?.(e.pointerId);

  window.addEventListener("pointermove", onSheetPointerMove, { passive: false });
  window.addEventListener("pointerup", onSheetPointerUp, { passive: true });

  e.preventDefault();
}
function onSheetPointerMove(e) {
  if (!isDragging.value) return;

  const now = performance.now();
  const dy = e.clientY - startY;
  const next = startSheetY + dy;

  const dt = now - lastT || 1;
  const v = (e.clientY - lastY) / dt;
  velocity = velocity * 0.7 + v * 0.3;

  lastY = e.clientY;
  lastT = now;

  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => setSheetY(next));

  requestAnimationFrame(() => map?.invalidateSize());
  e.preventDefault();
}
function onSheetPointerUp() {
  if (!isDragging.value) return;

  isDragging.value = false;
  sheetAnimating.value = true;

  const { expanded, mid, collapsed } = snapPoints();
  const v = velocity;
  const y = sheetY.value;

  const flickDown = v > 0.6;
  const flickUp = v < -0.6;

  let target;
  if (flickUp) target = expanded;
  else if (flickDown) target = collapsed;
  else target = nearestSnap(y);

  if (!flickUp && !flickDown) {
    if (y > (mid + collapsed) / 2) target = collapsed;
    else if (y > (expanded + mid) / 2) target = mid;
    else target = expanded;
  }

  snapTo(target);

  window.removeEventListener("pointermove", onSheetPointerMove);
  window.removeEventListener("pointerup", onSheetPointerUp);
}

/* ========= Live sync to markers ========= */
function syncMarkersToBuses() {
  const next = buses.value;

  const nextIds = new Set(next.map((b) => b.id));
  for (const id of busMarkers.keys()) {
    if (!nextIds.has(id)) removeMarker(id);
  }

  if (map) {
    next.forEach(addOrUpdateBusMarker);
    refreshAllBusMarkerIcons();

    if (!hasUserLocation.value) {
      fitToBusesIfAny();
    }
  }

  if (selectedBus.value) {
    const updated = next.find((b) => b.id === selectedBus.value.id);
    if (updated) selectedBus.value = updated;
  }
}

watch(
  buses,
  () => {
    syncMarkersToBuses();
  },
  { deep: true }
);

watch(
  terminals,
  () => {
    syncTerminalMarkers();
  },
  { deep: true }
);

/* ========= Terminals polling ========= */
async function loadTerminalsOnce() {
  try {
    const res = await fetchPublicTerminals();
    terminals.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    // ignore (map still works without terminals)
  }
}
function startTerminalPolling() {
  stopTerminalPolling();
  loadTerminalsOnce();
  terminalTimer = setInterval(loadTerminalsOnce, 5000);
}
function stopTerminalPolling() {
  if (terminalTimer) clearInterval(terminalTimer);
  terminalTimer = null;
}

/* ========= Lifecycle ========= */
onMounted(async () => {
  initLeaflet();

  await nextTick();
  openSheetMid();
  window.addEventListener("resize", openSheetMid);

  requestAnimationFrame(() => map?.invalidateSize());
  setTimeout(() => map?.invalidateSize(), 350);

  // ✅ start polling buses
  startLive();

  // ✅ start polling terminals
  startTerminalPolling();

  // ✅ run once now so markers appear immediately
  await fetchOnce();
  syncMarkersToBuses();

  await loadTerminalsOnce();
  syncTerminalMarkers();
});

onUnmounted(() => {
  stopLive();
  stopTerminalPolling();

  if (geoWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(geoWatchId);
  }

  window.removeEventListener("resize", openSheetMid);
  window.removeEventListener("pointermove", onSheetPointerMove);
  window.removeEventListener("pointerup", onSheetPointerUp);
  cancelAnimationFrame(raf);

  if (map) {
    map.off();
    map.remove();
    map = null;
  }
});
</script>

<style>
:root {
  --bottom-nav-h: 72px;
}

/* Page wrapper */
.tb-page {
  position: relative;
  height: calc(100vh - var(--bottom-nav-h));
  width: 100%;
  overflow: hidden;
  background: var(--light-bg);
}

/* ===== Permission Overlay ===== */
.tb-permission-overlay {
  position: absolute;
  inset: 0;
  background: rgba(245, 247, 250, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.tb-permission-card {
  width: min(420px, 100%);
  background: white;
  border: 2px solid var(--border-light);
  border-radius: 18px;
  padding: 20px 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.tb-permission-icon {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-teal) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 26px;
}

.tb-permission-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 6px 0;
}

.tb-permission-text {
  font-size: 14px;
  color: var(--text-gray);
  margin: 0 0 14px 0;
  line-height: 1.4;
}

/* Gate status pill */
.tb-gate-status {
  margin: 12px 0 14px;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 900;
  font-size: 12px;
  border: 2px solid var(--border-light);
  color: var(--text-dark);
  background: rgba(17, 24, 39, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.tb-gate-status.warn {
  color: #b45309;
  border-color: rgba(180, 83, 9, 0.25);
  background: rgba(180, 83, 9, 0.08);
}
.tb-gate-status.ok {
  color: #166534;
  border-color: rgba(22, 101, 52, 0.25);
  background: rgba(22, 101, 52, 0.08);
}
.tb-gate-status.bad {
  color: #b91c1c;
  border-color: rgba(185, 28, 28, 0.25);
  background: rgba(185, 28, 28, 0.08);
}

.tb-gate-help {
  margin-top: 12px;
  text-align: left;
  border: 2px dashed var(--border-light);
  border-radius: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
}
.tb-gate-help-title {
  font-weight: 900;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 8px;
}
.tb-gate-help-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-gray);
  font-weight: 800;
  font-size: 12px;
  line-height: 1.5;
}

.tb-btn {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.tb-btn:active {
  transform: scale(0.98);
}
.tb-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.tb-btn-primary {
  background: linear-gradient(135deg, var(--primary-blue) 0%, #0d47a1 100%);
  color: white;
  margin-bottom: 10px;
}
.tb-btn-ghost {
  background: transparent;
  border: 2px solid var(--border-light);
  color: var(--text-dark);
}

/* ===== Map ===== */
.tb-map-wrap {
  position: absolute;
  inset: 0;
}
.tb-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #e3f2fd 0%, #e0f2f1 100%);
  touch-action: pan-x pan-y;
  z-index: 1;
}
.tb-map .leaflet-container {
  width: 100% !important;
  height: 100% !important;
}

/* Floating action stack */
.tb-fab-stack {
  position: absolute;
  right: 14px;
  bottom: calc(var(--bottom-nav-h) + 18px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 12;
}
.tb-fab {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: white;
  border: 2px solid var(--border-light);
  color: var(--primary-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}
.tb-fab:active {
  transform: scale(0.92);
}

/* Floating card */
.tb-bus-card {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light);
  border-radius: 14px;
  padding: 14px 14px 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14);
  z-index: 20;
}
.tb-bus-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.tb-bus-route {
  font-weight: 800;
  color: var(--text-dark);
  font-size: 15px;
}
.tb-bus-close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-gray);
}
.tb-bus-close:active {
  transform: scale(0.92);
}

/* ✅ new route line pills */
.tb-route-line{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin-bottom: 8px;
}
.tb-route-pill{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:6px 10px;
  border-radius:999px;
  border:2px solid var(--border-light);
  background: rgba(17,24,39,0.02);
  font-weight:900;
  font-size:12px;
  color: var(--text-dark);
}
.tb-route-pill.ok{
  border-color: rgba(22,101,52,0.25);
  background: rgba(22,101,52,0.08);
  color:#166534;
}
.tb-route-pill.warn{
  border-color: rgba(180,83,9,0.25);
  background: rgba(180,83,9,0.08);
  color:#b45309;
}

.tb-bus-meta {
  font-size: 13px;
  font-weight: 800;
  color: var(--primary-blue);
  margin-bottom: 4px;
}
.tb-bus-sub {
  font-size: 13px;
  color: var(--text-gray);
}
.tb-chipline {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.tb-chip-mini {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 900;
  border: 2px solid var(--border-light);
  background: rgba(17, 24, 39, 0.02);
  color: var(--text-dark);
}
.tb-chip-mini.low {
  color: #166534;
  border-color: rgba(22, 101, 52, 0.25);
  background: rgba(22, 101, 52, 0.08);
}
.tb-chip-mini.mid {
  color: #b45309;
  border-color: rgba(180, 83, 9, 0.25);
  background: rgba(180, 83, 9, 0.08);
}
.tb-chip-mini.full {
  color: #b91c1c;
  border-color: rgba(185, 28, 28, 0.25);
  background: rgba(185, 28, 28, 0.08);
}
.tb-mini-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.tb-mini-btn {
  border: 2px solid var(--border-light);
  background: white;
  color: var(--text-dark);
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.tb-mini-btn:active {
  transform: scale(0.98);
}

/* Bottom sheet */
.tb-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 74%;
  z-index: 30;
  padding: 0 12px calc(12px + env(safe-area-inset-bottom));
  will-change: transform;
  pointer-events: auto;
}
.tb-sheet.dragging {
  transition: none !important;
}
.tb-sheet-handle {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  padding: 10px 14px 12px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.12);
  user-select: none;
  touch-action: none;
}
.tb-sheet-pill {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: rgba(31, 41, 55, 0.18);
  margin: 0 auto 10px;
}

/* ... KEEP REST OF YOUR CSS SAME BELOW ... */

/* Leaflet markers */
.tb-leaflet-bus-icon {
  background: transparent;
  border: none;
}
.tb-leaflet-bus-pill {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #fff;
  border: 2px solid var(--accent-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.tb-leaflet-bus-pill i {
  color: var(--accent-teal);
  font-size: 18px;
}
.tb-leaflet-bus-pill.low {
  border-color: #16a34a;
}
.tb-leaflet-bus-pill.low i {
  color: #16a34a;
}
.tb-leaflet-bus-pill.mid {
  border-color: #f59e0b;
}
.tb-leaflet-bus-pill.mid i {
  color: #f59e0b;
}
.tb-leaflet-bus-pill.full {
  border-color: #ef4444;
}
.tb-leaflet-bus-pill.full i {
  color: #ef4444;
}
.tb-leaflet-bus-pill.selected {
  transform: scale(1.12);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  position: relative;
}
.tb-leaflet-bus-pill.selected::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  border: 2px solid currentColor;
  opacity: 0.22;
}
.tb-leaflet-user-icon {
  background: transparent;
  border: none;
}
.tb-leaflet-user-dot {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--primary-blue);
  border: 3px solid #fff;
  box-shadow: 0 6px 16px rgba(30, 136, 229, 0.25);
}

/* ✅ terminal markers */
.tb-leaflet-terminal-icon { background: transparent; border:none; }
.tb-terminal-pill{
  width:38px; height:38px;
  border-radius:999px;
  background:#fff;
  border:2px solid rgba(30,136,229,0.65);
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  box-shadow: 0 10px 22px rgba(0,0,0,0.12);
}
.tb-terminal-pill i{
  color: rgba(30,136,229,0.95);
  font-size: 18px;
}
.tb-terminal-badge{
  position:absolute;
  top:-6px; right:-6px;
  width:20px; height:20px;
  border-radius:999px;
  background: linear-gradient(135deg, rgba(0,188,212,0.92), rgba(30,136,229,0.92));
  color:#fff;
  font-weight:900;
  font-size:11px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:2px solid #fff;
}

/* transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.list-enter-active,
.list-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.list-move {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Bottom sheet */
.tb-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 74%;
  z-index: 30;
  padding: 0 12px calc(12px + env(safe-area-inset-bottom));
  will-change: transform;
  pointer-events: auto;
}
.tb-sheet.dragging {
  transition: none !important;
}
.tb-sheet-handle {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  padding: 10px 14px 12px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.12);
  user-select: none;
  touch-action: none;
}
.tb-sheet-pill {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: rgba(31, 41, 55, 0.18);
  margin: 0 auto 10px;
}
.tb-sheet-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.tb-sheet-title {
  font-size: 15px;
  font-weight: 900;
  margin: 0;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 10px;
}
.tb-live {
  font-size: 12px;
  font-weight: 900;
  color: var(--accent-teal);
  background: rgba(0, 131, 143, 0.1);
  border: 2px solid rgba(0, 131, 143, 0.18);
  padding: 4px 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tb-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--accent-teal);
  box-shadow: 0 0 0 0 rgba(0, 131, 143, 0.35);
  animation: tbPulse 1.3s infinite;
}
@keyframes tbPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 131, 143, 0.35);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 131, 143, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 131, 143, 0);
  }
}
.tb-sheet-count {
  font-size: 12px;
  font-weight: 900;
  color: white;
  background: linear-gradient(135deg, var(--accent-teal) 0%, #00838f 100%);
  padding: 6px 10px;
  border-radius: 999px;
}

.tb-sheet-controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 10px;
}
.tb-search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid var(--border-light);
  border-radius: 14px;
  padding: 10px 12px;
}
.tb-search i {
  color: var(--text-gray);
}
.tb-search-input {
  border: none;
  outline: none;
  width: 100%;
  font-weight: 800;
  font-size: 13px;
  color: var(--text-dark);
  background: transparent;
}
.tb-search-clear {
  border: none;
  background: transparent;
  color: var(--text-gray);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  cursor: pointer;
}
.tb-search-clear:active {
  transform: scale(0.92);
}

.tb-chips {
  display: flex;
  gap: 8px;
  overflow: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
}
.tb-chip {
  border: 2px solid var(--border-light);
  background: #fff;
  color: var(--text-dark);
  border-radius: 999px;
  padding: 8px 10px;
  font-weight: 900;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}
.tb-chip.active {
  border-color: rgba(0, 131, 143, 0.35);
  background: rgba(0, 131, 143, 0.1);
  color: var(--accent-teal);
}
.tb-chip:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tb-sheet-content {
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
  max-height: calc(74vh - 175px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
.tb-sheet-list {
  padding: 10px;
}
.tb-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tb-bus-row {
  background: white;
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.tb-bus-row:active {
  transform: scale(0.99);
}
.tb-bus-row.selected {
  border-color: rgba(30, 136, 229, 0.35);
  box-shadow: 0 14px 26px rgba(30, 136, 229, 0.12);
}
.tb-bus-badge {
  width: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-teal) 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  flex-shrink: 0;
  padding: 8px 0;
}
.tb-bus-badge.low {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
}
.tb-bus-badge.mid {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}
.tb-bus-badge.full {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}
.tb-bus-badge-top {
  font-size: 15px;
  line-height: 1;
}
.tb-bus-badge-sub {
  font-size: 10px;
  opacity: 0.9;
  margin-top: 4px;
}
.tb-bus-row-main {
  flex: 1;
  min-width: 0;
}
.tb-row-line1 {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.tb-bus-row-title {
  font-weight: 900;
  margin: 0;
  font-size: 14px;
  color: var(--text-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tb-row-line2 {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: var(--text-gray);
  font-weight: 800;
  font-size: 12px;
}
.tb-metric {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tb-muted {
  opacity: 0.85;
}
.tb-dotsep {
  opacity: 0.5;
}
.tb-bus-row-right {
  color: var(--border-medium);
  font-size: 18px;
  flex-shrink: 0;
  padding-top: 6px;
}

.tb-empty {
  padding: 22px 12px;
  border: 2px dashed var(--border-light);
  border-radius: 18px;
  text-align: center;
  color: var(--text-gray);
  font-weight: 800;
}
.tb-empty i {
  font-size: 22px;
  margin-bottom: 8px;
  color: var(--accent-teal);
}
.tb-empty-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
  flex-wrap: wrap;
}
.tb-footnote {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-gray);
  font-weight: 800;
  font-size: 12px;
  padding: 10px 12px;
  border: 2px solid var(--border-light);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
}

/* Leaflet markers */
.tb-leaflet-bus-icon {
  background: transparent;
  border: none;
}
.tb-leaflet-bus-pill {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #fff;
  border: 2px solid var(--accent-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.tb-leaflet-bus-pill i {
  color: var(--accent-teal);
  font-size: 18px;
}
.tb-leaflet-bus-pill.low {
  border-color: #16a34a;
}
.tb-leaflet-bus-pill.low i {
  color: #16a34a;
}
.tb-leaflet-bus-pill.mid {
  border-color: #f59e0b;
}
.tb-leaflet-bus-pill.mid i {
  color: #f59e0b;
}
.tb-leaflet-bus-pill.full {
  border-color: #ef4444;
}
.tb-leaflet-bus-pill.full i {
  color: #ef4444;
}
.tb-leaflet-bus-pill.selected {
  transform: scale(1.12);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  position: relative;
}
.tb-leaflet-bus-pill.selected::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  border: 2px solid currentColor;
  opacity: 0.22;
}
.tb-leaflet-user-icon {
  background: transparent;
  border: none;
}
.tb-leaflet-user-dot {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--primary-blue);
  border: 3px solid #fff;
  box-shadow: 0 6px 16px rgba(30, 136, 229, 0.25);
}

/* transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.list-enter-active,
.list-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.list-move {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
