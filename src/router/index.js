import { createRouter, createWebHistory } from "vue-router";
import CommuterLayout from "../layouts/CommutersLayout.vue";

// Commuters pages
import HomePage from "../pages/commuters/HomePage.vue";
import TrackBusPage from "../pages/commuters/TrackBusPage.vue";
import SettingsPage from "../pages/commuters/SettingsPage.vue";
import RoutesPage from "../pages/commuters/RoutesPage.vue";
import TerminalPage from "../pages/commuters/TerminalPage.vue";

// settings components (commuters)
import SettingsHome from "../components/commuters/settings/SettingsHome.vue";
import AccountSettings from "../components/commuters/settings/AccountSettings.vue";
import SecuritySettings from "../components/commuters/settings/SecuritySettings.vue";
import NotificationSettings from "../components/commuters/settings/NotificationSettings.vue";
import LanguageSettings from "../components/commuters/settings/LanguageSettings.vue";
import ThemeSettings from "../components/commuters/settings/ThemeSettings.vue";
import FeedbackRate from "../components/commuters/settings/FeedbackRate.vue";
import FeedbackSend from "../components/commuters/settings/FeedbackSend.vue";
import AboutApp from "../components/commuters/settings/AboutApp.vue";
import PrivacyPolicy from "../components/commuters/settings/PrivacyPolicy.vue";
import TermsService from "../components/commuters/settings/TermsService.vue";

import AdminLayout from "../layouts/AdminLayout.vue"
import AdminDashboard from "../pages/admin/AdminDashboard.vue"
import AdminBusesPage from "../pages/admin/AdminBusesPage.vue"
import AdminNotificationPage from "../pages/admin/AdminNotificationPage.vue"
import AdminLiveTrackPage from "../pages/admin/AdminLiveTrackPage.vue"
import AdminTerminalPage from "../pages/admin/adminTerminalPage.vue"


// ✅ Admin - IoT pages (create these files)
import IoTDevices from "../pages/admin/iot/Devices.vue"
import IoTAssignments from "../pages/admin/iot/assignment.vue"
import IoTHealth from "../pages/admin/iot/health.vue"

const routes = [
  // ✅ Commuters (unchanged)
  {
    path: "/",
    component: CommuterLayout,
    children: [
      { path: "", redirect: "/home" },
      { path: "home", name: "home", component: HomePage },
      { path: "track-bus", name: "track", component: TrackBusPage },
      { path: "routes", name: "routes", component: RoutesPage },
      { path: "terminal", name: "terminal", component: TerminalPage },
      {
        path: "settings",
        component: SettingsPage,
        children: [
          { path: "", name: "settings", component: SettingsHome },
          { path: "account", component: AccountSettings },
          { path: "security", component: SecuritySettings },
          { path: "notifications", component: NotificationSettings },
          { path: "language", component: LanguageSettings },
          { path: "theme", component: ThemeSettings },
          { path: "rate", component: FeedbackRate },
          { path: "feedback", component: FeedbackSend },
          { path: "about", component: AboutApp },
          { path: "privacy", component: PrivacyPolicy },
          { path: "terms", component: TermsService },
        ],
      },
    ],
  },

  // ✅ Admin
  {
     path: "/admin",
    component: AdminLayout,
    children: [
      { path: "", redirect: "/admin/dashboard" },
      { path: "dashboard", component: AdminDashboard },

      // placeholders (create later)
      { path: "live", component: AdminLiveTrackPage },
 {
      path: "buses",
      component: AdminBusesPage,
 },
   {
        path: "iot",
        children: [
          { path: "", redirect: "/admin/iot/devices" },
          { path: "devices", component: IoTDevices },
          { path: "assignments", component: IoTAssignments },
        ],
      },


      { path: "terminals", component: AdminTerminalPage },
      { path: "alerts", component: AdminNotificationPage },
      { path: "analytics", component: AdminDashboard },
      { path: "users", component: AdminDashboard },
      { path: "settings", component: AdminDashboard },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

