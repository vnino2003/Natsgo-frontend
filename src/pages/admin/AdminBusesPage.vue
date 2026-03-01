<!-- src/pages/admin/BusesPage.vue (COMPLETE UPDATED: includes Terminal State / Route from bus_terminal_state) -->
<template>
  <div class="bus-page">
    <div class="bus-shell">
      <!-- Header -->
      <div class="bus-head">
        <div class="bus-head-left">
          <div class="bus-head-title">
            <p class="bus-title">Bus List</p>
            <p class="bus-sub">Fleet records, assignment status, live occupancy, and current route (terminal state).</p>
          </div>

          <div class="bus-head-state">
            <p v-if="loading" class="bus-hint">
              <i class="fas fa-circle-notch fa-spin"></i> Loading buses…
            </p>
            <p v-else-if="error" class="bus-hint bus-hint-error">
              <i class="fas fa-triangle-exclamation"></i> {{ error }}
            </p>
            <p v-else class="bus-hint">
              <i class="fas fa-clock"></i> Auto refresh: every 5s
            </p>
          </div>
        </div>

        <div class="bus-head-right">
          <button class="bus-btn bus-btn-ghost" type="button" @click="refresh" :disabled="loading">
            <i class="fas fa-rotate"></i>
            <span>{{ loading ? "Refreshing..." : "Refresh" }}</span>
          </button>

          <button class="bus-btn bus-btn-primary" type="button" @click="openNewBus">
            <i class="fas fa-plus"></i>
            <span>New Bus</span>
          </button>
        </div>
      </div>

      <!-- Toolbar row -->
      <div class="bus-toolbar">
        <!-- Search -->
        <div class="bus-search">
          <i class="fas fa-search"></i>
          <input
            v-model="localSearch"
            type="text"
            placeholder="Search bus code, plate no, device code, status…"
            @keyup.enter="refresh"
          />
          <button v-if="localSearch" class="bus-x" type="button" @click="localSearch = ''" aria-label="Clear search">
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <!-- Filters -->
        <div class="bus-filters">
          <button class="bus-chip" :class="{ active: filterStatus === 'all' }" type="button" @click="filterStatus = 'all'">
            All <span class="bus-chip-count">{{ counts.all }}</span>
          </button>

    

  

        </div>
      </div>

      <!-- Table -->
      <div class="bus-table-wrap">
        <table class="bus-table">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Plate No</th>
              <th>Capacity / Occupancy</th>
              <th>Device</th>
              <th>Route</th>
              <th>Last Seen</th>
              <th class="bus-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="b in filteredRows" :key="b.id" :class="{ 'bus-row-full': isFull(b) }">
              <!-- Bus -->
              <td>
                <div class="bus-buscell">
                  <div class="bus-badge">
                    <i class="fas fa-bus"></i>
                  </div>
                  <div class="bus-busmeta">
                    <div class="bus-buscode bus-mono">{{ b.bus_code }}</div>
                    <div class="bus-mini">ID: <span class="bus-mono">{{ b.id }}</span></div>
                  </div>
                </div>
              </td>

              <!-- Plate -->
              <td class="bus-cell-strong">{{ b.plate_no || "—" }}</td>

              <!-- Capacity / Occupancy -->
              <td>
                <div class="bus-cap-col">
                  <div class="bus-cap-top">
                    <span class="bus-cell-strong">{{ b.capacity ?? "—" }}</span>
                    <span class="bus-cap-label">seats</span>
                  </div>

                  <div class="bus-cap-sub">
                    <template v-if="b.device_status === 'assigned' && b.passenger_count != null && b.capacity">
                      <span class="bus-cap-muted">Occupancy:</span>
                      <b class="bus-occ-num" :class="{ full: isFull(b) }">{{ safeOcc(b) }}</b>
                      <span class="bus-cap-muted">/ {{ b.capacity }}</span>
                      <span v-if="b.occupancy_percent != null" class="bus-cap-muted">
                        ({{ clampPct(b.occupancy_percent) }}%)
                      </span>

                      <div class="bus-occ-bar">
                        <div
                          class="bus-occ-fill"
                          :class="{ full: isFull(b) }"
                          :style="{ width: clampPct(b.occupancy_percent) + '%' }"
                        ></div>
                      </div>

                      <div class="bus-mini bus-full-note" v-if="isFull(b)">
                        FULL • Capacity reached
                      </div>
                    </template>

                    <template v-else>
                      <span class="bus-cap-muted">Occupancy:</span> —
                      <div class="bus-occ-bar">
                        <div class="bus-occ-fill" style="width:0%;"></div>
                      </div>
                    </template>
                  </div>
                </div>
              </td>

              <!-- Device -->
              <td>
                <span class="bus-pill" :class="devicePill(b).cls">
                  <i class="fas" :class="devicePill(b).ico"></i>
                  {{ devicePill(b).text }}
                </span>

                <div class="bus-mini" v-if="b.device_status === 'assigned' && b.device?.device_code">
                  {{ b.device.device_code }}
                </div>
              </td>

              <!-- Route -->
              <td>
                <span class="bus-pill" :class="routePill(b).cls">
                  <i class="fas" :class="routePill(b).ico"></i>
                  {{ routePill(b).text }}
                </span>

                <div class="bus-mini" v-if="b.terminal_state?.dist_m != null">
                  Dist: {{ Math.round(b.terminal_state.dist_m) }}m
                  <span v-if="Number(b.terminal_state?.at_terminal) === 1"> • at terminal</span>
                  <span v-else> • on road</span>
                </div>

                <div class="bus-mini" v-else-if="b.device_status === 'assigned'">
                  — no terminal state yet
                </div>
              </td>

              <!-- Last Seen -->
              <td>
                <span class="bus-cell-strong">{{ timeAgo(b.device_last_seen_at) }}</span>
                <div class="bus-mini" v-if="b.device_last_seen_at">
                  {{ formatTs(b.device_last_seen_at) }}
                </div>
              </td>

              <!-- Status -->
          

              <!-- Actions -->
              <td class="bus-right">
                <button class="bus-btn bus-btn-ghost" type="button" @click="viewBus(b.id)">
                  <i class="fas fa-eye"></i>
                  <span>View</span>
                </button>
                <button class="bus-btn bus-btn-ghost" type="button" @click="openEdit(b)">
                  <i class="fas fa-pen"></i>
                  <span>Edit</span>
                </button>
              </td>
            </tr>

            <tr v-if="!loading && filteredRows.length === 0">
              <td colspan="8">
                <div class="bus-empty">
                  <i class="fas fa-inbox"></i>
                  <p>No buses found</p>
                  <small>Try adjusting search/filters, or create a new bus record.</small>

                  <div class="bus-empty-actions">
                    <button class="bus-btn bus-btn-ghost" type="button" @click="clearFilters">
                      <i class="fas fa-filter-circle-xmark"></i> Clear filters
                    </button>
                    <button class="bus-btn bus-btn-primary" type="button" @click="openNewBus">
                      <i class="fas fa-plus"></i> New Bus
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL -->
    <teleport to="body">
      <div v-if="showBusModal" class="admin-modal-overlay" @click.self="closeBusModal">
        <form class="admin-modal" @submit.prevent="saveBus">
          <div class="admin-modal-head">
            <p class="admin-modal-title">
              <i class="fas fa-bus"></i>
              {{ editing ? "Edit Bus" : "New Bus" }}
            </p>
            <button class="admin-icon-btn" type="button" @click="closeBusModal" aria-label="Close">
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <div class="admin-modal-body">
            <div class="admin-form-grid">
              <label class="admin-field" v-if="editing">
                <span>Bus Code</span>
                <input class="admin-input" v-model="form.bus_code" disabled />
              </label>

              <label class="admin-field">
                <span>Plate No *</span>
                <input class="admin-input" v-model.trim="form.plate_no" placeholder="ABC-1234" />
              </label>

              <label class="admin-field">
                <span>Capacity *</span>
                <input
                  class="admin-input"
                  v-model.number="form.capacity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="40"
                />
              </label>

     
            </div>

            <p v-if="modalError" class="admin-err">
              <i class="fas fa-triangle-exclamation"></i> {{ modalError }}
            </p>
          </div>

          <div class="admin-modal-foot">
            <button class="admin-btn" type="button" @click="closeBusModal" :disabled="saving">
              Cancel
            </button>
            <button class="admin-btn primary" type="submit" :disabled="saving">
              <i class="fas fa-check"></i>
              {{ saving ? "Saving..." : "Save" }}
            </button>
          </div>
        </form>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useBuses } from "@/composables/useBuses";

