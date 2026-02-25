import api from "./http";

export function getAdminLiveBuses() {
  return api.get("/admin/track/buses/live");
}