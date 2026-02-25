// src/composables/useUserLocation.js
import { ref } from "vue";

// ✅ singleton state (shared across pages)
const hasLocation = ref(false);
const status = ref("idle"); // idle | requesting | connecting | connected | error | denied
const coords = ref(null); // {lat,lng} | null

let watchId = null;

function stopLocation() {
  if (watchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
  watchId = null;
  hasLocation.value = false;
  coords.value = null;
  if (status.value !== "denied") status.value = "idle";
}

function startLocation({ highAccuracy = true } = {}) {
  if (!navigator.geolocation) {
    status.value = "error";
    hasLocation.value = false;
    coords.value = null;
    return;
  }

  status.value = "requesting";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      status.value = "connecting";
      hasLocation.value = true;
      coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      if (watchId == null) {
        watchId = navigator.geolocation.watchPosition(
          (p) => {
            hasLocation.value = true;
            coords.value = { lat: p.coords.latitude, lng: p.coords.longitude };
            status.value = "connected";
          },
          (err) => {
            if (err?.code === 1) status.value = "denied";
            else status.value = "error";
            stopLocation();
          },
          { enableHighAccuracy: highAccuracy, maximumAge: 3000, timeout: 15000 }
        );
      } else {
        status.value = "connected";
      }
    },
    (err) => {
      if (err?.code === 1) status.value = "denied";
      else status.value = "error";
      hasLocation.value = false;
      coords.value = null;
    },
    { enableHighAccuracy: highAccuracy, timeout: 15000 }
  );
}

async function getPermissionState() {
  try {
    if (!navigator.permissions) return null;
    const p = await navigator.permissions.query({ name: "geolocation" });
    return p.state; // granted | prompt | denied
  } catch {
    return null;
  }
}

export function useUserLocation() {
  return {
    coords,
    hasLocation,
    status,
    startLocation,
    stopLocation,
    getPermissionState,
  };
}