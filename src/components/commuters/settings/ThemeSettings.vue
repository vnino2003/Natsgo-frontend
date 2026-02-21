<template>
  <div class="page active">
    <SettingsHeader
      title="Theme"
      subtitle="Choose how the app looks"
      back
    />

    <div class="page-content">
      <!-- Soft preview -->
      <div class="theme-preview">
        <div class="preview-left">
          <div class="preview-dot"></div>
          <div>
            <p class="preview-title">Preview</p>
            <p class="preview-desc">
              {{ modeLabel }}
            </p>
          </div>
        </div>

        <span class="preview-pill">{{ pill }}</span>
      </div>

      <div class="settings-section">
        <p class="section-label">Appearance</p>

        <!-- System Theme switch -->
        <div class="settings-item static">
          <div class="settings-text">
            <p class="item-title">Use System Theme</p>
            <p class="item-description">Automatically match your device settings</p>
          </div>

          <div class="toggle-switch">
            <input
              type="checkbox"
              class="toggle-checkbox"
              id="system"
              v-model="useSystem"
            />
            <label for="system" class="toggle-label"></label>
          </div>
        </div>

        <!-- Light option -->
        <button
          class="settings-item theme-choice"
          :class="{ active: !useSystem && mode === 'light', disabled: useSystem }"
          type="button"
          @click="selectMode('light')"
          :disabled="useSystem"
        >
          <div class="settings-text">
            <p class="item-title">Light</p>
            <p class="item-description">Bright and clean</p>
          </div>

          <i v-if="!useSystem && mode === 'light'" class="fas fa-check theme-check"></i>
          <i v-else class="far fa-circle theme-circle"></i>
        </button>

        <!-- Dark option -->
        <button
          class="settings-item theme-choice"
          :class="{ active: !useSystem && mode === 'dark', disabled: useSystem }"
          type="button"
          @click="selectMode('dark')"
          :disabled="useSystem"
        >
          <div class="settings-text">
            <p class="item-title">Dark</p>
            <p class="item-description">Easy on the eyes at night</p>
          </div>

          <i v-if="!useSystem && mode === 'dark'" class="fas fa-check theme-check"></i>
          <i v-else class="far fa-circle theme-circle"></i>
        </button>
      </div>

      <!-- Save bar -->
      <div class="save-space"></div>
    </div>

    <div class="savebar">
      <button class="save-btn" type="button" @click="save">
        <i class="fas fa-check"></i>
        Save Theme
      </button>

      <p v-if="saved" class="save-confirm">
        <i class="fas fa-circle-check"></i>
        Saved!
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue"
import { useRouter } from "vue-router"
import SettingsHeader from "./SettingsHeader.vue"

const router = useRouter()

const useSystem = ref(true)
const mode = ref("light") // light | dark
const saved = ref(false)

onMounted(() => {
  useSystem.value = localStorage.getItem("theme_use_system") !== "false"
  mode.value = localStorage.getItem("theme_mode") || "light"
})

function selectMode(m) {
  if (useSystem.value) return
  mode.value = m
}

const pill = computed(() => {
  if (useSystem.value) return "SYSTEM"
  return mode.value.toUpperCase()
})

const modeLabel = computed(() => {
  if (useSystem.value) return "Following your device theme"
  return mode.value === "dark" ? "Dark mode enabled" : "Light mode enabled"
})

function save() {
  localStorage.setItem("theme_use_system", String(useSystem.value))
  localStorage.setItem("theme_mode", mode.value)

  saved.value = true
  setTimeout(() => (saved.value = false), 900)

  // optional: go back after save
  setTimeout(() => router.back(), 600)
}
</script>

<style scoped>
/* calm preview card */
.theme-preview{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 14px 14px;
  margin-bottom: 16px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  box-shadow: 0 8px 18px rgba(0,0,0,0.04);
}

.preview-left{
  display:flex;
  align-items:center;
  gap: 10px;
}

.preview-dot{
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: rgba(0, 188, 212, 0.35);
  border: 1px solid rgba(0, 188, 212, 0.45);
}

.preview-title{
  margin:0;
  font-weight: 800;
  font-size: 13px;
  color: var(--text-dark);
}
.preview-desc{
  margin:2px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: rgba(38,43,51,0.7);
}

.preview-pill{
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(0, 188, 212, 0.35);
  background: rgba(0, 188, 212, 0.08);
  color: var(--accent-teal);
}

/* choices */
.theme-choice{
  width: 100%;
  text-align:left;
}

.theme-circle{
  color: var(--border-medium);
  font-size: 18px;
}
.theme-check{
  color: var(--accent-teal);
  font-size: 18px;
}

/* active highlight */
.settings-item.active{
  border-color: rgba(0, 188, 212, 0.45);
  background: rgba(0, 188, 212, 0.06);
}

/* disabled when system on */
.settings-item.disabled{
  opacity: 0.55;
  pointer-events: none;
}

/* save bar */
.savebar{
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--nav-height);
  padding: 12px 16px;
  background: rgba(245, 247, 250, 0.92);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(209, 213, 219, 0.65);
  z-index: 90;
}

.save-btn{
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 800;
  cursor:pointer;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-teal) 100%);
  box-shadow: 0 10px 22px rgba(0, 188, 212, 0.18);
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
}
.save-btn:active{ transform: scale(.98); }

.save-confirm{
  margin-top: 8px;
  font-size: 12px;
  font-weight: 800;
  color: rgba(38, 43, 51, 0.75);
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 8px;
}
.save-confirm i{ color: var(--success-green); }

.save-space{ height: 120px; }
</style>
