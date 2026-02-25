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
          <div class="lt-stat__value">{{ buses.length }}</div>
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
          </div>
        </div>
      </section>

      <!-- Panel -->
      <aside class="lt-card lt-panel">
        <div class="lt-card__head lt-panel__head">
          <div class="lt-panel__title">
            <i class="fas fa-satellite-dish"></i>
            <span>Tracked Buses</span>
            <span class="lt-badge">{{ filtered.length }}</span>
          </div>
        </div>

        <div class="lt-panel__tools">
          <div class="lt-search">
            <i class="fas fa-search"></i>
            <input v-model="q" type="text" placeholder="Search bus..." />
            <button v-if="q" class="lt-search__clear" type="button" @click="q = ''" aria-label="Clear">
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <div class="lt-filters">
            <button class="lt-pill" :class="{ on: filter === 'all' }" type="button" @click="filter = 'all'">All</button>
            <button class="lt-pill" :class="{ on: filter === 'online' }" type="button" @click="filter = 'online'">Online</button>
            <button class="lt-pill" :class="{ on: filter === 'warning' }" type="button" @click="filter = 'warning'">Warning</button>
            <button class="lt-pill" :class="{ on: filter === 'offline' }" type="button" @click="filter = 'offline'">Offline</button>
          </div>
        </div>

        <div class="lt-list">
          <button
            v-for="b in filtered"
            :key="b.id"
            class="lt-item"
            :class="{ on: selected?.id === b.id }"
            type="button"
            @click="selectBus(b)"
          >
            <div class="lt-item__top">
              <div class="lt-item__left">
                <div class="lt-item__code">{{ b.code }}</div>
                <div class="lt-item__route">{{ b.plate }} • {{ b.route }}</div>
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
                <i class="fas fa-signal"></i>
                {{ b.signal }}
              </span>
              <span class="lt-sep">•</span>
              <span class="lt-meta">
                <i class="fas fa-clock"></i>
                {{ b.lastSeen }}
              </span>

              <!-- ✅ GPS badge from iot_devices.gps_state -->
              <span class="lt-sep">•</span>
              <span class="lt-meta">
                <i class="fas fa-satellite"></i>
                {{ b.gpsBadge }}
              </span>
            </div>
          </button>
        </div>
      </aside>
    </div>

    <!-- Analytics -->
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

    <!-- Floating details -->
    <div v-if="selected" class="lt-float">
      <div class="lt-float__left">
        <div class="lt-float__title">
          <i class="fas fa-bus"></i>
          <span>{{ selected.code }}</span>

          <span class="lt-status" :class="statusClass(selected.status)">
            <i class="fas" :class="statusIcon(selected.status)"></i>
            {{ selected.status }}
          </span>

          <!-- ✅ gps badge color based on gpsState -->
          <span class="lt-mini-badge" :class="gpsBadgeClass(selected.gpsState)">
            {{ selected.gpsBadge }}
          </span>
        </div>
        <div class="lt-float__sub">
          {{ selected.plate }} • {{ selected.route }}
          <span v-if="selected.driver"> • <span class="muted">Driver:</span> {{ selected.driver }}</span>
        </div>
      </div>

      <div class="lt-float__right">
        <button class="lt-btn lt-btn--soft lt-btn--sm" type="button" @click="centerOnSelected">
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

const view = ref("tracking");
const q = ref("");
const filter = ref("all");
const selected = ref(null);

const mapEl = ref(null);
let map = null;
let myMarker = null;
const busMarkers = new Map();

