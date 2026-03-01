<!-- src/pages/commuters/TerminalDetailsPage.vue
     ✅ shows terminal info + live buses inside this terminal
     ✅ card tap from TerminalPage goes here
-->
<template>
  <div class="td-page">
    <!-- Header -->
    <div class="td-top">
      <button class="td-back" type="button" @click="goBack">
        <i class="fas fa-chevron-left"></i>
      </button>

      <div class="td-head">
        <div class="td-ic"><i class="fas fa-building"></i></div>
        <div class="td-meta">
          <div class="td-title">{{ terminal?.terminal_name || "Terminal" }}</div>
          <div class="td-sub">
            <i class="fas fa-location-dot"></i>
            <span>{{ terminal?.city || "—" }}</span>
          </div>
        </div>
      </div>

      <button class="td-refresh" type="button" @click="refreshNow" :disabled="busy">
        <i class="fas fa-rotate" :class="{ spin: busy }"></i>
      </button>
    </div>

    <!-- Stats -->
    <div class="td-stats">
      <div class="td-stat">
        <div class="td-stat__label">Buses inside</div>
        <div class="td-stat__value">{{ insideBuses.length }}</div>
      </div>

      <div class="td-stat td-stat--soft">
        <div class="td-stat__label">Live</div>
        <div class="td-stat__value">
          <span class="td-live"><span class="dot"></span> Updating</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="td-actions">
      <button class="td-btn primary" type="button" @click="viewOnLiveTrack" :disabled="!terminalIdNum">
        <i class="fas fa-map-location-dot"></i>
        View on Live Track
      </button>

      <a class="td-btn" :href="mapsUrl" target="_blank" rel="noopener noreferrer" v-if="mapsUrl">
        <i class="fas fa-map"></i>
        Open Google Maps
      </a>
    </div>

    <!-- List -->
    <div class="td-list">
      <div v-if="insideBuses.length === 0" class="td-empty">
        <i class="fas fa-bus"></i>
        <div class="td-empty-title">No buses inside right now</div>
        <div class="td-empty-sub">If buses are moving, they will appear on Live Track.</div>
      </div>

      <div v-else class="td-wrap">
        <div
          v-for="b in insideBuses"
          :key="b.id"
          class="td-row"
          @click="openBusOnTrack(b)"
          role="button"
        >
          <div class="td-badge" :class="occClass(b)">
            <div class="td-badge-top">{{ b.trackNo || b.bus_code || b.plate_no || b.id }}</div>
            <div class="td-badge-sub">BUS</div>
          </div>

          <div class="td-row-main">
            <div class="td-row-title">{{ b.route || "Route" }}</div>
            <div class="td-row-sub">
              <span class="pill" :class="occClass(b)">
                <i class="fas fa-user"></i> {{ seatsLabel(b) }}
              </span>

              <span class="pill soft">
                <i class="fas fa-signal"></i>
                Sats {{ b.sats ?? "—" }} • HDOP {{ b.hdop ?? "—" }}
              </span>
            </div>
          </div>

          <div class="td-row-right">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      <div style="height: 10px;"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTerminals } from "@/composables/useTerminal";
import { useLiveBuses } from "@/composables/useLiveBuses";

const route = useRoute();
const router = useRouter();

const { rows, fetchTerminals } = useTerminals();
const { buses, start, stop, fetchOnce } = useLiveBuses({ intervalMs: 1000 });

const busy = ref(false);

const terminalId = computed(() => route.query?.terminalId || "");
const terminalIdNum = computed(() => {
  const n = Number(terminalId.value);
  return Number.isFinite(n) ? n : NaN;
});

const terminals = computed(() => (Array.isArray(rows.value) ? rows.value : []));
const terminal = computed(() => terminals.value.find((t) => Number(t.terminal_id) === terminalIdNum.value) || null);

