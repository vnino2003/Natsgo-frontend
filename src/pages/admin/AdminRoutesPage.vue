<!-- src/pages/admin/RoutesFlowPage.vue (LAYOUT UPDATE: Map + Right Sidebar Tabs) -->
<template>
  <div class="rf-page">
    <!-- Topbar -->
    <header class="rf-topbar">
      <div class="rf-topbar__left">
        <div class="rf-brand">
          <div class="rf-brand__icon"><i class="fas fa-route"></i></div>
          <div>
            <h1 class="rf-title">Routes Builder</h1>
            <p class="rf-sub">Pick 2 terminals, then draw/record one shared route (A ↔ B).</p>
          </div>
        </div>

        <div class="rf-topchips">
          <span class="rf-chip" :class="stateClass">
            <i class="fas" :class="stateIcon"></i>
            {{ stateLabel }}
          </span>
          <span class="rf-chip rf-chip--soft">
            <i class="fas fa-arrows-left-right"></i>
            {{ pairLabel }}
          </span>
        </div>
      </div>

      <div class="rf-topbar__right">
        <button class="rf-btn rf-btn--soft" type="button" @click="refreshAll" :disabled="loadingAny">
          <i class="fas fa-rotate"></i><span>{{ loadingAny ? "Refreshing..." : "Refresh" }}</span>
        </button>
        <button class="rf-btn rf-btn--soft" type="button" @click="fitToRoute" :disabled="!activePair">
          <i class="fas fa-crosshairs"></i><span>Fit</span>
        </button>
        <button class="rf-btn rf-btn--soft" type="button" @click="centerOnA" :disabled="!aTerminal">
          <i class="fas fa-location-dot"></i><span>Terminal A</span>
        </button>
        <button class="rf-btn rf-btn--primary" type="button" @click="resetAll" :disabled="loadingAny">
          <i class="fas fa-rotate"></i><span>Reset</span>
        </button>
      </div>
    </header>

    <!-- Global error -->
    <div v-if="pageError" class="rf-globalerr">
      <i class="fas fa-triangle-exclamation"></i>
      <div class="rf-globalerr__txt">{{ pageError }}</div>
      <button class="rf-globalerr__x" type="button" @click="pageError = ''">
        <i class="fas fa-xmark"></i>
      </button>
    </div>

    <div class="rf-layout">
      <!-- MAP (big main) -->
      <main class="rf-main">
        <section class="rf-mapcard">
          <div class="rf-mapcard__head">
            <div class="rf-mapcard__title">
              <i class="fas fa-map"></i><span>Map</span>
            </div>

            <div class="rf-mapcard__tools">
              <button class="rf-icon" type="button" title="Zoom in" @click="zoomIn"><i class="fas fa-plus"></i></button>
              <button class="rf-icon" type="button" title="Zoom out" @click="zoomOut"><i class="fas fa-minus"></i></button>
              <button
                class="rf-icon"
                type="button"
                title="Clear points"
                @click="clearPoints"
                :disabled="!canEdit || activePoints.length === 0"
              >
                <i class="fas fa-trash"></i>
              </button>
              <button
                class="rf-icon"
                type="button"
                title="Undo"
                @click="undoPoint"
                :disabled="!canEdit || activePoints.length === 0"
              >
                <i class="fas fa-undo"></i>
              </button>
            </div>
          </div>

          <div class="rf-map" ref="mapEl">
            <div class="rf-map-hint" v-if="activePair && uiMode !== 'view'">
              <i class="fas fa-hand-pointer"></i>
              <span v-if="uiMode === 'manual'">Manual: click map to add waypoint. Drag pins to adjust.</span>
              <span v-else>Recording: waypoints will auto-add from the selected live bus GPS.</span>
            </div>
          </div>

          <div class="rf-bottombar">
            <div class="rf-metrics">
              <div class="rf-metric">
                <div class="rf-metric__label">Waypoints</div>
                <div class="rf-metric__value">{{ activePoints.length }}</div>
              </div>
              <div class="rf-metric">
                <div class="rf-metric__label">Distance</div>
                <div class="rf-metric__value">{{ approxKm(activePoints).toFixed(2) }} km</div>
              </div>
              <div class="rf-metric">
                <div class="rf-metric__label">Mode</div>
                <div class="rf-metric__value">{{ uiMode }}</div>
              </div>
              <div class="rf-metric">
                <div class="rf-metric__label">Recording Bus</div>
                <div class="rf-metric__value">{{ selectedBus?.code || "—" }}</div>
              </div>
            </div>

            <div class="rf-actions">
              <button class="rf-btn rf-btn--soft" type="button" @click="fitToRoute" :disabled="!activePair">
                <i class="fas fa-expand"></i><span>Fit</span>
              </button>
              <button class="rf-btn rf-btn--primary" type="button" @click="saveRoute" :disabled="!canSave || savingRoute">
                <i class="fas fa-floppy-disk"></i><span>{{ savingRoute ? "Saving..." : "Save" }}</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- SIDEBAR (tabs) -->
      <aside class="rf-side">
        <section class="rf-sidecard">
          <div class="rf-sidehead">
            <div class="rf-tabs">
              <button class="rf-tab" :class="{ on: sideTab === 'terminals' }" type="button" @click="sideTab = 'terminals'">
                <i class="fas fa-building"></i><span>Terminals</span>
                <span class="rf-tabbadge">{{ terminals.length }}</span>
              </button>
              <button class="rf-tab" :class="{ on: sideTab === 'routes' }" type="button" @click="sideTab = 'routes'">
                <i class="fas fa-route"></i><span>Routes</span>
                <span class="rf-tabbadge">{{ routes.length }}</span>
              </button>
              <button class="rf-tab" :class="{ on: sideTab === 'builder' }" type="button" @click="sideTab = 'builder'">
                <i class="fas fa-screwdriver-wrench"></i><span>Builder</span>
              </button>
            </div>
          </div>

          <div class="rf-sidebody">
            <!-- TAB: TERMINALS -->
            <div v-show="sideTab === 'terminals'" class="rf-pane">
              <div class="rf-pane__top">
                <div class="rf-search">
                  <i class="fas fa-search"></i>
                  <input v-model="terminalQ" placeholder="Search terminal..." />
                  <button v-if="terminalQ" class="rf-clear" type="button" @click="terminalQ = ''" aria-label="Clear">
                    <i class="fas fa-xmark"></i>
                  </button>
                </div>

                <div class="rf-pair">
                  <div class="rf-pair__title">
                    <i class="fas fa-arrows-left-right"></i>
                    <span>Route Pair</span>
                  </div>

                  <div class="rf-pair__row">
                    <div class="rf-pair__col">
                      <div class="rf-label">Terminal A</div>
                      <div class="rf-value">{{ aTerminal?.terminal_name || "—" }}</div>
                    </div>
                    <div class="rf-pair__mid"><i class="fas fa-arrows-left-right"></i></div>
                    <div class="rf-pair__col">
                      <div class="rf-label">Terminal B</div>
                      <div class="rf-value">{{ bTerminal?.terminal_name || "—" }}</div>
                    </div>
                  </div>

                  <button
                    class="rf-btn rf-btn--primary rf-btn--block"
                    type="button"
                    @click="createOrLoadPair"
                    :disabled="!canCreatePair || loadingAny"
                  >
                    <i class="fas fa-wand-magic-sparkles"></i><span>Create / Load Route (A ↔ B)</span>
                  </button>

                  <div class="rf-note">
                    <i class="fas fa-circle-info"></i>
                    One route only. It works vice-versa automatically: <b>A ↔ B</b>.
                  </div>
                </div>
              </div>

              <div class="rf-terminal-grid">
                <button
                  v-for="t in filteredTerminals"
                  :key="t.terminal_id"
                  class="rf-terminal"
                  :class="{ a: aId === t.terminal_id, b: bId === t.terminal_id }"
                  type="button"
                  @click="togglePickTerminal(t.terminal_id)"
                  :disabled="loadingAny"
                >
                  <div class="rf-terminal__top">
                    <div
                      class="rf-terminal__pill"
                      :class="aId === t.terminal_id ? 'p-a' : bId === t.terminal_id ? 'p-b' : ''"
                    >
                      <i class="fas fa-building"></i>
                    </div>
                    <div class="rf-terminal__meta">
                      <div class="rf-terminal__name">{{ t.terminal_name }}</div>
                      <div class="rf-terminal__sub">{{ t.city }}</div>
                    </div>
                  </div>

                  <div class="rf-terminal__bottom">
                    <span class="rf-mini">
                      <i class="fas fa-location-crosshairs"></i>
                      {{ Number(t.lat).toFixed(4) }}, {{ Number(t.lng).toFixed(4) }}
                    </span>

                    <span class="rf-tag" v-if="aId === t.terminal_id">Terminal A</span>
                    <span class="rf-tag rf-tag--b" v-else-if="bId === t.terminal_id">Terminal B</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- TAB: ROUTES -->
            <div v-show="sideTab === 'routes'" class="rf-pane">
              <div class="rf-search rf-search--routes">
                <i class="fas fa-filter"></i>
                <input v-model="routeQ" placeholder="Filter routes..." />
                <button v-if="routeQ" class="rf-clear" type="button" @click="routeQ = ''" aria-label="Clear">
                  <i class="fas fa-xmark"></i>
                </button>
              </div>

              <div class="rf-empty" v-if="!routesFiltered.length && !routesLoading">
                <i class="fas fa-route"></i>
                <p>No saved routes</p>
                <small>Create one by selecting terminals and saving points.</small>
              </div>

              <div class="rf-route-list" v-else>
                <button
                  v-for="r in routesFiltered"
                  :key="r.route_id"
                  type="button"
                  class="rf-route"
                  :class="{ on: activePair?.route_id === r.route_id }"
                  @click="selectPair(r)"
                >
                  <div class="rf-route__line" :style="{ background: r.color || '#06b6d4' }"></div>
                  <div class="rf-route__meta">
                    <div class="rf-route__name">{{ r.name || "Route A ↔ B" }}</div>
                    <div class="rf-route__sub">
                      <span class="rf-pill out">A ↔ B</span>
                      <span class="rf-dot">•</span>
                      <span>{{ (r.points?.length || 0) }} pts</span>
                      <span class="rf-dot">•</span>
                      <span class="rf-mini">{{ prettyPairLabel(r) }}</span>
                    </div>
                  </div>

                  <div class="rf-route__right">
                    <span class="rf-mini rf-mono">{{ fmtTimeAgo(r.updated_at) }}</span>
                  </div>
                </button>
              </div>

              <div class="rf-note rf-note--footer" style="margin-top: 12px">
                <i class="fas fa-database"></i>
                List is from <b>MySQL</b>. After Save, it auto-refreshes.
              </div>
            </div>

            <!-- TAB: BUILDER -->
            <div v-show="sideTab === 'builder'" class="rf-pane">
              <div class="rf-section">
                <div class="rf-section__title"><i class="fas fa-sliders"></i><span>Route Settings</span></div>

                <div class="rf-form">
                  <div class="rf-row">
                    <label class="rf-label">Name</label>
                    <input class="rf-input" v-model="draft.name" :disabled="!activePair" placeholder="Route name..." />
                  </div>

                  <div class="rf-row rf-row--2">
                    <div>
                      <label class="rf-label">Color</label>
                      <input class="rf-color" type="color" v-model="draft.color" :disabled="!activePair" />
                    </div>
                    <div>
                      <label class="rf-label">Mode</label>
                      <select class="rf-select" v-model="uiMode" :disabled="!activePair || isRecording">
                        <option value="view">view</option>
                        <option value="manual">manual</option>
                        <option value="record">record</option>
                      </select>
                    </div>
                  </div>

                  <div class="rf-note">
                    <i class="fas fa-circle-info"></i>
                    <span>One route only: <b>A ↔ B</b>. No origin/destination.</span>
                  </div>
                </div>
              </div>

              <div class="rf-divider"></div>

              <!-- RECORD -->
              <div class="rf-section" v-if="activePair && uiMode === 'record'">
                <div class="rf-section__title"><i class="fas fa-circle-dot"></i><span>Record from Live Bus</span></div>

                <div class="rf-note" v-if="busesError">
                  <i class="fas fa-triangle-exclamation"></i>
                  {{ busesError }}
                </div>
                <div class="rf-note" v-else>
                  <i class="fas fa-satellite"></i>
                  Uses <b>real GPS logs</b> (polled). Only buses with valid lat/lng can record.
                </div>

                <div class="rf-row">
                  <label class="rf-label">Select Bus</label>
                  <select class="rf-select" v-model="selectedBusId" :disabled="isRecording || busesLoading">
                    <option :value="''">— choose bus —</option>
                    <option v-for="b in busesUsable" :key="b.id" :value="b.id">
                      {{ b.code }} • {{ b.plate }} • {{ b.status }} • {{ b.lastSeen }}
                    </option>
                  </select>
                  <div class="rf-mini" style="margin-top: 6px" v-if="selectedBus">
                    <span class="rf-mono">
                      Lat {{ selectedBus.lat?.toFixed?.(6) ?? "—" }}, Lng {{ selectedBus.lng?.toFixed?.(6) ?? "—" }}
                    </span>
                    <span class="rf-dot">•</span>
                    <span>Speed {{ Number(selectedBus.speed || 0).toFixed(0) }} km/h</span>
                  </div>
                </div>

                <div class="rf-row rf-row--2">
                  <div>
                    <label class="rf-label">Capture every</label>
                    <select class="rf-select" v-model.number="recordEveryMs" :disabled="isRecording">
                      <option :value="1000">1s</option>
                      <option :value="2000">2s</option>
                      <option :value="3000">3s</option>
                    </select>
                  </div>
                  <div>
                    <label class="rf-label">Min distance</label>
                    <select class="rf-select" v-model.number="recordMinMeters" :disabled="isRecording">
                      <option :value="10">10m</option>
                      <option :value="20">20m</option>
                      <option :value="30">30m</option>
                      <option :value="50">50m</option>
                    </select>
                  </div>
                </div>

                <div class="rf-actions2">
                  <button class="rf-btn rf-btn--primary" type="button" @click="startRecording" :disabled="!canStartRecord">
                    <i class="fas fa-circle-dot"></i><span>Start Record</span>
                  </button>
                  <button class="rf-btn rf-btn--danger" type="button" @click="stopRecording" :disabled="!isRecording">
                    <i class="fas fa-stop"></i><span>Stop</span>
                  </button>
                </div>
              </div>

              <div class="rf-divider"></div>

              <!-- WAYPOINTS -->
              <div class="rf-section" v-if="activePair">
                <div class="rf-section__title"><i class="fas fa-list"></i><span>Waypoints</span></div>

                <div class="rf-empty rf-empty--small" v-if="!activePoints.length">
                  <i class="fas fa-location-dot"></i>
                  <p>No points</p>
                  <small>Use manual or recording to add points.</small>
                </div>

                <div class="rf-wp-list" v-else>
                  <div v-for="(p, idx) in activePoints" :key="idx" class="rf-wp">
                    <div class="rf-wp__left">
                      <span class="rf-wp__num">{{ idx + 1 }}</span>
                      <div class="rf-wp__coords">
                        <div><b>Lat</b> {{ p.lat.toFixed(6) }}</div>
                        <div><b>Lng</b> {{ p.lng.toFixed(6) }}</div>
                      </div>
                    </div>

                    <div class="rf-wp__right">
                      <button class="rf-miniicon" type="button" title="Up" @click="movePoint(idx, -1)" :disabled="!canEdit || idx === 0">
                        <i class="fas fa-arrow-up"></i>
                      </button>
                      <button
                        class="rf-miniicon"
                        type="button"
                        title="Down"
                        @click="movePoint(idx, +1)"
                        :disabled="!canEdit || idx === activePoints.length - 1"
                      >
                        <i class="fas fa-arrow-down"></i>
                      </button>
                      <button class="rf-miniicon rf-miniicon--danger" type="button" title="Delete" @click="removePoint(idx)" :disabled="!canEdit">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="rf-actions2">
                  <button class="rf-btn rf-btn--soft" type="button" @click="fitToRoute" :disabled="activePoints.length < 2">
                    <i class="fas fa-expand"></i><span>Fit</span>
                  </button>
                  <button class="rf-btn rf-btn--danger" type="button" @click="deleteRoute" :disabled="isRecording || deletingRoute">
                    <i class="fas fa-trash-can"></i><span>{{ deletingRoute ? "Deleting..." : "Delete Route" }}</span>
                  </button>
                </div>
              </div>

              <div class="rf-note rf-note--footer">
                <i class="fas fa-database"></i>
                Saved to <b>MySQL</b> via <b>/api/admin/routes</b> (pair_key based).
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useTerminals } from "../../composables/useTerminal";
import { useRoutes } from "../../composables/useRoutes";
import { useAdminLiveBuses } from "../../composables/useAdminLiveBuses";

