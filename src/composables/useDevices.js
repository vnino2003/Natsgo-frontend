// src/composables/useDevices.js
import { ref, computed } from "vue";
import { getDevices, getDeviceById } from "../services/api/deviceService";

export function useDevices() {
  const rows = ref([]);
  const loading = ref(false);
  const error = ref("");
  const selected = ref(null);

  const hasError = computed(() => !!error.value);

  async function fetchDevices(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getDevices(params);
      rows.value = Array.isArray(res.data) ? res.data : [];
      return rows.value;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to fetch devices";
      rows.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchDevice(id) {
    if (!id) return null;
    loading.value = true;
    error.value = "";
    try {
      const res = await getDeviceById(id);
      selected.value = res.data || null;
      return selected.value;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to fetch device";
      selected.value = null;
      return null;
    } finally {
      loading.value = false;
    }
  }

  function clearSelected() {
    selected.value = null;
  }

  return {
    // state
    rows,
    selected,
    loading,
    error,
    hasError,

    // actions
    fetchDevices,
    fetchDevice,
    clearSelected
  };
}
