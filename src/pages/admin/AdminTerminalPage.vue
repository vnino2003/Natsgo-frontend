<!-- src/pages/admin/TerminalPage.vue -->
<template>
  <div class="wrap">
    <div class="panel">
      <div class="panel-head">
        <div>
          <p class="title">Terminal List</p>
          <p class="sub">Manage terminals, coordinates, status, and assigned buses.</p>

          <p v-if="loading" class="sub">Loading terminals…</p>
          <p v-else-if="error" class="sub" style="color:#ef4444;">{{ error }}</p>
        </div>

        <div class="head-actions">
          <div class="search">
            <i class="fas fa-search"></i>
            <input
              v-model="search"
              class="search-input"
              type="text"
              placeholder="Search terminal name, city..."
            />
            <button v-if="search" class="search-clear" type="button" @click="search = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <button class="btn primary" type="button" @click="openNew">
            <i class="fas fa-plus"></i>
            New Terminal
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="t">
          <thead>
            <tr>
              <th>Terminal</th>
              <th>City</th>
              <th>Coordinates</th>
              <th>Buses</th>
              <th>Status</th>
              <th class="right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="t in filteredRows" :key="t.terminal_id">
              <td>
                <div class="cell-main">
                  <span class="cell-strong">{{ t.terminal_name }}</span>
                  <div class="mini mono">ID {{ t.terminal_id }}</div>
                </div>
              </td>

              <td>{{ t.city }}</td>

              <td class="mono">
                <div class="coord">
                  <span class="coord-dot"></span>
                  {{ fmtCoord(t.lat) }}, {{ fmtCoord(t.lng) }}
                </div>
              </td>

              <td>
                <span class="pill pill-blue">
                  <i class="fas fa-bus"></i>
                  {{ Number(t.bus_count ?? 0) }}
                </span>
                <div class="mini" v-if="Number(t.bus_count ?? 0) === 0">No assigned buses</div>
              </td>

              <td>
                <span class="pill" :class="activePill(t.is_active).cls">
                  <i class="fas" :class="activePill(t.is_active).ico"></i>
                  {{ activePill(t.is_active).text }}
                </span>
              </td>

              <td class="right">
                <button class="btn ghost" type="button" @click="openEdit(t)">
                  <i class="fas fa-pen"></i> Edit
                </button>
                <button class="btn ghost danger" type="button" @click="askDelete(t)">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>

            <tr v-if="!loading && filteredRows.length === 0">
              <td colspan="6">
                <div class="empty">
                  <i class="fas fa-map-location-dot"></i>
                  <p>No terminals found</p>
                  <small>Add a terminal to get started.</small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footnote">
        <i class="fas fa-circle-info"></i>
        Tip: Keep coordinates accurate. Track page uses terminals to infer route direction.
      </div>
    </div>

    <!-- MODAL: Create/Edit -->
    <teleport to="body">
      <div v-if="showModal" class="admin-modal-overlay" @click.self="closeModal">
        <form class="admin-modal" @submit.prevent="save">
          <div class="admin-modal-head">
            <p class="admin-modal-title">
              <i class="fas fa-location-dot"></i>
              {{ editing ? "Edit Terminal" : "New Terminal" }}
            </p>
            <button class="admin-icon-btn" type="button" @click="closeModal" :disabled="saving">
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <div class="admin-modal-body">
            <div class="admin-form-grid">
              <label class="admin-field">
                <span>Terminal Name *</span>
                <input
                  class="admin-input"
                  v-model.trim="form.terminal_name"
                  placeholder="e.g., Calapan Terminal"
                  :disabled="saving"
                />
              </label>

              <label class="admin-field">
                <span>City *</span>
                <input
                  class="admin-input"
                  v-model.trim="form.city"
                  placeholder="e.g., Calapan City"
                  :disabled="saving"
                />
              </label>

              <label class="admin-field">
                <span>Latitude *</span>
                <input
                  class="admin-input"
                  v-model.number="form.lat"
                  type="number"
                  step="0.0000001"
                  placeholder="13.4100123"
                  :disabled="saving"
                />
                <div class="mini">Tip: Copy from Google Maps pin</div>
              </label>

              <label class="admin-field">
                <span>Longitude *</span>
                <input
                  class="admin-input"
                  v-model.number="form.lng"
                  type="number"
                  step="0.0000001"
                  placeholder="121.1800456"
                  :disabled="saving"
                />
              </label>

              <label class="admin-field">
                <span>Status</span>
                <select class="admin-input" v-model.number="form.is_active" :disabled="saving">
                  <option :value="1">Active</option>
                  <option :value="0">Inactive</option>
                </select>
              </label>

              <div class="admin-field hint">
                <span>Preview</span>
                <div class="preview">
                  <div class="preview-row">
                    <span class="pill" :class="activePill(form.is_active).cls">
                      <i class="fas" :class="activePill(form.is_active).ico"></i>
                      {{ activePill(form.is_active).text }}
                    </span>
                  </div>
                  <div class="preview-row mono">
                    {{ fmtCoord(form.lat) }}, {{ fmtCoord(form.lng) }}
                  </div>
                </div>
              </div>
            </div>

            <p v-if="modalError" class="admin-err">
              <i class="fas fa-triangle-exclamation"></i> {{ modalError }}
            </p>
          </div>

          <div class="admin-modal-foot">
            <button class="admin-btn" type="button" @click="closeModal" :disabled="saving">
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

    <!-- DELETE CONFIRM -->
    <teleport to="body">
      <div v-if="deleteTarget" class="admin-modal-overlay" @click.self="deleteTarget = null">
        <div class="admin-modal">
          <div class="admin-modal-head">
            <p class="admin-modal-title">
              <i class="fas fa-trash"></i>
              Delete Terminal
            </p>
            <button class="admin-icon-btn" type="button" @click="deleteTarget = null" :disabled="deleting">
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <div class="admin-modal-body">
            <p class="confirm-text">
              Delete <b>{{ deleteTarget.terminal_name }}</b>?
            </p>
            <p class="mini">
              Note: If buses are assigned to this terminal, you should re-assign them first.
            </p>

            <p v-if="deleteError" class="admin-err">
              <i class="fas fa-triangle-exclamation"></i> {{ deleteError }}
            </p>
          </div>

          <div class="admin-modal-foot">
            <button class="admin-btn" type="button" @click="deleteTarget = null" :disabled="deleting">
              Cancel
            </button>
            <button class="admin-btn danger" type="button" @click="doDelete" :disabled="deleting">
              <i class="fas fa-trash"></i>
              {{ deleting ? "Deleting..." : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useTerminals } from "../../composables/useTerminal";

const { rows, loading, error, fetchTerminals, addTerminal, editTerminal, removeTerminal } =
  useTerminals();

let poll = null;
const search = ref("");

async function load() {
  await fetchTerminals();
}

onMounted(async () => {
  await load();
  poll = setInterval(load, 8000);
});

onBeforeUnmount(() => {
  if (poll) clearInterval(poll);
});

const filteredRows = computed(() => {
  const q = String(search.value || "").trim().toLowerCase();
  const list = rows.value || [];
  if (!q) return list;

  return list.filter((t) =>
    [t.terminal_name, t.city, t.terminal_id].some((x) =>
      String(x ?? "").toLowerCase().includes(q)
    )
  );
});

function fmtCoord(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(6);
}

function activePill(v) {
  const on = Number(v) === 1;
  if (on) return { text: "Active", cls: "pill-green", ico: "fa-circle-check" };
  return { text: "Inactive", cls: "pill-red", ico: "fa-circle-xmark" };
}

/* ===== Modal ===== */
const showModal = ref(false);
const editing = ref(false);
const saving = ref(false);
const modalError = ref("");

const form = reactive({
  terminal_id: null,
  terminal_name: "",
  city: "",
  lat: null,
  lng: null,
  is_active: 1,
});

function openNew() {
  editing.value = false;
  modalError.value = "";
  Object.assign(form, {
    terminal_id: null,
    terminal_name: "",
    city: "",
    lat: null,
    lng: null,
    is_active: 1,
  });
  showModal.value = true;
}

function openEdit(t) {
  editing.value = true;
  modalError.value = "";
  Object.assign(form, {
    terminal_id: t.terminal_id,
    terminal_name: t.terminal_name,
    city: t.city,
    lat: Number(t.lat),
    lng: Number(t.lng),
    is_active: Number(t.is_active) ? 1 : 0,
  });
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  modalError.value = "";
  saving.value = false;
}

function validate() {
  if (!form.terminal_name) return "Terminal name is required.";
  if (!form.city) return "City is required.";

  const lat = Number(form.lat);
  const lng = Number(form.lng);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return "Latitude must be a valid number (-90 to 90).";
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return "Longitude must be a valid number (-180 to 180).";

  return "";
}

async function save() {
  modalError.value = "";
  const msg = validate();
  if (msg) {
    modalError.value = msg;
    return;
  }

  saving.value = true;
  try {
    const payload = {
      terminal_name: form.terminal_name,
      city: form.city,
      lat: Number(form.lat),
      lng: Number(form.lng),
      is_active: Number(form.is_active) ? 1 : 0,
    };

    if (editing.value && form.terminal_id != null) {
      await editTerminal(form.terminal_id, payload);
    } else {
      await addTerminal(payload);
    }

    closeModal();
    await load();
  } catch (e) {
    modalError.value = e?.response?.data?.message || e?.message || "Failed to save terminal.";
  } finally {
    saving.value = false;
  }
}

/* ===== Delete ===== */
const deleteTarget = ref(null);
const deleting = ref(false);
const deleteError = ref("");

function askDelete(t) {
  deleteError.value = "";
  deleting.value = false;
  deleteTarget.value = t;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  deleteError.value = "";
  deleting.value = true;
  try {
    await removeTerminal(deleteTarget.value.terminal_id);
    deleteTarget.value = null;
    await load();
  } catch (e) {
    deleteError.value = e?.response?.data?.message || e?.message || "Failed to delete terminal.";
  } finally {
    deleting.value = false;
  }
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

.head-actions{
  display:flex;
  gap: 10px;
  align-items:center;
  flex-wrap: wrap;
}

.search{
  position: relative;
  display:flex;
  align-items:center;
  gap: 8px;
  border: 2px solid var(--border-light);
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  min-width: 280px;
}
.search i{ color: rgba(38,43,51,0.55); }
.search-input{
  border:none;
  outline:none;
  width: 100%;
  font-weight: 900;
  font-size: 12px;
  color: rgba(38,43,51,0.88);
}
.search-clear{
  border:none;
  background: transparent;
  color: rgba(38,43,51,0.55);
  width: 30px;
  height: 30px;
  border-radius: 10px;
  cursor:pointer;
}
.search-clear:active{ transform: scale(.95); }

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
  font-weight: 800;
  color: rgba(38,43,51,0.88);
  vertical-align: middle;
}
.t tbody tr:hover td{
  background: rgba(0,188,212,0.04);
}
.right{ text-align:right; white-space: nowrap; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.cell-strong{ font-weight: 900; }

.cell-main{ display:flex; flex-direction:column; gap: 2px; }
.mini{
  margin-top: 4px;
  font-size: 11px;
  font-weight: 800;
  color: rgba(38,43,51,0.60);
}

.coord{
  display:inline-flex;
  align-items:center;
  gap: 8px;
}
.coord-dot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(0,188,212,0.9);
  box-shadow: 0 0 0 4px rgba(0,188,212,0.12);
}

.footnote{
  margin-top: 12px;
  display:flex;
  align-items:center;
  gap: 8px;
  color: rgba(38,43,51,0.65);
  font-weight: 800;
  font-size: 12px;
  padding: 10px 12px;
  border: 2px solid var(--border-light);
  border-radius: 16px;
  background: rgba(255,255,255,0.7);
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
.pill-red{ background: rgba(239,68,68,0.12); color: var(--error-red); border-color: rgba(239,68,68,0.25); }
.pill-blue{ background: rgba(30,136,229,0.10); color: rgba(30,136,229,0.95); border-color: rgba(30,136,229,0.22); }

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
.btn.danger:hover{ border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.06); }

/* empty */
.empty{
  padding: 18px 10px;
  text-align:center;
  color: rgba(38,43,51,0.68);
}
.empty i{ font-size: 32px; color: var(--border-medium); display:block; margin-bottom: 8px; }
.empty p{ margin:0; font-weight: 900; }
.empty small{ font-weight: 700; }

/* ===== Modal styles ===== */
.admin-modal-overlay{
  position: fixed;
  inset: 0;
  background: rgba(17,24,39,0.35);
  backdrop-filter: blur(8px);
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 16px;
  z-index: 999;
}
.admin-modal{
  width: min(720px, 100%);
  background: #fff;
  border: 2px solid var(--border-light);
  border-radius: 18px;
  box-shadow: 0 20px 55px rgba(0,0,0,0.18);
  overflow:hidden;
}
.admin-modal-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 14px 14px;
  border-bottom: 1px solid rgba(229,231,235,0.85);
  background: rgba(245,247,250,0.65);
}
.admin-modal-title{
  margin:0;
  font-weight: 1000;
  color: rgba(38,43,51,0.92);
  display:flex;
  align-items:center;
  gap: 10px;
}
.admin-icon-btn{
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  background: #fff;
  cursor:pointer;
}
.admin-icon-btn:active{ transform: scale(.98); }

