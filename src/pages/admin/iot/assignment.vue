<template>
  <div class="iot-assignments">
    <!-- HERO -->
    <div class="iot-assignments__hero">
      <div class="iot-assignments__hero-left">
        <div class="iot-assignments__hero-icon">
          <i class="fas fa-link"></i>
        </div>
        <div>
          <h2 class="iot-assignments__hero-title">Bus ⇄ Device Assignments</h2>
          <p class="iot-assignments__hero-sub">
            Assign IoT devices (ESP32 + GPS + IR) to buses. Occupancy & tracking will work only when assigned.
          </p>

          <div class="iot-assignments__hero-meta">
            <span class="iot-assignments__meta-pill">
              <span class="iot-assignments__dot" :class="onlineCount > 0 ? 'ok' : ''"></span>
              Online devices: <b>{{ onlineCount }}</b>
            </span>
            <span class="iot-assignments__meta-pill soft">
              Total buses: <b>{{ buses.length }}</b>
            </span>
            <span class="iot-assignments__meta-pill soft">
              Assigned: <b>{{ assignedCount }}</b>
            </span>
          </div>
        </div>
      </div>

      <button class="iot-assignments__btn primary" type="button" @click="openAssign">
        <i class="fas fa-plus"></i>
        New Assignment
      </button>
    </div>

    <!-- TOOLBAR -->
    <div class="iot-assignments__toolbar">
      <div class="iot-assignments__search">
        <i class="fas fa-search"></i>
        <input
          v-model="q"
          class="iot-assignments__search-input"
          placeholder="Search bus, plate, device code, ESP32 ID..."
        />
      </div>

      <div class="iot-assignments__toolbar-right">
        <select v-model="flt" class="iot-assignments__select" aria-label="Filter">
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
          <option value="active">Active (IR ok)</option>
          <option value="needs">Needs Check (IR stale/offline)</option>
        </select>

        <button class="iot-assignments__btn" type="button" @click="refresh" :disabled="loading">
          <i class="fas fa-rotate" :class="{ spin: loading }"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- TABLE CARD -->
    <div class="iot-assignments__table-card">
      <div class="iot-assignments__table-head">
        <div>
          <p class="iot-assignments__table-title">Assignments Table</p>
          <p class="iot-assignments__table-sub">Each row is a bus + its current assigned device</p>

          <p v-if="error" class="iot-assignments__err">{{ error }}</p>
        </div>

        <div class="iot-assignments__table-mini">
          <span class="iot-assignments__mini-pill">
            <i class="fas fa-microchip"></i>
            Unassigned devices: <b>{{ unassignedDevices.length }}</b>
          </span>
        </div>
      </div>

      <div class="admin-table-assignments-wrap">
        <table class="admin-table-assignments">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Device</th>
              <th>ESP32 ID</th>
              <th>Last Seen</th>
              <th>Status</th>
              <th style="width:220px;">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="a in filteredAssignments" :key="a.bus_id">
              <td>
                <div class="cell-main">{{ a.bus_code }}</div>
                <div class="cell-sub">Plate: {{ a.plate_no }} • Cap: {{ a.capacity }}</div>
              </td>

              <td>
                <div class="cell-main">{{ a.device_id ? a.device_code : "Not Assigned" }}</div>
                <div class="cell-sub">
                  {{ a.device_id ? "Assigned device" : "Assign a device to enable GPS + IR" }}
                </div>
              </td>

              <td>
                <div class="cell-main mono">{{ a.device_id ? a.esp32_id : "—" }}</div>
                <div class="cell-sub">Telemetry: GPS + IR</div>
              </td>

              <td>
                <div class="cell-main">{{ a.last_seen_at ? fmt(a.last_seen_at) : "—" }}</div>
                <div class="cell-sub">IR Seen: {{ a.ir_last_seen_at ? fmt(a.ir_last_seen_at) : "—" }}</div>
              </td>

              <td>
                <span class="pill-badge" :class="statusClass(a)">
                  <i class="fas" :class="statusIcon(a)"></i>
                  {{ statusLabel(a) }}
                </span>
              </td>

              <td>
                <div class="row-actions">
                  <button class="iot-assignments__btn" type="button" @click="editAssign(a)">
                    <i class="fas fa-pen"></i> Edit
                  </button>

                  <button
                    class="iot-assignments__btn danger"
                    type="button"
                    @click="doUnassign(a)"
                    :disabled="!a.device_id || loading"
                    :title="!a.device_id ? 'No device assigned' : ''"
                  >
                    <i class="fas fa-link-slash"></i> Unassign
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredAssignments.length === 0">
              <td colspan="6">
                <div class="empty">
                  <i class="fas fa-link"></i>
                  <p>No results</p>
                  <small>Try clearing filters or assign devices to buses.</small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL -->
     
   <!-- MODAL (teleported so it won't be clipped by admin layout overflow) -->
<Teleport to="body">
  <div v-if="modalOpen" class="admin-modal-overlay" @click.self="closeModal">
    <div class="admin-modal" role="dialog" aria-modal="true">
      <div class="admin-modal-head">
        <h3 class="admin-modal-title">
          <i class="fas" :class="isEditing ? 'fa-pen' : 'fa-link'"></i>
          {{ isEditing ? "Edit Assignment" : "New Assignment" }}
        </h3>

        <button class="admin-icon-btn" type="button" @click="closeModal" aria-label="Close">
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <div class="admin-modal-body">
        <p class="m-sub" style="margin-top:0;">
          Select a bus, then choose an unassigned device. Device is locked in edit mode.
        </p>

        <div class="admin-form-grid">
          <div class="admin-field">
            <span>Bus</span>
            <select v-model="form.bus_id" class="admin-input">
              <option disabled value="">Select bus</option>
              <option v-for="b in buses" :key="b.bus_id" :value="b.bus_id">
                {{ b.bus_code }} • {{ b.plate_no }}
              </option>
            </select>
          </div>

          <div class="admin-field">
            <span>Device (Unassigned)</span>
            <select v-model="form.device_id" class="admin-input" :disabled="isEditing">
              <option disabled value="">Select device</option>
              <option v-for="d in unassignedDevices" :key="d.id" :value="d.id">
                {{ d.device_code }} • {{ d.esp32_id }}
              </option>
            </select>

            <small v-if="isEditing" style="font-weight:700; color: rgba(38,43,51,0.55);">
              Device cannot be changed in edit mode. Unassign then re-assign if needed.
            </small>
          </div>

          <div class="admin-field full">
            <span>Notes</span>
            <input
              v-model="form.note"
              class="admin-input"
              placeholder="Example: Installed by Tech A. Front door beams aligned."
            />
          </div>

          <div class="admin-field full">
            <span>Local Status (UI only)</span>
            <select v-model="form.ui_status" class="admin-input">
              <option value="Active">Active</option>
              <option value="Needs Check">Needs Check</option>
            </select>
            <small style="font-weight:700; color: rgba(38,43,51,0.55);">
              Label only. Real device state comes from telemetry.
            </small>
          </div>
        </div>

        <div v-if="error" class="admin-err">
          <i class="fas fa-triangle-exclamation"></i>
          {{ error }}
        </div>
      </div>

      <div class="admin-modal-foot">
        <button class="admin-btn" type="button" @click="closeModal" :disabled="loading">
          Cancel
        </button>

        <button class="admin-btn primary" type="button" @click="saveAssign" :disabled="loading">
          <i class="fas fa-floppy-disk"></i> Save
        </button>
      </div>
    </div>
  </div>
</Teleport>


    <div style="height:14px;"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useBusAssignments } from "@/composables/useBusAssignments";
