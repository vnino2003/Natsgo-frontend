<template>
  <div class="settings-item" @click="onClick">
    <div class="settings-left">
      <div v-if="icon" class="settings-leading">
        <i :class="icon"></i>
      </div>

      <div class="settings-text">
        <p class="item-title">{{ title }}</p>
        <p v-if="desc" class="item-description">{{ desc }}</p>
      </div>
    </div>

    <!-- right content -->
    <div class="settings-right" @click.stop>
      <slot name="right">
        <i class="fas fa-chevron-right"></i>
      </slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  desc: { type: String, default: "" },
  icon: { type: String, default: "" },
  to: { type: String, default: "" }, // route
})

const emit = defineEmits(["go"])

function onClick() {
  if (props.to) emit("go", props.to)
}
</script>

<style scoped>
.settings-left{
  display:flex;
  align-items:center;
  gap: 12px;
  flex: 1;
}

.settings-leading{
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(30,136,229,0.16), rgba(0,188,212,0.16));
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.settings-leading i{
  color: var(--accent-teal);
  font-size: 18px;
}

.settings-right{
  display:flex;
  align-items:center;
  gap: 10px;
  color: var(--border-medium);
}
</style>
