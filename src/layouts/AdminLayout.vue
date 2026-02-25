<template>
  <div class="admin-layout">
    <AdminSidebar v-model:collapsed="sidebarCollapsed" />

    <div class="admin-main">
      <AdminTopbar
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      />

      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

import "../assets/css/admin.css";
import AdminSidebar from "../components/admin/layout/AdminSidebar.vue";
import AdminTopbar from "../components/admin/layout/AdminTopbar.vue";

import { useNotificationToasts } from "@/composables/useNotificationToasts";

const sidebarCollapsed = ref(false);
const router = useRouter();

const toastFeed = useNotificationToasts({
  pollMs: 3000,
  previewLimit: 5,
  autoCloseMs: 5000,
});

function goNotifications() {
  router.push("/admin/notifications");
}

onMounted(() => {
  toastFeed.start({ onOpenNotifications: goNotifications });
});

onBeforeUnmount(() => {
  toastFeed.stop();
});
</script>