/* ==============================
   Terminals (API)
============================== */
const { rows: terminalRows, loading: terminalsLoading, error: terminalsError, fetchTerminals } = useTerminals();

/* ==============================
   Routes (API)
============================== */
const {
  rows: routeRows,
  loading: routesLoading,
  error: routesError,
  fetchRoutes,
  addRoute,
  editRoute,
  removeRoute,
} = useRoutes();

/* ==============================
   Live Buses (API logs)
============================== */
const {
  buses,
  loading: busesLoading,
  error: busesError,
  fetchOnce: fetchBusesOnce,
  start: startBuses,
  stop: stopBuses,
} = useAdminLiveBuses({ intervalMs: 2000 });

/* ==============================
   UI State
============================== */
const pageError = ref("");
const savingRoute = ref(false);
const deletingRoute = ref(false);

const terminalQ = ref("");
const routeQ = ref("");

const aId = ref(null);
const bId = ref(null);

const activePair = ref(null); // active route object from DB
const uiMode = ref("view"); // view|manual|record

// NEW: sidebar tabs
const sideTab = ref("terminals"); // terminals|routes|builder

const draft = reactive({
  name: "Route A ↔ B",
  color: "#06b6d4",
});
const activePoints = ref([]);

/* Recording */
const selectedBusId = ref("");
const recordEveryMs = ref(1000);
const recordMinMeters = ref(20);
const isRecording = ref(false);
let recordTimer = null;

