<template>
  <header class="admin-topbar">
    <div class="at-left">
      <button class="at-icon-btn" type="button" @click="$emit('toggle-sidebar')" aria-label="Toggle sidebar">
        <i class="fas" :class="collapsed ? 'fa-bars-staggered' : 'fa-bars'"></i>
      </button>

      <div class="at-search">
        <i class="fas fa-search"></i>
        <input class="at-search-input" type="text" placeholder="Search buses, routes, users..." />
      </div>
    </div>

    <div class="at-right">
      <button class="at-pill" type="button">
        <i class="fas fa-plus"></i>
        <span class="at-pill-text">New</span>
      </button>

      <button class="at-icon-btn at-badge" type="button" aria-label="Notifications">
        <i class="fas fa-bell"></i>
        <span class="at-dot"></span>
      </button>

      <div class="at-profile">
        <div class="at-avatar">
          <i class="fas fa-user-shield"></i>
        </div>
        <div class="at-profile-text">
          <p class="at-name">Admin</p>
          <p class="at-role">System Manager</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  collapsed: { type: Boolean, default: false },
})

defineEmits(["toggle-sidebar"])
</script>


