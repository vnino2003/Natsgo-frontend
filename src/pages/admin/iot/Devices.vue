<template>
  <div class="device-page">
    <!-- Header row -->
    <div class="device-head">
      <div class="device-head-left">
        <h1 class="device-title">IoT Devices</h1>
        <p class="device-sub">ESP32 units + GPS tracking + IR passenger counter</p>

        <p v-if="loading" class="device-sub">
          <i class="fas fa-circle-notch fa-spin"></i> Loading devices…
        </p>
        <p v-else-if="error" class="device-sub device-sub-error">
          <i class="fas fa-triangle-exclamation"></i> {{ error }}
        </p>
      </div>

      <div class="device-head-actions">
        <div class="device-search">
          <i class="fas fa-search"></i>
          <input
            v-model="q"
            class="device-search-input"
            type="text"
            placeholder="Search device code, ESP32 ID..."
          />
          <button
            v-if="q"
            class="device-search-clear"
            type="button"
            @click="q = ''"
            aria-label="Clear search"
          >
            <i class="fas fa-xmark"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="device-filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="device-pill"
        :class="{ active: filter === f.key }"
        type="button"
        @click="filter = f.key"
      >
        {{ f.label }}
        <span class="device-pill-count">{{ countByFilter(f.key) }}</span>
      </button>
    </div>

    <!-- Table -->
    <div class="device-table-wrap">
      <table class="device-table">
        <thead>
          <tr>
            <th>Device Code</th>
            <th>ESP32 ID</th>
            <th>GPS</th>
            <th>IR Counter</th>
            <th>Firmware</th>
            <th>Last Seen</th>
            <th>Health</th>
            <th class="device-th-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="d in filtered" :key="d.id">
            <!-- Device Code -->
            <td>
              <div class="device-cell-title">{{ d.code }}</div>
              <div class="device-cell-sub">{{ d.model }}</div>
            </td>

            <!-- ESP32 ID -->
            <td>
              <div class="device-cell-title device-mono">{{ d.esp32Id }}</div>
              <div class="device-cell-sub">MAC/Chip ID</div>
            </td>

            <!-- GPS -->
            <td>
              <div class="device-cell-inline">
                <span class="device-dot" :class="d.gps.dot"></span>
                <b>{{ d.gps.fix }}</b>
              </div>
              <div class="device-cell-sub">
                Updated: <b>{{ timeAgo(d._raw?.gps_recorded_at) }}</b> • {{ d.gps.rate }}
              </div>
            </td>

            <!-- IR Counter -->
            <td>
              <div class="device-cell-inline">
                <span class="device-dot" :class="d.ir.dot"></span>
                <b>{{ d.ir.label }}</b>
              </div>
              <div class="device-cell-sub">
                Mode: <b>{{ d.ir.mode }}</b> • Threshold: <b>{{ d.ir.threshold }}</b>
              </div>
            </td>

            <!-- Firmware (static for now) -->
            <td>
              <div class="device-cell-title">{{ d.fw.version }}</div>
              <div class="device-cell-sub">Build: <b>{{ d.fw.build }}</b></div>
            </td>

            <!-- Last Seen -->
            <td>
              <div class="device-cell-title">{{ d.lastSeen }}</div>
              <div class="device-cell-sub">
                Signal: <b>{{ d.signal.type }}</b> • {{ d.signal.rssi }}
              </div>
            </td>

            <!-- Health -->
            <td>
              <span class="device-badge" :class="healthClass(d.health.state)">
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
              <div class="device-cell-sub">
                Battery: <b>{{ d.health.battery }}</b> • {{ d.health.sim }}
              </div>
            </td>

            <!-- Assignment -->

            <!-- Actions -->
            <td class="device-td-actions">
              <button class="device-btn-mini" type="button" @click="openView(d)">
                <i class="fas fa-circle-info"></i> View
              </button>
            </td>
          </tr>

          <tr v-if="filtered.length === 0">
            <td colspan="9">
              <div class="device-empty">
                <i class="fas fa-inbox"></i>
                <p>No devices found</p>
                <small>Try another keyword or filter.</small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal (still static) -->
    <div v-if="showModal" class="device-modal-overlay" @click.self="closeModal">
      <div class="device-modal-card">
        <div class="device-modal-head">
          <div>
            <p class="device-modal-title">{{ mode === "add" ? "Add Device" : "Edit Device" }}</p>
            <p class="device-modal-sub">ESP32 + GPS + IR passenger counter</p>
          </div>

          <button class="device-icon-x" type="button" @click="closeModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="device-modal-body">
          <div class="device-form-grid">
            <label class="device-field">
              <span>Device Code</span>
              <input class="device-input" v-model="form.code" placeholder="DEV-ESP32-004" />
            </label>

            <label class="device-field">
              <span>ESP32 ID (MAC/Chip)</span>
              <input class="device-input" v-model="form.esp32Id" placeholder="AA:BB:CC:DD:EE:FF" />
            </label>

            <label class="device-field">
              <span>Firmware Version</span>
              <input class="device-input" v-model="form.fwVersion" placeholder="v1.0.4" />
            </label>

            <label class="device-field">
              <span>Build Date</span>
              <input class="device-input" v-model="form.fwBuild" placeholder="2026.02.01" />
            </label>

            <label class="device-field">
              <span>GPS Enabled</span>
              <select class="device-input" v-model="form.gpsEnabled">
                <option :value="true">Enabled</option>
                <option :value="false">Disabled</option>
              </select>
            </label>

            <label class="device-field">
              <span>GPS Fix</span>
              <input class="device-input" v-model="form.gpsFix" placeholder="Active" />
            </label>

            <label class="device-field">
              <span>IR Enabled</span>
              <select class="device-input" v-model="form.irEnabled">
                <option :value="true">Enabled</option>
                <option :value="false">Disabled</option>
              </select>
            </label>

            <label class="device-field">
              <span>IR Mode</span>
              <input class="device-input" v-model="form.irMode" placeholder="entry-exit" />
            </label>

            <label class="device-field">
              <span>IR Threshold</span>
              <input class="device-input" v-model="form.irThreshold" placeholder="120ms debounce" />
            </label>

            <label class="device-field">
              <span>Assignment</span>
              <select class="device-input" v-model="form.assignment">
                <option>Unassigned</option>
                <option>BUS-001</option>
                <option>BUS-002</option>
                <option>BUS-003</option>
              </select>
              <small class="device-hint">Default is <b>Unassigned</b>.</small>
            </label>
          </div>
        </div>

        <div class="device-modal-foot">
          <button class="device-btn-ghost" type="button" @click="closeModal">Cancel</button>
          <button class="device-btn-primary" type="button" @click="saveDevice">
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
function fakeSignal() {
  return { type: "LTE", rssi: "-80 dBm" }
}

