<template>
  <aside class="admin-sidebar" :class="{ collapsed: collapsed }">
    <!-- Brand -->
    <div class="as-brand">
      <div class="as-logo">
        <i class="fas fa-bus"></i>
      </div>

      <div v-if="!collapsed" class="as-brand-text">
        <p class="as-name">NATSGO</p>
        <p class="as-sub">Admin</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="as-nav">
      <RouterLink class="as-item" to="/admin/dashboard" title="Dashboard">
        <i class="fas fa-chart-line"></i>
        <span v-if="!collapsed">Dashboard</span>
      </RouterLink>

      <p v-if="!collapsed" class="as-section">Operations</p>

      <RouterLink class="as-item" to="/admin/live" title="Live Tracking">
        <i class="fas fa-map-location-dot"></i>
        <span v-if="!collapsed">Live Tracking</span>
      </RouterLink>

      <RouterLink class="as-item" to="/admin/buses" title="Buses">
        <i class="fas fa-bus"></i>
        <span v-if="!collapsed">Buses</span>
      </RouterLink>

      <RouterLink class="as-item" to="/admin/routes" title="Routes">
        <i class="fas fa-route"></i>
        <span v-if="!collapsed">Routes</span>
      </RouterLink>

      <RouterLink class="as-item" to="/admin/terminals" title="Terminals">
        <i class="fas fa-warehouse"></i>
        <span v-if="!collapsed">Terminals</span>
      </RouterLink>

      <!-- ✅ IoT (submenu) -->
      <p v-if="!collapsed" class="as-section">IoT</p>

      <!-- Parent item -->
      <button
        class="as-item as-item-btn"
        type="button"
        :class="{ activeish: isIoTRoute }"
        @click="toggleIoT"
        :title="collapsed ? 'IoT' : ''"
      >
        <i class="fas fa-microchip"></i>

        <span v-if="!collapsed" class="as-item-flex">
          <span>IoT</span>
          <i
            class="fas as-caret"
            :class="iotOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
          ></i>
        </span>
      </button>

      <!-- Submenu -->
      <div class="as-submenu" :class="{ open: iotOpen && !collapsed }">
        <RouterLink
          class="as-subitem"
          to="/admin/iot/devices"
          title="Devices"
        >
          <i class="fas fa-sim-card"></i>
          <span>Devices</span>
        </RouterLink>

        <RouterLink
          class="as-subitem"
          to="/admin/iot/assignments"
          title="Assignments"
        >
          <i class="fas fa-link"></i>
          <span>Assignments</span>
        </RouterLink>

        <RouterLink
          class="as-subitem"
          to="/admin/iot/health"
          title="Health Monitor"
        >
          <i class="fas fa-heart-pulse"></i>
          <span>Health Monitor</span>
        </RouterLink>
      </div>

      <p v-if="!collapsed" class="as-section">Monitoring</p>

      <RouterLink class="as-item" to="/admin/alerts" title="Alerts & Logs">
        <i class="fas fa-bell"></i>
        <span v-if="!collapsed">Alerts & Logs</span>
      </RouterLink>

      <RouterLink class="as-item" to="/admin/analytics" title="Analytics">
        <i class="fas fa-chart-pie"></i>
        <span v-if="!collapsed">Analytics</span>
      </RouterLink>

      <p v-if="!collapsed" class="as-section">Admin</p>

      <RouterLink class="as-item" to="/admin/users" title="Users">
        <i class="fas fa-users"></i>
        <span v-if="!collapsed">Users</span>
      </RouterLink>

      <RouterLink class="as-item" to="/admin/settings" title="Settings">
        <i class="fas fa-gear"></i>
        <span v-if="!collapsed">Settings</span>
      </RouterLink>
    </nav>

    <!-- Footer -->
    <button
      class="as-collapse"
      type="button"
      @click="$emit('update:collapsed', !collapsed)"
    >
      <i class="fas" :class="collapsed ? 'fa-angles-right' : 'fa-angles-left'"></i>
      <span v-if="!collapsed">Collapse</span>
    </button>
  </aside>
</template>

<script setup>
import { computed, ref, watchEffect } from "vue"
import { useRoute } from "vue-router"

const props = defineProps({
  collapsed: { type: Boolean, default: false },
})
defineEmits(["update:collapsed"])

const collapsed = computed(() => props.collapsed)

const route = useRoute()

const isIoTRoute = computed(() => String(route.path || "").startsWith("/admin/iot"))

const iotOpen = ref(false)

function toggleIoT() {
  // if collapsed, don't open submenu (no space)
  if (collapsed.value) return
  iotOpen.value = !iotOpen.value
}

// auto-open when navigating inside /admin/iot
watchEffect(() => {
  if (collapsed.value) return
  if (isIoTRoute.value) iotOpen.value = true
})
</script>