const props = defineProps({
  search: { type: String, default: "" }, // from topbar global search
});

const router = useRouter();
const { rows, loading, error, fetchBuses, addBus, editBus: apiEditBus } = useBuses();

let poll = null;

const localSearch = ref("");
const filterStatus = ref("all");

async function refresh() {
  await fetchBuses();
}

onMounted(async () => {
  await refresh();
  poll = setInterval(refresh, 5000);
});

onBeforeUnmount(() => {
  if (poll) clearInterval(poll);
});

/* ---------- Counts for chips ---------- */
const counts = computed(() => {
  const list = rows.value || [];
  const norm = (v) => String(v || "").toLowerCase();
  return {
    all: list.length,
    active: list.filter((b) => norm(b.bus_status) === "active").length,
    maintenance: list.filter((b) => norm(b.bus_status) === "maintenance").length,
    inactive: list.filter((b) => norm(b.bus_status) === "inactive").length,
  };
});

/* ---------- Filtering ---------- */
const filteredRows = computed(() => {
  const qTop = String(props.search || "").trim().toLowerCase();
  const qLocal = String(localSearch.value || "").trim().toLowerCase();
  const q = (qTop + " " + qLocal).trim();

  const list = rows.value || [];
  const status = String(filterStatus.value || "all").toLowerCase();

  let out = list;

  if (status !== "all") {
    out = out.filter((b) => String(b.bus_status || "").toLowerCase() === status);
  }

  if (!q) return out;

  return out.filter((b) =>
    [
      b.bus_code,
      b.plate_no,
      b.bus_status,
      b.capacity,
      b.device_status,
      b.device?.device_code,
      b.device?.esp32_id,
      b.route_label,
      b.terminal_state?.current_terminal_name,
      b.terminal_state?.target_terminal_name,
    ].some((x) => String(x ?? "").toLowerCase().includes(q))
  );
});

