// src/composables/useGps.js
import { ref, computed } from "vue";
import { postTelemetry } from "../services/api/gpsService";

export function useGps() {
  const sending = ref(false);
  const error = ref("");
  const lastResult = ref(null);

  const hasError = computed(() => !!error.value);

  async function sendTelemetry(payload) {
    sending.value = true;
    error.value = "";
    try {
      const res = await postTelemetry(payload);
      lastResult.value = res.data || null;
      return lastResult.value;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to send telemetry";
      lastResult.value = null;
      return null;
    } finally {
      sending.value = false;
    }
  }

  return {
    sending,
    error,
    hasError,
    lastResult,
    sendTelemetry
  };
}
