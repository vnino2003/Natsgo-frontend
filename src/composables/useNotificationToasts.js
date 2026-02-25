// src/composables/useNotificationToasts.js
import { ref } from "vue";
import { getNotificationPreview } from "@/services/api/notificationService";

/**
 * Simple "new notification" detector via polling.
 * - keeps last seen notification id
 * - when new id appears, show toast(s)
 */
export function useNotificationToasts({ pollMs = 3000, maxToasts = 3 } = {}) {
  const toasts = ref([]); // [{ id, title, message, severity, created_at, unread, _timer }]
  const lastSeenId = ref(null);
  const running = ref(false);
  let timer = null;

  function pushToast(n, { autoCloseMs = 5000 } = {}) {
    // prevent duplicates
    if (toasts.value.some((t) => t.id === n.id)) return;

    const toast = {
      id: n.id,
      title: n.title || "Notification",
      message: n.message || "",
      severity: n.severity,
      unread: !!n.unread,
      created_at: n.created_at,
      _timer: null,
    };

    // keep only newest maxToasts
    toasts.value.unshift(toast);
    if (toasts.value.length > maxToasts) {
      const removed = toasts.value.pop();
      if (removed?._timer) clearTimeout(removed._timer);
    }

    // auto-close
    toast._timer = setTimeout(() => {
      removeToast(toast.id);
    }, autoCloseMs);
  }

  function removeToast(id) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx >= 0) {
      const t = toasts.value[idx];
      if (t?._timer) clearTimeout(t._timer);
      toasts.value.splice(idx, 1);
    }
  }

  async function checkNow() {
    try {
      // ask latest 5
      const res = await getNotificationPreview(5);
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      if (!list.length) return;

      // newest first (assume API returns newest first)
      const newest = list[0];
      if (!newest?.id) return;

      // first run: set baseline ONLY (no toast spam)
      if (lastSeenId.value == null) {
        lastSeenId.value = newest.id;
        return;
      }

      // if newest changed => find which are new (until lastSeenId)
      if (newest.id !== lastSeenId.value) {
        const fresh = [];
        for (const n of list) {
          if (n.id === lastSeenId.value) break;
          fresh.push(n);
        }

        // show from oldest -> newest so order feels natural
        fresh.reverse().forEach((n) => pushToast(n, { autoCloseMs: 5000 }));

        // update baseline to newest
        lastSeenId.value = newest.id;
      }
    } catch {
      // ignore polling errors
    }
  }

  function start() {
    if (running.value) return;
    running.value = true;

    // baseline fetch
    checkNow();

    timer = setInterval(checkNow, pollMs);
  }

  function stop() {
    running.value = false;
    if (timer) clearInterval(timer);
    timer = null;
  }

  return {
    toasts,
    start,
    stop,
    checkNow,
    removeToast,
  };
}