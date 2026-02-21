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
import { ref } from "vue"
import "../assets/css/admin.css"  // adjust path
import AdminSidebar from "../components/admin/layout/AdminSidebar.vue"
import AdminTopbar from "../components/admin/layout/AdminTopbar.vue"

const sidebarCollapsed = ref(false)
</script>

