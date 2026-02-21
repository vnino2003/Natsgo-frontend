<template>
  <div class="iot-health">
    <!-- Header -->
    <div class="iot-health__hero">
      <div class="iot-health__hero-left">
        <div class="iot-health__hero-icon">
          <i class="fas fa-heart-pulse"></i>
        </div>

        <div class="iot-health__hero-text">
          <p class="iot-health__hero-title">IoT Health Monitor</p>
          <p class="iot-health__hero-sub">
            Heartbeat status, GPS quality, signal strength, and IR sensor readiness.
          </p>

          <div class="iot-health__hero-meta">
            <span class="iot-health__meta-pill">
              <i class="fas fa-clock"></i>
              Updated: <b>{{ lastUpdated }}</b>
            </span>
            <span class="iot-health__meta-pill soft">
              <span class="iot-health__dot ok"></span>
              System: <b>Operational</b>
            </span>
          </div>
        </div>
      </div>

      <button class="iot-health__btn" type="button" @click="refresh">
        <i class="fas fa-rotate"></i>
        Refresh
      </button>
    </div>

    <!-- Summary -->
    <div class="iot-health__summary">
      <div class="iot-health__sum-card">
        <div class="iot-health__sum-top">
          <p class="iot-health__sum-label">Tracking Service</p>
          <span class="iot-health__chip ok">
            <i class="fas fa-circle-check"></i> Healthy
          </span>
        </div>

        <p class="iot-health__sum-value">Operational</p>
        <p class="iot-health__sum-sub">Receiving telemetry updates</p>

        <div class="iot-health__sum-bg">
          <i class="fas fa-satellite-dish"></i>
        </div>
      </div>

      <div class="iot-health__sum-card">
        <div class="iot-health__sum-top">
          <p class="iot-health__sum-label">Devices Online</p>
          <span class="iot-health__chip info">
            <i class="fas fa-wifi"></i> Live
          </span>
        </div>

        <p class="iot-health__sum-value">{{ summary.online }}</p>
        <p class="iot-health__sum-sub">Out of {{ summary.total }} total devices</p>

        <div class="iot-health__sum-bg">
          <i class="fas fa-microchip"></i>
        </div>
      </div>

      <div class="iot-health__sum-card warn">
        <div class="iot-health__sum-top">
          <p class="iot-health__sum-label">GPS Fix Issues</p>
          <span class="iot-health__chip warn">
            <i class="fas fa-location-crosshairs"></i> Check
          </span>
        </div>

        <p class="iot-health__sum-value">{{ summary.gpsIssues }}</p>
        <p class="iot-health__sum-sub">No fix / weak fix (2D)</p>

        <div class="iot-health__sum-bg">
          <i class="fas fa-location-dot"></i>
        </div>
      </div>

      <div class="iot-health__sum-card warn">
        <div class="iot-health__sum-top">
          <p class="iot-health__sum-label">IR Sensor Issues</p>
          <span class="iot-health__chip warn">
            <i class="fas fa-triangle-exclamation"></i> Inspect
          </span>
        </div>

        <p class="iot-health__sum-value">{{ summary.irIssues }}</p>
        <p class="iot-health__sum-sub">Blocked / disconnected sensors</p>

        <div class="iot-health__sum-bg">
          <i class="fas fa-wave-square"></i>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="iot-health__table-card">
      <div class="iot-health__table-head">
        <div>
          <p class="iot-health__table-title">Device Telemetry</p>
          <p class="iot-health__table-sub">Quick scan for issues per device</p>
        </div>

        <div class="iot-health__table-actions">
          <div class="iot-health__search">
            <i class="fas fa-search"></i>
            <input v-model="q" class="iot-health__search-input" placeholder="Search device code, ESP32 ID, bus..." />
          </div>

          <select v-model="flt" class="iot-health__select">
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="warning">Needs Attention</option>
            <option value="offline">Offline</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>

      <div class="admin-table-health-wrap">
        <table class="admin-table-health">
          <thead>
            <tr>
              <th>Device</th>
              <th>Assignment</th>
              <th>Heartbeat</th>
              <th>GPS Fix</th>
              <th>Signal</th>
              <th>IR Sensor</th>
              <th>Warnings</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="d in filteredRows" :key="d.id">
              <td>
                <div class="cell-main">{{ d.code }}</div>
                <div class="cell-sub mono">{{ d.esp32Id }}</div>
              </td>

              <td>
                <span class="pill-badge" :class="d.bus ? 'ok' : 'soft'">
                  <i class="fas" :class="d.bus ? 'fa-link' : 'fa-link-slash'"></i>
                  {{ d.bus || "Unassigned" }}
                </span>
                <div class="cell-sub" v-if="d.bus">Source: GPS + IR</div>
                <div class="cell-sub" v-else>Not sending to any bus</div>
              </td>

              <td>
                <span class="pill-badge" :class="hbClass(d.heartbeat)">
                  <i class="fas" :class="hbIcon(d.heartbeat)"></i>
                  {{ d.heartbeat }}
                </span>
                <div class="cell-sub">Last: {{ d.lastSeen }}</div>
              </td>

              <td>
                <span class="pill-badge" :class="gpsClass(d.gpsFix)">
                  <i class="fas fa-location-crosshairs"></i>
                  {{ d.gpsFix }}
                </span>
                <div class="cell-sub">Sat: {{ d.sats }} • HDOP: {{ d.hdop }}</div>
              </td>

              <td>
                <span class="pill-badge" :class="sigClass(d.signal)">
                  <i class="fas fa-signal"></i>
                  {{ d.signal }}
                </span>
                <div class="cell-sub">Network: {{ d.net }}</div>
              </td>

              <td>
                <span class="pill-badge" :class="irClass(d.irStatus)">
                  <i class="fas fa-wave-square"></i>
                  {{ d.irStatus }}
                </span>
                <div class="cell-sub">Mode: {{ d.irMode }}</div>
              </td>

              <td>
                <div class="warn-wrap">
                  <span v-for="w in d.warnings" :key="w" class="warn-pill">
                    <i class="fas fa-triangle-exclamation"></i> {{ w }}
                  </span>

                  <span v-if="d.warnings.length === 0" class="ok-text">
                    <i class="fas fa-circle-check"></i> No issues
                  </span>
                </div>
              </td>
            </tr>

            <tr v-if="filteredRows.length === 0">
              <td colspan="7">
                <div class="empty">
                  <i class="fas fa-heart-pulse"></i>
                  <p>No telemetry data</p>
                  <small>Try another filter or refresh.</small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="iot-health__tip">
        <i class="fas fa-lightbulb"></i>
        <p>
          <b>IR passenger counter tip:</b> “Blocked” means the beam is continuously interrupted
          (misalignment, dirt, obstruction). “Disconnected” usually means wiring/power issue.
        </p>
      </div>
    </div>

    <div style="height:14px;"></div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"

