    <template>
        <!-- Drawer (Home only) -->
        <DrawerMenu v-model="drawerOpen" @open-auth="authOpen = true" />
   <NotificationDrawer
  v-model="notifOpen"
  :items="notifications"
  @open="openNotif"
  @dismiss="dismiss"
  @mark-all-read="markAllRead"
  @clear="clear"
/>
        <!-- Auth Modal -->
        <AuthModal v-model="authOpen" />

        <!-- Home page -->
        <div id="home" class="page active">
        <HomeHeader
            v-model="search"
            @open-drawer="drawerOpen = true"
            @open-notif="notifOpen = true"

        />

        <div class="page-content">
            <!-- Weather Widget -->
         <WeatherCard/>

            <!-- Tabs (Bootstrap) -->
          <HomeTabs/>

            <!-- Nearest Bus Stop -->
        <NearestBusesSection />


            <!-- Recent Public Bikes -->
            <!-- <div class="section">
            <h3 class="section-title">Recent Public Bikes</h3>
            <div class="bus-stop-card">
                <p class="bus-stop-info">Find nearby bike stations</p>
                <button class="btn-location">
                <i class="fas fa-location-dot"></i>
                Turn on Location Services
                </button>
            </div>
            </div> -->
        </div>
        </div>
    </template>
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

// ✅ dynamic nearby notifications
const {
  notifications,
  markAllRead,
  dismiss,
  clear,
} = useNearbyBusAlerts({
  intervalMs: 1500,
  maxNearest: 4,
  nearKm: 1.0,         // when bus is within 1.0km => notif
  cooldownMs: 5 * 60 * 1000, // avoid spam per bus
});

function openNotif(n) {
  // mark read
  n.read = true;

  // optional: close drawer
  notifOpen.value = false;

  // optional: navigate to tracking page / focus bus using n.meta.bus_id
  // (if you want this next, tell me your route path)
}
</script>