// src/services/api/notificationService.js
import api from "./http";

export function getNotifications(params = {}) {
  return api.get("/admin/notifications", { params });
}

export function getNotificationSummary() {
  return api.get("/admin/notifications/summary");
}
export function getNotificationPreview(limit = 5) {
  return api.get(`/admin/notifications/preview?limit=${limit}`);
}
export function setNotificationRead(id, unread = 0) {
  return api.patch(`/admin/notifications/${id}/read`, { unread });
}

export function resolveNotification(id) {
  return api.patch(`/admin/notifications/${id}/resolve`);
}

// ✅ delete single
export function deleteNotification(id) {
  return api.delete(`/admin/notifications/${id}`);
}

// ✅ clear bulk
// mode: all|resolved|read|resolved_read
export function clearNotifications(params = { mode: "resolved" }) {
  return api.delete(`/admin/notifications`, { params });
}