const FALLBACK = { lat: 12.8797, lng: 121.774 };
const { buses, start, stop, fetchOnce } = useAdminLiveBuses({ intervalMs: 2000 });

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase();

  return buses.value
    .filter((b) => {
      if (!keyword) return true;
      const hay = [b.code, b.plate, b.route, b.driver, b.status, b.gpsBadge].join(" ").toLowerCase();
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

function safeFixed(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(5);
}

function countBy(status) {
  return buses.value.filter((b) => b.status === status).length;
}

function selectBus(b) {
  selected.value = b;
  refreshAllMarkerIcons();
  centerOnSelected();
}
function clearSelected() {
  selected.value = null;
  refreshAllMarkerIcons();
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

/* Leaflet icons */
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
function makeMyDivIcon() {
  return L.divIcon({
    className: "lt-leaflet-me-icon",
    html: `<div class="lt-leaflet-me-dot"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function initLeaflet() {
  if (!mapEl.value || map) return;

  map = L.map(mapEl.value, { zoomControl: false, attributionControl: false, tap: true })
    .setView([FALLBACK.lat, FALLBACK.lng], 6);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 20 }).addTo(map);

  map.on("click", () => {
    selected.value = null;
    refreshAllMarkerIcons();
  });

  requestAnimationFrame(() => map?.invalidateSize());
  setTimeout(() => map?.invalidateSize(), 350);
}

function addOrUpdateBusMarker(bus) {
  if (!map) return;
  if (!Number.isFinite(Number(bus.lat)) || !Number.isFinite(Number(bus.lng))) return;

  const pos = [Number(bus.lat), Number(bus.lng)];
  const existing = busMarkers.get(bus.id);

  if (existing) {
    existing.setLatLng(pos);
    existing.setIcon(makeBusDivIcon(bus, selected.value?.id === bus.id));
    return;
  }

  const m = L.marker(pos, { icon: makeBusDivIcon(bus, selected.value?.id === bus.id) }).addTo(map);
  m.on("click", () => selectBus(bus));
  busMarkers.set(bus.id, m);
}

function removeMarker(id) {
  const m = busMarkers.get(id);
  if (m && map) map.removeLayer(m);
  busMarkers.delete(id);
}

function refreshAllMarkerIcons() {
  for (const b of buses.value) {
    const m = busMarkers.get(b.id);
    if (!m) continue;
    m.setIcon(makeBusDivIcon(b, selected.value?.id === b.id));
  }
}

function syncMarkersToBuses() {
  if (!map) return;

  const nextIds = new Set(buses.value.map((b) => b.id));
  for (const id of busMarkers.keys()) {
    if (!nextIds.has(id)) removeMarker(id);
  }

  buses.value.forEach(addOrUpdateBusMarker);
  refreshAllMarkerIcons();

  if (selected.value) {
    const updated = buses.value.find((x) => x.id === selected.value.id);
    if (updated) selected.value = updated;
  }
}

watch(buses, () => syncMarkersToBuses(), { deep: true });

function fitAll() {
  if (!map) return;

  const pts = buses.value
    .filter((b) => Number.isFinite(Number(b.lat)) && Number.isFinite(Number(b.lng)))
    .map((b) => [Number(b.lat), Number(b.lng)]);

  if (!pts.length) return;
  map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
}

function centerOnSelected() {
  if (!map || !selected.value) return;
  map.flyTo([Number(selected.value.lat), Number(selected.value.lng)], Math.max(map.getZoom(), 16), { duration: 0.5 });
}

function zoomIn() { map?.zoomIn(); }
function zoomOut() { map?.zoomOut(); }

function refreshOnce() { fetchOnce(); }

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

onMounted(async () => {
  initLeaflet();
  start();
  await fetchOnce();
  await nextTick();
  syncMarkersToBuses();
  setTimeout(() => map?.invalidateSize(), 350);
});

onUnmounted(() => {
  stop();
  if (map) {
    map.off();
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
/* =========================================================
   LIVE TRACKING (your exact design)
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
  z-index: 500; /* above leaflet tiles */
}
.lt-legend__item{
  display:flex;
  align-items:center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}
.lt-dot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.lt-dot.ok{ background: #16a34a; }
.lt-dot.warn{ background: #fb923c; }
.lt-dot.bad{ background: #ef4444; }

/* Panel */
.lt-panel{
  display:flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
}
.lt-panel__head{ align-items:flex-start; }
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

/* list */
.lt-list{
  padding: 8px;
  display:flex;
  flex-direction: column;
  gap: 8px;
  overflow:auto;
  flex: 1;
}
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
  font-weight: 500;
  color: #64748b;
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

/* Analytics */
.lt-ana-body{
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
.lt-ana-title{
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}
.lt-ana-sub{
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

/* Floating details */
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
  font-weight: 500;
  color: #64748b;
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
.lt-float__right{
  display:flex;
  align-items:center;
  gap: 8px;
  flex-wrap: wrap;
}
.muted{ color: #64748b; }

/* ✅ Leaflet marker styling (matches your design) */
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
  .lt-panel{ min-height: 400px; }
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
}
</style>