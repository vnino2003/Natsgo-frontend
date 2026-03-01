
<!-- src/pages/admin/TerminalPage.vue -->
<template>
  <div class="term-page">
    <div class="term-shell">
      <!-- Header (sticky) -->
      <div class="term-head">
        <div class="term-head-left">
          <div class="term-breadcrumb">
            <i class="fas fa-gauge-high"></i>
            <span>Admin</span>
            <i class="fas fa-chevron-right term-bc-sep"></i>
            <span class="term-bc-current">Terminals</span>
          </div>

          <div class="term-head-title">
            <p class="term-title">Terminal Management</p>
            <p class="term-sub">You can manage up to <b>2 terminals</b> only.</p>
          </div>

          <div class="term-head-state">
            <p v-if="loading" class="term-hint">
              <i class="fas fa-circle-notch fa-spin"></i> Loading terminals…
            </p>
            <p v-else-if="error" class="term-hint term-hint-error">
              <i class="fas fa-triangle-exclamation"></i> {{ error }}
            </p>
            <p v-else class="term-hint">
              <i class="fas fa-arrows-rotate"></i> Auto refresh: every 8s
            </p>
          </div>
        </div>

        <div class="term-head-right">
          <button class="term-btn term-btn-ghost" type="button" @click="load" :disabled="loading">
            <i class="fas fa-rotate"></i>
            <span class="term-btn-text">{{ loading ? "Refreshing..." : "Refresh" }}</span>
          </button>

          <button v-if="!limitReached" class="term-btn term-btn-primary" type="button" @click="openNew">
            <i class="fas fa-plus"></i>
            <span class="term-btn-text">New Terminal</span>
          </button>

          <div v-else class="term-limit">
            <i class="fas fa-lock"></i>
            Max 2 terminals reached
          </div>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="term-content">
        <div class="term-cards">
          <div v-for="t in rows" :key="t.terminal_id" class="term-card">
            <div class="term-card-top">
              <div class="term-card-left">
                <div class="term-card-badge">
                  <i class="fas fa-map-location-dot"></i>
                </div>

                <div class="term-card-meta">
                  <div class="term-card-title">
                    <span class="term-strong">{{ t.terminal_name }}</span>
                    <span class="term-mini term-mono">ID {{ t.terminal_id }}</span>
                  </div>

                  <div class="term-card-sub">
                    <i class="fas fa-city"></i>
                    <span>{{ t.city || "—" }}</span>
                  </div>
                </div>
              </div>

              <div class="term-card-actions">
                <button class="term-icon-btn" type="button" @click="openEdit(t)" aria-label="Edit terminal">
                  <i class="fas fa-pen"></i>
                </button>
                <button class="term-icon-btn danger" type="button" @click="askDelete(t)" aria-label="Delete terminal">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div class="term-card-body">
              <!-- ✅ Leaflet mini map -->
              <div class="term-mini-map term-mini-map--leaflet">
                <div class="term-mini-map__canvas" :ref="setMapEl(t.terminal_id)"></div>

                <div class="term-mini-map-coord term-mono">
                  {{ fmtCoord(t.lat) }}, {{ fmtCoord(t.lng) }}
                </div>
              </div>

              <div class="term-card-grid">
                <div class="term-info">
                  <div class="term-info-label">
                    <i class="fas fa-clock"></i> Available
                  </div>
                  <div class="term-info-value">
                    <span class="term-pill term-pill-gray">
                      {{ fmtTime(t.available_from) }} – {{ fmtTime(t.available_to) }}
                    </span>
                    <div class="term-mini">Daily schedule</div>
                  </div>
                </div>

                <!-- ✅ KEEP bus_count variable name -->
                <div class="term-info">
                  <div class="term-info-label">
                    <i class="fas fa-bus"></i> Current buses
                  </div>
                  <div class="term-info-value">
                    <span class="term-pill term-pill-blue">
                      {{ Number(t.bus_count ?? 0) }}
                    </span>
                    <div class="term-mini" v-if="Number(t.bus_count ?? 0) === 0">
                      No buses currently in terminal
                    </div>
                    <div class="term-mini" v-else>
                      Currently inside terminal area
                    </div>
                  </div>
                </div>
              </div>

              <!-- footer row -->
              <div class="term-card-foot">
                <div class="term-foot-left">
                  <i class="fas fa-circle-info"></i>
                  Keep coordinates accurate.
                </div>

                <div class="term-foot-actions">
                  <button
                    class="term-link"
                    type="button"
                    @click="openInFullMap(t)"
                    :disabled="!isValidCoord(t)"
                    title="Open in Live Tracking map"
                  >
                    <i class="fas fa-map"></i>
                    Open in full map
                  </button>

                  <button class="term-link" type="button" @click="openEdit(t)">
                    Edit details <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="!loading && (rows?.length || 0) === 0" class="term-empty-card">
            <i class="fas fa-map-location-dot"></i>
            <p>No terminals yet</p>
            <small>Add up to 2 terminals to get started.</small>

            <div class="term-empty-actions">
              <button v-if="!limitReached" class="term-btn term-btn-primary" type="button" @click="openNew">
                <i class="fas fa-plus"></i>
                <span class="term-btn-text">New Terminal</span>
              </button>

              <button class="term-btn term-btn-ghost" type="button" @click="load" :disabled="loading">
                <i class="fas fa-rotate"></i>
                <span class="term-btn-text">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div class="term-footnote">
          <i class="fas fa-circle-info"></i>
          Tip: You can only have 2 terminals. To add a new one, delete an old terminal.
        </div>
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
                <input class="admin-input" v-model.trim="form.terminal_name" placeholder="e.g., Calapan Terminal" :disabled="saving" />
              </label>

              <label class="admin-field">
                <span>City *</span>
                <input class="admin-input" v-model.trim="form.city" placeholder="e.g., Calapan City" :disabled="saving" />
              </label>

              <label class="admin-field">
                <span>Latitude *</span>
                <input class="admin-input" v-model.number="form.lat" type="number" step="0.0000001" placeholder="13.4100123" :disabled="saving" />
                <div class="term-mini">Tip: Copy from Google Maps pin</div>
              </label>

              <label class="admin-field">
                <span>Longitude *</span>
                <input class="admin-input" v-model.number="form.lng" type="number" step="0.0000001" placeholder="121.1800456" :disabled="saving" />
              </label>

              <label class="admin-field">
                <span>Available From *</span>
                <input class="admin-input" v-model="form.available_from" type="time" :disabled="saving" />
              </label>

              <label class="admin-field">
                <span>Available To *</span>
                <input class="admin-input" v-model="form.available_to" type="time" :disabled="saving" />
              </label>

              <div class="admin-field hint">
                <span>Preview</span>
                <div class="term-preview">
                  <div class="term-preview-row">
                    <span class="term-pill term-pill-gray">
                      <i class="fas fa-clock"></i>
                      {{ form.available_from || "—" }} – {{ form.available_to || "—" }}
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
            <button class="admin-btn" type="button" @click="closeModal" :disabled="saving">Cancel</button>
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
            <p class="term-confirm">Delete <b>{{ deleteTarget.terminal_name }}</b>?</p>
            <p class="term-mini">Note: If buses are assigned, re-assign them first.</p>

            <p v-if="deleteError" class="admin-err">
              <i class="fas fa-triangle-exclamation"></i> {{ deleteError }}
            </p>
          </div>

          <div class="admin-modal-foot">
            <button class="admin-btn" type="button" @click="deleteTarget = null" :disabled="deleting">Cancel</button>
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
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useTerminals } from "../../composables/useTerminal";

