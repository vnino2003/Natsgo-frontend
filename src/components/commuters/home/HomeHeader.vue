<template>
  <div class="page-header header-home">
    <div class="header-top">
      <button class="btn-menu" @click="$emit('open-drawer')">
        <i class="fas fa-bars"></i>
      </button>

      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Find Bus Routes"
          class="search-input"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <i class="fas fa-sliders-h"></i>
      </div>

      <button class="btn-notification" @click="$emit('open-notif')">
        <i class="fas fa-bell"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, default: "" } })
defineEmits(["update:modelValue", "open-drawer", "open-notif"])
</script>
