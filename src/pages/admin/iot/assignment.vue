<template>
  <div class="assign-page">
    <!-- HERO -->
    <div class="assign-hero">
      <div class="assign-hero-left">
        <div class="assign-hero-icon">
          <i class="fas fa-link"></i>
        </div>

        <div class="assign-hero-text">
          <h2 class="assign-hero-title">Bus ⇄ Device Assignments</h2>
          <p class="assign-hero-sub">
            Connect buses to IoT devices. Tracking & passenger counter works only when assigned.
          </p>

          <div class="assign-hero-meta">
            <span class="assign-meta-pill soft">
              Total buses: <b>{{ buses.length }}</b>
            </span>

            <span class="assign-meta-pill soft">
              Assigned: <b>{{ assignedCount }}</b>
            </span>

            <span class="assign-meta-pill soft">
              Unassigned devices: <b>{{ unassignedDevices.length }}</b>
            </span>
          </div>

          <p v-if="error" class="assign-err">
            <i class="fas fa-triangle-exclamation"></i> {{ error }}
          </p>
        </div>
      </div>

      <button class="assign-btn primary" type="button" @click="openAssign">
        <i class="fas fa-plus"></i>
        New Assignment
      </button>
    </div>

    <!-- TOOLBAR -->
    <div class="assign-toolbar">
      <div class="assign-search">
        <i class="fas fa-search"></i>
        <input
          v-model="q"
          class="assign-search-input"
          placeholder="Search bus, plate, device code, ESP32..."
        />
        <button
          v-if="q"
          class="assign-search-clear"
          type="button"
          @click="q = ''"
          aria-label="Clear search"
        >
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <div class="assign-toolbar-right">
        <select v-model="flt" class="assign-select" aria-label="Filter">
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>

        <button class="assign-btn" type="button" @click="refresh" :disabled="loading">
          <i class="fas fa-rotate" :class="{ spin: loading }"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- TABLE CARD -->
    <div class="assign-card">
      <div class="assign-table-wrap">
        <table class="assign-table">
          <!-- ✅ stable column sizes -->
          <colgroup>
            <col class="col-bus" />
            <col class="col-device" />
            <col class="col-esp32" />
            <col class="col-actions" />
          </colgroup>

          <thead>
            <tr>
              <th>Bus</th>
              <th>Device</th>
              <th>ESP32 ID</th>
              <th class="assign-th-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="a in filteredAssignments" :key="a.bus_id">
              <!-- Bus -->
              <td>
                <div class="assign-cell-main clamp-1">{{ a.bus_code }}</div>
                <div class="assign-cell-sub clamp-1">
                  Plate: <b>{{ a.plate_no }}</b> • Cap: <b>{{ a.capacity }}</b>
                </div>
              </td>

              <!-- Device -->
              <td>
                <div class="assign-cell-main clamp-1">
                  {{ a.device_id ? a.device_code : "Not Assigned" }}
                </div>
                <div class="assign-cell-sub clamp-1">
                  {{ a.device_id ? "Assigned device" : "Assign a device to enable GPS + IR" }}
                </div>
              </td>

              <!-- ESP32 -->
              <td>
                <div class="assign-cell-main assign-mono clamp-1">
                  {{ a.device_id ? a.esp32_id : "—" }}
                </div>
                <div class="assign-cell-sub clamp-1">ESP32 / MAC</div>
              </td>

              <!-- Actions -->
              <td class="assign-td-actions">
                <div class="assign-actions">
                  <button class="assign-btn" type="button" @click="editAssign(a)">
                    <i class="fas fa-pen"></i> Edit
                  </button>

                  <button
                    class="assign-btn danger"
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

            <tr v-if="!loading && filteredAssignments.length === 0">
              <td colspan="4">
                <div class="assign-empty">
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
            <p class="assign-modal-sub">
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

                <small v-if="isEditing" class="assign-hint">
                  Device cannot be changed in edit mode. Unassign then re-assign if needed.
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
import { useDevices } from "@/composables/useDevices";

const { rows: assignmentRows, loading, error, fetchCurrentAssignments, assign, unassign } =
  useBusAssignments();

const { rows: deviceRows, fetchDevices } = useDevices();

/* ===== toolbar ===== */
const q = ref("");
const flt = ref("all");

const buses = computed(() => assignmentRows.value || []);

const unassignedDevices = computed(() => {
  const used = new Set(buses.value.map((b) => b.device_id).filter(Boolean));
  return (deviceRows.value || []).filter((d) => !used.has(d.id));
});

const assignedCount = computed(() => buses.value.filter((b) => !!b.device_id).length);

const filteredAssignments = computed(() => {
  const keyword = q.value.trim().toLowerCase();

  return buses.value.filter((a) => {
    const hay = [a.bus_code, a.plate_no, a.device_code || "", a.esp32_id || ""]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !keyword || hay.includes(keyword);

    const isAssigned = !!a.device_id;
    const matchesFilter =
      flt.value === "all" ||
      (flt.value === "assigned" && isAssigned) ||
      (flt.value === "unassigned" && !isAssigned);

    return matchesSearch && matchesFilter;
  });
});

/* ===== modal ===== */
const modalOpen = ref(false);
const isEditing = ref(false);
const editingBusId = ref(null);

const form = ref(resetForm());

function resetForm() {
  return { bus_id: "", device_id: "" };
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
  form.value = { bus_id: a.bus_id, device_id: a.device_id || "" };
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
}

async function saveAssign() {
  if (!form.value.bus_id) return alert("Please select a Bus.");

  // create
  if (!isEditing.value) {
    if (!form.value.device_id) return alert("Please select a Device.");
    try {
      await assign(form.value.bus_id, form.value.device_id, "");
      modalOpen.value = false;
    } catch (e) {}
    return;
  }

  // edit mode: move assignment only
  const oldBusId = editingBusId.value;
  const newBusId = form.value.bus_id;
  const deviceId = form.value.device_id;

  if (!deviceId) return alert("This bus has no device. Use New Assignment instead.");

  try {
    if (newBusId !== oldBusId) {
      await unassign(oldBusId, "Moved assignment");
      await assign(newBusId, deviceId, "");
    } else {
      alert("Edit currently supports moving assignment by changing bus.");
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

onMounted(refresh);
</script>
