<template>
  <div class="ana">
    <!-- TOP BAR (like your screenshot) -->


    <!-- FILTERS (LANDSCAPE BAR) ✅ -->
    <section class="filterBar">
      <div class="filterBar__left">
        <div class="fld">
          <div class="fld__lab">Timeframe</div>
          <select v-model="range" class="input">
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        <div class="fld">
          <div class="fld__lab">Route</div>
          <select v-model="route" class="input">
            <option value="all">All</option>
            <option v-for="r in routeOptions" :key="r.key" :value="r.key">{{ r.label }}</option>
          </select>
        </div>

        <div class="fld">
          <div class="fld__lab">Bus</div>
          <select v-model="bus" class="input">
            <option value="all">All</option>
            <option v-for="b in busOptions" :key="b.key" :value="b.key">{{ b.label }}</option>
          </select>
        </div>

        <div class="fld fld--wide">
          <div class="fld__lab">Direction</div>
          <div class="chkRow">
            <label class="chk">
              <input type="checkbox" v-model="dirFilter.n2c" />
              <span>Naujan → Calapan</span>
            </label>
            <label class="chk">
              <input type="checkbox" v-model="dirFilter.c2n" />
              <span>Calapan → Naujan</span>
            </label>
            <label class="chk">
              <input type="checkbox" v-model="dirFilter.other" />
              <span>Other</span>
            </label>
          </div>
        </div>
      </div>

      <div class="filterBar__right">
        <div class="miniStats">
          <div class="miniStat">
            <div class="miniStat__lab">Scope buses</div>
            <div class="miniStat__val">{{ fmtInt(scopedBuses.length) }}</div>
          </div>
          <div class="miniStat">
            <div class="miniStat__lab">Avg pax/bus</div>
            <div class="miniStat__val">{{ fmt1(avgPassengersPerBus) }}</div>
          </div>
          <div class="miniStat">
            <div class="miniStat__lab">Dominant</div>
            <div class="miniStat__val">{{ dominantDirectionLabel }}</div>
          </div>
        </div>

        <button class="btn btn--soft" type="button" @click="reset">
          <i class="fas fa-eraser"></i> Reset
        </button>
      </div>
    </section>

    <!-- KPI STRIP -->
    <section class="kpis">
      <div class="kpi kpi--indigo">
        <div class="kpi__lab">Total passengers</div>
        <div class="kpi__val">{{ fmtInt(kpis.passengers) }}</div>
        <div class="kpi__sub">onboard (scope)</div>
      </div>

      <div class="kpi kpi--blue">
        <div class="kpi__lab">Active buses</div>
        <div class="kpi__val">{{ fmtInt(kpis.active) }}/{{ fmtInt(kpis.total) }}</div>
        <div class="kpi__sub">{{ fmt1(activePct) }}% active</div>
      </div>

      <div class="kpi kpi--cyan">
        <div class="kpi__lab">Naujan → Calapan</div>
        <div class="kpi__val">{{ fmtInt(directionSummary.n2c.passengers) }}</div>
        <div class="kpi__sub">{{ fmtInt(directionSummary.n2c.buses) }} buses</div>
      </div>

      <div class="kpi kpi--green">
        <div class="kpi__lab">Calapan → Naujan</div>
        <div class="kpi__val">{{ fmtInt(directionSummary.c2n.passengers) }}</div>
        <div class="kpi__sub">{{ fmtInt(directionSummary.c2n.buses) }} buses</div>
      </div>

      <div class="kpi kpi--pink">
        <div class="kpi__lab">Capacity use</div>
        <div class="kpi__val">{{ fmt1(capacityUsePct) }}%</div>
        <div class="kpi__sub">pax ÷ capacity</div>
      </div>
    </section>

    <!-- MAIN CONTENT (no right sidebar now) -->
    <section class="grid">
      <div class="left">
        <!-- Row 1 -->
        <div class="row3">
          <div class="card">
            <div class="card__head">
              <div class="card__title">Recent passenger trend</div>
              <div class="card__meta">
                <span class="chip"><i class="fas fa-clock"></i> last: {{ lastSnapshotLabel }}</span>
              </div>
            </div>
            <div class="card__body">
              <LineChart :labels="trend.labels" :dataset="trendDataset" :height="220" />
            </div>
          </div>

          <div class="card">
            <div class="card__head">
              <div class="card__title">Direction passengers</div>
              <div class="card__meta">
                <span class="chip">N→C vs C→N</span>
              </div>
            </div>
            <div class="card__body">
              <LineChart :labels="dirTrend.labels" :dataset="dirTrendDataset" :height="220" />
            </div>
          </div>

          <div class="card">
            <div class="card__head">
              <div class="card__title">Active buses (trend)</div>
              <div class="card__meta">
                <span class="chip">{{ routeLabel }}, {{ busLabel }}</span>
              </div>
            </div>
            <div class="card__body">
              <LineChart :labels="activeTrend.labels" :dataset="activeTrendDataset" :height="220" />
            </div>
          </div>
        </div>

        <!-- Row 2 -->
        <div class="row2">
          <div class="card">
            <div class="card__head">
              <div class="card__title">Passengers by direction (now)</div>
              <div class="card__meta">
                <span class="chip"><i class="fas fa-chart-column"></i> live snapshot</span>
              </div>
            </div>
            <div class="card__body">
              <BarChart :labels="directionChartLabels" :datasets="directionDatasets" :height="240" />
              <div class="noteMini">
                Direction is derived from route text containing “Naujan” + “Calapan”.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card__head">
              <div class="card__title">Passenger load (Many vs Konti)</div>
              <div class="card__meta">
                <span class="chip"><i class="fas fa-circle-half-stroke"></i> buckets</span>
              </div>
            </div>
            <div class="card__body">
              <DoughnutChart
                :labels="loadLabels"
                :values="loadValues"
                :colors="['#22c55e','#06b6d4','#f59e0b','#94a3b8']"
                center-title="Buses"
                :center-value="String(scopedBuses.length)"
                :height="240"
              />
              <div class="noteMini">
                Low &lt; 35%, Medium 35–70%, High ≥ 70%, No data = 0 capacity/offline.
              </div>
            </div>
          </div>
        </div>

        <!-- VIEW TABLES -->
        <div v-if="view === 'buses'" class="card">
          <div class="card__head">
            <div class="card__title">Buses (passenger focused)</div>
            <div class="search">
              <i class="fas fa-search"></i>
              <input v-model="q" placeholder="Search bus / route / direction..." />
              <button v-if="q" class="clear" type="button" @click="q = ''" aria-label="Clear">
                <i class="fas fa-xmark"></i>
              </button>
            </div>
          </div>

          <div class="card__body">
            <div class="tableWrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Bus</th>
                    <th>Route</th>
                    <th>Direction</th>
                    <th>Passengers</th>
                    <th>Load %</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in filteredBusRows" :key="row.id" class="clickRow" @click="focusBus(row.code)">
                    <td>
                      <div class="tdTitle">{{ row.code }}</div>
                      <div class="tdSub">cap: {{ fmtInt(row.capacity) }}</div>
                    </td>
                    <td>
                      <div class="tdTitle">{{ row.routeLabel }}</div>
                      <div class="tdSub">{{ row.routeKey }}</div>
                    </td>
                    <td>
                      <span class="dirPill" :class="row.directionKey">{{ row.directionLabel }}</span>
                    </td>
                    <td class="mono">{{ fmtInt(row.passengerCount) }}</td>
                    <td class="mono">{{ fmt1(row.loadPct) }}%</td>
                    <td class="mono">{{ row.lastSeen }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="note">Click a row to focus that bus (applies Bus filter).</div>
          </div>
        </div>

        <div v-else-if="view === 'terminals'" class="card">
          <div class="card__head">
            <div class="card__title">Terminals (remote)</div>
            <div class="chip"><i class="fas fa-list"></i> {{ terminals.length }} terminals</div>
          </div>
          <div class="card__body">
            <div class="termGrid">
              <div v-for="t in terminals.slice(0, 12)" :key="terminalKey(t)" class="termCard">
                <div class="termCard__t">{{ terminalName(t) }}</div>
                <div class="termCard__s">{{ terminalLoc(t) }}</div>
                <div class="termCard__meta" v-if="terminalRoute(t)">
                  <i class="fas fa-route"></i> {{ terminalRoute(t) }}
                </div>
              </div>
            </div>

            <div class="note" v-if="terminals.length > 12">Showing first 12 terminals.</div>
          </div>
        </div>

        <div v-else class="card">
          <div class="card__head">
            <div class="card__title">Top buses by passengers</div>
            <div class="chip"><i class="fas fa-arrow-trend-up"></i> live</div>
          </div>
          <div class="card__body">
            <div class="rankGrid">
              <div class="rankCard" v-for="b in topPassengers" :key="b.id" @click="focusBus(b.code)">
                <div class="rankCard__top">
                  <div>
                    <div class="rankCard__bus">{{ b.code }}</div>
                    <div class="rankCard__route">
                      {{ b.routeLabel }}
                      <span class="dirPill" :class="b.directionKey">{{ b.directionLabel }}</span>
                    </div>
                  </div>
                  <div class="rankCard__num">{{ fmtInt(b.passengers) }}</div>
                </div>
                <div class="rankBar">
                  <div class="rankFill" :style="{ width: clamp(b.pctOfMax, 0, 100) + '%' }"></div>
                </div>
              </div>

              <div v-if="!topPassengers.length" class="empty">No buses in scope.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useAdminLiveBuses } from "@/composables/useAdminLiveBuses";