.admin-modal-body{ padding: 14px; }
.admin-form-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 720px){
  .admin-form-grid{ grid-template-columns: 1fr; }
  .search{ min-width: 0; width: 100%; }
}
.admin-field{
  display:flex;
  flex-direction:column;
  gap: 6px;
}
.admin-field > span{
  font-size: 12px;
  font-weight: 1000;
  color: rgba(38,43,51,0.70);
}
.admin-input{
  border: 2px solid var(--border-light);
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 900;
  outline:none;
}
.admin-input:focus{
  border-color: rgba(0,188,212,0.35);
  box-shadow: 0 0 0 4px rgba(0,188,212,0.10);
}
.admin-field.hint .preview{
  border: 2px dashed rgba(209,213,219,0.8);
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(245,247,250,0.55);
}
.preview-row{ margin-bottom: 8px; }
.preview-row:last-child{ margin-bottom: 0; }

.admin-err{
  margin: 12px 0 0;
  color: #ef4444;
  font-weight: 900;
  display:flex;
  align-items:center;
  gap: 8px;
}

.confirm-text{
  margin: 0;
  font-weight: 900;
  color: rgba(38,43,51,0.90);
}

.admin-modal-foot{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid rgba(229,231,235,0.85);
  background: rgba(245,247,250,0.65);
}
.admin-btn{
  border: 2px solid var(--border-light);
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 1000;
  cursor:pointer;
}
.admin-btn.primary{
  border-color: rgba(30,136,229,0.18);
  background: linear-gradient(135deg, rgba(30,136,229,0.92), rgba(0,188,212,0.72));
  color:#fff;
}
.admin-btn.danger{
  border-color: rgba(239,68,68,0.20);
  background: rgba(239,68,68,0.12);
  color: rgba(239,68,68,0.95);
}
.admin-btn:disabled{ opacity: .65; cursor: not-allowed; }
</style>
