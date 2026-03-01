<script setup>
import { ref } from "vue";
import DrawerMenu from "../../components/commuters/home/DrawerMenu.vue";
import HomeHeader from "../../components/commuters/home/HomeHeader.vue";
import AuthModal from "../../components/commuters/authModal/AuthModal.vue";
import WeatherCard from "../../components/commuters/home/WeatherCard.vue";
import HomeTabs from "../../components/commuters/home/HomeTabs/HomeTabs.vue";
import NearestBusesSection from "../../components/commuters/home/NearestBusCard.vue";
import NotificationDrawer from "../../components/commuters/home/NotificationDrawer.vue";

import { useNearbyBusAlerts } from "@/composables/useNearbyBusAlerts";

const drawerOpen = ref(false);
const authOpen = ref(false);
const notifOpen = ref(false);
const search = ref("");

const {
  notifications,
  unreadCount,
  markRead,
  markAllRead,
  dismiss,
  clear,
} = useNearbyBusAlerts({
  intervalMs: 1500,
  maxNearest: 4,
  nearKm: 1.0,
  cooldownMs: 5 * 60 * 1000,
});

function openNotif(n) {
  markRead(n.id);
  // optional close:
  // notifOpen.value = false;
}
</script>

<template>
  <DrawerMenu v-model="drawerOpen" @open-auth="authOpen = true" />

  <NotificationDrawer
    v-model="notifOpen"
    :items="notifications"
    @open="openNotif"
    @dismiss="dismiss"
    @mark-all-read="markAllRead"
    @clear="clear"
  />

  <AuthModal v-model="authOpen" />

  <div id="home" class="page active">
    <HomeHeader
      v-model="search"
      :unread="unreadCount"
      @open-drawer="drawerOpen = true"
      @open-notif="notifOpen = true"
    />

    <div class="page-content">
      <WeatherCard />
      <HomeTabs />
      <NearestBusesSection />
    </div>
  </div>
</template>