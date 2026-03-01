// src/composables/useTerminalState.js
import { computed, ref } from "vue";
import {
  getAdminTerminalStateSummary,
  getAdminTerminalStateDevices,
  getAdminTerminalStateByDevices,
  recomputeAdminTerminalState,
} from "@/services/api/terminalStateService";

export function useTerminalState() {
  const terminals = ref([]); // from /summary -> terminals
  const devices = ref([]);   // from /devices -> array
  const stateMap = ref({});  // from /by-devices -> map

  const loading = ref(false);
  const error = ref("");

  async function fetchSummary(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getAdminTerminalStateSummary(params);
      terminals.value = Array.isArray(res.data?.terminals) ? res.data.terminals : [];
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to load terminal state summary.";
    } finally {
      loading.value = false;
    }
  }

  async function fetchDevices(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getAdminTerminalStateDevices(params);
      devices.value = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to load terminal state devices.";
    } finally {
      loading.value = false;
    }
  }

  async function fetchByDevices(deviceIds = []) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getAdminTerminalStateByDevices(deviceIds);
      stateMap.value = res.data?.states && typeof res.data.states === "object" ? res.data.states : {};
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to load terminal state by devices.";
    } finally {
      loading.value = false;
    }
  }

  async function recompute(payload = {}) {
    // not setting global loading here? but consistent with your pattern, we do:
    loading.value = true;
    error.value = "";
    try {
      const res = await recomputeAdminTerminalState(payload);
      return res.data;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to recompute terminal state.";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // helper computed: quick get by device id (even if devices array fetched)
  const deviceStateMapFromList = computed(() => {
    const map = {};
    for (const d of devices.value || []) map[d.device_id] = d;
    return map;
  });

  return {
    terminals,
    devices,
    stateMap,
    deviceStateMapFromList,

    loading,
    error,

    fetchSummary,
    fetchDevices,
    fetchByDevices,
    recompute,
  };
}