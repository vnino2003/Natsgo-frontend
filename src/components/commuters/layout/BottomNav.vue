<template>
  <nav class="bottom-nav">
    <RouterLink
      to="/home"
      class="nav-item"
      :class="{ active: isActive('home') }"
    >
      <i class="fas fa-home"></i>
      <span>Home</span>
    </RouterLink>

    <RouterLink
      to="/track-bus"
      class="nav-item"
      :class="{ active: isActive('track') }"
    >
      <i class="fas fa-location-dot"></i>
      <span>Track</span>
    </RouterLink>

    <RouterLink
      to="/routes"
      class="nav-item"
      :class="{ active: isActive('routes') }"
    >
      <i class="fas fa-map"></i>
      <span>Routes</span>
    </RouterLink>

    <RouterLink
      to="/terminal"
      class="nav-item"
      :class="{ active: isActive('terminal') }"
    >
      <i class="fas fa-bus"></i>
      <span>Terminal</span>
    </RouterLink>

    <RouterLink
      to="/settings"
      class="nav-item"
      :class="{ active: isActive('settings') }"
    >
      <i class="fas fa-cog"></i>
      <span>Settings</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

const isActive = (name) => route.name === name
</script>

