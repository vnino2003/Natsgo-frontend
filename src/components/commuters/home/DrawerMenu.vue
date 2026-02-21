<template>
  <div
    class="drawer-overlay"
    :class="{ active: modelValue }"
    @click="$emit('update:modelValue', false)"
  ></div>

  <div class="drawer" :class="{ active: modelValue }">
    <div class="drawer-header">
      <button class="btn-close" @click="$emit('update:modelValue', false)"></button>
    </div>

    <div class="drawer-content">
      <button class="drawer-profile" type="button" @click="$emit('open-auth')">
        <div class="profile-avatar">
          <i class="fas fa-user"></i>
        </div>
        <p class="profile-text">Not signed in</p>
      </button>

      <nav class="drawer-menu">
        <a href="#" class="drawer-menu-item">
          <i class="fas fa-envelope"></i>
          <span>Contact Us</span>
        </a>
        <a href="#" class="drawer-menu-item">
          <i class="fab fa-facebook"></i>
          <span>Facebook Page</span>
        </a>

        <a href="#" class="drawer-menu-item">
          <i class="fas fa-bell"></i>
          <span>Arrival Notice</span>
        </a>

      </nav>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: Boolean, default: false } })
defineEmits(["update:modelValue", "open-auth"])
</script>