/* ==============================
   Computed
============================== */
const loadingAny = computed(
  () => terminalsLoading.value || routesLoading.value || savingRoute.value || deletingRoute.value
);

const terminals = computed(() => terminalRows.value || []);
const routes = computed(() => routeRows.value || []);

const filteredTerminals = computed(() => {
  const k = terminalQ.value.trim().toLowerCase();
  if (!k) return terminals.value;
  return terminals.value.filter((t) => [t.terminal_name, t.city, t.terminal_id].join(" ").toLowerCase().includes(k));
});

const routesFiltered = computed(() => {
  const k = routeQ.value.trim().toLowerCase();
  if (!k) return routes.value;
  return routes.value.filter((r) => {
    const blob = [r.name, r.pair_key, r.a_terminal_id, r.b_terminal_id, r.method].join(" ").toLowerCase();
    return blob.includes(k);
  });
});

const aTerminal = computed(() => terminals.value.find((t) => t.terminal_id === aId.value) || null);
const bTerminal = computed(() => terminals.value.find((t) => t.terminal_id === bId.value) || null);

const canCreatePair = computed(
  () => Number.isFinite(Number(aId.value)) && Number.isFinite(Number(bId.value)) && aId.value !== bId.value
);

function pairKeyFrom(a, b) {
  const x = Number(a),
    y = Number(b);
  const lo = Math.min(x, y);
  const hi = Math.max(x, y);
  return `${lo}_${hi}`;
}

