<!-- src/pages/admin/LiveTrackingPage.vue (FULL UPDATED: terminal range circle on click) -->
<template>
  <div class="lt-page">
    <!-- Header -->
    <div class="lt-head">
      <div class="lt-head__left">
        <h1 class="lt-title">Live Tracking</h1>
        <p class="lt-sub">Monitor tracked buses in real-time.</p>
      </div>

      <div class="lt-head__right">
        <button class="lt-btn lt-btn--soft" type="button" @click="refreshOnce">
          <i class="fas fa-rotate"></i>
          <span>Refresh</span>
        </button>

        <button class="lt-btn lt-btn--primary" type="button" @click="fitAll">
          <i class="fas fa-location-crosshairs"></i>
          <span>Fit All</span>
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="lt-stats">
      <div class="lt-stat lt-stat--all">
        <div class="lt-stat__meta">
          <div class="lt-stat__label">All Buses</div>
          <div class="lt-stat__value">{{ uiBuses.length }}</div>
        </div>
        <div class="lt-stat__icon lt-stat__icon--blue"><i class="fas fa-bus"></i></div>
        <div class="lt-stat__bar lt-bar--blue"></div>
      </div>

      <div class="lt-stat lt-stat--online">
        <div class="lt-stat__meta">
          <div class="lt-stat__label">Online</div>
          <div class="lt-stat__value">{{ countBy("Online") }}</div>
        </div>
        <div class="lt-stat__icon lt-stat__icon--green"><i class="fas fa-wifi"></i></div>
        <div class="lt-stat__bar lt-bar--green"></div>
      </div>

      <div class="lt-stat lt-stat--warning">
        <div class="lt-stat__meta">
          <div class="lt-stat__label">Warning</div>
          <div class="lt-stat__value">{{ countBy("Warning") }}</div>
        </div>
        <div class="lt-stat__icon lt-stat__icon--orange"><i class="fas fa-triangle-exclamation"></i></div>
        <div class="lt-stat__bar lt-bar--orange"></div>
      </div>

      <div class="lt-stat lt-stat--offline">
        <div class="lt-stat__meta">
          <div class="lt-stat__label">Offline</div>
          <div class="lt-stat__value">{{ countBy("Offline") }}</div>
        </div>
        <div class="lt-stat__icon lt-stat__icon--red"><i class="fas fa-wifi-slash"></i></div>
        <div class="lt-stat__bar lt-bar--red"></div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="lt-tabs">
      <button class="lt-tab" :class="{ on: view === 'tracking' }" type="button" @click="view = 'tracking'">
        <i class="fas fa-location-dot"></i><span>Tracking</span>
      </button>
      <button class="lt-tab" :class="{ on: view === 'analytics' }" type="button" @click="view = 'analytics'">
        <i class="fas fa-chart-line"></i><span>Analytics</span>
      </button>
    </div>

    <!-- TRACKING VIEW -->
    <div class="lt-grid" v-if="view === 'tracking'">
      <!-- Map -->
      <section class="lt-card lt-map">
        <div class="lt-card__head">
          <div class="lt-card__title"><i class="fas fa-map"></i><span>Map</span></div>

          <div class="lt-map__controls">
            <button class="lt-iconbtn" type="button" title="Zoom in" @click="zoomIn"><i class="fas fa-plus"></i></button>
            <button class="lt-iconbtn" type="button" title="Zoom out" @click="zoomOut"><i class="fas fa-minus"></i></button>
            <button class="lt-iconbtn" type="button" title="My location" @click="centerOnMe">
              <i class="fas fa-location-arrow"></i>
            </button>
          </div>
        </div>

        <div class="lt-map__canvas" ref="mapEl">
          <div class="lt-legend">
            <div class="lt-legend__item"><span class="lt-dot ok"></span><span>Online</span></div>
            <div class="lt-legend__item"><span class="lt-dot warn"></span><span>Warning</span></div>
            <div class="lt-legend__item"><span class="lt-dot bad"></span><span>Offline</span></div>

            <div class="lt-legend__sep"></div>
            <div class="lt-legend__item"><span class="lt-dot term"></span><span>Terminal</span></div>
            <div class="lt-legend__item">
              <span class="lt-dot range"></span><span>Terminal range ({{ TERMINAL_RANGE_M }}m)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Panel -->
      <aside class="lt-card lt-panel">
        <div class="lt-card__head lt-panel__head">
          <div class="lt-panel__title">
            <i class="fas" :class="panelView === 'buses' ? 'fa-satellite-dish' : 'fa-map-location-dot'"></i>
            <span>{{ panelView === "buses" ? "Tracked Buses" : "Terminals" }}</span>

            <span class="lt-badge" v-if="panelView === 'buses'">{{ filteredBuses.length }}</span>
            <span class="lt-badge" v-else>{{ filteredTerminals.length }}</span>
          </div>

          <div class="lt-panel-switch">
            <button class="lt-switch" :class="{ on: panelView === 'buses' }" type="button" @click="panelView = 'buses'">
              <i class="fas fa-bus"></i><span>Buses</span>
            </button>

            <button
              class="lt-switch"
              :class="{ on: panelView === 'terminals' }"
              type="button"
              @click="panelView = 'terminals'"
            >
              <i class="fas fa-map-location-dot"></i><span>Terminals</span>
            </button>
          </div>
        </div>

        <div class="lt-panel__tools">
          <div class="lt-search">
            <i class="fas fa-search"></i>

            <input v-if="panelView === 'buses'" v-model="q" type="text" placeholder="Search bus..." />
            <input v-else v-model="tq" type="text" placeholder="Search terminal..." />

            <button
              v-if="panelView === 'buses' ? q : tq"
              class="lt-search__clear"
              type="button"
              @click="panelView === 'buses' ? (q = '') : (tq = '')"
              aria-label="Clear"
            >
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <div class="lt-filters" v-if="panelView === 'buses'">
            <button class="lt-pill" :class="{ on: filter === 'all' }" type="button" @click="filter = 'all'">All</button>
            <button class="lt-pill" :class="{ on: filter === 'online' }" type="button" @click="filter = 'online'">Online</button>
            <button class="lt-pill" :class="{ on: filter === 'warning' }" type="button" @click="filter = 'warning'">Warning</button>
            <button class="lt-pill" :class="{ on: filter === 'offline' }" type="button" @click="filter = 'offline'">Offline</button>
          </div>

          <div class="lt-term-hint" v-else>
            <i class="fas fa-circle-info"></i>
            Click a terminal to focus it and show its range.
          </div>
        </div>

        <!-- Bus list -->
        <div class="lt-list" v-if="panelView === 'buses'">
          <button
            v-for="b in filteredBuses"
            :key="b.id"
            class="lt-item"
            :class="{ on: selectedBus?.id === b.id }"
            type="button"
            @click="selectBus(b)"
          >
            <div class="lt-item__top">
              <div class="lt-item__left">
                <div class="lt-item__code">{{ b.code }}</div>

                <div class="lt-item__route">
                  {{ b.plate || "—" }}
                  <span class="lt-sep">•</span>
                  <span>{{ b.route || "Unknown route" }}</span>

                  <span class="lt-sep">•</span>
                  <span class="lt-occ">
                    <i class="fas fa-users"></i>
                    {{ b.passengerCount }} / {{ b.capacity || "—" }}
                    <span v-if="b.occPct != null">({{ b.occPct }}%)</span>
                  </span>
                </div>
              </div>

              <div class="lt-item__right">
                <div class="lt-speed">
                  <span class="lt-speed__num">{{ b.speed }}</span>
                  <span class="lt-speed__unit">km/h</span>
                </div>

                <span class="lt-status" :class="statusClass(b.status)">
                  <i class="fas" :class="statusIcon(b.status)"></i>
                  {{ b.status }}
                </span>
              </div>
            </div>

            <div class="lt-item__meta">
              <span class="lt-meta">
                <i class="fas fa-location-crosshairs"></i>
                {{ safeFixed(b.lat) }}, {{ safeFixed(b.lng) }}
              </span>
              <span class="lt-sep">•</span>
              <span class="lt-meta">
                <i class="fas fa-road"></i>
                {{ b.terminalAt ? "at terminal" : "on road" }}
                <span v-if="b.distM != null"> • {{ Math.round(b.distM) }}m</span>
              </span>
              <span class="lt-sep">•</span>
              <span class="lt-meta">
                <i class="fas fa-signal"></i>
                {{ b.signal }}
              </span>
              <span class="lt-sep">•</span>
              <span class="lt-meta">
                <i class="fas fa-clock"></i>
                {{ b.lastSeen }}
              </span>
              <span class="lt-sep">•</span>
              <span class="lt-meta">
                <i class="fas fa-satellite"></i>
                {{ b.gpsBadge }}
              </span>
            </div>
          </button>

          <div v-if="!filteredBuses.length" class="lt-empty-mini">
            <i class="fas fa-bus"></i>
            <p>No buses found</p>
            <small>Try another keyword or filter.</small>
          </div>
        </div>

        <!-- Terminal list -->
        <div class="lt-list" v-else>
          <button
            v-for="t in filteredTerminals"
            :key="t.terminal_id"
            class="lt-term-item"
            :class="{ on: selectedTerminal?.terminal_id === t.terminal_id }"
            type="button"
            @click="selectTerminal(t)"
          >
            <div class="lt-term-top">
              <div class="lt-term-left">
                <div class="lt-term-badge"><i class="fas fa-map-location-dot"></i></div>
                <div class="lt-term-meta">
                  <div class="lt-term-title">
                    <span class="lt-term-name">{{ t.terminal_name || "Terminal" }}</span>
                    <span class="lt-term-id">ID {{ t.terminal_id }}</span>
                  </div>
                  <div class="lt-term-sub">
                    <i class="fas fa-city"></i>
                    <span>{{ t.city || "—" }}</span>
                  </div>
                </div>
              </div>

              <div class="lt-term-right">
                <span class="lt-term-pill">
                  <i class="fas fa-bus"></i>
                  {{ Number(t.bus_count ?? 0) }}
                </span>
              </div>
            </div>

            <div class="lt-term-bottom">
              <span class="lt-meta">
                <i class="fas fa-location-crosshairs"></i>
                {{ safeFixed(t.lat) }}, {{ safeFixed(t.lng) }}
              </span>
              <span class="lt-sep">•</span>
              <span class="lt-meta">
                <i class="fas fa-bullseye"></i>
                {{ TERMINAL_RANGE_M }}m range
              </span>
              <span class="lt-sep">•</span>
              <span class="lt-meta">
                <i class="fas fa-clock"></i>
                {{ fmtTime(t.available_from) }} – {{ fmtTime(t.available_to) }}
              </span>
            </div>
          </button>

          <div v-if="!filteredTerminals.length" class="lt-empty-mini">
            <i class="fas fa-map-location-dot"></i>
            <p>No terminals found</p>
            <small>Try another keyword.</small>
          </div>
        </div>
      </aside>
    </div>

    <!-- ANALYTICS VIEW -->
    <div v-else class="lt-analytics">
      <div class="lt-card lt-ana-card">
        <div class="lt-card__head">
          <div class="lt-card__title"><i class="fas fa-chart-line"></i><span>Analytics</span></div>
        </div>
        <div class="lt-ana-body">
          <div class="lt-ana-title">Coming soon</div>
          <div class="lt-ana-sub">Place charts here later.</div>
        </div>
      </div>
    </div>

    <!-- Floating details: Bus -->
    <div v-if="selectedBus" class="lt-float">
      <div class="lt-float__left">
        <div class="lt-float__title">
          <i class="fas fa-bus"></i>
          <span>{{ selectedBus.code }}</span>

          <span class="lt-status" :class="statusClass(selectedBus.status)">
            <i class="fas" :class="statusIcon(selectedBus.status)"></i>
            {{ selectedBus.status }}
          </span>

          <span class="lt-mini-badge" :class="gpsBadgeClass(selectedBus.gpsState)">
            {{ selectedBus.gpsBadge }}
          </span>
        </div>

        <div class="lt-float__sub">
          {{ selectedBus.plate }} • {{ selectedBus.route || "Unknown route" }}
          <span class="lt-sep">•</span>
          <span class="muted">
            <i class="fas fa-users"></i>
            {{ selectedBus.passengerCount }} / {{ selectedBus.capacity || "—" }}
            <span v-if="selectedBus.occPct != null">({{ selectedBus.occPct }}%)</span>
          </span>
          <span class="lt-sep">•</span>
          <span class="muted">
            {{ selectedBus.terminalAt ? "at terminal" : "on road" }}
            <span v-if="selectedBus.distM != null"> • {{ Math.round(selectedBus.distM) }}m</span>
          </span>
        </div>
      </div>

      <div class="lt-float__right">
        <button class="lt-btn lt-btn--soft lt-btn--sm" type="button" @click="centerOnSelectedBus">
          <i class="fas fa-crosshairs"></i><span>Center</span>
        </button>
        <button class="lt-btn lt-btn--danger lt-btn--sm" type="button" @click="clearSelected">
          <i class="fas fa-xmark"></i><span>Close</span>
        </button>
      </div>
    </div>

    <!-- Floating details: Terminal -->
    <div v-if="selectedTerminal" class="lt-float lt-float--term">
      <div class="lt-float__left">
        <div class="lt-float__title">
          <i class="fas fa-map-location-dot"></i>
          <span>{{ selectedTerminal.terminal_name || "Terminal" }}</span>

          <span class="lt-mini-badge lt-mini-badge--term">
            <i class="fas fa-bus"></i>
            {{ Number(selectedTerminal.bus_count ?? 0) }}
          </span>
        </div>

        <div class="lt-float__sub">
          {{ selectedTerminal.city || "—" }}
          <span class="lt-sep">•</span>
          <span class="muted">{{ safeFixed(selectedTerminal.lat) }}, {{ safeFixed(selectedTerminal.lng) }}</span>
          <span class="lt-sep">•</span>
          <span class="muted">{{ fmtTime(selectedTerminal.available_from) }} – {{ fmtTime(selectedTerminal.available_to) }}</span>
          <span class="lt-sep">•</span>
          <span class="muted">
            <i class="fas fa-bullseye"></i>
            Range: {{ TERMINAL_RANGE_M }}m (inside terminal)
          </span>
        </div>
      </div>

      <div class="lt-float__right">
        <button class="lt-btn lt-btn--soft lt-btn--sm" type="button" @click="centerOnSelectedTerminal">
          <i class="fas fa-crosshairs"></i><span>Center</span>
        </button>
        <button class="lt-btn lt-btn--danger lt-btn--sm" type="button" @click="clearSelected">
          <i class="fas fa-xmark"></i><span>Close</span>
        </button>
      </div>
    </div>

    <div style="height: 14px"></div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useAdminLiveBuses } from "@/composables/useAdminLiveBuses";
