<template>
  <div class="settings-topbar">
    <button
      v-if="back"
      class="settings-back"
      type="button"
      @click="goBack"
      aria-label="Back"
    >
      <i class="fas fa-arrow-left"></i>
    </button>

    <div class="settings-topbar-title">
      <h1 class="settings-title">{{ title }}</h1>
      <p v-if="subtitle" class="settings-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"

defineProps({
  title: { type: String, default: "Settings" },
  subtitle: { type: String, default: "" },
  back: { type: Boolean, default: false },
})

const router = useRouter()
function goBack() {
  router.back()
}
</script>

<style scoped>
/* =========================
   Settings Header (Premium, Calm)
   ========================= */
.settings-topbar{
  position: sticky;
  top: 0;
  z-index: 60;

  padding: 16px 16px 12px;
  display:flex;
  align-items:flex-start;
  gap: 12px;

  /* calmer gradient (less harsh than #0D47A1) */
  background:
    radial-gradient(circle at 18% 12%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(135deg,
      rgba(30, 136, 229, 0.95) 0%,
      rgba(18, 110, 210, 0.96) 45%,
      rgba(0, 188, 212, 0.72) 115%
    );

  /* clean separation */
  border-bottom: 1px solid rgba(255,255,255,0.14);

  /* depth but not heavy */
  box-shadow:
    0 10px 22px rgba(9, 61, 120, 0.18),
    0 1px 0 rgba(255,255,255,0.10) inset;
}

/* Optional: subtle blur only if supported */
@supports (backdrop-filter: blur(10px)){
  .settings-topbar{
    backdrop-filter: blur(10px);
  }
}

/* Back button: modern glass pill */
.settings-back{
  width: 44px;
  height: 44px;
  border-radius: 14px;

  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.95);

  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;

  transition: transform .12s ease, background .2s ease, border-color .2s ease;
  box-shadow:
    0 8px 18px rgba(0,0,0,0.14),
    0 1px 0 rgba(255,255,255,0.12) inset;
}

.settings-back:hover{
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.28);
}
.settings-back:active{ transform: scale(.96); }

/* title area */
.settings-topbar-title{
  flex: 1;
  min-width: 0;
}

.settings-title{
  margin: 0;
  font-size: 18px;       /* calmer than 22 */
  font-weight: 900;
  letter-spacing: 0.2px;
  line-height: 1.15;
  color: #fff;

  /* makes text readable on gradient */
  text-shadow: 0 1px 2px rgba(0,0,0,0.18);
}

.settings-subtitle{
  margin: 5px 0 0 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;

  color: rgba(255,255,255,0.86);
  text-shadow: 0 1px 2px rgba(0,0,0,0.14);
}

/* mobile tweak */
@media (max-width: 480px){
  .settings-topbar{ padding: 14px 14px 10px; }
  .settings-title{ font-size: 17px; }
  .settings-back{ width: 42px; height: 42px; border-radius: 13px; }
}
</style>