const now = ref(new Date())
const lastUpdated = computed(() => now.value.toLocaleString())

const q = ref("")
const flt = ref("all")

const rows = ref([
  {
    id: 1,
    code: "DEV-ESP32-001",
    esp32Id: "A1:B2:C3:D4:E5:F6",
    bus: "BUS-001",
    heartbeat: "Online",
    lastSeen: "1 min ago",
    gpsFix: "3D",
    sats: 11,
    hdop: 0.9,
    signal: "Strong",
    net: "LTE",
    irStatus: "Ready",
    irMode: "entry-exit",
    warnings: [],
  },
  {
    id: 2,
    code: "DEV-ESP32-002",
    esp32Id: "11:22:33:44:55:66",
    bus: null,
    heartbeat: "Online",
    lastSeen: "7 mins ago",
    gpsFix: "2D",
    sats: 5,
    hdop: 2.2,
    signal: "Weak",
    net: "LTE",
    irStatus: "Blocked",
    irMode: "single",
    warnings: ["IR beam blocked", "GPS weak fix"],
  },
  {
    id: 3,
    code: "DEV-ESP32-003",
    esp32Id: "AA:BB:CC:DD:EE:FF",
    bus: null,
    heartbeat: "Offline",
    lastSeen: "2 days ago",
    gpsFix: "No Fix",
    sats: 0,
    hdop: "-",
    signal: "No Signal",
    net: "-",
    irStatus: "Disconnected",
    irMode: "entry-exit",
    warnings: ["Device offline", "GPS no fix", "IR disconnected"],
  },
])

const summary = computed(() => {
  const total = rows.value.length
  const online = rows.value.filter((r) => r.heartbeat === "Online").length
  const gpsIssues = rows.value.filter((r) => r.gpsFix === "No Fix" || r.gpsFix === "2D").length
  const irIssues = rows.value.filter((r) => r.irStatus === "Blocked" || r.irStatus === "Disconnected").length
  return { total, online, gpsIssues, irIssues }
})

const filteredRows = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rows.value.filter((r) => {
    const hay = [r.code, r.esp32Id, r.bus || "", r.heartbeat, r.gpsFix, r.signal, r.irStatus]
      .join(" ")
      .toLowerCase()

    const matchesSearch = !keyword || hay.includes(keyword)

    const isUnassigned = !r.bus
    const isOffline = r.heartbeat === "Offline"
    const isWarning = r.warnings.length > 0 || r.gpsFix === "2D" || r.irStatus === "Blocked"
    const isOnline = r.heartbeat === "Online"

    const matchesFilter =
      flt.value === "all" ||
      (flt.value === "online" && isOnline && !isOffline) ||
      (flt.value === "warning" && isWarning && !isOffline) ||
      (flt.value === "offline" && isOffline) ||
      (flt.value === "unassigned" && isUnassigned)

    return matchesSearch && matchesFilter
  })
})

