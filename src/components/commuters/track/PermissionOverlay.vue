<template>
  <div class="tb-permission-overlay">
    <div class="tb-permission-card">
      <div class="tb-permission-icon">
        <i class="fas fa-location-dot"></i>
      </div>
      <h2 class="tb-permission-title">Enable Location Services</h2>
      <p class="tb-permission-text">
        We need your location to show nearby buses and track your position on the map.
      </p>

      <button class="tb-btn tb-btn-primary" @click="$emit('allow')">
        <i class="fas fa-check"></i>
        Allow Location Access
      </button>

      <button class="tb-btn tb-btn-ghost" @click="$emit('skip')">
        Use Without Location
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['allow', 'skip'])
</script>

<style scoped>
.tb-permission-overlay {
  position: absolute;
  inset: 0;
  background: rgba(245, 247, 250, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.tb-permission-card {
  width: min(420px, 100%);
  background: white;
  border: 2px solid var(--border-light, #e5e7eb);
  border-radius: 18px;
  padding: 20px 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.tb-permission-icon {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, var(--primary-blue, #1e88e5) 0%, var(--accent-teal, #00bcd4) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 26px;
}

.tb-permission-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 6px 0;
}

.tb-permission-text {
  font-size: 14px;
  color: var(--text-gray, #6b7280);
  margin: 0 0 14px 0;
  line-height: 1.4;
}

.tb-btn {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.15s;
}

.tb-btn:active {
  transform: scale(0.98);
}

.tb-btn-primary {
  background: linear-gradient(135deg, var(--primary-blue, #1e88e5) 0%, #0d47a1 100%);
  color: white;
  margin-bottom: 10px;
}

.tb-btn-ghost {
  background: transparent;
  border: 2px solid var(--border-light, #e5e7eb);
  color: var(--text-dark, #1f2937);
}
</style>
