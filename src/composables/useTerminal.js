  // src/composables/useTerminals.js
  import { ref } from "vue";
  import {
    getAdminTerminals,
    createTerminal,
    updateTerminal,
    deleteTerminal,
  } from "@/services/api/terminalService";

  export function useTerminals() {
    const rows = ref([]);
    const loading = ref(false);
    const error = ref("");

    async function fetchTerminals(params = {}) {
      loading.value = true;
      error.value = "";
      try {
        const res = await getAdminTerminals(params);
        rows.value = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        error.value = e?.response?.data?.message || e?.message || "Failed to load terminals.";
      } finally {
        loading.value = false;
      }
    }

    async function addTerminal(payload) {
      const res = await createTerminal(payload);
      return res.data;
    }

    async function editTerminal(id, payload) {
      const res = await updateTerminal(id, payload);
      return res.data;
    }

    async function removeTerminal(id) {
      const res = await deleteTerminal(id);
      return res.data;
    }

    return {
      rows,
      loading,
      error,
      fetchTerminals,
      addTerminal,
      editTerminal,
      removeTerminal,
    };
  }