import { useTerminals } from "@/composables/useTerminal";

import LineChart from "@/components/admin/charts/LineChart.vue";
import BarChart from "@/components/admin/charts/BarChart.vue";
import DoughnutChart from "@/components/admin/charts/Doughnut.vue";

/* ==========================
  STATE
========================== */
const view = ref("overview"); // overview | buses | terminals
const range = ref("today");
const route = ref("all");
const bus = ref("all");
const q = ref("");

const dirFilter = ref({ n2c: true, c2n: true, other: true });

/* ==========================
  LIVE + REMOTE
========================== */
const { buses: liveBuses, loading: liveLoading, error: liveError, fetchOnce, start, stop } =
  useAdminLiveBuses({ intervalMs: 2000 });

const { rows: terminals, loading: terminalsLoading, error: terminalsError, fetchTerminals } = useTerminals();

/* ==========================
  HELPERS
========================== */
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function fmtInt(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString() : "—";
}
function fmt1(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(1) : "—";
}
function normStr(x) {
  return String(x ?? "").trim();
}

function routeKeyFromBus(b) {
  const r = b?.raw || {};
  if (r.route_id != null) return `route:${r.route_id}`;
  if (r.route_code) return `route:${r.route_code}`;
  if (r.route_name) return `route:${r.route_name}`;
  if (b.route) return `route:${b.route}`;
  return "route:—";
}
function routeLabelFromBus(b) {
  const r = b?.raw || {};
  return normStr(r.route_name) || normStr(r.route_code) || normStr(b.route) || "—";
}
function isActive(b) {
  return b.status === "Online" || b.status === "Warning";
}
function loadPct(b) {
  const cap = Number(b.capacity) || 0;
  const pax = Number(b.passengerCount) || 0;
  if (!cap) return 0;
  return (pax / cap) * 100;
}
function directionFromRouteLabel(label) {
  const s = normStr(label).toLowerCase();
  const hasN = s.includes("naujan");
  const hasC = s.includes("calapan");
  if (!hasN || !hasC) return "other";
  const iN = s.indexOf("naujan");
  const iC = s.indexOf("calapan");
  return iN < iC ? "n2c" : "c2n";
}
function directionMeta(key) {
  if (key === "n2c") return { key, label: "Naujan → Calapan" };
  if (key === "c2n") return { key, label: "Calapan → Naujan" };
  return { key: "other", label: "Other" };
}