import { useDevices } from "@/composables/useDevices"; // you likely have this; if not, tell me and I'll write it

// --- composables (API)
const {
  rows: assignmentRows,
  loading,
  error,
  fetchCurrentAssignments,
  assign,
  unassign,
} = useBusAssignments();

const {
  rows: deviceRows,
  fetchDevices,
} = useDevices();

// --- toolbar
const q = ref("");
const flt = ref("all");

// We treat assignmentRows as bus list with device fields
const buses = computed(() => assignmentRows.value || []);

// Unassigned devices = all devices not currently used by any bus.device_id
const unassignedDevices = computed(() => {
  const used = new Set(
    buses.value.map((b) => b.device_id).filter(Boolean)
  );
  return (deviceRows.value || []).filter((d) => !used.has(d.id));
});

const assignedCount = computed(() => buses.value.filter((b) => !!b.device_id).length);

const onlineCount = computed(() => {
  // simple: online if last_seen_at exists and within 120s (backend already computes in devices endpoint,
  // but current assignments endpoint returns last_seen_at; we do simple display)
  const now = Date.now();
  return buses.value.filter((b) => {
    if (!b.last_seen_at) return false;
    const t = new Date(b.last_seen_at).getTime();
    return Number.isFinite(t) && t >= now - 120 * 1000;
  }).length;
});