function clearFilters() {
  localSearch.value = "";
  filterStatus.value = "all";
}

/* ---------- Helpers ---------- */
function safeOcc(b) {
  const cap = Number(b.capacity ?? 0);
  const occ = Number(b.passenger_count ?? 0);
  if (!Number.isFinite(cap) || cap <= 0) return Number.isFinite(occ) ? Math.max(0, occ) : 0;
  if (!Number.isFinite(occ)) return 0;
  return Math.min(Math.max(occ, 0), cap);
}

function isFull(b) {
  const cap = Number(b.capacity ?? 0);
  const occ = Number(b.passenger_count ?? 0);
  if (!Number.isFinite(cap) || cap <= 0) return false;
  if (!Number.isFinite(occ)) return false;
  return occ >= cap;
}

function prettyStatus(s) {
  const v = String(s || "").toLowerCase();
  if (v === "active") return "Active";
  if (v === "maintenance") return "Maintenance";
  return "Inactive";
}

function statusPill(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return { cls: "bus-pill-green" };
  if (s === "maintenance") return { cls: "bus-pill-yellow" };
  return { cls: "bus-pill-red" };
}

function devicePill(b) {
  const ds = String(b.device_status || "unassigned").toLowerCase();
  if (ds !== "assigned") return { text: "Not Assigned", cls: "bus-pill-red", ico: "fa-link-slash" };
  if (b.device_online) return { text: "Assigned • Online", cls: "bus-pill-green", ico: "fa-link" };
  return { text: "Assigned • Offline", cls: "bus-pill-yellow", ico: "fa-link" };
}

