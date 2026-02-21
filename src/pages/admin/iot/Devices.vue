<template>
  <div class="iot-page">
    <!-- Header row -->
    <div class="iot-head">
      <div>
        <h1 class="iot-title">IoT Devices</h1>
        <p class="iot-sub">ESP32 units + GPS tracking + IR passenger counter</p>

        <!-- optional status -->
        <p v-if="loading" class="iot-sub">Loading devices…</p>
        <p v-else-if="error" class="iot-sub" style="color:#ef4444;">{{ error }}</p>
      </div>

      <div class="iot-head-actions">
        <div class="iot-search">
          <i class="fas fa-search"></i>
          <input
            v-model="q"
            class="iot-search-input"
            type="text"
            placeholder="Search device code, ESP32 ID..."
          />
        </div>

       
      </div>
    </div>

    <!-- Filters -->
    <div class="iot-filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="pill"
        :class="{ active: filter === f.key }"
        type="button"
        @click="filter = f.key"
      >
        {{ f.label }}
        <span class="pill-count">{{ countByFilter(f.key) }}</span>
      </button>
    </div>

    <!-- Table -->
    <div class="iot-table-wrap">
      <table class="iot-table">
        <thead>
          <tr>
            <th>Device Code</th>
            <th>ESP32 ID</th>
            <th>GPS</th>
            <th>IR Counter</th>
            <th>Firmware</th>
            <th>Last Seen</th>
            <th>Health</th>
            <th>Assignment</th>
            <th class="th-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="d in filtered" :key="d.id">
            <!-- Device Code -->
            <td>
              <div class="cell-title">{{ d.code }}</div>
              <div class="cell-sub">{{ d.model }}</div>
            </td>

            <!-- ESP32 ID -->
            <td>
              <div class="cell-title mono">{{ d.esp32Id }}</div>
              <div class="cell-sub">MAC/Chip ID</div>
            </td>

            <!-- GPS -->
            <td>
              <div class="cell-inline">
                <span class="tiny-dot" :class="d.gps.dot"></span>
                <b>{{ d.gps.fix }}</b>
              </div>
              <div class="cell-sub">
                Updated: <b>{{ timeAgo(d._raw?.recorded_at) }}</b> • {{ d.gps.rate }}
              </div>
            </td>

            <!-- IR Counter (static for now) -->
            <td>
              <div class="cell-inline">
                <span class="tiny-dot" :class="d.ir.enabled ? 'ok' : 'off'"></span>
                <b>{{ d.ir.enabled ? "Enabled" : "Disabled" }}</b>
              </div>
              <div class="cell-sub">
                Mode: <b>{{ d.ir.mode }}</b> • Threshold: <b>{{ d.ir.threshold }}</b>
              </div>
            </td>

            <!-- Firmware (static for now) -->
            <td>
              <div class="cell-title">{{ d.fw.version }}</div>
              <div class="cell-sub">Build: <b>{{ d.fw.build }}</b></div>
            </td>

            <!-- Last Seen -->
            <td>
              <div class="cell-title">{{ d.lastSeen }}</div>
              <div class="cell-sub">
                Signal: <b>{{ d.signal.type }}</b> • {{ d.signal.rssi }}
              </div>
            </td>

            <!-- Health -->
            <td>
              <span class="badge" :class="healthClass(d.health.state)">
                <i
                  class="fas"
                  :class="
                    d.health.state === 'Healthy'
                      ? 'fa-circle-check'
                      : d.health.state === 'Warning'
                        ? 'fa-triangle-exclamation'
                        : 'fa-circle-xmark'
                  "
                ></i>
                {{ d.health.state }}
              </span>
              <div class="cell-sub">
                Battery: <b>{{ d.health.battery }}</b> • {{ d.health.sim }}
              </div>
            </td>

            <!-- Assignment (static for now) -->
            <td>
              <span class="badge soft" :class="d.assignment === 'Unassigned' ? 'soft' : 'info'">
                <i class="fas" :class="d.assignment === 'Unassigned' ? 'fa-link-slash' : 'fa-link'"></i>
                {{ d.assignment }}
              </span>
            </td>

            <!-- Actions -->
            <td class="td-actions">
        
              <button class="btn-mini" type="button" @click="openView(d)">
                <i class="fas fa-circle-info"></i> View
              </button>
            </td>
          </tr>

          <tr v-if="filtered.length === 0">
            <td colspan="9">
              <div class="empty">
                <i class="fas fa-inbox"></i>
                <p>No devices found</p>
                <small>Try another keyword or filter.</small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal (still static; auto-discovery is source of truth) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <p class="modal-title">{{ mode === "add" ? "Add Device" : "Edit Device" }}</p>
            <p class="modal-sub">ESP32 + GPS + IR passenger counter</p>
          </div>

          <button class="icon-x" type="button" @click="closeModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Device Code</span>
              <input class="input" v-model="form.code" placeholder="DEV-ESP32-004" />
            </label>

            <label class="field">
              <span>ESP32 ID (MAC/Chip)</span>
              <input class="input" v-model="form.esp32Id" placeholder="AA:BB:CC:DD:EE:FF" />
            </label>

            <label class="field">
              <span>Firmware Version</span>
              <input class="input" v-model="form.fwVersion" placeholder="v1.0.4" />
            </label>

            <label class="field">
              <span>Build Date</span>
              <input class="input" v-model="form.fwBuild" placeholder="2026.02.01" />
            </label>

            <label class="field">
              <span>GPS Enabled</span>
              <select class="input" v-model="form.gpsEnabled">
                <option :value="true">Enabled</option>
                <option :value="false">Disabled</option>
              </select>
            </label>

            <label class="field">
              <span>GPS Fix</span>
              <input class="input" v-model="form.gpsFix" placeholder="3D • NEO-6M" />
            </label>

            <label class="field">
              <span>IR Enabled</span>
              <select class="input" v-model="form.irEnabled">
                <option :value="true">Enabled</option>
                <option :value="false">Disabled</option>
              </select>
            </label>

            <label class="field">
              <span>IR Mode</span>
              <input class="input" v-model="form.irMode" placeholder="entry-exit" />
            </label>

            <label class="field">
              <span>IR Threshold</span>
              <input class="input" v-model="form.irThreshold" placeholder="120ms debounce" />
            </label>

            <!-- Assignment -->
            <label class="field">
              <span>Assignment</span>
              <select class="input" v-model="form.assignment">
                <option>Unassigned</option>
                <option>BUS-001</option>
                <option>BUS-002</option>
                <option>BUS-003</option>
              </select>
              <small class="hint">Default is <b>Unassigned</b>.</small>
            </label>
          </div>
        </div>

        <div class="modal-foot">
          <button class="btn-ghost" type="button" @click="closeModal">Cancel</button>
          <button class="btn-primary" type="button" @click="saveDevice">
            <i class="fas fa-check"></i>
            {{ mode === "add" ? "Add Device" : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { useDevices } from "../../../composables/useDevices"

const q = ref("")
const filter = ref("all")

const filters = [
  { key: "all", label: "All" },
  { key: "online", label: "Online" },
  { key: "offline", label: "Offline" },
  { key: "unassigned", label: "Unassigned" },
  { key: "attention", label: "Needs Attention" },
]

// API
const { rows: apiRows, loading, error, fetchDevices } = useDevices()

// ---------- Helpers ----------
function timeAgo(dateLike) {
  if (!dateLike) return "—"
  const dt = new Date(dateLike)
  if (isNaN(dt.getTime())) return "—"
  const diffMs = Date.now() - dt.getTime()
  const s = Math.floor(diffMs / 1000)
  if (s < 10) return "just now"
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} mins ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hrs ago`
  const d = Math.floor(h / 24)
  return `${d} days ago`
}

function fakeFirmware() {
  return { version: "v1.0.0", build: "—" }
}
function fakeIr() {
  return { enabled: true, mode: "entry-exit", threshold: "120ms debounce" }
}
function fakeSignal() {
  return { type: "LTE", rssi: "-80 dBm" }
}

function gpsUiFromApi(d) {
  const enabled = Number(d.gps_enabled) === 1
  const gpsState = String(d.gps_state || "").toLowerCase() // ok | no_fix | disabled
  const isOnline = String(d.status || "").toLowerCase() === "online"

  // tiny-dot supports: ok/off in your CSS
  const dot = enabled && isOnline && gpsState === "ok" ? "ok" : "off"

  const fixText =
    !enabled ? "Disabled"
      : !isOnline ? "Offline"
        : gpsState === "ok" ? "Fix OK"
          : "No Fix"

  return {
    enabled,
    dot,          // "ok" or "off"
    fix: fixText,
    rate: enabled ? "2s" : "—", // static muna
  }
}

function healthUiFromApi(d) {
  // backend returns health_state: Healthy | Warning | Offline
  const hs = d.health_state || (String(d.status || "").toLowerCase() === "online" ? "Healthy" : "Offline")

  if (hs === "Healthy") return { state: "Healthy", battery: "—", sim: "—" }
  if (hs === "Warning") return { state: "Warning", battery: "—", sim: "—" }
  return { state: "Offline", battery: "—", sim: "—" }
}

function mapApiDeviceToRow(d) {
  return {
    id: d.id,
    code: d.device_code || `DEV-${d.id}`,
    model: "NATS IoT Kit v1", // static muna
    esp32Id: d.esp32_id || "—",

    gps: gpsUiFromApi(d),
    ir: fakeIr(),
    fw: fakeFirmware(),

    lastSeen: timeAgo(d.last_seen_at),
    signal: fakeSignal(),

    health: healthUiFromApi(d),
    assignment: "Unassigned",

    _raw: d,
  }
}

const devices = computed(() => (apiRows.value || []).map(mapApiDeviceToRow))

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return devices.value
    .filter((d) => {
      if (!keyword) return true
      const hay = [d.code, d.esp32Id, d.fw.version, d.assignment, d.health.state]
        .join(" ")
        .toLowerCase()
      return hay.includes(keyword)
    })
    .filter((d) => {
      if (filter.value === "all") return true

      const apiStatus = String(d._raw?.status || "").toLowerCase()
      if (filter.value === "online") return apiStatus === "online"
      if (filter.value === "offline") return apiStatus !== "online"
      if (filter.value === "unassigned") return d.assignment === "Unassigned"
      if (filter.value === "attention") return d.health.state === "Warning"

      return true
    })
})

function countByFilter(key) {
  const list = devices.value
  if (key === "all") return list.length
  if (key === "online") return list.filter((d) => String(d._raw?.status || "").toLowerCase() === "online").length
  if (key === "offline") return list.filter((d) => String(d._raw?.status || "").toLowerCase() !== "online").length
  if (key === "unassigned") return list.filter((d) => d.assignment === "Unassigned").length
  if (key === "attention") return list.filter((d) => d.health.state === "Warning").length
  return 0
}

function healthClass(state) {
  if (state === "Healthy") return "ok"
  if (state === "Warning") return "warn"
  return "bad"
}

// ---------- Modal (static) ----------
const showModal = ref(false)
const mode = ref("add")
const editingKey = ref(null)

const form = reactive({
  code: "",
  esp32Id: "",
  fwVersion: "",
  fwBuild: "",
  gpsEnabled: true,
  gpsFix: "",
  irEnabled: true,
  irMode: "",
  irThreshold: "",
  assignment: "Unassigned",
})

function openAdd() {
  mode.value = "add"
  editingKey.value = null
  Object.assign(form, {
    code: "",
    esp32Id: "",
    fwVersion: "v1.0.0",
    fwBuild: new Date().toISOString().slice(0, 10).replaceAll("-", "."),
    gpsEnabled: true,
    gpsFix: "3D • NEO-6M",
    irEnabled: true,
    irMode: "entry-exit",
    irThreshold: "120ms debounce",
    assignment: "Unassigned",
  })
  showModal.value = true
}

function openEdit(d) {
  mode.value = "edit"
  editingKey.value = d.code
  Object.assign(form, {
    code: d.code,
    esp32Id: d.esp32Id,
    fwVersion: d.fw.version,
    fwBuild: d.fw.build,
    gpsEnabled: d.gps.enabled,
    gpsFix: d.gps.fix,
    irEnabled: d.ir.enabled,
    irMode: d.ir.mode,
    irThreshold: d.ir.threshold,
    assignment: d.assignment || "Unassigned",
  })
  showModal.value = true
}

function openView(d) {
  alert(`View: ${d.code}`)
}

function closeModal() {
  showModal.value = false
}

function saveDevice() {
  alert("Auto-discovery ang devices ngayon (galing telemetry). Static pa ang Add/Edit until we add POST/PUT endpoints.")
  closeModal()
}

// ---------- load + polling ----------
let poll = null

async function load() {
  await fetchDevices()
}

onMounted(async () => {
  await load()
  poll = setInterval(load, 5000) // refresh every 5s
})

onBeforeUnmount(() => {
  if (poll) clearInterval(poll)
})
</script>

<style scoped>
/* (same CSS mo - unchanged) */
.iot-page{
  padding: 16px;
}
.iot-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 14px;
  margin-bottom: 12px;
}
.iot-title{
  margin:0;
  font-weight: 1000;
  font-size: 18px;
  color: var(--text-dark);
}
.iot-sub{
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 800;
  color: rgba(38,43,51,0.62);
}
.iot-head-actions{
  display:flex;
  align-items:center;
  gap: 10px;
}
.iot-search{
  display:flex;
  align-items:center;
  gap: 10px;
  border: 2px solid var(--border-light);
  background:#fff;
  border-radius: 14px;
  padding: 10px 12px;
  min-width: 280px;
}
.iot-search i{ color: var(--accent-teal); }
.iot-search-input{
  border:none;
  outline:none;
  width: 100%;
  font-weight: 800;
  font-size: 13px;
  color: var(--text-dark);
  background: transparent;
}
.iot-add{
  border: 2px solid var(--border-light);
  background: #fff;
  color: rgba(38,43,51,0.85);
  padding: 10px 12px;
  border-radius: 14px;
  cursor:pointer;
  font-weight: 1000;
  display:flex;
  align-items:center;
  gap: 8px;
}
.iot-add:hover{
  border-color: rgba(0,188,212,0.35);
  background: rgba(0,188,212,0.06);
}
.iot-add:active{ transform: scale(.98); }
.iot-filters{
  display:flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.pill{
  border: 2px solid var(--border-light);
  background: #fff;
  color: rgba(38,43,51,0.82);
  padding: 8px 12px;
  border-radius: 999px;
  cursor:pointer;
  font-weight: 1000;
  font-size: 12px;
  display:flex;
  align-items:center;
  gap: 8px;
}
.pill:hover{
  border-color: rgba(0,188,212,0.35);
  background: rgba(0,188,212,0.05);
}
.pill.active{
  border-color: rgba(30,136,229,0.35);
  background: rgba(30,136,229,0.08);
  color: rgba(38,43,51,0.92);
}
.pill-count{
  min-width: 22px;
  height: 18px;
  border-radius: 999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size: 11px;
  font-weight: 1000;
  padding: 0 8px;
  background: rgba(209,213,219,0.28);
  border: 1px solid rgba(209,213,219,0.55);
}
.iot-table-wrap{
  border: 2px solid var(--border-light);
  background: #fff;
  border-radius: 16px;
  overflow: auto;
}
.iot-table{
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 980px;
}
.iot-table thead th{
  text-align:left;
  padding: 12px 12px;
  font-size: 11px;
  letter-spacing: .4px;
  text-transform: uppercase;
  font-weight: 1000;
  color: rgba(38,43,51,0.58);
  border-bottom: 1px solid rgba(209,213,219,0.6);
  background: rgba(245,247,250,0.8);
}
.iot-table tbody td{
  padding: 12px 12px;
  border-bottom: 1px solid rgba(229,231,235,1);
  vertical-align: top;
}
.th-actions{ text-align:right; }
.td-actions{
  text-align:right;
  white-space: nowrap;
}
.cell-title{
  margin:0;
  font-weight: 1000;
  color: rgba(38,43,51,0.92);
  font-size: 13px;
}
.cell-sub{
  margin-top: 6px;
  font-size: 11px;
  font-weight: 900;
  color: rgba(38,43,51,0.60);
  line-height: 1.35;
}
.cell-inline{
  display:flex;
  align-items:center;
  gap: 8px;
  font-size: 12px;
  font-weight: 1000;
  color: rgba(38,43,51,0.85);
}
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.tiny-dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(209,213,219,1);
}
.tiny-dot.ok{ background: rgba(16,185,129,1); }
.tiny-dot.off{ background: rgba(156,163,175,1); }
.badge{
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
.badge.ok{ color: var(--success-green); border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.08); }
.badge.warn{ color: var(--warning-orange); border-color: rgba(255,152,0,0.25); background: rgba(255,152,0,0.08); }
.badge.bad{ color: var(--error-red); border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.08); }
.badge.info{ color: var(--primary-blue); border-color: rgba(30,136,229,0.25); background: rgba(30,136,229,0.08); }
.badge.soft{ color: rgba(38,43,51,0.70); }
.btn-mini{
  border: 2px solid var(--border-light);
  background: #fff;
  padding: 8px 10px;
  border-radius: 12px;
  font-weight: 1000;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  margin-left: 8px;
}
.btn-mini:hover{
  border-color: rgba(0,188,212,0.35);
  background: rgba(0,188,212,0.06);
}
.btn-mini:active{ transform: scale(.98); }
.empty{
  padding: 28px 10px;
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
.modal-overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 999;
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 16px;
}
.modal-card{
  width: min(720px, 96vw);
  background: #fff;
  border-radius: 18px;
  border: 2px solid rgba(229,231,235,1);
  box-shadow: 0 22px 70px rgba(0,0,0,0.35);
  overflow:hidden;
}
.modal-head{
  padding: 14px 14px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
  border-bottom: 1px solid rgba(229,231,235,1);
  background: rgba(245,247,250,0.8);
}
.modal-title{
  margin:0;
  font-weight: 1000;
  color: rgba(38,43,51,0.92);
}
.modal-sub{
  margin:6px 0 0;
  font-size: 12px;
  font-weight: 900;
  color: rgba(38,43,51,0.62);
}
.icon-x{
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  background: #fff;
  cursor:pointer;
}
.icon-x:active{ transform: scale(.98); }
.modal-body{ padding: 14px; }
.form-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field span{
  display:block;
  font-size: 11px;
  font-weight: 1000;
  color: rgba(38,43,51,0.62);
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 6px;
}
.input{
  width: 100%;
  border: 2px solid var(--border-light);
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  outline:none;
  font-weight: 900;
  color: rgba(38,43,51,0.88);
}
.input:focus{
  border-color: rgba(0,188,212,0.45);
  box-shadow: 0 0 0 4px rgba(0,188,212,0.10);
}
.hint{
  display:block;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 900;
  color: rgba(38,43,51,0.62);
}
.modal-foot{
  padding: 14px;
  display:flex;
  justify-content:flex-end;
  gap: 10px;
  border-top: 1px solid rgba(229,231,235,1);
  background: rgba(245,247,250,0.8);
}
.btn-ghost{
  border: 2px solid var(--border-light);
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1000;
  cursor:pointer;
}
.btn-ghost:active{ transform: scale(.98); }
.btn-primary{
  border: none;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1000;
  cursor:pointer;
  color:#fff;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
  box-shadow: 0 10px 22px rgba(0,188,212,0.18);
}
.btn-primary:active{ transform: scale(.98); }
@media (max-width: 860px){
  .iot-head{ flex-direction: column; align-items: stretch; }
  .iot-head-actions{ justify-content: space-between; }
  .iot-search{ min-width: 0; width: 100%; }
  .form-grid{ grid-template-columns: 1fr; }
}
</style>