const pairLabel = computed(() => {
  if (!aTerminal.value || !bTerminal.value) return "—";
  return `${aTerminal.value.terminal_name} ↔ ${bTerminal.value.terminal_name}`;
});

const canEdit = computed(() => !!activePair.value && uiMode.value !== "view" && !isRecording.value);

const busesUsable = computed(() => {
  const list = buses.value || [];
  return list.filter((b) => Number.isFinite(b?.lat) && Number.isFinite(b?.lng));
});

const selectedBus = computed(() => {
  if (!selectedBusId.value) return null;
  return (buses.value || []).find((b) => String(b.id) === String(selectedBusId.value)) || null;
});

const canStartRecord = computed(() => {
  if (!activePair.value) return false;
  if (uiMode.value !== "record") return false;
  if (!selectedBusId.value) return false;
  if (isRecording.value) return false;
  const sb = selectedBus.value;
  return !!sb && Number.isFinite(sb.lat) && Number.isFinite(sb.lng);
});

const canSave = computed(() => {
  if (!activePair.value) return false;
  const nameOk = draft.name.trim().length >= 3;
  const ptsOk = activePoints.value.length >= 2;
  return nameOk && ptsOk && !isRecording.value && uiMode.value !== "view" && !savingRoute.value;
});

const stateLabel = computed(() => {
  if (!activePair.value) return "No active route";
  if (isRecording.value) return "Recording (live GPS)";
  if (uiMode.value === "manual") return "Manual editing";
  if (uiMode.value === "record") return "Record ready";
  return "View only";
});
const stateClass = computed(() => {
  if (!activePair.value) return "idle";
  if (isRecording.value) return "rec";
  if (uiMode.value === "manual") return "man";
  if (uiMode.value === "record") return "ready";
  return "view";
});
const stateIcon = computed(() => {
  if (!activePair.value) return "fa-circle";
  if (isRecording.value) return "fa-circle-dot";
  if (uiMode.value === "manual") return "fa-pen";
  if (uiMode.value === "record") return "fa-satellite-dish";
  return "fa-eye";
});

/* ==============================
   Helpers
============================== */
function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Haversine distance in meters */
function metersBetween(a, b) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function approxKm(points) {
  if (!points || points.length < 2) return 0;
  let totalM = 0;
  for (let i = 1; i < points.length; i++) totalM += metersBetween(points[i - 1], points[i]);
  return totalM / 1000;
}

function setPageError(e, fallback = "Something went wrong.") {
  pageError.value = e?.response?.data?.message || e?.message || fallback;
}

function prettyPairLabel(r) {
  const a = terminals.value.find((t) => t.terminal_id === Number(r.a_terminal_id));
  const b = terminals.value.find((t) => t.terminal_id === Number(r.b_terminal_id));
  if (!a || !b) return `Pair ${r.pair_key || ""}`;
  return `${a.terminal_name} ↔ ${b.terminal_name}`;
}

