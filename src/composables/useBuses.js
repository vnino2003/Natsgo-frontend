// src/composables/useBuses.js
import { ref } from "vue";
import {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} from "../services/api/busService";

export function useBuses() {
  const rows = ref([]);
  const one = ref(null);

  const loading = ref(false);
  const error = ref("");

  async function fetchBuses(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getBuses(params);
      rows.value = res.data || [];
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to fetch buses";
    } finally {
      loading.value = false;
    }
  }

  async function fetchBus(id) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getBusById(id);
      one.value = res.data;
      return one.value;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to fetch bus";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function addBus(payload) {
    loading.value = true;
    error.value = "";
    try {
      const res = await createBus(payload);
      // optional: refresh list
      return res.data;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to create bus";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function editBus(id, payload) {
    loading.value = true;
    error.value = "";
    try {
      const res = await updateBus(id, payload);
      return res.data;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to update bus";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeBus(id) {
    loading.value = true;
    error.value = "";
    try {
      const res = await deleteBus(id);
      return res.data;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to delete bus";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    rows,
    one,
    loading,
    error,
    fetchBuses,
    fetchBus,
    addBus,
    editBus,
    removeBus,
  };
}
