<template>
  <div class="app-shell">
    <div class="app-container">
      <router-view />
    </div>

    <BottomNav />

    <!-- ✅ Global Location Gate Overlay -->
    <transition name="fade">
      <div v-if="showGate" class="loc-overlay">
        <div class="loc-card">
          <div class="loc-icon">
            <i class="fas fa-location-dot"></i>
          </div>

          <h3 class="loc-title">{{ gateTitle }}</h3>
          <p class="loc-text">{{ gateText }}</p>

          <div class="loc-status" :class="statusClass">
            <span v-if="status === 'idle'">
              <i class="fas fa-circle-info"></i> Tap to enable location
            </span>
            <span v-else-if="status === 'requesting'">
              <i class="fas fa-spinner fa-spin"></i> Requesting permission…
            </span>
            <span v-else-if="status === 'connecting'">
              <i class="fas fa-signal"></i> Waiting for GPS fix…
            </span>
            <span v-else-if="status === 'connected'">
              <i class="fas fa-check"></i> Location Connected
            </span>
            <span v-else-if="status === 'denied'">
              <i class="fas fa-triangle-exclamation"></i> Location Blocked
            </span>
            <span v-else>
              <i class="fas fa-triangle-exclamation"></i> Location unavailable
            </span>
          </div>

          <button class="loc-btn primary" type="button" @click="enableLocation"
            :disabled="status === 'requesting' || status === 'connecting'">
            <i class="fas fa-check"></i>
            Turn On Location
          </button>

          <button class="loc-btn ghost" type="button" @click="skipLocation">
            Use Without Location
          </button>

          <div v-if="status === 'denied'" class="loc-help">
            <div class="loc-help-title">
              <i class="fas fa-gear"></i> How to allow
            </div>
            <ul>
              <li>Chrome: click 🔒 → Site settings → Location → Allow</li>
              <li>Turn ON Location in device settings</li>
              <li>Refresh page, then tap “Turn On Location”</li>
              <li>Needs HTTPS (or localhost)</li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import "../assets/css/styles.css";
import BottomNav from "../components/commuters/layout/BottomNav.vue";
import { computed, onMounted, ref } from "vue";
import { useUserLocation } from "@/composables/useUserLocation";

// ✅ global location singleton
const { status, hasLocation, startLocation, getPermissionState } = useUserLocation();

const dismissed = ref(false);

const showGate = computed(() => {
  if (dismissed.value) return false;
  // show gate until connected (or user skips)
  return status.value !== "connected";
});

const gateTitle = computed(() => {
  if (status.value === "requesting") return "Requesting Permission…";
  if (status.value === "connecting") return "Connecting…";
  if (status.value === "denied") return "Enable Location";
  if (status.value === "error") return "Enable Location";
  if (status.value === "connected") return "Location Connected";
  return "Turn On Location";
});

const gateText = computed(() => {
  if (status.value === "connected") return "Near-bus alerts are enabled.";
  if (status.value === "denied")
    return "Location is blocked. Allow it to get near-bus notifications.";
  if (status.value === "error")
    return "Location is needed for near-bus notifications. You can still use the app without it.";
  return "Turn on location to enable near-bus notifications and nearby features.";
});

const statusClass = computed(() => {
  if (status.value === "connected") return "ok";
  if (status.value === "denied" || status.value === "error") return "bad";
  if (status.value === "requesting" || status.value === "connecting") return "warn";
  return "";
});

function enableLocation() {
  startLocation({ highAccuracy: true });
}

function skipLocation() {
  dismissed.value = true;
}

// ✅ auto-start if permission already granted (no need to show gate)
onMounted(async () => {
  const perm = await getPermissionState();
  if (perm === "granted") {
    startLocation({ highAccuracy: true });
    dismissed.value = true; // optional: hide gate immediately
  }
});
</script>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
}

/* Overlay */
.loc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(245, 247, 250, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.loc-card {
  width: min(420px, 100%);
  background: #fff;
  border: 2px solid rgba(209, 213, 219, 0.7);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.loc-icon {
  width: 58px;
  height: 58px;
  border-radius: 999px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-teal) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.loc-title {
  margin: 0 0 6px 0;
  font-weight: 900;
  font-size: 18px;
}

.loc-text {
  margin: 0 0 12px 0;
  font-weight: 700;
  font-size: 14px;
  color: rgba(38, 43, 51, 0.65);
  line-height: 1.4;
}

/* status pill */
.loc-status {
  margin: 10px 0 12px;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 900;
  font-size: 12px;
  border: 2px solid rgba(209, 213, 219, 0.7);
  background: rgba(17, 24, 39, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.loc-status.warn {
  color: #b45309;
  border-color: rgba(180, 83, 9, 0.25);
  background: rgba(180, 83, 9, 0.08);
}
.loc-status.ok {
  color: #166534;
  border-color: rgba(22, 101, 52, 0.25);
  background: rgba(22, 101, 52, 0.08);
}
.loc-status.bad {
  color: #b91c1c;
  border-color: rgba(185, 28, 28, 0.25);
  background: rgba(185, 28, 28, 0.08);
}

.loc-btn {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}
.loc-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.loc-btn.primary {
  background: linear-gradient(135deg, var(--primary-blue) 0%, #0d47a1 100%);
  color: #fff;
}
.loc-btn.ghost {
  background: transparent;
  border: 2px solid rgba(209, 213, 219, 0.7);
  color: rgba(38, 43, 51, 0.9);
}

.loc-help {
  margin-top: 12px;
  text-align: left;
  border: 2px dashed rgba(209, 213, 219, 0.7);
  border-radius: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
}
.loc-help-title {
  font-weight: 900;
  font-size: 13px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.loc-help ul {
  margin: 0;
  padding-left: 18px;
  font-weight: 800;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(38, 43, 51, 0.65);
}

/* transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>