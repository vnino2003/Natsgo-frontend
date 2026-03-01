// src/composables/useRoutes.js
import { ref } from "vue";
import {
  getAdminRoutes,
  getAdminRouteById,
  createAdminRoute,
  updateAdminRoute,
  deleteAdminRoute,
  getPublicRoute,
} from "@/services/api/routeService";

export function useRoutes() {
  const rows = ref([]);
  const loading = ref(false);
  const error = ref("");

  async function fetchRoutes(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const res = await getAdminRoutes(params);
      rows.value = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      error.value = e?.response?.data?.message || e?.message || "Failed to load routes.";
    } finally {
      loading.value = false;
    }
  }

  async function fetchRouteById(id) {
    const res = await getAdminRouteById(id);
    return res.data;
  }

  async function addRoute(payload) {
    const res = await createAdminRoute(payload);
    return res.data;
  }

  async function editRoute(id, payload) {
    const res = await updateAdminRoute(id, payload);
    return res.data;
  }

  async function removeRoute(id) {
    const res = await deleteAdminRoute(id);
    return res.data;
  }

  // commuter/public
  async function fetchPublicRoute() {
    const res = await getPublicRoute();
    return res.data; // route object or null
  }

  return {
    rows,
    loading,
    error,
    fetchRoutes,
    fetchRouteById,
    addRoute,
    editRoute,
    removeRoute,
    fetchPublicRoute,
  };
}