/* ✅ Leaflet */
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const router = useRouter();
const { rows, loading, error, fetchTerminals, addTerminal, editTerminal, removeTerminal } = useTerminals();

let poll = null;

async function load() {
  await fetchTerminals({ q: "" });
  await nextTick();
  syncMiniMapsToRows();
}

onMounted(async () => {
  await load();
  poll = setInterval(load, 8000);
});

onBeforeUnmount(() => {
  if (poll) clearInterval(poll);
  destroyAllMiniMaps();
});

const limitReached = computed(() => (rows.value?.length || 0) >= 2);

function fmtCoord(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(6);
}
function fmtTime(v) {
  const s = String(v || "");
  if (!s) return "—";
  return s.slice(0, 5);
}

/* =========================================================
   ✅ Open in full map
   Change "/admin/live" if your tracking route is different
========================================================= */
function isValidCoord(t) {
  const lat = Number(t?.lat);
  const lng = Number(t?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
}

function openInFullMap(t) {
  if (!isValidCoord(t)) return;

  router.push({
    path: "/admin/live",
    query: {
      focus: "terminal",
      lat: String(Number(t.lat)),
      lng: String(Number(t.lng)),
      name: t.terminal_name || "Terminal",
      id: String(t.terminal_id),
    },
  });
}

/* =========================================================
   ✅ Leaflet mini maps per terminal
========================================================= */
const mapEls = new Map();  // terminalId -> DOM element
const maps = new Map();    // terminalId -> leaflet map
const markers = new Map(); // terminalId -> marker

const FALLBACK = { lat: 12.8797, lng: 121.774 };

function setMapEl(id) {
  return (el) => {
    if (el) mapEls.set(id, el);
    else mapEls.delete(id);
  };
}

function makePinIcon() {
  return L.divIcon({
    className: "term-leaflet-pin",
    html: `<div class="term-leaflet-pin__dot"><i class="fas fa-location-dot"></i></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 30],
  });
}

function initMiniMap(t) {
  const id = t.terminal_id;
  const el = mapEls.get(id);
  if (!el) return;
  if (maps.has(id)) return;

  const lat = Number(t.lat);
  const lng = Number(t.lng);
  const hasCoord = Number.isFinite(lat) && Number.isFinite(lng);
  const start = hasCoord ? [lat, lng] : [FALLBACK.lat, FALLBACK.lng];

  const m = L.map(el, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: true,
  }).setView(start, hasCoord ? 15 : 6);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 20 }).addTo(m);

  maps.set(id, m);

  if (hasCoord) {
    const mk = L.marker([lat, lng], { icon: makePinIcon(), interactive: false }).addTo(m);
    markers.set(id, mk);
  }

  requestAnimationFrame(() => m.invalidateSize());
  setTimeout(() => m.invalidateSize(), 250);
}

function updateMiniMap(t) {
  const id = t.terminal_id;
  const m = maps.get(id);
  if (!m) return;

  const lat = Number(t.lat);
  const lng = Number(t.lng);
  const hasCoord = Number.isFinite(lat) && Number.isFinite(lng);
  if (!hasCoord) return;

  m.setView([lat, lng], Math.max(m.getZoom(), 15), { animate: false });

  const mk = markers.get(id);
  if (mk) mk.setLatLng([lat, lng]);
  else markers.set(id, L.marker([lat, lng], { icon: makePinIcon(), interactive: false }).addTo(m));
}

function removeMiniMap(id) {
  const mk = markers.get(id);
  if (mk) markers.delete(id);

  const m = maps.get(id);
  if (m) {
    m.off();
    m.remove();
    maps.delete(id);
  }
}

function syncMiniMapsToRows() {
  const list = rows.value || [];
  const ids = new Set(list.map((t) => t.terminal_id));

  for (const id of maps.keys()) {
    if (!ids.has(id)) removeMiniMap(id);
  }

  for (const t of list) {
    initMiniMap(t);
    updateMiniMap(t);
  }
}

function destroyAllMiniMaps() {
  for (const id of maps.keys()) removeMiniMap(id);
  mapEls.clear();
}

watch(
  rows,
  async () => {
    await nextTick();
    syncMiniMapsToRows();
  },
  { deep: true }
);

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
  available_from: "05:00",
  available_to: "22:00",
});

function openNew() {
  if (limitReached.value) return;
  editing.value = false;
  modalError.value = "";
  Object.assign(form, {
    terminal_id: null,
    terminal_name: "",
    city: "",
    lat: null,
    lng: null,
    available_from: "05:00",
    available_to: "22:00",
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
    available_from: fmtTime(t.available_from),
    available_to: fmtTime(t.available_to),
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

  if (!form.available_from || !form.available_to) return "Available time is required.";
  if (form.available_from >= form.available_to) return "'Available From' must be earlier than 'Available To'.";

  if (!editing.value && limitReached.value) return "Max terminals reached (2). Delete one before adding.";
  return "";
}

async function save() {
  modalError.value = "";
  const msg = validate();
  if (msg) return (modalError.value = msg);

  saving.value = true;
  try {
    const payload = {
      terminal_name: form.terminal_name,
      city: form.city,
      lat: Number(form.lat),
      lng: Number(form.lng),
      available_from: form.available_from,
      available_to: form.available_to,
    };

    if (editing.value && form.terminal_id != null) await editTerminal(form.terminal_id, payload);
    else await addTerminal(payload);

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

<style scoped></style>


