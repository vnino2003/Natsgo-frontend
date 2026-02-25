<template>
  <div class="section">
    <div class="section-head">
      <h3 class="section-title">Nearby Buses</h3>

      <small v-if="locationEnabled" class="section-subtitle">
        Updated {{ lastUpdatedText }}
      </small>
    </div>

    <!-- Before location enabled -->
    <div v-if="!locationEnabled" class="bus-stop-card">
      <p class="bus-stop-info">Turn on location to see nearby buses</p>
      <button class="btn-location" @click="enableLocation" type="button">
        <i class="fas fa-location-dot"></i>
        Turn on Location Services
      </button>
    </div>

    <!-- After location enabled -->
    <div v-else class="nearby-bus-list">
      <div v-if="nearestBuses.length === 0" class="bus-stop-card">
        <p class="bus-stop-info">No nearby buses yet.</p>
        <button class="btn-location btn-refresh" @click="refresh" type="button">
          <i class="fas fa-rotate"></i>
          Refresh
        </button>
      </div>

      <div v-else>
        <div v-for="bus in nearestBuses" :key="bus.id" class="nearby-bus-item">
          <div class="bus-left">
            <div class="bus-badge">
              <i class="fas fa-bus"></i>
            </div>

            <div class="bus-meta">
              <p class="bus-route">
                {{ bus.route }}
                <span class="bus-distance">• {{ bus.kmText }} away</span>
              </p>
              <p class="bus-desc">
                Track #{{ bus.trackNo }} • {{ bus.plate_no || "—" }}
              </p>
            </div>
          </div>

          <div class="bus-right">
            <span class="pill" :class="pillClass(bus)">
              {{ pillText(bus) }}
            </span>
            <div class="seat-text">
              Seats: <b>{{ bus.seats }}</b> / {{ bus.capacity }}
            </div>
          </div>
        </div>

        <button class="btn-location btn-refresh" @click="refresh" type="button" :disabled="loading">
          <i class="fas fa-rotate" :class="{ 'fa-spin': loading }"></i>
          {{ loading ? "Refreshing..." : "Refresh" }}
        </button>

        <p v-if="error" class="nearby-error">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useNearbyBusAlerts } from "@/composables/useNearbyBusAlerts";

const lastUpdatedAt = ref(Date.now());

const {
  hasLocation,
  enableLocation,
  nearestBuses,
  fetchOnce,
  loading,
  error,
} = useNearbyBusAlerts({
  intervalMs: 1500,
  maxNearest: 4,
  nearKm: 1.0, // notif threshold also uses this
});

const locationEnabled = computed(() => hasLocation.value);

const lastUpdatedText = computed(() => {
  const s = Math.floor((Date.now() - lastUpdatedAt.value) / 1000);
  if (s < 10) return "just now";
  const m = Math.floor(s / 60);
  if (m < 1) return `${s}s ago`;
  return `${m} min${m > 1 ? "s" : ""} ago`;
});

async function refresh() {
  await fetchOnce();
  lastUpdatedAt.value = Date.now();
}

function pillClass(bus) {
  const cap = Number(bus.capacity || 0);
  const used = Number(bus.seats || 0);
  const avail = Math.max(0, cap - used);

  if (cap <= 0) return "pill-gray";
  if (avail <= 0) return "pill-red";
  if (avail <= 3) return "pill-yellow";
  return "pill-green";
}
function pillText(bus) {
  const cap = Number(bus.capacity || 0);
  const used = Number(bus.seats || 0);
  const avail = Math.max(0, cap - used);

  if (cap <= 0) return "—";
  if (avail <= 0) return "FULL";
  if (avail <= 3) return "LOW";
  return "AVAILABLE";
}
</script>

<style scoped>
/* you already have styles in your global css;
   add only small extras if needed */
.nearby-error{
  margin-top: 10px;
  font-size: 12px;
  font-weight: 800;
  color: #b91c1c;
}
.pill-gray{
  background: rgba(17,24,39,0.06);
  border: 1px solid var(--border-light);
  color: var(--text-gray);
}
</style>