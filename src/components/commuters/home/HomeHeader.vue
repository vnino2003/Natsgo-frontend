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

      <!-- bell w/ badge -->
      <button class="btn-notification hh__bell" @click="$emit('open-notif')" type="button">
        <i class="fas fa-bell"></i>
        <span v-if="unread > 0" class="hh__badge">{{ unread > 99 ? "99+" : unread }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: "" },
  unread: { type: Number, default: 0 },
});
defineEmits(["update:modelValue", "open-drawer", "open-notif"]);
</script>

<style scoped>
.hh__bell{ position: relative; }

.hh__badge{
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  background: #ef4444;
  border: 2px solid #fff;
  box-shadow: 0 10px 20px rgba(239,68,68,0.25);
}
</style>