<template>
  <div class="wrap">
    <div class="panel">
      <div class="panel-head">
        <div>
          <p class="title">Bus List</p>
          <p class="sub">Fleet records, assignment status, and live occupancy.</p>

          <p v-if="loading" class="sub">Loading buses…</p>
          <p v-else-if="error" class="sub" style="color:#ef4444;">{{ error }}</p>
        </div>

        <button class="btn primary" type="button" @click="openNewBus">
          <i class="fas fa-plus"></i>
          New Bus
        </button>
      </div>

      <div class="table-wrap">
        <table class="t">
          <thead>
            <tr>
              <th>Bus Code</th>
              <th>Plate No</th>
              <th>Capacity / Occupancy</th>
              <th>Device Status</th>
              <th>Last Seen</th>
              <th>Status</th>
              <th class="right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="b in filteredRows"
              :key="b.id"
              :class="{ 'row-full': isFull(b) }"
            >
              <td class="mono">
                <span class="cell-strong">{{ b.bus_code }}</span>
              </td>

              <td>{{ b.plate_no }}</td>

              <td>
                <div class="cap-col">
                  <div class="cap-top">
                    <span class="cell-strong">{{ b.capacity ?? "—" }}</span>
                    <span class="cap-label">seats</span>
                  </div>

                  <div class="cap-sub">
                    <template v-if="b.device_status === 'assigned' && b.passenger_count != null && b.capacity">
                      Occupancy:
                      <b :style="isFull(b) ? 'color:#ef4444;' : ''">
                        {{ safeOcc(b) }}
                      </b>
                      / {{ b.capacity }}
                      <span v-if="b.occupancy_percent != null"> ({{ clampPct(b.occupancy_percent) }}%)</span>

                      <div class="occ-bar">
                        <div
                          class="occ-fill"
                          :class="{ full: isFull(b) }"
                          :style="{ width: clampPct(b.occupancy_percent) + '%' }"
                        ></div>
                      </div>

                      <div class="mini full-note" v-if="isFull(b)">
                        FULL • Capacity reached
                      </div>
                    </template>

                    <template v-else>
                      Occupancy: —
                      <div class="occ-bar">
                        <div class="occ-fill" style="width:0%;"></div>
                      </div>
                    </template>
                  </div>
                </div>
              </td>

              <td>
                <span class="pill" :class="devicePill(b).cls">
                  <i class="fas" :class="devicePill(b).ico"></i>
                  {{ devicePill(b).text }}
                </span>

                <div class="mini" v-if="b.device_status === 'assigned' && b.device?.device_code">
                  {{ b.device.device_code }}
                </div>
              </td>

              <td>{{ timeAgo(b.device_last_seen_at) }}</td>

              <td>
                <span class="pill" :class="statusPill(b.bus_status).cls">
                  {{ prettyStatus(b.bus_status) }}
                </span>
              </td>

              <td class="right">
                <button class="btn ghost" type="button" @click="viewBus(b.id)">
                  <i class="fas fa-eye"></i> View
                </button>
                <button class="btn ghost" type="button" @click="openEdit(b)">
                  <i class="fas fa-pen"></i> Edit
                </button>
              </td>
            </tr>

            <tr v-if="!loading && filteredRows.length === 0">
              <td colspan="7">
                <div class="empty">
                  <i class="fas fa-inbox"></i>
                  <p>No buses found</p>
                  <small>Create a bus record to get started.</small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL (same as yours) -->
    <teleport to="body">
      <div v-if="showBusModal" class="admin-modal-overlay" @click.self="closeBusModal">
        <form class="admin-modal" @submit.prevent="saveBus">
          <div class="admin-modal-head">
            <p class="admin-modal-title">
              <i class="fas fa-bus"></i>
              {{ editing ? "Edit Bus" : "New Bus" }}
            </p>
            <button class="admin-icon-btn" type="button" @click="closeBusModal">
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
                <input class="admin-input" v-model="form.plate_no" placeholder="ABC-1234" />
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

              <label class="admin-field">
                <span>Status</span>
                <select class="admin-input" v-model="form.bus_status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
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
  search: { type: String, default: "" },
});

const router = useRouter();
const { rows, loading, error, fetchBuses, addBus, editBus: apiEditBus } = useBuses();

let poll = null;

async function load() {
  await fetchBuses();
}

onMounted(async () => {
  await load();
  poll = setInterval(load, 5000);
});

onBeforeUnmount(() => {
  if (poll) clearInterval(poll);
});

const filteredRows = computed(() => {
  const q = String(props.search || "").trim().toLowerCase();
  const list = rows.value || [];
  if (!q) return list;

  return list.filter((b) =>
    [b.bus_code, b.plate_no, b.bus_status, b.capacity, b.device?.device_code, b.device?.esp32_id]
      .some((x) => String(x ?? "").toLowerCase().includes(q))
  );
});