function isAtTerminal(bus) {
  const v =
    bus?.at_terminal ??
    bus?.atTerminal ??
    bus?.terminal_state?.at_terminal ??
    bus?.terminal_state?.atTerminal ??
    bus?.terminal_state?.atTerminalFlag;

  return Number(v) === 1 || v === true;
}
function busCurrentTerminalId(bus) {
  const v =
    bus?.terminal_state?.current_terminal_id ??
    bus?.terminal_state?.currentTerminalId ??
    bus?.current_terminal_id ??
    bus?.currentTerminalId;

  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

const insideBuses = computed(() => {
  const tid = terminalIdNum.value;
  if (!Number.isFinite(tid)) return [];
  return (buses.value || []).filter((b) => isAtTerminal(b) && busCurrentTerminalId(b) === tid);
});

function occClass(bus) {
  const cap = Number(bus.capacity ?? 0);
  const used = Number(bus.seats ?? 0);
  if (!cap || cap < 1) return "low";
  const r = Math.max(0, Math.min(1, used / cap));
  if (r >= 0.85) return "full";
  if (r >= 0.55) return "mid";
  return "low";
}
function seatsLabel(bus) {
  const cap = Number(bus.capacity ?? 0);
  const used = Number(bus.seats ?? 0);
  if (!cap || cap < 1) return "—";
  return `${used}/${cap} seats`;
}

const mapsUrl = computed(() => {
  const t = terminal.value;
  if (!t) return "";
  const lat = Number(t.lat);
  const lng = Number(t.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return `https://www.google.com/maps?q=${lat},${lng}`;
  const text = encodeURIComponent(`${t.terminal_name || "Terminal"}, ${t.city || ""}`);
  return `https://www.google.com/maps/search/?api=1&query=${text}`;
});

function goBack() {
  router.back();
}

function viewOnLiveTrack() {
  const tid = terminalIdNum.value;
  if (!Number.isFinite(tid)) return;
  router.push({ path: "/track-bus", query: { terminalId: String(tid) } });
}

/* optional: open Track page and focus bus (if you want) */
function openBusOnTrack(bus) {
  // If later you implement busId focusing, you can pass busId too.
  const tid = terminalIdNum.value;
  router.push({ path: "/track-bus", query: { terminalId: String(tid) } });
}

async function refreshNow() {
  busy.value = true;
  try {
    await fetchOnce();
  } finally {
    busy.value = false;
  }
}

async function loadTerminalInfo() {
  await fetchTerminals({ q: "" });
  await nextTick();
}

watch(
  () => route.query?.terminalId,
  async () => {
    await loadTerminalInfo();
  }
);

onMounted(async () => {
  await loadTerminalInfo();
  start();
  await fetchOnce();
});

onUnmounted(() => {
  stop();
});
</script>

<style scoped>
.td-page{
  height: calc(100vh - var(--bottom-nav-h, 72px));
  background: var(--light-bg, #f5f7fa);
  overflow: hidden;
  display:flex;
  flex-direction: column;
}

/* top header */
.td-top{
  padding: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(245,247,250,0.95), rgba(245,247,250,0.75));
  backdrop-filter: blur(10px);
  display:flex;
  align-items:center;
  gap: 10px;
}
.td-back{
  width: 44px; height: 44px;
  border-radius: 14px;
  border: 2px solid var(--border-light, rgba(209,213,219,0.75));
  background: #fff;
  color: var(--text-dark, #111827);
  cursor:pointer;
}
.td-back:active{ transform: scale(0.96); }

.td-head{
  flex: 1;
  min-width: 0;
  display:flex;
  align-items:center;
  gap: 10px;
  border: 2px solid var(--border-light, rgba(209,213,219,0.75));
  background: rgba(255,255,255,0.92);
  border-radius: 18px;
  padding: 10px 12px;
  box-shadow: 0 14px 26px rgba(0,0,0,0.10);
}
.td-ic{
  width: 40px; height: 40px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary-blue,#1e88e5) 0%, var(--accent-teal,#00bfa6) 100%);
  color:#fff;
  display:grid;
  place-items:center;
}
.td-title{
  font-weight: 1000;
  font-size: 14px;
  color: var(--text-dark, #111827);
  line-height: 1.1;
}
.td-sub{
  margin-top: 4px;
  display:flex;
  align-items:center;
  gap: 8px;
  font-weight: 900;
  font-size: 12px;
  color: var(--text-gray, rgba(31,41,55,0.60));
}
.td-refresh{
  width: 44px; height: 44px;
  border-radius: 14px;
  border: 2px solid var(--border-light, rgba(209,213,219,0.75));
  background: #fff;
  color: var(--text-dark, #111827);
  cursor:pointer;
}
.td-refresh:active{ transform: scale(0.96); }
.spin{ animation: spin 0.9s linear infinite; }
@keyframes spin{ to { transform: rotate(360deg); } }

/* stats */
.td-stats{
  padding: 0 12px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.td-stat{
  border: 2px solid var(--border-light, rgba(209,213,219,0.75));
  background: rgba(255,255,255,0.92);
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 10px 18px rgba(0,0,0,0.06);
}
.td-stat--soft{
  border-color: rgba(0,131,143,0.22);
  background: rgba(0,131,143,0.06);
}
.td-stat__label{
  font-size: 12px;
  font-weight: 900;
  color: var(--text-gray, rgba(31,41,55,0.60));
}
.td-stat__value{
  margin-top: 6px;
  font-size: 18px;
  font-weight: 1000;
  color: var(--text-dark, #111827);
}
.td-live{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  font-weight: 1000;
  color: rgba(0,131,143,0.95);
}
.td-live .dot{
  width: 8px; height: 8px;
  border-radius: 999px;
  background: rgba(0,131,143,0.95);
  box-shadow: 0 0 0 0 rgba(0,131,143,0.35);
  animation: pulse 1.3s infinite;
}
@keyframes pulse{
  0%{ box-shadow: 0 0 0 0 rgba(0,131,143,0.35); }
  70%{ box-shadow: 0 0 0 10px rgba(0,131,143,0); }
  100%{ box-shadow: 0 0 0 0 rgba(0,131,143,0); }
}

/* actions */
.td-actions{
  padding: 10px 12px 0;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
.td-btn{
  border: 2px solid var(--border-light, rgba(209,213,219,0.75));
  background: #fff;
  color: rgba(38,43,51,0.92);
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1000;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  cursor:pointer;
  text-decoration:none;
}
.td-btn:active{ transform: scale(0.98); }
.td-btn.primary{
  border-color: rgba(0,131,143,0.22);
  background: rgba(0,131,143,0.08);
  color: rgba(0,131,143,0.98);
}

/* list */
.td-list{
  padding: 10px 12px 12px;
  overflow:auto;
  -webkit-overflow-scrolling: touch;
}
.td-empty{
  margin-top: 10px;
  border: 2px dashed var(--border-light, rgba(209,213,219,0.75));
  border-radius: 18px;
  padding: 22px 14px;
  text-align:center;
  color: rgba(31,41,55,0.60);
  font-weight: 1000;
  background: rgba(255,255,255,0.7);
}
.td-empty i{
  font-size: 22px;
  margin-bottom: 10px;
  color: var(--accent-teal, #00bfa6);
}
.td-empty-title{ font-size: 14px; color: rgba(38,43,51,0.92); }
.td-empty-sub{ margin-top: 4px; font-size: 12px; font-weight: 900; }

.td-wrap{ display:flex; flex-direction: column; gap: 10px; margin-top: 10px; }

.td-row{
  border: 2px solid var(--border-light, rgba(209,213,219,0.75));
  background: rgba(255,255,255,0.95);
  border-radius: 18px;
  padding: 12px;
  display:flex;
  gap: 12px;
  align-items:flex-start;
  cursor:pointer;
  box-shadow: 0 14px 26px rgba(0,0,0,0.10);
}
.td-row:active{ transform: scale(0.99); }

.td-badge{
  width: 56px;
  border-radius: 16px;
  color:#fff;
  display:flex;
  flex-direction: column;
  align-items:center;
  justify-content:center;
  font-weight: 1000;
  flex-shrink: 0;
  padding: 10px 0;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-teal) 100%);
}
.td-badge.low{ background: linear-gradient(135deg,#16a34a 0%, #22c55e 100%); }
.td-badge.mid{ background: linear-gradient(135deg,#f59e0b 0%, #fbbf24 100%); }
.td-badge.full{ background: linear-gradient(135deg,#ef4444 0%, #f87171 100%); }
.td-badge-top{ font-size: 14px; line-height: 1; }
.td-badge-sub{ font-size: 10px; opacity: 0.9; margin-top: 4px; }

.td-row-main{ flex: 1; min-width: 0; }
.td-row-title{
  font-weight: 1000;
  font-size: 14px;
  color: rgba(38,43,51,0.92);
  overflow:hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.td-row-sub{
  margin-top: 8px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pill{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  border: 2px solid var(--border-light, rgba(209,213,219,0.75));
  background: rgba(17,24,39,0.02);
  color: rgba(38,43,51,0.78);
  font-weight: 1000;
  font-size: 12px;
}
.pill.soft{
  border-color: rgba(0,131,143,0.18);
  background: rgba(0,131,143,0.06);
}

.td-row-right{
  color: rgba(156,163,175,0.95);
  font-size: 18px;
  padding-top: 6px;
  flex-shrink: 0;
}
</style>