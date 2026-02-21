// src/composables/useBusAssignments.js
import { ref } from "vue";
import {
  getCurrentAssignments,
  getAssignmentHistory,
  assignDeviceToBus,
  unassignDeviceFromBus,
} from "../services/api/busAssignmentService";

export function useBusAssignments() {
  const rows = ref([]);        // current assignments (for assignment page)
  const history = ref([]);     // history results

  const loading = ref(false);
  const error = ref("");

  async function fetchCurrentAssignments() {
    loading.value = true;
    error.value = "";
    try {
      const res = await getCurrentAssignments();
      rows.value = res.data || [];
    } catch (e) {
      error.value =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to fetch current assignments";
    } finally {
      loading.value = false;
    }
  }

  async function fetchAssignmentHistory(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getAssignmentHistory(params);
      history.value = res.data || [];
      return history.value;
    } catch (e) {
      error.value =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to fetch assignment history";
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function assign(bus_id, device_id, note = "") {
    loading.value = true;
    error.value = "";
    try {
      const res = await assignDeviceToBus({ bus_id, device_id, note: note || undefined });
      // refresh current view
      await fetchCurrentAssignments();
      return res.data;
    } catch (e) {
      error.value =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to assign device";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function unassign(bus_id, note = "") {
    loading.value = true;
    error.value = "";
    try {
      const res = await unassignDeviceFromBus({ bus_id, note: note || undefined });
      await fetchCurrentAssignments();
      return res.data;
    } catch (e) {
      error.value =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to unassign device";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    rows,
    history,
    loading,
    error,
    fetchCurrentAssignments,
    fetchAssignmentHistory,
    assign,
    unassign,
  };
}
