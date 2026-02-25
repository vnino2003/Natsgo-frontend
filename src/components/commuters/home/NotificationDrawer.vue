<template>
  <!-- overlay -->
  <div class="notif-overlay" :class="{ active: modelValue }" @click="close"></div>

  <!-- drawer -->
  <aside class="notif-drawer" :class="{ active: modelValue }" @click.stop>
    <div class="notif-header">
      <div class="notif-title">
        <i class="fas fa-bell"></i>
        <span>Notifications</span>
        <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
      </div>

      <div class="notif-actions">
        <button class="notif-action" type="button" @click="$emit('mark-all-read')">
          Mark all read
        </button>
        <button class="notif-action danger" type="button" @click="$emit('clear')">
          Clear
        </button>

        <button class="notif-close" type="button" @click="close" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="notif-content">
      <div v-if="items.length === 0" class="notif-empty">
        <i class="fas fa-inbox"></i>
        <p>No notifications</p>
      </div>

      <div v-for="n in items" :key="n.id" class="notif-item" :class="{ read: !!n.read }">
        <div class="notif-icon">
          <i :class="notifIcon(n.type)"></i>
        </div>

        <div class="notif-text" @click="$emit('open', n)">
          <p class="notif-item-title">{{ n.title }}</p>
          <p class="notif-item-desc">{{ n.message }}</p>
          <small class="notif-item-time">{{ n.time }}</small>
        </div>

        <!-- per-item dismiss -->
        <button
          class="notif-dismiss"
          type="button"
          aria-label="Dismiss"
          @click.stop="$emit('dismiss', n.id)"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  items: { type: Array, default: () => [] }, // [{id,title,message,time,type,read}]
});

const emit = defineEmits([
  "update:modelValue",
  "open",
  "dismiss",
  "mark-all-read",
  "clear",
]);

const unreadCount = computed(() => props.items.filter((x) => !x.read).length);

function close() {
  emit("update:modelValue", false);
}

function notifIcon(type) {
  const map = {
    bus: "fas fa-bus",
    route: "fas fa-route",
    alert: "fas fa-triangle-exclamation",
    info: "fas fa-circle-info",
  };
  return map[type] || map.info;
}
</script>

<style scoped>
.notif-overlay{
  display:none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 998;
}
.notif-overlay.active{ display:block; }

/* right drawer */
.notif-drawer{
  position: fixed;
  top: 0;
  right: -340px;
  width: 340px;
  height: 100vh;
  background: var(--bg-white);
  z-index: 999;
  transition: right 0.28s ease;
  box-shadow: -10px 0 30px rgba(0,0,0,0.10);
  display:flex;
  flex-direction: column;
}
.notif-drawer.active{ right: 0; }

/* header */
.notif-header{
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
}
.notif-title{
  display:flex;
  align-items:center;
  gap: 10px;
  font-weight: 800;
  color: var(--text-dark);
}
.notif-title i{ color: var(--accent-teal); }

.notif-badge{
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
  padding: 3px 8px;
  border-radius: 999px;
}

.notif-actions{
  display:flex;
  align-items:center;
  gap: 8px;
}
.notif-action{
  border: 1px solid var(--border-light);
  background: #fff;
  color: var(--text-dark);
  font-weight: 900;
  font-size: 11px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
}
.notif-action:hover{ background: rgba(0, 188, 212, 0.08); }
.notif-action.danger{
  color: #b91c1c;
  border-color: rgba(185, 28, 28, 0.25);
}
.notif-action.danger:hover{ background: rgba(185, 28, 28, 0.08); }

.notif-close{
  background: none;
  border: none;
  cursor: pointer;
  width: 38px;
  height: 38px;
  display:flex;
  align-items:center;
  justify-content:center;
  color: var(--text-gray);
  border-radius: 10px;
}
.notif-close:hover{ background: rgba(0, 188, 212, 0.08); }
.notif-close:active{ transform: scale(0.95); }

/* content */
.notif-content{
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

/* empty */
.notif-empty{
  text-align:center;
  padding: 40px 16px;
  color: var(--text-gray);
}
.notif-empty i{
  font-size: 40px;
  color: var(--border-medium);
  display:block;
  margin-bottom: 10px;
}
.notif-empty p{ font-weight: 800; }

/* item row */
.notif-item{
  border: 1px solid var(--border-light);
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  display:flex;
  align-items:flex-start;
  gap: 12px;
  margin-bottom: 10px;
}
.notif-item.read{
  opacity: 0.72;
}

/* icon */
.notif-icon{
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
}

.notif-text{
  flex: 1;
  cursor: pointer;
}
.notif-item-title{
  margin: 0;
  font-weight: 900;
  color: var(--text-dark);
  font-size: 14px;
}
.notif-item-desc{
  margin: 4px 0 0;
  color: var(--text-gray);
  font-size: 12px;
  line-height: 1.35;
}
.notif-item-time{
  display:block;
  margin-top: 6px;
  color: rgba(38, 43, 51, 0.65);
  font-size: 11px;
  font-weight: 700;
}

/* dismiss */
.notif-dismiss{
  background: transparent;
  border: none;
  color: var(--text-gray);
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  display:flex;
  align-items:center;
  justify-content:center;
}
.notif-dismiss:hover{ background: rgba(0,0,0,0.05); color: var(--text-dark); }
.notif-dismiss:active{ transform: scale(0.95); }

@media (max-width: 480px){
  .notif-drawer{ width: 300px; right: -300px; }
}
</style>