/* ==========================
  OPTIONS
========================== */
const routeOptions = computed(() => {
  const map = new Map();

  for (const b of liveBuses.value || []) {
    const key = routeKeyFromBus(b);
    const label = routeLabelFromBus(b);
    if (label && label !== "—") map.set(key, label);
  }

  for (const t of terminals.value || []) {
    const rk = normStr(t.route_name || t.route || t.routeCode || t.route_code || t.routeLabel);
    const rid = t.route_id != null ? `route:${t.route_id}` : "";
    if (rk) map.set(rid || `route:${rk}`, rk);
  }

  return [...map.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const busOptions = computed(() => {
  const map = new Map();
  for (const b of liveBuses.value || []) {
    const code = normStr(b.code);
    if (!code || code === "—") continue;
    map.set(code, code);
  }
  return [...map.entries()].map(([key, label]) => ({ key, label })).sort((a, b) => a.label.localeCompare(b.label));
});

const routeLabel = computed(() => {
  if (route.value === "all") return "All routes";
  return routeOptions.value.find((r) => r.key === route.value)?.label || "Selected route";
});
const busLabel = computed(() => (bus.value === "all" ? "All buses" : bus.value));

/* ==========================
  SCOPED BUSES (filters)
========================== */
const scopedBuses = computed(() => {
  let rows = [...(liveBuses.value || [])];

  if (route.value !== "all") rows = rows.filter((b) => routeKeyFromBus(b) === route.value);
  if (bus.value !== "all") rows = rows.filter((b) => normStr(b.code) === bus.value);

  rows = rows.filter((b) => {
    const dir = directionFromRouteLabel(routeLabelFromBus(b));
    return Boolean(dirFilter.value[dir]);
  });

  return rows;
});

/* ==========================
  KPIs
========================== */
const kpis = computed(() => {
  const rows = scopedBuses.value;
  const passengers = rows.reduce((s, b) => s + (Number(b.passengerCount) || 0), 0);
  const total = rows.length;
  const active = rows.filter(isActive).length;
  return { passengers, total, active };
});

const activePct = computed(() => {
  const t = kpis.value.total || 0;
  return t ? (kpis.value.active / t) * 100 : 0;
});

/* ==========================
  Direction summary
========================== */
const directionSummary = computed(() => {
  const out = {
    n2c: { buses: 0, passengers: 0 },
    c2n: { buses: 0, passengers: 0 },
    other: { buses: 0, passengers: 0 },
  };

  for (const b of scopedBuses.value) {
    const dir = directionFromRouteLabel(routeLabelFromBus(b));
    const pax = Number(b.passengerCount) || 0;
    out[dir].buses += 1;
    out[dir].passengers += pax;
  }

  return out;
});

const dominantDirectionLabel = computed(() => {
  const a = directionSummary.value.n2c.passengers;
  const c = directionSummary.value.c2n.passengers;
  if (a === 0 && c === 0) return "—";
  if (a === c) return "Tie";
  return a > c ? "Naujan → Calapan" : "Calapan → Naujan";
});

const directionChartLabels = computed(() => ["Naujan → Calapan", "Calapan → Naujan", "Other"]);
const directionDatasets = computed(() => {
  const d = directionSummary.value;
  return [
    {
      label: "Buses",
      data: [d.n2c.buses, d.c2n.buses, d.other.buses],
      backgroundColor: ["rgba(79,70,229,.75)", "rgba(6,182,212,.75)", "rgba(148,163,184,.65)"],
      borderRadius: 10,
    },
    {
      label: "Passengers",
      data: [d.n2c.passengers, d.c2n.passengers, d.other.passengers],
      backgroundColor: ["rgba(34,197,94,.60)", "rgba(245,158,11,.60)", "rgba(100,116,139,.45)"],
      borderRadius: 10,
    },
  ];
});

/* ==========================
  MANY vs KONTI
========================== */
const loadBuckets = computed(() => {
  let low = 0,
    mid = 0,
    high = 0,
    nodata = 0;

  for (const b of scopedBuses.value) {
    const cap = Number(b.capacity) || 0;
    const pct = loadPct(b);
    if (!cap || b.status === "Offline") {
      nodata++;
      continue;
    }
    if (pct < 35) low++;
    else if (pct < 70) mid++;
    else high++;
  }
  return { low, mid, high, nodata };
});

const loadLabels = computed(() => ["Low", "Medium", "High", "No data"]);
const loadValues = computed(() => [loadBuckets.value.low, loadBuckets.value.mid, loadBuckets.value.high, loadBuckets.value.nodata]);

/* ==========================
  SNAPSHOT HISTORY (trend)
========================== */
const history = ref([]); // { ts, passengers, active, n2cPax, c2nPax }
let lastMinuteKey = null;

function minuteKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
}

function recordSnapshot() {
  const ts = Date.now();
  const mk = minuteKey(ts);
  if (mk === lastMinuteKey) return;
  lastMinuteKey = mk;

  history.value.push({
    ts,
    passengers: kpis.value.passengers,
    active: kpis.value.active,
    n2cPax: directionSummary.value.n2c.passengers,
    c2nPax: directionSummary.value.c2n.passengers,
  });

  const MAX = 2880;
  if (history.value.length > MAX) history.value.splice(0, history.value.length - MAX);
}

watch(
  () => liveBuses.value,
  () => recordSnapshot(),
  { deep: true }
);

const lastSnapshotLabel = computed(() => {
  const last = history.value[history.value.length - 1];
  if (!last) return "—";
  return new Date(last.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
});

function pickSeriesPoints(targetCount) {
  const h = history.value;
  if (!h.length) return [];
  if (h.length <= targetCount) return h;

  const out = [];
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.floor((i / (targetCount - 1)) * (h.length - 1));
    out.push(h[idx]);
  }
  return out;
}

function seriesFor(getValue) {
  const targetCount = range.value === "today" ? 12 : range.value === "7d" ? 7 : 15;
  const pts = pickSeriesPoints(targetCount);

  const labels = pts.map((p) => {
    const d = new Date(p.ts);
    if (range.value === "today") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  });

  const values = pts.map((p) => Math.round(getValue(p)));
  return { labels, values };
}

const trend = computed(() => seriesFor((p) => p.passengers));
const dirTrend = computed(() => seriesFor((p) => p.n2cPax - p.c2nPax)); // kept compatible with your LineChart API
const activeTrend = computed(() => seriesFor((p) => p.active));

const trendDataset = computed(() => ({
  data: trend.value.values,
  label: "Passengers",
  borderColor: "#4f46e5",
  backgroundColor: "rgba(79,70,229,.12)",
}));

const dirTrendDataset = computed(() => ({
  data: dirTrend.value.values,
  label: "N→C minus C→N",
  borderColor: "#06b6d4",
  backgroundColor: "rgba(6,182,212,.12)",
}));

const activeTrendDataset = computed(() => ({
  data: activeTrend.value.values,
  label: "Active buses",
  borderColor: "#22c55e",
  backgroundColor: "rgba(34,197,94,.12)",
}));

/* ==========================
  EXTRA
========================== */
const avgPassengersPerBus = computed(() => {
  const t = kpis.value.total || 0;
  return t ? kpis.value.passengers / t : 0;
});
const capacityUsePct = computed(() => {
  const rows = scopedBuses.value;
  const cap = rows.reduce((s, b) => s + (Number(b.capacity) || 0), 0);
  const pax = rows.reduce((s, b) => s + (Number(b.passengerCount) || 0), 0);
  return cap ? (pax / cap) * 100 : 0;
});

/* ==========================
  RANKED
========================== */
const rankedByPassengers = computed(() => {
  const rows = scopedBuses.value.map((b) => {
    const routeLabel = routeLabelFromBus(b);
    const dirKey = directionFromRouteLabel(routeLabel);
    const dm = directionMeta(dirKey);
    return {
      id: b.id,
      code: normStr(b.code) || "—",
      routeLabel,
      directionKey: dm.key,
      directionLabel: dm.label,
      passengers: Number(b.passengerCount) || 0,
    };
  });

  const max = rows.reduce((m, r) => Math.max(m, r.passengers), 0) || 1;
  return rows
    .map((r) => ({ ...r, pctOfMax: (r.passengers / max) * 100 }))
    .sort((a, c) => c.passengers - a.passengers);
});
const topPassengers = computed(() => rankedByPassengers.value.slice(0, 6));

/* ==========================
  BUSES TABLE
========================== */
const busRows = computed(() => {
  return scopedBuses.value.map((b) => {
    const routeLabel = routeLabelFromBus(b);
    const dirKey = directionFromRouteLabel(routeLabel);
    const dm = directionMeta(dirKey);
    return {
      id: b.id,
      code: normStr(b.code) || "—",
      routeKey: routeKeyFromBus(b),
      routeLabel,
      directionKey: dm.key,
      directionLabel: dm.label,
      passengerCount: Number(b.passengerCount) || 0,
      capacity: Number(b.capacity) || 0,
      loadPct: loadPct(b),
      lastSeen: b.lastSeen || "—",
    };
  });
});

const filteredBusRows = computed(() => {
  const key = q.value.trim().toLowerCase();
  if (!key) return busRows.value;
  return busRows.value.filter((r) => `${r.code} ${r.routeLabel} ${r.directionLabel} ${r.routeKey}`.toLowerCase().includes(key));
});

function focusBus(code) {
  if (!code || code === "—") return;
  bus.value = code;
  view.value = "buses";
}

/* ==========================
  TERMINALS
========================== */
function terminalKey(t) {
  return t?.id ?? t?.terminal_id ?? `${terminalName(t)}-${terminalLoc(t)}`;
}
function terminalName(t) {
  return normStr(t?.name || t?.terminal_name || t?.title || "Terminal");
}
function terminalLoc(t) {
  return normStr(t?.city || t?.municipality || t?.address || t?.location) || "—";
}
function terminalRoute(t) {
  return normStr(t?.route_name || t?.route || t?.routeLabel || "");
}

/* ==========================
  ACTIONS
========================== */
async function refreshNow() {
  await Promise.allSettled([fetchOnce(), fetchTerminals()]);
}
function reset() {
  range.value = "today";
  route.value = "all";
  bus.value = "all";
  q.value = "";
  dirFilter.value = { n2c: true, c2n: true, other: true };
}

watch(routeOptions, (opts) => {
  if (route.value !== "all" && !opts.some((r) => r.key === route.value)) route.value = "all";
});
watch(busOptions, (opts) => {
  if (bus.value !== "all" && !opts.some((b) => b.key === bus.value)) bus.value = "all";
});

/* ==========================
  LIFECYCLE
========================== */
onMounted(async () => {
  start();
  await fetchTerminals();
});
onUnmounted(() => stop());
</script>

<style scoped>
.ana {
  --bg: #f3f6fb;
  --card: #ffffff;
  --ink: #0f172a;
  --mut: #64748b;
  --bd: #e5e7eb;
  --soft: #f1f5f9;
  --r: 16px;
  min-height: calc(100vh - 64px);
  padding: 14px;
  background: var(--bg);
}

/* Topbar */
.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--bd);
  border-radius: var(--r);
  background: var(--card);
}
.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}
.brand__ic {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(6, 182, 212, 0.12));
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.18);
}
.brand__t {
  font-weight: 1100;
  color: var(--ink);
  letter-spacing: -0.2px;
  font-size: 14px;
}
.brand__s {
  margin-top: 2px;
  font-weight: 850;
  color: var(--mut);
  font-size: 12px;
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.navTabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.navTab {
  height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid var(--bd);
  background: #fff;
  font-weight: 1000;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
}
.navTab:hover {
  background: var(--soft);
}
.navTab.on {
  border-color: transparent;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #06b6d4);
}
.topRight {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
  align-items: center;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid var(--bd);
  background: var(--soft);
  font-size: 11px;
  font-weight: 1000;
  color: #475569;
}
.pill--ok {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.12);
  color: #166534;
}
.pill--warn {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.14);
  color: #92400e;
}
.btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid var(--bd);
  background: #fff;
  font-size: 12px;
  font-weight: 1100;
  color: #334155;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn:hover {
  background: var(--soft);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn--soft {
  background: var(--soft);
}

