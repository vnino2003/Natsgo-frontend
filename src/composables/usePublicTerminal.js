// src/composables/usePublicTerminals.js
import { ref, onUnmounted } from "vue";
import { getPublicTerminals } from "@/services/api/terminalService";

export function usePublicTerminals({ intervalMs = 5000 } = {}) {
  const terminals = ref([]);
  const loading = ref(false);
  const error = ref("");

  let timer = null;

  async function fetchOnce() {
    loading.value = true;
    error.value = "";
    try {
      const res = await getPublicTerminals();
      terminals.value = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to load terminals";
    } finally {
      loading.value = false;
    }
  }

  function start() {
    stop();
    fetchOnce();
    timer = setInterval(fetchOnce, intervalMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  onUnmounted(stop);

  return { terminals, loading, error, fetchOnce, start, stop };
}