// ✅ FULL helpers
function safeOcc(b) {
  const cap = Number(b.capacity ?? 0);
  const occ = Number(b.passenger_count ?? 0);
  if (!Number.isFinite(cap) || cap <= 0) return occ;
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
  if (s === "active") return { cls: "pill-green" };
  if (s === "maintenance") return { cls: "pill-yellow" };
  return { cls: "pill-red" };
}

function devicePill(b) {
  const ds = String(b.device_status || "unassigned").toLowerCase();
  if (ds !== "assigned") return { text: "Not Assigned", cls: "pill-red", ico: "fa-link-slash" };
  if (b.device_online) return { text: "Assigned • Online", cls: "pill-green", ico: "fa-link" };
  return { text: "Assigned • Offline", cls: "pill-yellow", ico: "fa-link" };
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

function clampPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function viewBus(id) {
  router.push(`/admin/buses/${id}`);
}

// modal state (same as yours)
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

async function saveBus() {
  // keep your existing save implementation
  // (left as-is because your add/edit API may differ)
  modalError.value = "Hook your existing create/update bus API here.";
}
</script>

<style scoped>
.wrap{ display:block; }
.panel{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 10px 22px rgba(0,0,0,0.04);
}
.panel-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.title{ margin:0; font-weight: 900; font-size: 14px; color: var(--text-dark); }
.sub{ margin:6px 0 0; font-weight: 700; font-size: 12px; color: rgba(38,43,51,0.68); }

.table-wrap{
  border: 2px solid var(--border-light);
  border-radius: 16px;
  overflow:auto;
  background: #fff;
}
.t{ width:100%; border-collapse: separate; border-spacing: 0; min-width: 980px; }
.t thead th{
  text-align:left;
  font-size: 11px;
  font-weight: 900;
  letter-spacing:.4px;
  text-transform: uppercase;
  color: rgba(38,43,51,0.62);
  padding: 12px;
  border-bottom: 1px solid rgba(209,213,219,0.65);
  background: rgba(245,247,250,0.7);
}
.t tbody td{
  padding: 12px;
  border-bottom: 1px solid rgba(229,231,235,0.8);
  font-weight: 700;
  color: rgba(38,43,51,0.88);
  vertical-align: middle;
}
.t tbody tr:hover td{
  background: rgba(0,188,212,0.04);
}
.right{ text-align:right; white-space: nowrap; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.cell-strong{ font-weight: 900; }

/* FULL row */
.row-full td{
  background: rgba(239,68,68,0.05);
}
.row-full:hover td{
  background: rgba(239,68,68,0.08);
}

/* occupancy cell */
.cap-col{ display:flex; flex-direction:column; gap:6px; min-width: 180px; }
.cap-top{ display:flex; align-items:baseline; gap:8px; }
.cap-label{ font-size: 12px; font-weight: 800; color: rgba(38,43,51,0.55); }
.cap-sub{ font-size: 12px; font-weight: 800; color: rgba(38,43,51,0.70); }
.occ-bar{
  margin-top: 6px;
  height: 8px;
  border-radius: 999px;
  background: rgba(209,213,219,0.55);
  overflow:hidden;
}
.occ-fill{
  height: 100%;
  border-radius: 999px;
  background: rgba(0,188,212,0.95);
  width: 0%;
  transition: width .25s ease;
}
.occ-fill.full{
  background: rgba(239,68,68,0.95);
}

.mini{
  margin-top: 6px;
  font-size: 11px;
  font-weight: 800;
  color: rgba(38,43,51,0.60);
}
.full-note{
  color:#ef4444;
}

/* pills */
.pill{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid transparent;
}
.pill-green{ background: rgba(16,185,129,0.12); color: var(--success-green); border-color: rgba(16,185,129,0.25); }
.pill-yellow{ background: rgba(255,152,0,0.12); color: var(--warning-orange); border-color: rgba(255,152,0,0.25); }
.pill-red{ background: rgba(239,68,68,0.12); color: var(--error-red); border-color: rgba(239,68,68,0.25); }

/* buttons */
.btn{
  border: 2px solid var(--border-light);
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 900;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  color: rgba(38,43,51,0.85);
}
.btn:hover{ border-color: rgba(0,188,212,0.35); background: rgba(0,188,212,0.06); }
.btn:active{ transform: scale(.99); }
.btn.primary{
  border-color: rgba(30,136,229,0.18);
  background: linear-gradient(135deg, rgba(30,136,229,0.92), rgba(0,188,212,0.72));
  color:#fff;
}
.btn.primary:hover{ filter: brightness(1.02); }
.btn.ghost{ padding: 8px 10px; border-radius: 10px; }

/* empty */
.empty{
  padding: 18px 10px;
  text-align:center;
  color: rgba(38,43,51,0.68);
}
.empty i{ font-size: 32px; color: var(--border-medium); display:block; margin-bottom: 8px; }
.empty p{ margin:0; font-weight: 900; }
.empty small{ font-weight: 700; }
</style>