function refresh() {
  now.value = new Date()
  alert("Refresh placeholder: connect to API later.")
}

/* badge helpers */
function hbClass(v) {
  if (v === "Online") return "ok"
  if (v === "Degraded") return "warn"
  return "bad"
}
function hbIcon(v) {
  if (v === "Online") return "fa-circle-check"
  if (v === "Degraded") return "fa-triangle-exclamation"
  return "fa-circle-xmark"
}
function gpsClass(v) {
  if (v === "3D") return "ok"
  if (v === "2D") return "warn"
  return "bad"
}
function sigClass(v) {
  if (v === "Strong") return "ok"
  if (v === "Weak") return "warn"
  return "bad"
}
function irClass(v) {
  if (v === "Ready") return "info"
  if (v === "Blocked") return "warn"
  return "bad"
}
</script>

<style scoped>
/* =========================
   IoT HEALTH (PAGE ONLY)
   ========================= */
.iot-health{
  padding: 16px;
}

/* ===== HERO ===== */
.iot-health__hero{
  border-radius: 18px;
  padding: 16px;
  background:
    radial-gradient(circle at 18% 12%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(135deg, rgba(30,136,229,0.92), rgba(0,188,212,0.72));
  color:#fff;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 12px;
  box-shadow: 0 14px 28px rgba(0,188,212,0.14);
  border: 1px solid rgba(255,255,255,0.18);
  margin-bottom: 12px;
}
.iot-health__hero-left{ display:flex; gap: 12px; align-items:flex-start; }
.iot-health__hero-icon{
  width: 48px; height: 48px; border-radius: 14px;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.22);
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.iot-health__hero-title{ margin:0; font-weight: 1000; font-size: 16px; }
.iot-health__hero-sub{ margin:6px 0 0; font-weight: 800; font-size: 12px; opacity:.92; line-height: 1.35; }

.iot-health__hero-meta{
  margin-top: 10px;
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
}
.iot-health__meta-pill{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.22);
  font-size: 12px;
  font-weight: 900;
}
.iot-health__meta-pill.soft{ background: rgba(255,255,255,0.12); }
.iot-health__dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: rgba(209,213,219,1);
}
.iot-health__dot.ok{ background: rgba(16,185,129,1); }

.iot-health__btn{
  border:none;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 1000;
  cursor:pointer;
  color: rgba(38,43,51,0.92);
  background: rgba(255,255,255,0.88);
  display:flex; align-items:center; gap: 8px;
  flex-shrink:0;
}
.iot-health__btn:active{ transform: scale(.98); }

/* ===== SUMMARY ===== */
.iot-health__summary{
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.iot-health__sum-card{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 14px;
  position: relative;
  overflow:hidden;
  box-shadow: 0 10px 22px rgba(0,0,0,0.04);
}
.iot-health__sum-card.warn{
  border-color: rgba(255,152,0,0.25);
  background: linear-gradient(0deg, rgba(255,152,0,0.06), rgba(255,152,0,0.02));
}
.iot-health__sum-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 10px;
}
.iot-health__sum-label{
  margin:0;
  font-size: 12px;
  font-weight: 1000;
  letter-spacing: .4px;
  text-transform: uppercase;
  color: rgba(38,43,51,0.62);
}
.iot-health__sum-value{
  margin: 12px 0 0;
  font-size: 22px;
  font-weight: 1000;
  color: var(--text-dark);
}
.iot-health__sum-sub{
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 900;
  color: rgba(38,43,51,0.70);
}
.iot-health__sum-bg{
  position:absolute;
  right: 10px;
  bottom: 10px;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  color: rgba(38,43,51,0.10);
  font-size: 26px;
}

/* chips */
.iot-health__chip{
  display:inline-flex;
  align-items:center;
  gap: 7px;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 1000;
  font-size: 11px;
  border: 1px solid transparent;
  background: rgba(209,213,219,0.22);
  color: rgba(38,43,51,0.8);
}
.iot-health__chip.ok{ background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.25); color: var(--success-green); }
.iot-health__chip.warn{ background: rgba(255,152,0,0.12); border-color: rgba(255,152,0,0.25); color: var(--warning-orange); }
.iot-health__chip.info{ background: rgba(30,136,229,0.12); border-color: rgba(30,136,229,0.25); color: var(--primary-blue); }

/* ===== TABLE CARD ===== */
.iot-health__table-card{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(0,0,0,0.04);
  overflow:hidden;
}
.iot-health__table-head{
  padding: 14px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(229,231,235,1);
  background: rgba(245,247,250,0.8);
}
.iot-health__table-title{
  margin:0;
  font-weight: 1000;
  color: var(--text-dark);
  font-size: 14px;
}
.iot-health__table-sub{
  margin:6px 0 0;
  font-weight: 800;
  color: rgba(38,43,51,0.65);
  font-size: 12px;
}