// ✅ GPS UI strictly follows backend effective fields:
// - d.status => online/offline
// - d.gps_state => active/searching/disconnected/disabled
function gpsUiFromApi(d) {
  const enabled = Number(d.gps_enabled) === 1
  const isOnline = String(d.status || "").toLowerCase() === "online"
  const gpsState = String(d.gps_state || "").toLowerCase()

  const dot = enabled && isOnline && gpsState === "active" ? "ok" : "off"

  const fixText =
    !enabled || gpsState === "disabled"
      ? "Disabled"
      : !isOnline
        ? "Offline"
        : gpsState === "active"
          ? "Active (Fix)"
          : gpsState === "searching"
            ? "Searching"
            : gpsState === "disconnected"
              ? "Disconnected"
              : "Disconnected"

  return {
    enabled,
    dot,
    fix: fixText,
    rate: enabled ? "2s" : "—",
  }
}

function irUiFromApi(d) {
  const enabled = Number(d.ir_enabled) === 1
  const irState = String(d.ir_state || "").toLowerCase() // ok/stale/disabled

  const dot = enabled && irState === "ok" ? "ok" : "off"

  const label =
    !enabled || irState === "disabled"
      ? "Disabled"
      : irState === "ok"
        ? "OK"
        : "Stale"

  return {
    enabled,
    dot,
    label,
    mode: "entry-exit",
    threshold: "120ms debounce",
    state: irState,
  }
}

function healthUiFromApi(d) {
  const hs = d.health_state || (String(d.status || "").toLowerCase() === "online" ? "Healthy" : "Offline")
  if (hs === "Healthy") return { state: "Healthy", battery: "—", sim: "—" }
  if (hs === "Warning") return { state: "Warning", battery: "—", sim: "—" }
  return { state: "Offline", battery: "—", sim: "—" }
}

/**
 * ✅ Assignment mapping
 */
function assignmentFromApi(d) {
  const busId = d.bus_id ?? null
  const label =
    d.assignment ||
    d.bus_code ||
    d.bus_plate_no ||
    "Unassigned"

  return {
    label,
    busId,
    isAssigned: label !== "Unassigned",
  }
}

function mapApiDeviceToRow(d) {
  const asg = assignmentFromApi(d)

  return {
    id: d.id,
    code: d.device_code || `DEV-${d.id}`,
    model: "NATS IoT Kit v1",
    esp32Id: d.esp32_id || "—",

    gps: gpsUiFromApi(d),
    ir: irUiFromApi(d),
    fw: fakeFirmware(),

    lastSeen: timeAgo(d.last_seen_at),
    signal: fakeSignal(),

    health: healthUiFromApi(d),

    assignment: asg.label,
    assignment_bus_id: asg.busId,
    isAssigned: asg.isAssigned,

    _raw: d,
  }
}

const devices = computed(() => (apiRows.value || []).map(mapApiDeviceToRow))

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return devices.value
    .filter((d) => {
      if (!keyword) return true
      const hay = [
        d.code,
        d.esp32Id,
        d.fw.version,
        d.assignment,
        d.health.state,
      ]
        .join(" ")
        .toLowerCase()
      return hay.includes(keyword)
    })
    .filter((d) => {
      if (filter.value === "all") return true

      const apiStatus = String(d._raw?.status || "").toLowerCase()
      if (filter.value === "online") return apiStatus === "online"
      if (filter.value === "offline") return apiStatus !== "online"
      if (filter.value === "unassigned") return !d.isAssigned
      if (filter.value === "attention") return d.health.state === "Warning"

      return true
    })
})

function countByFilter(key) {
  const list = devices.value
  if (key === "all") return list.length
  if (key === "online") return list.filter((d) => String(d._raw?.status || "").toLowerCase() === "online").length
  if (key === "offline") return list.filter((d) => String(d._raw?.status || "").toLowerCase() !== "online").length
  if (key === "unassigned") return list.filter((d) => !d.isAssigned).length
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
  poll = setInterval(load, 5000)
})

onBeforeUnmount(() => {
  if (poll) clearInterval(poll)
})
</script>