/* ✅ FILTER BAR (landscape) */
.filterBar {
  margin-top: 12px;
  border: 1px solid var(--bd);
  border-radius: var(--r);
  background: var(--card);
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
}
.filterBar__left {
  display: grid;
  grid-template-columns: 180px 260px 180px 1fr;
  gap: 12px;
  align-items: end;
}
.filterBar__right {
  display: flex;
  gap: 12px;
  align-items: end;
  justify-content: flex-end;
}

/* Fields */
.fld {
  display: grid;
  gap: 6px;
}
.fld__lab {
  font-size: 11px;
  font-weight: 1100;
  color: #64748b;
}
.input {
  height: 36px;
  border-radius: 12px;
  border: 1px solid var(--bd);
  background: #fff;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 1000;
  color: var(--ink);
  outline: none;
}
.input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}
.fld--wide .input {
  width: 100%;
}
.chkRow {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  min-height: 36px;
  border: 1px solid var(--bd);
  border-radius: 12px;
  padding: 0 10px;
  background: rgba(241, 245, 249, 0.65);
}
.chk {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  font-weight: 950;
  color: #334155;
  user-select: none;
}
.chk input {
  width: 14px;
  height: 14px;
}

/* Mini stats on the right of filter bar */
.miniStats {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.miniStat {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 14px;
  background: rgba(241, 245, 249, 0.65);
  min-width: 160px;
}
.miniStat__lab {
  font-size: 11px;
  font-weight: 1000;
  color: #64748b;
}
.miniStat__val {
  font-size: 12px;
  font-weight: 1200;
  color: var(--ink);
}

/* KPI strip */
.kpis {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.kpi {
  border-radius: 16px;
  padding: 12px;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.kpi::after {
  content: "";
  position: absolute;
  right: -40px;
  top: -40px;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
}
.kpi__lab {
  font-size: 12px;
  font-weight: 1000;
  opacity: 0.9;
}
.kpi__val {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 1300;
  letter-spacing: -0.4px;
}
.kpi__sub {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 900;
  opacity: 0.9;
}
.kpi--indigo {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
}
.kpi--blue {
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
}
.kpi--cyan {
  background: linear-gradient(135deg, #06b6d4, #22c55e);
}
.kpi--green {
  background: linear-gradient(135deg, #22c55e, #10b981);
}
.kpi--pink {
  background: linear-gradient(135deg, #ec4899, #f97316);
}

/* Main content */
.grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.left {
  display: grid;
  gap: 12px;
}
.row3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Cards */
.card {
  border: 1px solid var(--bd);
  border-radius: var(--r);
  background: var(--card);
  overflow: hidden;
}
.card__head {
  padding: 12px;
  border-bottom: 1px solid var(--bd);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}
.card__title {
  font-size: 12px;
  font-weight: 1200;
  color: var(--ink);
}
.card__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.card__body {
  padding: 12px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--bd);
  background: rgba(241, 245, 249, 0.85);
  font-size: 11px;
  font-weight: 1000;
  color: #475569;
}
.noteMini {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 850;
  color: var(--mut);
}

/* Rank cards */
.rankGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.rankCard {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  cursor: pointer;
}
.rankCard:hover {
  background: rgba(99, 102, 241, 0.04);
}
.rankCard__top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}
.rankCard__bus {
  font-size: 13px;
  font-weight: 1200;
  color: var(--ink);
}
.rankCard__route {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 900;
  color: var(--mut);
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.rankCard__num {
  font-size: 13px;
  font-weight: 1200;
  color: var(--ink);
}
.rankBar {
  margin-top: 10px;
  height: 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(241, 245, 249, 0.85);
  overflow: hidden;
}
.rankFill {
  height: 100%;
  background: linear-gradient(90deg, rgba(79, 70, 229, 0.85), rgba(6, 182, 212, 0.85));
}

/* Direction pill */
.dirPill {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(241, 245, 249, 0.9);
  color: #475569;
  font-size: 11px;
  font-weight: 1000;
}
.dirPill.n2c {
  border-color: rgba(6, 182, 212, 0.35);
  background: rgba(6, 182, 212, 0.12);
  color: #0e7490;
}
.dirPill.c2n {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.14);
  color: #92400e;
}
.dirPill.other {
  border-color: rgba(148, 163, 184, 0.45);
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
}

/* Search + table */
.search {
  height: 36px;
  border-radius: 14px;
  border: 1px solid var(--bd);
  background: var(--soft);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  min-width: 260px;
}
.search i {
  color: #94a3b8;
}
.search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  font-weight: 900;
  color: var(--ink);
}
.clear {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
}
.clear:hover {
  background: rgba(15, 23, 42, 0.06);
}
.tableWrap {
  border: 1px solid var(--bd);
  border-radius: var(--r);
  overflow: hidden;
  background: #fff;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table thead th {
  text-align: left;
  font-size: 11px;
  font-weight: 1100;
  color: #64748b;
  background: rgba(241, 245, 249, 0.85);
  padding: 10px 12px;
  border-bottom: 1px solid var(--bd);
}
.table tbody td {
  padding: 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.88);
  font-size: 12px;
  font-weight: 900;
  color: var(--ink);
}
.clickRow {
  cursor: pointer;
}
.table tbody tr:hover {
  background: rgba(99, 102, 241, 0.04);
}
.tdTitle {
  font-size: 12px;
  font-weight: 1100;
  color: var(--ink);
}
.tdSub {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
}
.note {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 850;
  color: var(--mut);
}

/* Terminals */
.termGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.termCard {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  padding: 10px;
  background: #fff;
}
.termCard__t {
  font-size: 12px;
  font-weight: 1100;
  color: var(--ink);
}
.termCard__s {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
}
.termCard__meta {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 900;
  color: #475569;
  display: flex;
  gap: 8px;
  align-items: center;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.empty {
  font-size: 12px;
  font-weight: 900;
  color: #94a3b8;
  padding: 10px;
}

/* Responsive */
@media (max-width: 1200px) {
  .topbar {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .topRight {
    justify-content: flex-start;
  }
  .filterBar {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .filterBar__left {
    grid-template-columns: 1fr 1fr;
  }
  .filterBar__right {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .kpis {
    grid-template-columns: 1fr 1fr;
  }
  .row3 {
    grid-template-columns: 1fr;
  }
  .row2 {
    grid-template-columns: 1fr;
  }
  .rankGrid {
    grid-template-columns: 1fr;
  }
  .termGrid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .filterBar__left {
    grid-template-columns: 1fr;
  }
  .miniStat {
    min-width: 0;
    width: 100%;
  }
}
</style>