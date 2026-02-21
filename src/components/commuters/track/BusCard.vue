<template>
  <div class="tb-bus-card" :class="{ show: !!bus }">
    <div class="tb-bus-card-top">
      <div class="tb-bus-route">{{ bus?.route ?? '' }}</div>
      <button class="tb-bus-close" @click="$emit('close')" aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="tb-bus-meta">
      {{ bus ? `${formatKm(distanceKm(bus))} away • Bus/Track #${bus.trackNo}` : '' }}
    </div>
    <div class="tb-bus-sub">
      {{ bus ? `ID: ${bus.id}` : '' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
// import { useDistance } from '../composables/useDistance'
import { ref } from 'vue'

const currentPos = ref({ lat: 14.5995, lng: 120.9842 })
const { distanceKm, formatKm } = useDistance(currentPos)

const props = defineProps({
  bus: Object,
})

defineEmits(['close'])
</script>

<style scoped>
.tb-bus-card {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light, #e5e7eb);
  border-radius: 14px;
  padding: 14px 14px 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14);
  z-index: 20;
  transform: translateY(-10px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.tb-bus-card.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.tb-bus-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.tb-bus-route {
  font-weight: 800;
  color: var(--text-dark, #1f2937);
  font-size: 15px;
}

.tb-bus-close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-gray, #6b7280);
  cursor: pointer;
  transition: transform 0.15s;
}

.tb-bus-close:active {
  transform: scale(0.92);
}

.tb-bus-meta {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-blue, #1e88e5);
  margin-bottom: 4px;
}

.tb-bus-sub {
  font-size: 13px;
  color: var(--text-gray, #6b7280);
}
</style>
