<!-- src/pages/admin/TerminalPage.vue -->
<template>
  <div class="term-page">
    <div class="term-shell">
      <!-- Header -->
      <div class="term-head">
        <div class="term-head-left">
          <div class="term-head-title">
            <p class="term-title">Terminal List</p>
            <p class="term-sub">Manage terminals, coordinates, status, and assigned buses.</p>
          </div>

          <div class="term-head-state">
            <p v-if="loading" class="term-hint">
              <i class="fas fa-circle-notch fa-spin"></i> Loading terminals…
            </p>
            <p v-else-if="error" class="term-hint term-hint-error">
              <i class="fas fa-triangle-exclamation"></i> {{ error }}
            </p>
            <p v-else class="term-hint">
              <i class="fas fa-clock"></i> Auto refresh: every 8s
            </p>
          </div>
        </div>

        <div class="term-head-right">
          <button class="term-btn term-btn-ghost" type="button" @click="load" :disabled="loading">
            <i class="fas fa-rotate"></i>
            <span>{{ loading ? "Refreshing..." : "Refresh" }}</span>
          </button>

          <button class="term-btn term-btn-primary" type="button" @click="openNew">
            <i class="fas fa-plus"></i>
            <span>New Terminal</span>
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="term-toolbar">
        <div class="term-search">
          <i class="fas fa-search"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Search terminal name, city, ID…"
            @keyup.enter="load"
          />
          <button
            v-if="search"
            class="term-x"
            type="button"
            @click="search = ''"
            aria-label="Clear search"
          >
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <div class="term-tools">
          <div class="term-kpis">
            <div class="term-kpi">
              <span class="term-kpi-label">Total</span>
              <span class="term-kpi-val">{{ counts.total }}</span>
            </div>
            <div class="term-kpi">
              <span class="term-kpi-label">Active</span>
              <span class="term-kpi-val">{{ counts.active }}</span>
            </div>
            <div class="term-kpi">
              <span class="term-kpi-label">Inactive</span>
              <span class="term-kpi-val">{{ counts.inactive }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="term-table-wrap">
        <table class="term-table">
          <thead>
            <tr>
              <th>Terminal</th>
              <th>City</th>
              <th>Coordinates</th>
              <th>Buses</th>
              <th>Status</th>
              <th class="term-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="t in filteredRows" :key="t.terminal_id">
              <!-- Terminal -->
              <td>
                <div class="term-maincell">
                  <div class="term-badge">
                    <i class="fas fa-map-location-dot"></i>
                  </div>
                  <div class="term-meta">
                    <span class="term-strong">{{ t.terminal_name }}</span>
                    <div class="term-mini term-mono">ID {{ t.terminal_id }}</div>
                  </div>
                </div>
              </td>

              <!-- City -->
              <td class="term-strong">{{ t.city || "—" }}</td>

              <!-- Coordinates -->
              <td class="term-mono">
                <div class="term-coord">
                  <span class="term-coord-dot"></span>
                  {{ fmtCoord(t.lat) }}, {{ fmtCoord(t.lng) }}
                </div>
              </td>

              <!-- Buses -->
              <td>
                <span class="term-pill term-pill-blue">
                  <i class="fas fa-bus"></i>
                  {{ Number(t.bus_count ?? 0) }}
                </span>
                <div class="term-mini" v-if="Number(t.bus_count ?? 0) === 0">
                  No assigned buses
                </div>
              </td>

              <!-- Status -->
              <td>
                <span class="term-pill" :class="activePill(t.is_active).cls">
                  <i class="fas" :class="activePill(t.is_active).ico"></i>
                  {{ activePill(t.is_active).text }}
                </span>
              </td>

              <!-- Actions -->
              <td class="term-right">
                <button class="term-btn term-btn-ghost" type="button" @click="openEdit(t)">
                  <i class="fas fa-pen"></i>
                  <span>Edit</span>
                </button>
                <button class="term-btn term-btn-ghost term-btn-danger" type="button" @click="askDelete(t)">
                  <i class="fas fa-trash"></i>
                  <span>Delete</span>
                </button>
              </td>
            </tr>

            <tr v-if="!loading && filteredRows.length === 0">
              <td colspan="6">
                <div class="term-empty">
                  <i class="fas fa-map-location-dot"></i>
                  <p>No terminals found</p>
                  <small>Try adjusting search, or add a terminal to get started.</small>

                  <div class="term-empty-actions">
                    <button class="term-btn term-btn-ghost" type="button" @click="search = ''">
                      <i class="fas fa-xmark"></i> Clear search
                    </button>
                    <button class="term-btn term-btn-primary" type="button" @click="openNew">
                      <i class="fas fa-plus"></i> New Terminal
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footnote -->
      <div class="term-footnote">
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
                <div class="term-mini">Tip: Copy from Google Maps pin</div>
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
                <div class="term-preview">
                  <div class="term-preview-row">
                    <span class="term-pill" :class="activePill(form.is_active).cls">
                      <i class="fas" :class="activePill(form.is_active).ico"></i>
                      {{ activePill(form.is_active).text }}
                    </span>
                  </div>
                  <div class="term-preview-row term-mono">
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
            <p class="term-confirm">
              Delete <b>{{ deleteTarget.terminal_name }}</b>?
            </p>
            <p class="term-mini">
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

const counts = computed(() => {
  const list = rows.value || [];
  const isOn = (v) => Number(v) === 1;
  return {
    total: list.length,
    active: list.filter((t) => isOn(t.is_active)).length,
    inactive: list.filter((t) => !isOn(t.is_active)).length,
  };
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
  if (on) return { text: "Active", cls: "term-pill-green", ico: "fa-circle-check" };
  return { text: "Inactive", cls: "term-pill-red", ico: "fa-circle-xmark" };
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

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return "Latitude must be valid (-90 to 90).";
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return "Longitude must be valid (-180 to 180).";

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