function fmtTimeAgo(updated_at) {
  if (!updated_at) return "";
  const d = new Date(updated_at);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ==============================
   Refresh
============================== */
async function refreshAll() {
  pageError.value = "";
  try {
    await fetchTerminals({ q: "" });
    await fetchRoutes({ q: "" });
    await fetchBusesOnce();
  } catch (e) {
    setPageError(e, "Failed to refresh data.");
  }
}

/* ==============================
   Pick terminals
============================== */
function togglePickTerminal(id) {
  const tid = Number(id);

  if (aId.value === tid) {
    aId.value = null;
    clearActive();
    return;
  }
  if (bId.value === tid) {
    bId.value = null;
    clearActive();
    return;
  }

  if (!aId.value) aId.value = tid;
  else if (!bId.value) bId.value = tid;
  else {
    aId.value = tid;
    bId.value = null;
  }

  clearActive();
}

/* ==============================
   Create or Load ONE route for pair
============================== */
async function createOrLoadPair() {
  if (!canCreatePair.value) return;

  pageError.value = "";
  stopRecording();

  const key = pairKeyFrom(aId.value, bId.value);

  try {
    await fetchRoutes({ q: "" });

    const existing = (routeRows.value || []).find((r) => String(r.pair_key) === String(key));
    if (existing) {
      selectPair(existing);
      sideTab.value = "builder";
      return;
    }

    const lo = Math.min(Number(aId.value), Number(bId.value));
    const hi = Math.max(Number(aId.value), Number(bId.value));
    const LoT = terminals.value.find((t) => t.terminal_id === lo);
    const HiT = terminals.value.find((t) => t.terminal_id === hi);

    const payload = {
      a_terminal_id: lo,
      b_terminal_id: hi,
      name: `${LoT?.terminal_name || "Terminal A"} ↔ ${HiT?.terminal_name || "Terminal B"}`,
      color: "#06b6d4",
      points: [],
      method: "unknown",
      recorded_bus_id: null,
    };

    await addRoute(payload);

    await fetchRoutes({ q: "" });
    const created = (routeRows.value || []).find((r) => String(r.pair_key) === String(key));
    if (created) {
      selectPair(created);
      sideTab.value = "builder";
    }
  } catch (e) {
    setPageError(e, "Failed to create/load route.");
  }
}

function selectPair(routeObj) {
  stopRecording();
  activePair.value = routeObj;

  aId.value = Number(routeObj.a_terminal_id);
  bId.value = Number(routeObj.b_terminal_id);

  draft.name = routeObj.name || "Route A ↔ B";
  draft.color = routeObj.color || "#06b6d4";
  activePoints.value = (routeObj.points || []).map((p) => ({ lat: toNum(p.lat), lng: toNum(p.lng) }));

  uiMode.value = "view";
  selectedBusId.value = "";

  refreshMapLayers();
  fitToRoute();
}

function clearActive() {
  stopRecording();
  activePair.value = null;
  draft.name = "Route A ↔ B";
  draft.color = "#06b6d4";
  activePoints.value = [];
  uiMode.value = "view";
  selectedBusId.value = "";
  clearMapLayers();
}

/* ==============================
   SAVE (refresh list after save)
============================== */
async function saveRoute() {
  if (!canSave.value) return;
  if (!activePair.value?.route_id) return;

  savingRoute.value = true;
  pageError.value = "";

  try {
    const payload = {
      name: draft.name.trim(),
      color: draft.color || "#06b6d4",
      points: activePoints.value.map((p) => ({ lat: toNum(p.lat), lng: toNum(p.lng) })),
      method: uiMode.value === "manual" ? "manual" : uiMode.value === "record" ? "record" : "unknown",
      recorded_bus_id: uiMode.value === "record" ? selectedBus.value?.id || null : null,
    };

    await editRoute(activePair.value.route_id, payload);

    await fetchRoutes({ q: "" });
    const fresh = (routeRows.value || []).find((r) => r.route_id === activePair.value.route_id);
    if (fresh) activePair.value = fresh;

    uiMode.value = "view";
    refreshMapLayers();
    sideTab.value = "routes";
  } catch (e) {
    setPageError(e, "Failed to save route.");
  } finally {
    savingRoute.value = false;
  }
}

async function deleteRoute() {
  if (!activePair.value?.route_id) return;
  if (isRecording.value) return;

  deletingRoute.value = true;
  pageError.value = "";

  try {
    await removeRoute(activePair.value.route_id);
    await fetchRoutes({ q: "" });
    clearActive();
    sideTab.value = "routes";
  } catch (e) {
    setPageError(e, "Failed to delete route.");
  } finally {
    deletingRoute.value = false;
  }
}

/* ==============================
   Manual points ops
============================== */
function undoPoint() {
  if (!canEdit.value) return;
  if (!activePoints.value.length) return;
  activePoints.value = activePoints.value.slice(0, -1);
  refreshMapLayers();
}
function clearPoints() {
  if (!canEdit.value) return;
  activePoints.value = [];
  refreshMapLayers();
}
function removePoint(idx) {
  if (!canEdit.value) return;
  const next = activePoints.value.slice();
  next.splice(idx, 1);
  activePoints.value = next;
  refreshMapLayers();
}
function movePoint(idx, dir) {
  if (!canEdit.value) return;
  const next = activePoints.value.slice();
  const ni = idx + dir;
  if (ni < 0 || ni >= next.length) return;
  const tmp = next[idx];
  next[idx] = next[ni];
  next[ni] = tmp;
  activePoints.value = next;
  refreshMapLayers();
}

/* ==============================
   Recording from LIVE bus
============================== */
function startRecording() {
  if (!canStartRecord.value) return;

  isRecording.value = true;

  const sb = selectedBus.value;
  if (sb && Number.isFinite(sb.lat) && Number.isFinite(sb.lng) && !activePoints.value.length) {
    activePoints.value = [{ lat: sb.lat, lng: sb.lng }];
  }

  if (sb) syncBusMarker(sb);

  if (recordTimer) clearInterval(recordTimer);
  recordTimer = setInterval(() => {
    const live = selectedBus.value;
    if (!live) return;
    if (!Number.isFinite(live.lat) || !Number.isFinite(live.lng)) return;

    const last = activePoints.value[activePoints.value.length - 1];
    const curr = { lat: live.lat, lng: live.lng };

    if (!last) {
      activePoints.value = [curr];
      refreshMapLayers();
      return;
    }

    const moved = metersBetween(last, curr);
    if (moved >= recordMinMeters.value) {
      activePoints.value = [...activePoints.value, curr];
      refreshMapLayers();
    }

    syncBusMarker(live);
  }, recordEveryMs.value);
}

function stopRecording() {
  if (recordTimer) clearInterval(recordTimer);
  recordTimer = null;
  isRecording.value = false;
  clearBusMarker();
}

/* ==============================
   Leaflet Map
============================== */
const mapEl = ref(null);
let map = null;

let aMarker = null;
let bMarker = null;

let routeLine = null;
const waypointMarkers = new Map();

let busMarker = null;

function initMap() {
  if (!mapEl.value || map) return;

  map = L.map(mapEl.value, { zoomControl: false, attributionControl: false, tap: true }).setView([12.8797, 121.774], 6);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 20 }).addTo(map);

  map.on("click", (e) => {
    if (!activePair.value) return;
    if (uiMode.value !== "manual") return;
    if (isRecording.value) return;

    const p = { lat: e.latlng.lat, lng: e.latlng.lng };
    activePoints.value = [...activePoints.value, p];
    refreshMapLayers();
  });

  requestAnimationFrame(() => map?.invalidateSize());
  setTimeout(() => map?.invalidateSize(), 350);
}

