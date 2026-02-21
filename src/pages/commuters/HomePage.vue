    <template>
        <!-- Drawer (Home only) -->
        <DrawerMenu v-model="drawerOpen" @open-auth="authOpen = true" />
          <NotificationDrawer
    v-model="notifOpen"
    :items="notifications"
    @open="openNotif"
    @mark-all-read="markAllRead"
    @clear="clearNotifs"
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
import { ref } from "vue"

import DrawerMenu from "../../components/commuters/home/DrawerMenu.vue"
import HomeHeader from "../../components/commuters/home/HomeHeader.vue"
import AuthModal from "../../components/commuters/authModal/AuthModal.vue"
import WeatherCard from "../../components/commuters/home/WeatherCard.vue"
import HomeTabs from "../../components/commuters/home/HomeTabs/HomeTabs.vue"
import NearestBusesSection from "../../components/commuters/home/NearestBusCard.vue"
import NotificationDrawer from "../../components/commuters/home/NotificationDrawer.vue" // ✅ ADD THIS

const drawerOpen = ref(false)
const authOpen = ref(false)
const notifOpen = ref(false) // ✅ ADD THIS
const search = ref("")

// ✅ sample notifications
const notifications = ref([
  {
    id: 1,
    title: "Bus 12 is near",
    message: "2 mins away • Route A → B",
    time: "Just now",
    read: false,
    type: "bus",
  },
  {
    id: 2,
    title: "Route Update",
    message: "Route 5 has a detour today.",
    time: "10 mins ago",
    read: false,
    type: "route",
  },
])

function openNotif(n) {
  n.read = true
  notifOpen.value = false
}

function markAllRead() {
  notifications.value.forEach(n => (n.read = true))
}

function clearNotifs() {
  notifications.value = []
}
</script>