const filteredAssignments = computed(() => {
  const keyword = q.value.trim().toLowerCase();

  return buses.value.filter((a) => {
    const hay = [
      a.bus_code,
      a.plate_no,
      a.device_code || "",
      a.esp32_id || "",
      a.gps_state || "",
      a.ir_state || "",
      a.last_seen_at || "",
      a.ir_last_seen_at || "",
    ].join(" ").toLowerCase();

    const matchesSearch = !keyword || hay.includes(keyword);

    const isAssigned = !!a.device_id;
    const isActive = isAssigned && a.ir_state === "ok";
    const needs = isAssigned && a.ir_state !== "ok";

    const matchesFilter =
      flt.value === "all" ||
      (flt.value === "assigned" && isAssigned) ||
      (flt.value === "unassigned" && !isAssigned) ||
      (flt.value === "active" && isActive) ||
      (flt.value === "needs" && needs);

    return matchesSearch && matchesFilter;
  });
});

// --- modal
const modalOpen = ref(false);
const isEditing = ref(false);
const editingBusId = ref(null);

const form = ref(resetForm());

function resetForm() {
  return {
    bus_id: "",
    device_id: "",
    note: "",
    ui_status: "Active", // UI only
  };
}

function openAssign() {
  isEditing.value = false;
  editingBusId.value = null;
  form.value = resetForm();
  modalOpen.value = true;
}

function editAssign(a) {
  isEditing.value = true;
  editingBusId.value = a.bus_id;

  form.value = {
    bus_id: a.bus_id,
    device_id: a.device_id || "",
    note: "",
    ui_status: a.ir_state === "ok" ? "Active" : "Needs Check",
  };

  // NOTE: device dropdown is disabled in edit mode (locked)
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
}

async function saveAssign() {
  if (!form.value.bus_id) {
    alert("Please select a Bus.");
    return;
  }

  // create new assignment
  if (!isEditing.value) {
    if (!form.value.device_id) {
      alert("Please select a Device.");
      return;
    }

    // store extra text in note so it doesn't get lost
    const finalNote = buildNote(form.value.note, form.value.ui_status);

    try {
      await assign(form.value.bus_id, form.value.device_id, finalNote);
      modalOpen.value = false;
    } catch (e) {
      // error already set in composable
    }
    return;
  }

  // edit mode: safest behavior = UNASSIGN then assign same device to new bus (if bus changed)
  const oldBusId = editingBusId.value;
  const newBusId = form.value.bus_id;
  const deviceId = form.value.device_id;

  if (!deviceId) {
    alert("This bus has no device. Use New Assignment instead.");
    return;
  }

  const finalNote = buildNote(form.value.note, form.value.ui_status);

  try {
    if (newBusId !== oldBusId) {
      // move device to another bus
      await unassign(oldBusId, "Moved assignment");
      await assign(newBusId, deviceId, finalNote);
    } else {
      // no backend field to update note-only, so just keep it simple:
      // you can create a 'notes update' endpoint later if you want
      alert("Edit mode currently supports moving assignment by changing bus. Notes are stored on assignment creation.");
    }

    modalOpen.value = false;
  } catch (e) {}
}

async function doUnassign(a) {
  if (!a.device_id) return;
  const ok = confirm(`Unassign ${a.device_code} from ${a.bus_code}?`);
  if (!ok) return;

  try {
    await unassign(a.bus_id, "Unassigned from admin");
  } catch (e) {}
}

