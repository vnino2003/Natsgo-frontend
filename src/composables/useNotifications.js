// src/composables/useNotifications.js
import { ref, computed } from "vue";
import {
  getNotifications,
  getNotificationSummary,
  getNotificationPreview,
  setNotificationRead,
  resolveNotification,
  deleteNotification as apiDeleteNotification,
  clearNotifications as apiClearNotifications,
} from "@/services/api/notificationService";

/** numeric enums from DB */
const SEVERITY = { INFO: 1, WARNING: 2, CRITICAL: 3 };

function toInt(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function useNotifications() {
  const rows = ref([]);
  const total = ref(0);
  const limit = ref(50);
  const offset = ref(0);

  const summary = ref({
    total: 0,
    active: 0,
    unread: 0,
    critical: 0,
    critical_active: 0,
  });

  // ✅ ADD THESE (you were returning them but never defined)
  const preview = ref([]);
  const loadingPreview = ref(false);

  const loading = ref(false);
  const loadingSummary = ref(false);
  const error = ref("");

  const hasError = computed(() => !!error.value);

  async function fetchNotifications(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getNotifications({
        limit: limit.value,
        offset: offset.value,
        ...params,
      });

      const payload = res.data || {};
      rows.value = Array.isArray(payload.data) ? payload.data : [];
      total.value = toInt(payload.total, 0);
      limit.value = toInt(payload.limit, limit.value);
      offset.value = toInt(payload.offset, offset.value);

      return rows.value;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to fetch notifications";
      rows.value = [];
      total.value = 0;
      return [];
    } finally {
      loading.value = false;
    }
  }

  // ✅ FIXED: now uses the service correctly + refs exist
  async function fetchPreview(take = 5) {
    loadingPreview.value = true;
    try {
      const res = await getNotificationPreview(take);
      const payload = res.data || {};
      preview.value = Array.isArray(payload.data) ? payload.data : [];
      return preview.value;
    } catch {
      preview.value = [];
      return [];
    } finally {
      loadingPreview.value = false;
    }
  }

  async function fetchSummary() {
    loadingSummary.value = true;
    error.value = "";
    try {
      const res = await getNotificationSummary();
      summary.value = res.data?.summary || summary.value;
      return summary.value;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to fetch summary";
      return summary.value;
    } finally {
      loadingSummary.value = false;
    }
  }

  async function refreshAll(params = {}) {
    await Promise.all([fetchSummary(), fetchNotifications(params)]);
  }

  function setPage(nextOffset) {
    offset.value = Math.max(Number(nextOffset || 0), 0);
  }

  async function markRead(id) {
    const idx = rows.value.findIndex((x) => x.id === id);
    const prev = idx >= 0 ? rows.value[idx].unread : null;
    if (idx >= 0) rows.value[idx].unread = false;

    try {
      await setNotificationRead(id, 0);
      if (summary.value.unread > 0) summary.value.unread -= 1;
      return true;
    } catch (e) {
      if (idx >= 0 && prev !== null) rows.value[idx].unread = prev;
      error.value = e?.response?.data?.message || e?.message || "Failed to mark read";
      return false;
    }
  }

  async function markUnread(id) {
    const idx = rows.value.findIndex((x) => x.id === id);
    const prev = idx >= 0 ? rows.value[idx].unread : null;
    if (idx >= 0) rows.value[idx].unread = true;

    try {
      await setNotificationRead(id, 1);
      summary.value.unread += 1;
      return true;
    } catch (e) {
      if (idx >= 0 && prev !== null) rows.value[idx].unread = prev;
      error.value = e?.response?.data?.message || e?.message || "Failed to mark unread";
      return false;
    }
  }

  async function resolve(id) {
    const idx = rows.value.findIndex((x) => x.id === id);
    const prevActive = idx >= 0 ? rows.value[idx].active : null;
    if (idx >= 0) rows.value[idx].active = false;

    try {
      await resolveNotification(id);
      if (summary.value.active > 0) summary.value.active -= 1;
      return true;
    } catch (e) {
      if (idx >= 0 && prevActive !== null) rows.value[idx].active = prevActive;
      error.value = e?.response?.data?.message || e?.message || "Failed to resolve notification";
      return false;
    }
  }

  async function remove(id) {
    const idx = rows.value.findIndex((x) => x.id === id);
    if (idx < 0) return false;

    const removed = rows.value[idx];
    rows.value.splice(idx, 1);
    total.value = Math.max(total.value - 1, 0);

    if (removed.active && summary.value.active > 0) summary.value.active -= 1;
    if (removed.unread && summary.value.unread > 0) summary.value.unread -= 1;
    if (removed.severity === 3 && summary.value.critical > 0) summary.value.critical -= 1;
    if (removed.active && removed.severity === 3 && summary.value.critical_active > 0) {
      summary.value.critical_active -= 1;
    }

    try {
      await apiDeleteNotification(id);
      return true;
    } catch (e) {
      rows.value.splice(idx, 0, removed);
      total.value += 1;
      await fetchSummary();
      error.value = e?.response?.data?.message || e?.message || "Failed to delete notification";
      return false;
    }
  }

  async function clear(params = { mode: "resolved" }) {
    try {
      await apiClearNotifications(params);
      setPage(0);
      await refreshAll({});
      return true;
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to clear notifications";
      return false;
    }
  }

  function severityLabel(n) {
    if (n === SEVERITY.CRITICAL) return "Critical";
    if (n === SEVERITY.WARNING) return "Warning";
    return "Info";
  }

  function severityClass(n) {
    if (n === SEVERITY.CRITICAL) return "critical";
    if (n === SEVERITY.WARNING) return "warning";
    return "info";
  }

  function categoryLabel(n) {
    if (n === 1) return "IoT";
    if (n === 2) return "Bus";
    if (n === 3) return "Auth";
    if (n === 4) return "System";
    if (n === 5) return "Admin";
    return `Cat ${n}`;
  }

  return {
    rows,
    total,
    limit,
    offset,
    summary,

    // ✅ preview support
    preview,
    loadingPreview,
    fetchPreview,

    loading,
    loadingSummary,
    error,
    hasError,

    fetchNotifications,
    fetchSummary,
    refreshAll,
    setPage,
    markRead,
    markUnread,
    resolve,

    remove,
    clear,

    severityLabel,
    severityClass,
    categoryLabel,
  };
}