function hexToRgba(hex, a) {
  const h = String(hex || "#000000").replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function makeTerminalIcon(kind = "a") {
  const color = kind === "a" ? "#16a34a" : "#f97316";
  return L.divIcon({
    className: "rf-leaflet-term",
    html: `
      <div class="rf-term">
        <div class="rf-term__ring" style="background: radial-gradient(circle at 50% 50%, ${hexToRgba(
          color,
          0.28
        )} 0%, ${hexToRgba(color, 0.1)} 45%, rgba(0,0,0,0) 70%);"></div>
        <div class="rf-term__badge" style="border-color:${hexToRgba(color, 0.55)}; color:${color}">
          <i class="fas fa-building"></i>
        </div>
        <div class="rf-term__base" style="border-color:${hexToRgba(color, 0.65)};"></div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 38],
  });
}
function makeWaypointIcon(idx) {
  return L.divIcon({
    className: "rf-leaflet-wp",
    html: `
      <button class="rf-wpm" type="button" aria-label="waypoint">
        <span class="rf-wpm__dot"></span>
        <span class="rf-wpm__num">${idx + 1}</span>
      </button>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 28],
  });
}
function makeBusIcon(status = "Online") {
  const ring =
    String(status).toLowerCase() === "offline"
      ? "rgba(148,163,184,0.28)"
      : String(status).toLowerCase() === "warning"
      ? "rgba(234,179,8,0.26)"
      : "rgba(34,197,94,0.28)";

  return L.divIcon({
    className: "rf-leaflet-bus",
    html: `
      <div class="rf-bus">
        <div class="rf-bus__ring" style="background:radial-gradient(circle at 50% 50%,${ring} 0%,rgba(0,0,0,0) 70%);"></div>
        <div class="rf-bus__pill"><i class="fas fa-bus"></i></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 28],
  });
}

function syncPairMarkers() {
  if (!map) return;

  const A = aTerminal.value;
  const B = bTerminal.value;

  if (A) {
    const pos = [toNum(A.lat), toNum(A.lng)];
    if (!aMarker) aMarker = L.marker(pos, { icon: makeTerminalIcon("a") }).addTo(map);
    else aMarker.setLatLng(pos);
  } else if (aMarker) {
    map.removeLayer(aMarker);
    aMarker = null;
  }

  if (B) {
    const pos = [toNum(B.lat), toNum(B.lng)];
    if (!bMarker) bMarker = L.marker(pos, { icon: makeTerminalIcon("b") }).addTo(map);
    else bMarker.setLatLng(pos);
  } else if (bMarker) {
    map.removeLayer(bMarker);
    bMarker = null;
  }
}

function clearMapLayers() {
  if (!map) return;
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
  for (const m of waypointMarkers.values()) map.removeLayer(m);
  waypointMarkers.clear();
}

function refreshMapLayers() {
  if (!map) return;

  syncPairMarkers();

  const pts = activePoints.value.map((p) => [toNum(p.lat), toNum(p.lng)]);
  const color = draft.color || "#06b6d4";

  if (!routeLine) routeLine = L.polyline(pts, { color, weight: 5, opacity: 0.95, lineJoin: "round" }).addTo(map);
  else {
    routeLine.setLatLngs(pts);
    routeLine.setStyle({ color });
  }

  for (const [idx, m] of waypointMarkers.entries()) {
    if (idx >= activePoints.value.length) {
      map.removeLayer(m);
      waypointMarkers.delete(idx);
    }
  }

  activePoints.value.forEach((p, idx) => {
    const existing = waypointMarkers.get(idx);
    if (existing) {
      existing.setLatLng([toNum(p.lat), toNum(p.lng)]);
      existing.setIcon(makeWaypointIcon(idx));
      return;
    }

    const m = L.marker([toNum(p.lat), toNum(p.lng)], {
      icon: makeWaypointIcon(idx),
      draggable: uiMode.value !== "view" && !isRecording.value,
    }).addTo(map);

    m.on("drag", (ev) => {
      if (uiMode.value === "view" || isRecording.value) return;
      const ll = ev.target.getLatLng();
      const next = activePoints.value.slice();
      next[idx] = { lat: ll.lat, lng: ll.lng };
      activePoints.value = next;
      routeLine?.setLatLngs(activePoints.value.map((pp) => [toNum(pp.lat), toNum(pp.lng)]));
    });

    m.on("dragend", () => {
      if (uiMode.value === "view" || isRecording.value) return;
      refreshMapLayers();
    });

    waypointMarkers.set(idx, m);
  });

  for (const m of waypointMarkers.values()) {
    if (uiMode.value === "view" || isRecording.value) m.dragging?.disable?.();
    else m.dragging?.enable?.();
  }
}

/* Bus marker */
function syncBusMarker(bus) {
  if (!map) return;
  if (!Number.isFinite(bus?.lat) || !Number.isFinite(bus?.lng)) return;

  const pos = [toNum(bus.lat), toNum(bus.lng)];
  const icon = makeBusIcon(bus.status);

  if (!busMarker) busMarker = L.marker(pos, { icon }).addTo(map);
  else {
    busMarker.setLatLng(pos);
    busMarker.setIcon(icon);
  }
}
function clearBusMarker() {
  if (!map) return;
  if (busMarker) {
    map.removeLayer(busMarker);
    busMarker = null;
  }
}

/* controls */
function zoomIn() {
  map?.zoomIn();
}
function zoomOut() {
  map?.zoomOut();
}

function centerOnA() {
  if (!map || !aTerminal.value) return;
  map.flyTo([toNum(aTerminal.value.lat), toNum(aTerminal.value.lng)], Math.max(map.getZoom(), 14), { duration: 0.55 });
}

function fitToRoute() {
  if (!map) return;

  const pts = [];
  if (aTerminal.value) pts.push([toNum(aTerminal.value.lat), toNum(aTerminal.value.lng)]);
  if (bTerminal.value) pts.push([toNum(bTerminal.value.lat), toNum(bTerminal.value.lng)]);
  for (const p of activePoints.value) pts.push([toNum(p.lat), toNum(p.lng)]);

  if (isRecording.value && selectedBus.value) {
    const sb = selectedBus.value;
    if (Number.isFinite(sb.lat) && Number.isFinite(sb.lng)) pts.push([toNum(sb.lat), toNum(sb.lng)]);
  }

  if (pts.length < 2) {
    if (aTerminal.value) centerOnA();
    return;
  }
  map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
}

/* ==============================
   Reset
============================== */
function resetAll() {
  stopRecording();
  aId.value = null;
  bId.value = null;
  clearActive();
  syncPairMarkers();
  map?.setView([12.8797, 121.774], 6);
  sideTab.value = "terminals";
}

/* ==============================
   Watches
============================== */
watch([aId, bId], async () => {
  await nextTick();
  syncPairMarkers();
  if (aTerminal.value && bTerminal.value) fitToRoute();
});

watch(
  () => uiMode.value,
  () => {
    if (isRecording.value) uiMode.value = "record";
    refreshMapLayers();
  }
);

watch(
  () => draft.color,
  () => {
    if (routeLine) routeLine.setStyle({ color: draft.color || "#06b6d4" });
  }
);

watch(
  () => selectedBus.value,
  (b) => {
    if (!isRecording.value) return;
    if (!b) return;
    syncBusMarker(b);
  },
  { deep: true }
);

watch([terminalsError, routesError], () => {
  const tErr = terminalsError.value;
  const rErr = routesError.value;
  if (tErr) pageError.value = tErr;
  else if (rErr) pageError.value = rErr;
});

/* ==============================
   Lifecycle
============================== */
async function boot() {
  pageError.value = "";
  try {
    await fetchTerminals({ q: "" });
    await fetchRoutes({ q: "" });

    startBuses();

    if ((terminalRows.value || []).length === 2) {
      aId.value = terminalRows.value[0].terminal_id;
      bId.value = terminalRows.value[1].terminal_id;
    }

    initMap();
    await nextTick();
    syncPairMarkers();
  } catch (e) {
    setPageError(e, "Failed to load page data.");
  }
}

onMounted(async () => {
  await boot();
});

onUnmounted(() => {
  stopRecording();
  stopBuses();
  if (map) {
    map.off();
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
/* base */
.rf-page {
  padding: 14px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%);
}

/* topbar */
.rf-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  margin-bottom: 14px;
}
.rf-topbar__left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.rf-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}
.rf-brand__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(6, 182, 212, 0.1));
  color: #2563eb;
  font-size: 18px;
}
.rf-title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}
.rf-sub {
  margin: 2px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.rf-topchips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  min-width: 0;
}
.rf-chip {
  font-size: 11px;
  font-weight: 1000;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: rgba(241, 245, 249, 0.8);
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 460px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rf-chip--soft {
  background: rgba(255, 255, 255, 0.65);
}
.rf-chip.idle {
  border-color: #cbd5e1;
}
.rf-chip.view {
  border-color: #cbd5e1;
}
.rf-chip.man {
  border-color: rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.12);
  color: #1e40af;
}
.rf-chip.ready {
  border-color: rgba(234, 179, 8, 0.4);
  background: rgba(234, 179, 8, 0.14);
  color: #92400e;
}
.rf-chip.rec {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.12);
  color: #166534;
}

.rf-topbar__right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.rf-btn {
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 900;
  color: #334155;
  cursor: pointer;
  transition: 0.15s;
}
.rf-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.rf-btn--primary {
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  box-shadow: 0 12px 26px rgba(59, 130, 246, 0.22);
}
.rf-btn--primary:hover {
  background: linear-gradient(135deg, #2563eb, #0891b2);
}
.rf-btn--soft {
  background: rgba(255, 255, 255, 0.85);
}
.rf-btn--danger {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
  color: rgba(239, 68, 68, 0.95);
}
.rf-btn--danger:hover {
  background: rgba(239, 68, 68, 0.12);
}
.rf-btn--block {
  width: 100%;
  justify-content: center;
}

/* error */
.rf-globalerr {
  margin: -4px 0 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
  color: rgba(239, 68, 68, 0.95);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}
.rf-globalerr i {
  margin-top: 2px;
}
.rf-globalerr__txt {
  flex: 1;
  font-size: 12px;
  font-weight: 900;
}
.rf-globalerr__x {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  color: rgba(239, 68, 68, 0.95);
}
.rf-globalerr__x:hover {
  background: rgba(255, 255, 255, 0.85);
}

/* layout */
.rf-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 14px;
  align-items: start;
  height: calc(100vh - 160px);
}
.rf-main {
  min-width: 0;
  height: 100%;
}
.rf-side {
  height: 100%;
  min-width: 0;
  position: sticky;
  top: 88px;
  align-self: start;
}

/* cards */
.rf-mapcard,
.rf-sidecard {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}
.rf-mapcard {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.rf-mapcard__head {
  padding: 12px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
}
.rf-mapcard__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
}
.rf-mapcard__tools {
  display: flex;
  gap: 8px;
}
.rf-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  color: #475569;
  transition: 0.15s;
}
.rf-icon:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
.rf-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* map */
.rf-map {
  position: relative;
  flex: 1;
  min-height: 520px;
}
.rf-map :global(.leaflet-container) {
  width: 100% !important;
  height: 100% !important;
}
.rf-map-hint {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 600;
  max-width: 420px;
  background: rgba(15, 23, 42, 0.82);
  color: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.16);
}

/* bottom bar */
.rf-bottombar {
  border-top: 1px solid #e2e8f0;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(255, 255, 255, 0.55);
}
.rf-metrics {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.rf-metric__label {
  font-size: 10px;
  font-weight: 1000;
  color: #94a3b8;
}
.rf-metric__value {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 1000;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rf-actions {
  display: flex;
  gap: 8px;
}

/* sidebar tabs */
.rf-sidehead {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.55);
}
.rf-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.rf-tab {
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 1000;
  color: #334155;
  cursor: pointer;
  transition: 0.15s;
  position: relative;
}
.rf-tab:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.rf-tab.on {
  border-color: rgba(6, 182, 212, 0.55);
  background: rgba(6, 182, 212, 0.12);
  color: #0f172a;
}
.rf-tabbadge {
  margin-left: 2px;
  min-width: 22px;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #dbeafe;
  color: #1e40af;
  font-size: 10px;
  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* sidebar body */
.rf-sidebody {
  padding: 12px;
  height: calc(100vh - 160px - 62px);
  overflow: auto;
}
.rf-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rf-pane__top {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* common inputs */
.rf-search {
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: rgba(241, 245, 249, 0.85);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
}
.rf-search i {
  color: #94a3b8;
}
.rf-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}
.rf-clear {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
}
.rf-clear:hover {
  background: rgba(15, 23, 42, 0.06);
}

/* terminals list */
.rf-terminal-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: 520px;
  overflow: auto;
  padding-right: 2px;
}
.rf-terminal {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  padding: 12px;
  cursor: pointer;
  text-align: left;
  transition: 0.15s;
}
.rf-terminal:hover {
  border-color: #cbd5e1;
  background: rgba(59, 130, 246, 0.05);
}
.rf-terminal:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.rf-terminal.a {
  border-color: rgba(34, 197, 94, 0.55);
  background: rgba(34, 197, 94, 0.1);
}
.rf-terminal.b {
  border-color: rgba(249, 115, 22, 0.55);
  background: rgba(249, 115, 22, 0.1);
}
.rf-terminal__top {
  display: flex;
  gap: 10px;
  align-items: center;
}
.rf-terminal__pill {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(148, 163, 184, 0.16);
  color: #334155;
}
.rf-terminal__pill.p-a {
  background: rgba(34, 197, 94, 0.16);
  color: #16a34a;
}
.rf-terminal__pill.p-b {
  background: rgba(249, 115, 22, 0.16);
  color: #f97316;
}
.rf-terminal__name {
  font-size: 13px;
  font-weight: 1000;
  color: #0f172a;
}
.rf-terminal__sub {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.rf-terminal__bottom {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.rf-mini {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rf-tag {
  font-size: 10px;
  font-weight: 1000;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
}
.rf-tag--b {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.12);
  color: #9a3412;
}

/* pair */
.rf-pair {
  padding: 12px;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.55);
}
.rf-pair__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 1000;
  font-size: 12px;
  color: #0f172a;
}
.rf-pair__row {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 30px 1fr;
  gap: 10px;
  align-items: center;
}
.rf-label {
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
}
.rf-value {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 1000;
  color: #0f172a;
}
.rf-pair__mid {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}
.rf-note {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.rf-note--footer {
  margin-top: 14px;
}

/* routes list */
.rf-route-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 620px;
  overflow: auto;
  padding-right: 2px;
}
.rf-route {
  width: 100%;
  text-align: left;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  padding: 10px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  align-items: center;
  transition: 0.15s;
}
.rf-route:hover {
  border-color: #cbd5e1;
  background: rgba(59, 130, 246, 0.05);
}
.rf-route.on {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.14);
}
.rf-route__line {
  width: 6px;
  border-radius: 999px;
}
.rf-route__name {
  font-size: 12px;
  font-weight: 1000;
  color: #0f172a;
}
.rf-route__sub {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.rf-pill {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
  font-size: 10px;
  font-weight: 1000;
}
.rf-dot {
  color: #cbd5e1;
}
.rf-route__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rf-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.rf-search--routes {
  margin-top: 0;
  margin-bottom: 10px;
}

/* builder */
.rf-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 1000;
  color: #0f172a;
  margin-bottom: 10px;
}
.rf-divider {
  margin: 14px 0;
  height: 1px;
  background: #e2e8f0;
}
.rf-form .rf-row {
  margin-bottom: 10px;
}
.rf-row--2 {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  align-items: end;
}
.rf-input,
.rf-select {
  width: 100%;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.88);
  padding: 0 10px;
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
  outline: none;
}
.rf-input:focus,
.rf-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.rf-color {
  width: 100%;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.88);
  padding: 0;
}
.rf-actions2 {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

/* waypoints */
.rf-wp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow: auto;
  padding-right: 2px;
}
.rf-wp {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.rf-wp__left {
  display: flex;
  gap: 10px;
  align-items: center;
}
.rf-wp__num {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid rgba(251, 146, 60, 0.35);
  background: rgba(251, 146, 60, 0.14);
  color: #92400e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 1000;
}
.rf-wp__coords {
  font-size: 11px;
  font-weight: 900;
  color: #475569;
  line-height: 1.35;
}
.rf-wp__right {
  display: flex;
  gap: 6px;
  align-items: center;
}
.rf-miniicon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  color: #475569;
}
.rf-miniicon:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
.rf-miniicon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.rf-miniicon--danger {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
  color: rgba(239, 68, 68, 0.95);
}
.rf-miniicon--danger:hover {
  background: rgba(239, 68, 68, 0.12);
}

/* empty */
.rf-empty {
  padding: 16px 12px;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.55);
  text-align: center;
  color: #64748b;
}
.rf-empty i {
  color: #06b6d4;
  font-size: 18px;
}
.rf-empty p {
  margin: 6px 0 2px;
  font-weight: 1000;
  color: #0f172a;
}
.rf-empty small {
  font-weight: 800;
}
.rf-empty--small {
  margin-top: 10px;
}

/* Leaflet icons */
:global(.rf-leaflet-term),
:global(.rf-leaflet-wp),
:global(.rf-leaflet-bus) {
  background: transparent !important;
  border: none !important;
}
:global(.rf-term) {
  width: 46px;
  height: 46px;
  position: relative;
}
:global(.rf-term__ring) {
  position: absolute;
  inset: 0;
  border-radius: 999px;
}
:global(.rf-term__badge) {
  position: absolute;
  left: 50%;
  top: 2px;
  transform: translateX(-50%);
  width: 30px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.45);
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.1);
  font-size: 12px;
}
:global(.rf-term__base) {
  position: absolute;
  left: 50%;
  top: 19px;
  transform: translateX(-50%);
  width: 28px;
  height: 21px;
  border-radius: 10px;
  border: 2px solid rgba(59, 130, 246, 0.6);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.9));
  box-shadow: 0 14px 22px rgba(0, 0, 0, 0.14);
}
:global(.rf-wpm) {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: grab;
  position: relative;
}
:global(.rf-wpm:active) {
  cursor: grabbing;
}
:global(.rf-wpm__dot) {
  position: absolute;
  left: 50%;
  top: 7px;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(251, 146, 60, 0.95);
  border: 3px solid #fff;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
}
:global(.rf-wpm__num) {
  position: absolute;
  left: 50%;
  top: 5px;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 1000;
  color: #0f172a;
}
:global(.rf-bus) {
  width: 44px;
  height: 44px;
  position: relative;
}
:global(.rf-bus__ring) {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.28) 0%, rgba(34, 197, 94, 0.1) 45%, rgba(0, 0, 0, 0) 70%);
}
:global(.rf-bus__pill) {
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  width: 34px;
  height: 26px;
  border-radius: 999px;
  border: 2px solid rgba(34, 197, 94, 0.55);
  background: rgba(255, 255, 255, 0.96);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.12);
}

/* responsive */
@media (max-width: 1200px) {
  .rf-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
  .rf-side {
    position: relative;
    top: auto;
    height: auto;
  }
  .rf-sidebody {
    height: auto;
    max-height: 70vh;
  }
  .rf-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 780px) {
  .rf-topbar {
    flex-direction: column;
    align-items: stretch;
  }
  .rf-topbar__left {
    flex-direction: column;
    align-items: flex-start;
  }
  .rf-tabs {
    grid-template-columns: 1fr 1fr;
  }
  .rf-tab:nth-child(3) {
    grid-column: 1 / -1;
  }
}
</style>