function routePill(b) {
  if (String(b.device_status || "").toLowerCase() !== "assigned") {
    return { text: "No device", cls: "bus-pill-red", ico: "fa-ban" };
  }

  const ts = b.terminal_state;
  if (!ts) return { text: "No terminal state", cls: "bus-pill-yellow", ico: "fa-question" };

  const cur = ts.current_terminal_name;
  const tgt = ts.target_terminal_name;

  const label =
    b.route_label ||
    (cur && tgt ? `${cur} → ${tgt}` : cur && !tgt ? `${cur} → —` : !cur && tgt ? `— → ${tgt}` : "Unknown route");

  if (Number(ts.at_terminal) === 1) {
    return { text: label, cls: "bus-pill-green", ico: "fa-location-dot" };
  }
  return { text: label, cls: "bus-pill-blue", ico: "fa-road" };
}

function timeAgo(dateLike) {
  if (!dateLike) return "—";
  const dt = new Date(dateLike);
  if (isNaN(dt.getTime())) return "—";
  const diffMs = Date.now() - dt.getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} mins ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hrs ago`;
  const d = Math.floor(h / 24);
  return `${d} days ago`;
}

function formatTs(dateLike) {
  if (!dateLike) return "";
  const dt = new Date(dateLike);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleString();
}

function clampPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function viewBus(id) {
  router.push(`/admin/buses/${id}`);
}

/* ---------- Modal / Save ---------- */
const showBusModal = ref(false);
const editing = ref(false);
const saving = ref(false);
const modalError = ref("");

const form = reactive({
  id: null,
  bus_code: "",
  plate_no: "",
  capacity: 40,
  bus_status: "active",
});

function openNewBus() {
  editing.value = false;
  modalError.value = "";
  Object.assign(form, { id: null, bus_code: "", plate_no: "", capacity: 40, bus_status: "active" });
  showBusModal.value = true;
}

function openEdit(b) {
  editing.value = true;
  modalError.value = "";
  Object.assign(form, {
    id: b.id,
    bus_code: b.bus_code,
    plate_no: b.plate_no,
    capacity: Number(b.capacity ?? 40),
    bus_status: String(b.bus_status || "active").toLowerCase(),
  });
  showBusModal.value = true;
}

function closeBusModal() {
  showBusModal.value = false;
  modalError.value = "";
  saving.value = false;
}

function validateForm() {
  const plate = String(form.plate_no || "").trim();
  const cap = Number(form.capacity);
  if (!plate) return "Plate No is required.";
  if (!Number.isFinite(cap) || cap <= 0) return "Capacity must be a valid number greater than 0.";
  return "";
}

async function saveBus() {
  modalError.value = "";
  const v = validateForm();
  if (v) {
    modalError.value = v;
    return;
  }

  const payload = {
    plate_no: String(form.plate_no || "").trim(),
    capacity: Number(form.capacity),
    bus_status: String(form.bus_status || "active").toLowerCase(),
  };

  saving.value = true;
  try {
    if (!editing.value) {
      await addBus(payload);
    } else {
      if (typeof apiEditBus === "function" && apiEditBus.length >= 2) {
        await apiEditBus(form.id, payload);
      } else {
        await apiEditBus({ id: form.id, ...payload });
      }
    }

    closeBusModal();
    await refresh();
  } catch (e) {
    modalError.value = e?.message || "Failed to save bus. Please try again.";
  } finally {
    saving.value = false;
  }
}
</script>

