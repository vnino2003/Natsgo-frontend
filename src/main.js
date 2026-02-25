import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import "leaflet/dist/leaflet.css";

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: false,     // so click can be used for "go to notif page"
  pauseOnHover: true,
  draggable: true,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
})
app.mount('#app')