.iot-health__table-actions{
  display:flex;
  gap: 10px;
  align-items:center;
}
.iot-health__search{
  display:flex;
  align-items:center;
  gap: 10px;
  border: 2px solid var(--border-light);
  background:#fff;
  border-radius: 14px;
  padding: 10px 12px;
  min-width: 280px;
}
.iot-health__search i{ color: var(--accent-teal); }
.iot-health__search-input{
  border:none;
  outline:none;
  width: 100%;
  font-weight: 900;
  font-size: 13px;
  color: var(--text-dark);
  background: transparent;
}
.iot-health__select{
  border: 2px solid var(--border-light);
  background:#fff;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1000;
  color: rgba(38,43,51,0.85);
  outline:none;
}
.iot-health__select:focus{
  border-color: rgba(0,188,212,0.45);
  box-shadow: 0 0 0 4px rgba(0,188,212,0.10);
}

/* ===== TABLE (specific class) ===== */
.admin-table-health-wrap{ overflow:auto; }
.admin-table-health{
  width:100%;
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0 10px; /* card rows */
  padding: 0 10px 10px;
}
.admin-table-health thead th{
  text-align:left;
  padding: 12px 10px 8px;
  font-size: 11px;
  letter-spacing: .4px;
  text-transform: uppercase;
  font-weight: 1000;
  color: rgba(38,43,51,0.55);
}
.admin-table-health tbody td{
  background:#fff;
  border: 1px solid rgba(209,213,219,.70);
  padding: 12px 10px;
  font-weight: 900;
  color: rgba(38,43,51,0.80);
  vertical-align: top;
}
.admin-table-health tbody tr td:first-child{
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}
.admin-table-health tbody tr td:last-child{
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
}

/* cells */
.cell-main{ font-weight: 1000; color: rgba(38,43,51,0.90); }
.cell-sub{ margin-top: 6px; font-size: 11px; font-weight: 900; color: rgba(38,43,51,0.55); line-height: 1.35; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }

/* badges */
.pill-badge{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 1000;
  border: 1px solid rgba(209,213,219,0.65);
  background: rgba(0,0,0,0.02);
  color: rgba(38,43,51,0.75);
}
.pill-badge.ok{ color: var(--success-green); border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.08); }
.pill-badge.warn{ color: var(--warning-orange); border-color: rgba(255,152,0,0.25); background: rgba(255,152,0,0.08); }
.pill-badge.bad{ color: var(--error-red); border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.08); }
.pill-badge.info{ color: var(--primary-blue); border-color: rgba(30,136,229,0.25); background: rgba(30,136,229,0.08); }
.pill-badge.soft{ color: rgba(38,43,51,0.70); background: rgba(209,213,219,0.20); border-color: rgba(209,213,219,0.55); }

/* warnings */
.warn-wrap{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items:flex-start;
}
.warn-pill{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 1000;
  border: 1px solid rgba(245,158,11,.25);
  background: rgba(245,158,11,.06);
  color: rgba(38,43,51,0.78);
}
.ok-text{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  font-size: 12px;
  font-weight: 1000;
  color: rgba(22,163,74,0.90);
}

/* empty */
.empty{
  padding: 34px 10px;
  text-align:center;
  color: rgba(38,43,51,0.62);
}
.empty i{
  font-size: 34px;
  color: rgba(209,213,219,1);
  display:block;
  margin-bottom: 10px;
}
.empty p{ margin:0; font-weight: 1000; }
.empty small{ font-weight: 900; }

/* tip */
.iot-health__tip{
  margin: 12px 14px 14px;
  padding: 12px;
  border-radius: 14px;
  border: 1px dashed rgba(0,188,212,0.35);
  background: rgba(0,188,212,0.06);
  display:flex;
  gap: 10px;
  align-items:flex-start;
  color: rgba(38,43,51,0.78);
}
.iot-health__tip i{ margin-top: 2px; color: rgba(0,188,212,0.95); }
.iot-health__tip p{ margin:0; font-weight: 900; font-size: 12px; line-height: 1.35; }

/* responsive */
@media (max-width: 1100px){
  .iot-health__summary{ grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media (max-width: 860px){
  .iot-health__hero{ flex-direction: column; }
  .iot-health__table-head{ flex-direction: column; }
  .iot-health__table-actions{ width: 100%; flex-direction: column; align-items: stretch; }
  .iot-health__search{ min-width: 0; width: 100%; }
}
@media (max-width: 520px){
  .iot-health__summary{ grid-template-columns: 1fr; }
}
</style>