import { useTerminals } from "@/composables/useTerminal"; // keep your path as-is

const view = ref("tracking");

/* right panel switch */
const panelView = ref("buses"); // "buses" | "terminals"

/* buses */
const q = ref("");
const filter = ref("all");
const selectedBus = ref(null);

/* terminals */
const tq = ref("");
const selectedTerminal = ref(null);

const mapEl = ref(null);
let map = null;
let myMarker = null;

/* markers */
const busMarkers = new Map(); // busId -> marker
const terminalMarkers = new Map(); // terminalId -> marker

const FALLBACK = { lat: 12.8797, lng: 121.774 };

/* =========================
   ✅ Terminal range settings
   - match your backend arrival_m default (120m)
========================= */
const TERMINAL_RANGE_M = 120;

// circle overlay for selected terminal
let terminalRangeCircle = null;

function clearTerminalRangeCircle() {
  if (terminalRangeCircle && map) {
    map.removeLayer(terminalRangeCircle);
  }
  terminalRangeCircle = null;
}

function drawTerminalRangeCircle(t) {
  if (!map || !t) return;

  const lat = Number(t.lat);
  const lng = Number(t.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  // remove old
  clearTerminalRangeCircle();

  // ✅ draw circle around terminal (radius meters)
  terminalRangeCircle = L.circle([lat, lng], {
    radius: TERMINAL_RANGE_M,
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.12,
  }).addTo(map);
}

/* ===== buses polling ===== */
const { buses, start, stop, fetchOnce } = useAdminLiveBuses({ intervalMs: 2000 });

/* ✅ NOW buses are already in UI shape */
const uiBuses = computed(() => buses.value || []);

/* ===== terminals polling ===== */
const { rows: terminals, fetchTerminals } = useTerminals();
let terminalPoll = null;

async function loadTerminalsOnce() {
  await fetchTerminals({ q: "" });
  await nextTick();
  syncTerminalMarkers();
}

/* =========================
   Computed lists (use uiBuses)
========================= */
const filteredBuses = computed(() => {
  const keyword = q.value.trim().toLowerCase();

  return uiBuses.value
    .filter((b) => {
      if (!keyword) return true;
      const hay = [
        b.code,
        b.plate,
        b.route,
        b.status,
        b.gpsBadge,
        b.signal,
        b.passengerCount,
        b.capacity,
        b.occPct,
        b.terminalAt ? "terminal" : "road",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(keyword);
    })
    .filter((b) => {
      if (filter.value === "all") return true;
      if (filter.value === "online") return b.status === "Online";
      if (filter.value === "warning") return b.status === "Warning";
      if (filter.value === "offline") return b.status === "Offline";
      return true;
    });
});

const filteredTerminals = computed(() => {
  const keyword = tq.value.trim().toLowerCase();
  const list = terminals.value || [];

  return list.filter((t) => {
    if (!keyword) return true;
    const hay = [t.terminal_name, t.city, t.terminal_id].join(" ").toLowerCase();
    return hay.includes(keyword);
  });
});

/* =========================
   Utils
========================= */
function safeFixed(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(5);
}
function fmtTime(v) {
  const s = String(v || "");
  if (!s) return "—";
  return s.slice(0, 5);
}
function countBy(status) {
  return uiBuses.value.filter((b) => b.status === status).length;
}

function clearSelected() {
  selectedBus.value = null;
  selectedTerminal.value = null;
  clearTerminalRangeCircle(); // ✅ remove range ring
  refreshAllMarkerIcons();
}

function selectBus(b) {
  selectedTerminal.value = null;
  clearTerminalRangeCircle(); // ✅ remove terminal ring when selecting bus
  selectedBus.value = b;
  panelView.value = "buses";
  refreshAllMarkerIcons();
  centerOnSelectedBus();
}

function selectTerminal(t) {
  selectedBus.value = null;
  selectedTerminal.value = t;
  panelView.value = "terminals";
  refreshAllMarkerIcons();
  drawTerminalRangeCircle(t); // ✅ show range ring
  centerOnSelectedTerminal();
}

function statusClass(status) {
  if (status === "Online") return "ok";
  if (status === "Warning") return "warn";
  return "bad";
}
function statusIcon(status) {
  if (status === "Online") return "fa-circle-check";
  if (status === "Warning") return "fa-triangle-exclamation";
  return "fa-circle-xmark";
}

/* GPS badge color */
function gpsBadgeClass(gpsState) {
  const s = String(gpsState || "").toLowerCase();
  if (s === "active") return "ok";
  if (s === "searching") return "warn";
  if (s === "disconnected") return "bad";
  if (s === "disabled") return "muted";
  return "warn";
}

/* =========================
   Leaflet icons
========================= */
function makeBusDivIcon(bus, isSelected = false) {
  const st = statusClass(bus.status);
  const sel = isSelected ? "selected" : "";
  return L.divIcon({
    className: "lt-leaflet-bus-icon",
    html: `
      <button class="lt-leaflet-bus-pill ${st} ${sel}" type="button" aria-label="bus">
        <i class="fas fa-bus"></i>
      </button>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

/* ✅ Terminal icon marker */
function makeTerminalDivIcon(isSelected = false) {
  const sel = isSelected ? "selected" : "";
  return L.divIcon({
    className: "lt-leaflet-term-icon",
    html: `
      <button class="lt-term-marker ${sel}" type="button" aria-label="terminal">
        <span class="lt-term-ring"></span>

        <span class="lt-term-sign">
          <i class="fas fa-building"></i>
        </span>

        <span class="lt-term-base">
          <span class="lt-term-door"></span>
          <span class="lt-term-window w1"></span>
          <span class="lt-term-window w2"></span>
        </span>

        <span class="lt-term-shadow"></span>
      </button>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 36],
  });
}

function makeMyDivIcon() {
  return L.divIcon({
    className: "lt-leaflet-me-icon",
    html: `<div class="lt-leaflet-me-dot"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

/* =========================
   Leaflet init + sync
========================= */
function initLeaflet() {
  if (!mapEl.value || map) return;

  map = L.map(mapEl.value, { zoomControl: false, attributionControl: false, tap: true }).setView(
    [FALLBACK.lat, FALLBACK.lng],
    6
  );

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 20 }).addTo(map);

  map.on("click", () => {
    selectedBus.value = null;
    selectedTerminal.value = null;
    clearTerminalRangeCircle(); // ✅ hide range when clicking empty map
    refreshAllMarkerIcons();
  });

  requestAnimationFrame(() => map?.invalidateSize());
  setTimeout(() => map?.invalidateSize(), 350);
}

/* ===== Buses markers ===== */
function addOrUpdateBusMarker(bus) {
  if (!map) return;
  if (!Number.isFinite(Number(bus.lat)) || !Number.isFinite(Number(bus.lng))) return;

  const pos = [Number(bus.lat), Number(bus.lng)];
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

function removeBusMarker(id) {
  const m = busMarkers.get(id);
  if (m && map) map.removeLayer(m);
  busMarkers.delete(id);
}

/* ===== Terminals markers ===== */
function addOrUpdateTerminalMarker(t) {
  if (!map) return;

  const id = t.terminal_id;
  const lat = Number(t.lat);
  const lng = Number(t.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  const pos = [lat, lng];
  const existing = terminalMarkers.get(id);

  if (existing) {
    existing.setLatLng(pos);
    existing.setIcon(makeTerminalDivIcon(selectedTerminal.value?.terminal_id === id));
    return;
  }

  const m = L.marker(pos, { icon: makeTerminalDivIcon(selectedTerminal.value?.terminal_id === id) }).addTo(map);
  m.on("click", () => selectTerminal(t));
  terminalMarkers.set(id, m);
}

function removeTerminalMarker(id) {
  const m = terminalMarkers.get(id);
  if (m && map) map.removeLayer(m);
  terminalMarkers.delete(id);
}

function refreshAllMarkerIcons() {
  // buses
  for (const b of uiBuses.value) {
    const m = busMarkers.get(b.id);
    if (!m) continue;
    m.setIcon(makeBusDivIcon(b, selectedBus.value?.id === b.id));
  }

  // terminals
  const list = terminals.value || [];
  for (const t of list) {
    const m = terminalMarkers.get(t.terminal_id);
    if (!m) continue;
    m.setIcon(makeTerminalDivIcon(selectedTerminal.value?.terminal_id === t.terminal_id));
  }
}

function syncBusMarkers() {
  if (!map) return;

  const nextIds = new Set(uiBuses.value.map((b) => b.id));
  for (const id of busMarkers.keys()) {
    if (!nextIds.has(id)) removeBusMarker(id);
  }

  uiBuses.value.forEach(addOrUpdateBusMarker);

  if (selectedBus.value) {
    const updated = uiBuses.value.find((x) => x.id === selectedBus.value.id);
    if (updated) selectedBus.value = updated;
  }

  refreshAllMarkerIcons();
}

function syncTerminalMarkers() {
  if (!map) return;

  const list = terminals.value || [];
  const nextIds = new Set(list.map((t) => t.terminal_id));

  for (const id of terminalMarkers.keys()) {
    if (!nextIds.has(id)) removeTerminalMarker(id);
  }

  list.forEach(addOrUpdateTerminalMarker);

  if (selectedTerminal.value) {
    const updated = list.find((x) => x.terminal_id === selectedTerminal.value.terminal_id);
    if (updated) selectedTerminal.value = updated;

    // ✅ keep range circle updated after polling
    drawTerminalRangeCircle(selectedTerminal.value);
  }

  refreshAllMarkerIcons();
}

/* watch buses changes */
watch(buses, () => syncBusMarkers(), { deep: true });

/* watch terminals changes */
watch(
  terminals,
  async () => {
    await nextTick();
    syncTerminalMarkers();
  },
  { deep: true }
);

/* =========================
   Map actions
========================= */
function fitAll() {
  if (!map) return;

  const pts = [];

  uiBuses.value.forEach((b) => {
    const lat = Number(b.lat);
    const lng = Number(b.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) pts.push([lat, lng]);
  });

  (terminals.value || []).forEach((t) => {
    const lat = Number(t.lat);
    const lng = Number(t.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) pts.push([lat, lng]);
  });

  if (!pts.length) return;
  map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
}

function centerOnSelectedBus() {
  if (!map || !selectedBus.value) return;
  map.flyTo([Number(selectedBus.value.lat), Number(selectedBus.value.lng)], Math.max(map.getZoom(), 16), {
    duration: 0.5,
  });
}

function centerOnSelectedTerminal() {
  if (!map || !selectedTerminal.value) return;
  map.flyTo([Number(selectedTerminal.value.lat), Number(selectedTerminal.value.lng)], Math.max(map.getZoom(), 15), {
    duration: 0.5,
  });
}

function zoomIn() {
  map?.zoomIn();
}
function zoomOut() {
  map?.zoomOut();
}

function refreshOnce() {
  fetchOnce();
  loadTerminalsOnce();
}

function centerOnMe() {
  if (!map) return;
  if (!navigator.geolocation) return alert("Geolocation not supported.");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (!myMarker) myMarker = L.marker([lat, lng], { icon: makeMyDivIcon(), interactive: false }).addTo(map);
      else myMarker.setLatLng([lat, lng]);

      map.flyTo([lat, lng], 15, { duration: 0.6 });
    },
    () => alert("Location blocked/unavailable."),
    { enableHighAccuracy: true, timeout: 12000 }
  );
}

/* =========================
   Lifecycle
========================= */
onMounted(async () => {
  initLeaflet();

  start();
  await fetchOnce();

  await loadTerminalsOnce();
  terminalPoll = setInterval(loadTerminalsOnce, 8000);

  await nextTick();
  syncBusMarkers();
  syncTerminalMarkers();
  setTimeout(() => map?.invalidateSize(), 350);
});

onUnmounted(() => {
  stop();
  if (terminalPoll) clearInterval(terminalPoll);

  // ✅ cleanup range circle
  clearTerminalRangeCircle();

  if (map) {
    map.off();
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
/* ONLY ADDITIONS */
.lt-occ{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  font-weight: 700;
  color: #0f172a;
}
.lt-occ i{ color: #64748b; }

/* legend range dot */
.lt-dot.range{ background: rgba(14,165,233,0.35); border: 1px solid rgba(14,165,233,0.65); }

/* =========================================================
   LIVE TRACKING (your exact design) + TERMINAL ICON MARKER
========================================================= */

.lt-page{
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f0f9ff 100%);
  min-height: calc(100vh - 64px);
}

/* Header */
.lt-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.lt-title{
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}
.lt-sub{
  margin: 6px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}
.lt-head__right{
  display:flex;
  gap: 10px;
  align-items:center;
  flex-wrap: wrap;
}

/* Buttons */
.lt-btn{
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background:#fff;
  font-weight: 600;
  font-size: 13px;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  cursor:pointer;
  color: #334155;
  transition: all 0.2s ease;
}
.lt-btn:hover{
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}
.lt-btn:active{ transform: scale(.98); }
.lt-btn--primary{
  border: 0;
  color:#fff;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}
.lt-btn--primary:hover{
  background: linear-gradient(135deg, #2563eb, #0891b2);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}
.lt-btn--soft{
  background:#fff;
}
.lt-btn--danger{
  border-color: rgba(239,68,68,0.25);
  background: rgba(239,68,68,0.08);
  color: rgba(239,68,68,0.95);
}
.lt-btn--danger:hover{ background: rgba(239,68,68,0.12); }
.lt-btn--sm{ height: 32px; border-radius: 10px; }

/* Stats */
.lt-stats{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.lt-stat{
  position: relative;
  background: rgba(255,255,255,0.7);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  overflow:hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  min-height: 100px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  transition: all 0.2s ease;
}
.lt-stat:hover{
  background: rgba(255,255,255,0.9);
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.lt-stat__label{
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}
.lt-stat__value{
  margin-top: 6px;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}
.lt-stat__icon{
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  border: none;
}
.lt-stat__icon i{ font-size: 20px; }
.lt-stat__bar{
  position:absolute;
  left:0; right:0; bottom:0;
  height: 4px;
  opacity: 1;
}
.lt-stat__icon--blue{ background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1)); color: #2563eb; }
.lt-stat__icon--green{ background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1)); color: #16a34a; }
.lt-stat__icon--orange{ background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(234, 88, 12, 0.1)); color: #ea580c; }
.lt-stat__icon--red{ background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1)); color: #dc2626; }

.lt-bar--blue{ background: #3b82f6; }
.lt-bar--green{ background: #16a34a; }
.lt-bar--orange{ background: #fb923c; }
.lt-bar--red{ background: #ef4444; }

/* Tabs */
.lt-tabs{
  display:flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}
.lt-tab{
  height: 40px;
  padding: 0 16px;
  border-radius: 0;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  cursor:pointer;
  transition: all 0.2s ease;
}
.lt-tab:hover{ color: #334155; }
.lt-tab.on{
  border-bottom-color: #3b82f6;
  color: #3b82f6;
}

/* Grid */
.lt-grid{
  display:grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 16px;
  align-items:start;
  height: calc(100vh - 450px);
}

/* Card base */
.lt-card{
  background: rgba(255,255,255,0.6);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow:hidden;
  backdrop-filter: blur(8px);
}
.lt-card:hover{
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.lt-card__head{
  padding: 12px 14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  border-bottom: 1px solid #e2e8f0;
  background: transparent;
}
.lt-card__title{
  display:flex;
  align-items:center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  color: #0f172a;
}

/* Map */
.lt-map__controls{ display:flex; gap: 8px; }
.lt-iconbtn{
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background:#fff;
  cursor:pointer;
  color: #475569;
  transition: all 0.2s ease;
}
.lt-iconbtn:hover{
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}
.lt-map__canvas{
  position: relative;
  min-height: 420px;
}
.lt-map__canvas :global(.leaflet-container){
  width: 100% !important;
  height: 100% !important;
}

/* Legend */
.lt-legend{
  position:absolute;
  left: 14px;
  bottom: 14px;
  background: rgba(255,255,255,0.85);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  display:flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  backdrop-filter: blur(8px);
  z-index: 500;
}
.lt-legend__item{
  display:flex;
  align-items:center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}
.lt-legend__sep{
  height: 1px;
  background: #e2e8f0;
  margin: 2px 0;
}
.lt-dot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.lt-dot.ok{ background: #16a34a; }
.lt-dot.warn{ background: #fb923c; }
.lt-dot.bad{ background: #ef4444; }
.lt-dot.term{ background: #0ea5e9; }

/* Panel */
.lt-panel{
  display:flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
}
.lt-panel__head{
  align-items:flex-start;
}
.lt-panel__title{
  display:flex;
  align-items:center;
  gap: 8px;
  font-weight: 700;
  color: #0f172a;
  font-size: 13px;
}
.lt-badge{
  margin-left: 6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border: 1px solid #bfdbfe;
  background: #dbeafe;
  color: #1e40af;
}
.lt-panel-switch{
  display:flex;
  gap: 8px;
  align-items:center;
  flex-wrap: wrap;
}
.lt-switch{
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: rgba(255,255,255,0.7);
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  gap: 6px;
  transition: all 0.2s ease;
}
.lt-switch:hover{
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}
.lt-switch.on{
  border-color: #3b82f6;
  background: #dbeafe;
  color: #1e40af;
}

.lt-panel__tools{
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  background: transparent;
}

/* search */
.lt-search{
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  display:flex;
  align-items:center;
  gap: 8px;
  padding: 0 12px;
  transition: all 0.2s ease;
}
.lt-search i{ font-size: 14px; color: #94a3b8; }
.lt-search input{
  flex:1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
}
.lt-search input::placeholder{ color: #94a3b8; }
.lt-search:focus-within{
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background:#fff;
}
.lt-search__clear{
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border:none;
  background: transparent;
  cursor:pointer;
  color: #64748b;
  transition: all 0.2s ease;
}
.lt-search__clear:hover{
  background: rgba(0,0,0,0.05);
  color: #334155;
}

/* pills */
.lt-filters{
  margin-top: 10px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.lt-pill{
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background:#fff;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor:pointer;
  transition: all 0.2s ease;
}
.lt-pill:hover{
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}
.lt-pill.on{
  border-color: #3b82f6;
  background: #dbeafe;
  color: #1e40af;
}
.lt-term-hint{
  margin-top: 10px;
  display:flex;
  gap: 8px;
  align-items:center;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

/* list base */
.lt-list{
  padding: 8px;
  display:flex;
  flex-direction: column;
  gap: 8px;
  overflow:auto;
  flex: 1;
}

/* bus item */
.lt-item{
  width: 100%;
  text-align:left;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: rgba(255,255,255,0.5);
  padding: 12px;
  cursor:pointer;
  transition: all 0.2s ease;
}
.lt-item:hover{
  background: rgba(59, 130, 246, 0.05);
  border-color: #cbd5e1;
}
.lt-item.on{
  background: #dbeafe;
  border-color: #3b82f6;
}
.lt-item__top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
}
.lt-item__code{
  font-weight: 700;
  font-size: 13px;
  color: #0f172a;
}
.lt-item__route{
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  display:flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items:center;
}
.lt-item__right{
  text-align:right;
  display:flex;
  flex-direction: column;
  align-items:flex-end;
  gap: 6px;
  flex-shrink:0;
}
.lt-speed{
  display:flex;
  align-items:baseline;
  gap: 6px;
}
.lt-speed__num{ font-size: 16px; font-weight: 800; color: #0f172a; }
.lt-speed__unit{ font-size: 11px; font-weight: 600; color: #64748b; }

.lt-status{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  white-space: nowrap;
}
.lt-status.ok{
  color: #166534;
  border-color: #86efac;
  background: #dcfce7;
}
.lt-status.warn{
  color: #92400e;
  border-color: #fcd34d;
  background: #fef3c7;
}
.lt-status.bad{
  color: #991b1b;
  border-color: #fca5a5;
  background: #fee2e2;
}

.lt-item__meta{
  margin-top: 10px;
  display:flex;
  align-items:center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
}
.lt-meta{
  display:inline-flex;
  align-items:center;
  gap: 6px;
}
.lt-sep{ color: #cbd5e1; }

/* terminal list item */
.lt-term-item{
  width: 100%;
  text-align:left;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: rgba(255,255,255,0.5);
  padding: 12px;
  cursor:pointer;
  transition: all 0.2s ease;
}
.lt-term-item:hover{
  background: rgba(14, 165, 233, 0.06);
  border-color: #cbd5e1;
}
.lt-term-item.on{
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(14, 165, 233, 0.55);
}
.lt-term-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
}
.lt-term-left{
  display:flex;
  gap: 10px;
  align-items:flex-start;
}
.lt-term-badge{
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: linear-gradient(135deg, rgba(14,165,233,0.16), rgba(6,182,212,0.10));
  color: #0284c7;
  flex-shrink:0;
}
.lt-term-meta{ min-width: 0; }
.lt-term-title{
  display:flex;
  align-items:baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.lt-term-name{
  font-weight: 800;
  font-size: 13px;
  color: #0f172a;
}
.lt-term-id{
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  background: rgba(148,163,184,0.18);
  border: 1px solid rgba(148,163,184,0.30);
  padding: 3px 8px;
  border-radius: 999px;
}
.lt-term-sub{
  margin-top: 4px;
  display:flex;
  gap: 6px;
  align-items:center;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}
.lt-term-right{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  flex-shrink:0;
}
.lt-term-pill{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(14,165,233,0.35);
  background: rgba(14,165,233,0.10);
  color: #0369a1;
  font-weight: 800;
  font-size: 11px;
}
.lt-term-bottom{
  margin-top: 10px;
  display:flex;
  gap: 8px;
  align-items:center;
  flex-wrap: wrap;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}
.lt-empty-mini{
  padding: 18px 10px;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  background: rgba(255,255,255,0.35);
  text-align:center;
  color: #64748b;
}
.lt-empty-mini i{ font-size: 18px; color: #0ea5e9; }
.lt-empty-mini p{ margin: 8px 0 2px; font-weight: 800; color: #0f172a; }
.lt-empty-mini small{ font-weight: 600; }

/* Floating */
.lt-float{
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255,255,255,0.95);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 14px 16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 16px;
  backdrop-filter: blur(10px);
  z-index: 50;
}
.lt-float__title{
  display:flex;
  align-items:center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  color: #0f172a;
}
.lt-float__sub{
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}
.lt-mini-badge{
  margin-left: 8px;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
}
.lt-mini-badge.ok{
  color: #166534;
  border-color: #86efac;
  background: #dcfce7;
}
.lt-mini-badge.warn{
  color: #92400e;
  border-color: #fcd34d;
  background: #fef3c7;
}
.lt-mini-badge.bad{
  color: #991b1b;
  border-color: #fca5a5;
  background: #fee2e2;
}
.lt-mini-badge.muted{
  color: #64748b;
  border-color: #e2e8f0;
  background: #f8fafc;
}
.lt-mini-badge--term{
  border-color: rgba(14,165,233,0.35);
  background: rgba(14,165,233,0.10);
  color: #0369a1;
}
.lt-float__right{
  display:flex;
  align-items:center;
  gap: 8px;
  flex-wrap: wrap;
}
.muted{ color: #64748b; }

/* ===== Leaflet bus marker ===== */
:global(.lt-leaflet-bus-icon){
  background: transparent !important;
  border: none !important;
}
:global(.lt-leaflet-bus-pill){
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 2px solid #06b6d4;
  background: rgba(255,255,255,0.96);
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow: 0 10px 22px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
:global(.lt-leaflet-bus-pill i){
  color:#06b6d4;
  font-size: 18px;
}
:global(.lt-leaflet-bus-pill.ok){ border-color:#16a34a; }
:global(.lt-leaflet-bus-pill.ok i){ color:#16a34a; }
:global(.lt-leaflet-bus-pill.warn){ border-color:#fb923c; }
:global(.lt-leaflet-bus-pill.warn i){ color:#fb923c; }
:global(.lt-leaflet-bus-pill.bad){ border-color:#ef4444; }
:global(.lt-leaflet-bus-pill.bad i){ color:#ef4444; }
:global(.lt-leaflet-bus-pill.selected){
  transform: scale(1.12);
  box-shadow: 0 14px 30px rgba(0,0,0,0.18);
}

/* ===== Leaflet terminal marker (REAL TERMINAL ICON) ===== */
:global(.lt-leaflet-term-icon){
  background: transparent !important;
  border: none !important;
}
:global(.leaflet-marker-pane .lt-leaflet-term-icon){
  z-index: 700 !important;
}

:global(.lt-term-marker){
  width: 44px;
  height: 44px;
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transform: translateZ(0);
}

:global(.lt-term-ring){
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: radial-gradient(circle at 50% 50%,
    rgba(14,165,233,0.28) 0%,
    rgba(14,165,233,0.10) 45%,
    rgba(14,165,233,0.00) 70%
  );
  filter: blur(0.2px);
}

:global(.lt-term-sign){
  position: absolute;
  left: 50%;
  top: -2px;
  transform: translateX(-50%);
  height: 18px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(14,165,233,0.45);
  background: rgba(255,255,255,0.95);
  color: #0284c7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 18px rgba(0,0,0,0.10);
  font-size: 12px;
}

:global(.lt-term-base){
  position: absolute;
  left: 50%;
  top: 14px;
  transform: translateX(-50%);
  width: 28px;
  height: 22px;
  border-radius: 8px;
  border: 2px solid rgba(14,165,233,0.60);
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,245,249,0.90));
  box-shadow: 0 14px 22px rgba(0,0,0,0.14);
}
:global(.lt-term-base::before){
  content: "";
  position: absolute;
  left: -3px;
  right: -3px;
  top: -7px;
  height: 10px;
  border-radius: 10px;
  border: 2px solid rgba(14,165,233,0.60);
  background: rgba(255,255,255,0.95);
}
:global(.lt-term-door){
  position: absolute;
  left: 50%;
  bottom: 3px;
  transform: translateX(-50%);
  width: 8px;
  height: 10px;
  border-radius: 3px;
  background: rgba(2,132,199,0.25);
  border: 1px solid rgba(2,132,199,0.35);
}
:global(.lt-term-window){
  position: absolute;
  top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: rgba(14,165,233,0.16);
  border: 1px solid rgba(14,165,233,0.30);
}
:global(.lt-term-window.w1){ left: 5px; }
:global(.lt-term-window.w2){ right: 5px; }

:global(.lt-term-shadow){
  position: absolute;
  left: 50%;
  bottom: 2px;
  transform: translateX(-50%);
  width: 28px;
  height: 8px;
  border-radius: 999px;
  background: rgba(15,23,42,0.12);
  filter: blur(2px);
}

:global(.lt-term-marker.selected .lt-term-ring){
  background: radial-gradient(circle at 50% 50%,
    rgba(34,197,94,0.30) 0%,
    rgba(34,197,94,0.10) 45%,
    rgba(34,197,94,0.00) 70%
  );
}
:global(.lt-term-marker.selected .lt-term-sign){
  border-color: rgba(34,197,94,0.55);
  color: #16a34a;
}
:global(.lt-term-marker.selected .lt-term-base){
  border-color: rgba(34,197,94,0.65);
}
:global(.lt-term-marker.selected .lt-term-base::before){
  border-color: rgba(34,197,94,0.65);
}

/* my marker */
:global(.lt-leaflet-me-icon){
  background: transparent !important;
  border: none !important;
}
:global(.lt-leaflet-me-dot){
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #3b82f6;
  border: 3px solid #fff;
  box-shadow: 0 6px 16px rgba(59,130,246,0.25);
}

/* Responsive */
@media (max-width: 1100px){
  .lt-grid{
    grid-template-columns: 1fr;
    height: auto;
  }
  .lt-panel{ min-height: 420px; }
  .lt-map__canvas{ min-height: 400px; }
}
@media (max-width: 980px){
  .lt-head{ flex-direction: column; align-items: stretch; }
  .lt-head__right{ justify-content:flex-start; }
  .lt-stats{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lt-float{
    position: relative;
    bottom: auto;
    right: auto;
    margin: 12px auto;
    width: 90%;
    flex-direction: column;
    align-items: stretch;
  }
  .lt-float__right{ justify-content:flex-start; }
}
@media (max-width: 520px){
  .lt-stats{ grid-template-columns: 1fr; }
  .lt-head__right { flex-direction: column; }
  .lt-btn { width: 100%; }
  .lt-panel-switch{ width: 100%; }
  .lt-switch{ flex: 1; justify-content:center; }
}
</style>