async function refresh() {
  await Promise.all([fetchCurrentAssignments(), fetchDevices()]);
}

function buildNote(note, uiStatus) {
  const parts = [];
  if (uiStatus) parts.push(`UI_STATUS: ${uiStatus}`);
  if (note && note.trim()) parts.push(note.trim());
  return parts.join(" | ");
}

function fmt(dt) {
  try {
    // show nice date/time
    const d = new Date(dt);
    if (!Number.isFinite(d.getTime())) return String(dt);
    return d.toLocaleString();
  } catch {
    return String(dt);
  }
}

function statusLabel(a) {
  if (!a.device_id) return "Not Assigned";
  if (!a.last_seen_at) return "Needs Check";
  return a.ir_state === "ok" ? "Active" : "Needs Check";
}
function statusClass(a) {
  const s = statusLabel(a);
  if (s === "Active") return "ok";
  if (s === "Not Assigned") return "";
  return "warn";
}
function statusIcon(a) {
  const s = statusLabel(a);
  if (s === "Active") return "fa-circle-check";
  if (s === "Not Assigned") return "fa-circle-minus";
  return "fa-triangle-exclamation";
}

onMounted(refresh);
</script>

<style scoped>
/* ✅ kept your original styles; added a few small extras */
.iot-assignments{ padding: 16px; }
.iot-assignments__err{
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 900;
  color: rgba(239,68,68,0.95);
}
.spin{ animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ===== HERO ===== */
.iot-assignments__hero{
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
.iot-assignments__hero-left{ display:flex; gap: 12px; align-items:flex-start; }
.iot-assignments__hero-icon{
  width: 48px; height: 48px; border-radius: 14px;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.22);
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.iot-assignments__hero-title{ margin:0; font-weight: 1000; font-size: 16px; }
.iot-assignments__hero-sub{ margin:6px 0 0; font-weight: 800; font-size: 12px; opacity:.92; line-height: 1.35; }

.iot-assignments__hero-meta{
  margin-top: 10px;
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
}
.iot-assignments__meta-pill{
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
.iot-assignments__meta-pill.soft{ background: rgba(255,255,255,0.12); }
.iot-assignments__dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: rgba(209,213,219,1);
}
.iot-assignments__dot.ok{ background: rgba(16,185,129,1); }

/* ===== BUTTONS ===== */
.iot-assignments__btn{
  border: 2px solid rgba(255,255,255,0.22);
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 1000;
  cursor:pointer;
  color: rgba(38,43,51,0.92);
  background: rgba(255,255,255,0.88);
  display:flex; align-items:center; gap: 8px;
  flex-shrink:0;
}
.iot-assignments__btn:active{ transform: scale(.98); }
.iot-assignments__btn.primary{
  border: none;
  color: #fff;
  background:
    radial-gradient(circle at 18% 12%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
  box-shadow: 0 10px 22px rgba(0,188,212,0.18);
}
.iot-assignments__btn.danger{
  border-color: rgba(239,68,68,0.25);
  background: rgba(239,68,68,0.10);
  color: rgba(239,68,68,0.95);
}

/* ===== TOOLBAR ===== */
.iot-assignments__toolbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.iot-assignments__search{
  flex: 1;
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 2px solid var(--border-light);
  background: #fff;
  min-width: 220px;
}
.iot-assignments__search i{ color: var(--accent-teal); }
.iot-assignments__search-input{
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  color: var(--text-dark);
  font-weight: 900;
  font-size: 13px;
}
.iot-assignments__toolbar-right{
  display:flex;
  align-items:center;
  gap: 10px;
}
.iot-assignments__select{
  border: 2px solid var(--border-light);
  background:#fff;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1000;
  color: rgba(38,43,51,0.85);
  outline:none;
}
.iot-assignments__select:focus{
  border-color: rgba(0,188,212,0.45);
  box-shadow: 0 0 0 4px rgba(0,188,212,0.10);
}

/* ===== TABLE CARD ===== */
.iot-assignments__table-card{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(0,0,0,0.04);
  overflow:hidden;
}
.iot-assignments__table-head{
  padding: 14px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(229,231,235,1);
  background: rgba(245,247,250,0.8);
}
.iot-assignments__table-title{
  margin:0;
  font-weight: 1000;
  color: var(--text-dark);
  font-size: 14px;
}
.iot-assignments__table-sub{
  margin:6px 0 0;
  font-weight: 800;
  color: rgba(38,43,51,0.65);
  font-size: 12px;
}
.iot-assignments__mini-pill{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 2px solid var(--border-light);
  background:#fff;
  font-weight: 1000;
  font-size: 12px;
  color: rgba(38,43,51,0.78);
}

/* ===== TABLE ===== */
.admin-table-assignments-wrap{ overflow:auto; }
.admin-table-assignments{
  width:100%;
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0 10px;
  padding: 0 10px 10px;
}
.admin-table-assignments thead th{
  text-align:left;
  padding: 12px 10px 8px;
  font-size: 11px;
  letter-spacing: .4px;
  text-transform: uppercase;
  font-weight: 1000;
  color: rgba(38,43,51,0.55);
}
.admin-table-assignments tbody td{
  background:#fff;
  border: 1px solid rgba(209,213,219,.70);
  padding: 12px 10px;
  font-weight: 900;
  color: rgba(38,43,51,0.80);
  vertical-align: top;
}
.admin-table-assignments tbody tr td:first-child{
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}
.admin-table-assignments tbody tr td:last-child{
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
}

/* cells */
.cell-main{ font-weight: 1000; color: rgba(38,43,51,0.90); }
.cell-sub{ margin-top: 6px; font-size: 11px; font-weight: 900; color: rgba(38,43,51,0.55); line-height: 1.35; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }

/* status badge */
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

/* actions */
.row-actions{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content:flex-end;
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

/* ===== MODAL ===== */
.modal-overlay{
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0,0,0,0.50);
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 18px;
}
.iot-modal{
  width: min(780px, 96vw);
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(209,213,219,.70);
  box-shadow: 0 24px 70px rgba(0,0,0,0.28);
  padding: 18px;
  position: relative;
}
.modal-close{
  position:absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(209,213,219,.75);
  background: #fff;
  cursor:pointer;
}
.modal-close:hover{ background: rgba(0,188,212,0.06); border-color: rgba(0,188,212,0.25); }

.m-head{ display:flex; gap: 12px; align-items:flex-start; }
.m-icon{
  width: 44px; height: 44px; border-radius: 14px;
  display:flex; align-items:center; justify-content:center;
  color:#fff;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
  flex-shrink:0;
}
.m-title{ margin: 2px 0 0; font-size: 16px; font-weight: 1000; color: rgba(38,43,51,0.92); }
.m-sub{ margin: 6px 0 0; font-size: 12px; font-weight: 900; color: rgba(38,43,51,0.60); }

.m-grid{
  margin-top: 14px;
  display:grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 12px;
}
.m-label{
  display:block;
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 1000;
  color: rgba(38,43,51,0.58);
  text-transform: uppercase;
  letter-spacing: .6px;
}
.m-input{
  width: 100%;
  border-radius: 14px;
  border: 2px solid var(--border-light);
  padding: 10px 12px;
  background: #fff;
  font-weight: 900;
  color: rgba(38,43,51,.85);
  outline: none;
}
.m-input:focus{
  border-color: rgba(0,188,212,0.45);
  box-shadow: 0 0 0 4px rgba(0,188,212,0.10);
}
.m-hint{
  display:block;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 900;
  color: rgba(38,43,51,0.55);
}
.m-actions{
  margin-top: 14px;
  display:flex;
  justify-content:flex-end;
  gap: 10px;
}

/* responsive */
@media (max-width: 980px){
  .iot-assignments__toolbar{ flex-direction: column; align-items: stretch; }
  .iot-assignments__toolbar-right{ justify-content: flex-end; }
}
@media (max-width: 860px){
  .iot-assignments__hero{ flex-direction: column; }
  .iot-assignments__btn.primary{ width: 100%; justify-content:center; }
}
@media (max-width: 820px){
  .m-grid{ grid-template-columns: 1fr; }
}
</style>
