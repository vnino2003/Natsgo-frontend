<template>
  <header class="admin-topbar imgbar">
    <!-- LEFT -->
    <div class="imgbar-left">
      <!-- Mobile hamburger -->
      <button
        class="imgbar-hamburger"
        type="button"
        aria-label="Toggle sidebar"
        @click="$emit('toggle-sidebar')"
      >
        <i class="fas fa-bars"></i>
      </button>

      <div class="imgbar-search">
        <i class="fas fa-search"></i>
        <input
          v-model="q"
          type="text"
          placeholder="Search buses, routes, users"
          @keyup.enter="$emit('search', q)"
        />
      </div>
    </div>

    <!-- RIGHT -->
    <div class="imgbar-right" ref="menuRoot">
<button class="imgbar-icon" type="button" aria-label="Notifications" @click="toggleNotif">
  <i class="fas fa-bell"></i>

  <!-- unread badge count -->
  <span v-if="unreadCount > 0" class="imgbar-badge">{{ unreadCount > 99 ? "99+" : unreadCount }}</span>
</button>

<!-- Notification dropdown -->
<div v-if="notifOpen" class="imgbar-notif">
  <div class="imgbar-notif-head">
    <span class="imgbar-notif-title">Notifications</span>
    <button class="imgbar-notif-link" type="button" @click="goNotif">See more</button>
  </div>

  <div class="imgbar-notif-list">
    <div v-if="loadingPreview" class="imgbar-notif-empty">Loading...</div>

    <div v-else-if="previewItems.length === 0" class="imgbar-notif-empty">
      No notifications
    </div>

    <button
      v-else
      v-for="n in previewItems"
      :key="n.id"
      class="imgbar-notif-item"
      :class="{ unread: n.unread }"
      type="button"
      @click="openNotif(n)"
    >
      <div class="imgbar-notif-row">
        <span class="imgbar-notif-dot" v-if="n.unread"></span>
        <div class="imgbar-notif-main">
          <div class="imgbar-notif-title2">{{ n.title }}</div>
          <div class="imgbar-notif-msg">{{ n.message }}</div>
        </div>
        <span class="imgbar-notif-sev" :class="sevClass(n.severity)">{{ sevLabel(n.severity) }}</span>
      </div>
    </button>
  </div>

  <button class="imgbar-notif-footer" type="button" @click="goNotif">
    View all notifications
  </button>
</div>
      <button class="imgbar-profile" type="button" @click="toggleMenu" aria-label="Account menu">
        <span class="imgbar-avatar">A</span>

        <span class="imgbar-meta">
          <span class="imgbar-name">Admin</span>
          <span class="imgbar-role">System Manager</span>
        </span>

        <i class="fas fa-chevron-down imgbar-chev"></i>
      </button>

      <div class="imgbar-menu" v-if="open">
        <button class="imgbar-menu-item" type="button">
          <i class="fas fa-user"></i>
          <span>Profile</span>
        </button>

        <button class="imgbar-menu-item" type="button">
          <i class="fas fa-gear"></i>
          <span>Settings</span>
        </button>

        <div class="imgbar-menu-sep"></div>

        <button class="imgbar-menu-item danger" type="button">
          <i class="fas fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useNotifications } from "@/composables/useNotifications";

defineEmits(["toggle-sidebar", "search"]);

const router = useRouter();

const q = ref("");

const open = ref(false);
const notifOpen = ref(false);
const menuRoot = ref(null);

function toggleMenu() {
  open.value = !open.value;
  if (open.value) notifOpen.value = false;
}
function toggleNotif() {
  notifOpen.value = !notifOpen.value;
  if (notifOpen.value) open.value = false;

  // fetch preview when opening
  if (notifOpen.value) {
    fetchSummary();       // for unread badge
    fetchPreview(5);      // top 5
  }
}
function closeAll() {
  open.value = false;
  notifOpen.value = false;
}

function onDocClick(e) {
  const root = menuRoot.value;
  if (!root) return;
  if (root && !root.contains(e.target)) closeAll();
}
function onEsc(e) {
  if (e.key === "Escape") closeAll();
}

// Notifications data
const {
  summary,
  preview,
  loadingPreview,
  fetchPreview,
  fetchSummary,
  markRead,
} = useNotifications();

const unreadCount = computed(() => Number(summary.value?.unread || 0));
const previewItems = computed(() => (Array.isArray(preview.value) ? preview.value.slice(0, 5) : []));

function sevLabel(n) {
  if (n === 3) return "Critical";
  if (n === 2) return "Warning";
  return "Info";
}
function sevClass(n) {
  if (n === 3) return "critical";
  if (n === 2) return "warning";
  return "info";
}

async function openNotif(n) {
  // optional: mark read on click
  if (n?.unread) await markRead(n.id);

  // go to notifications page
  notifOpen.value = false;
  router.push("/admin/alerts");
}

function goNotif() {
  notifOpen.value = false;
  router.push("/admin/alerts");
}

onMounted(() => {
  // load badge count once on mount
  fetchSummary();

  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onEsc);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onEsc);
});
</script>
