<template>
  <div class="page active">
    <SettingsHeader
      title="Rate Us"
      subtitle="Quick rating, big help"
      back
    />

    <div class="page-content">
      <!-- soft hero (minimal) -->
      <div class="rate-hero">
        <div class="rate-hero-left">
          <div class="rate-badge">
            <i class="fas fa-star"></i>
          </div>

          <div>
            <p class="rate-hero-title">How’s NATSGO so far?</p>
            <p class="rate-hero-desc">Tap a star to rate your experience.</p>
          </div>
        </div>

        <div class="rate-pill">
          <span class="rate-pill-num">{{ rating.toFixed(1) }}</span>
          <span class="rate-pill-sub">/ 5</span>
        </div>
      </div>

      <!-- rating -->
      <div class="settings-section">
        <p class="section-label">Your Rating</p>

        <div class="settings-item static rate-box">
          <div class="stars" role="radiogroup" aria-label="Rate NATSGO">
            <button
              v-for="s in 5"
              :key="s"
              class="star-btn"
              type="button"
              :class="{ on: s <= hover || s <= rating }"
              @mouseenter="hover = s"
              @mouseleave="hover = 0"
              @click="setRating(s)"
              :aria-label="`Rate ${s} stars`"
            >
              <i class="fas fa-star"></i>
            </button>
          </div>

          <span class="rate-label">{{ label }}</span>
        </div>

        <!-- link to feedback page -->
        <button class="settings-item" type="button" @click="goFeedback">
          <div class="settings-text">
            <p class="item-title">Write a short feedback</p>
            <p class="item-description">Tell us what you like or what to improve</p>
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <div class="bottom-space"></div>
    </div>

    <!-- sticky save -->
    <div class="rate-savebar">
      <button class="rate-save" type="button" :disabled="!dirty" @click="save">
        <i class="fas fa-check"></i>
        Save rating
      </button>
    </div>

    <!-- toast -->
    <div class="rate-toast" :class="{ show: toast }">
      <i class="fas fa-circle-check"></i>
      Rating saved
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import SettingsHeader from "./SettingsHeader.vue"

const router = useRouter()

const rating = ref(4)
const savedRating = ref(4)
const hover = ref(0)
const toast = ref(false)

onMounted(() => {
  const r = Number(localStorage.getItem("app_rating") || 4)
  rating.value = isNaN(r) ? 4 : r
  savedRating.value = rating.value
})

const dirty = computed(() => rating.value !== savedRating.value)

const label = computed(() => {
  const r = hover.value || rating.value
  if (r >= 5) return "Excellent"
  if (r >= 4) return "Good"
  if (r >= 3) return "Okay"
  if (r >= 2) return "Not great"
  return "Poor"
})

function setRating(v) {
  rating.value = v
}

function save() {
  localStorage.setItem("app_rating", String(rating.value))
  savedRating.value = rating.value
  toast.value = true
  setTimeout(() => (toast.value = false), 2000)
}

function goFeedback() {
  // change this to your actual route name/path
  // example: router.push({ name: "feedback-send" })
  router.push("/settings/feedback-send")
}
</script>

<style scoped>
/* hero: soft, minimal, not too blue */
.rate-hero{
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 8px 18px rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 14px 14px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.rate-hero-left{
  display:flex;
  gap: 12px;
  align-items:center;
}

.rate-badge{
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(0,188,212,0.10);
  color: rgba(0, 145, 165, 1);
  flex-shrink: 0;
}

.rate-hero-title{
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: var(--text-dark);
}

.rate-hero-desc{
  margin: 4px 0 0 0;
  font-size: 12px;
  font-weight: 700;
  color: rgba(38, 43, 51, 0.65);
}

.rate-pill{
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(245, 247, 250, 0.9);
  display:flex;
  align-items:baseline;
  gap: 4px;
  color: var(--text-dark);
  font-weight: 900;
}
.rate-pill-num{ font-size: 16px; }
.rate-pill-sub{ font-size: 12px; opacity: .7; }

/* rating box */
.rate-box{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
}

.settings-item.static{
  cursor: default;
}
.settings-item.static:hover{
  border-color: var(--border-light);
  background: var(--bg-white);
}
.settings-item.static:active{ transform:none; }

/* clickable stars */
.stars{
  display:flex;
  gap: 6px;
  align-items:center;
}
.star-btn{
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
  background: #fff;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition: transform .12s ease, background .2s ease, border-color .2s ease;
}
.star-btn i{
  font-size: 18px;
  color: rgba(209, 213, 219, 1);
}
.star-btn.on{
  border-color: rgba(255, 193, 7, 0.35);
  background: rgba(255, 193, 7, 0.08);
}
.star-btn.on i{
  color: #FFC107;
}
.star-btn:active{ transform: scale(0.98); }

/* label */
.rate-label{
  font-size: 12px;
  font-weight: 900;
  color: rgba(38, 43, 51, 0.70);
}

/* sticky save (subtle) */
.rate-savebar{
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--nav-height);
  padding: 12px 16px;
  background: rgba(245, 247, 250, 0.92);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(209, 213, 219, 0.7);
  z-index: 90;
}

.rate-save{
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 900;
  cursor:pointer;
  color: #fff;
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
  background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
  box-shadow: 0 12px 22px rgba(14,165,233,0.16);
  transition: transform .15s ease, filter .2s ease, opacity .2s ease;
}
.rate-save:active{ transform: scale(.98); }
.rate-save:disabled{
  opacity: .45;
  cursor:not-allowed;
  box-shadow:none;
}

/* toast */
.rate-toast{
  position: fixed;
  left: 50%;
  bottom: calc(var(--nav-height) + 14px);
  transform: translate(-50%, 16px);
  opacity: 0;
  pointer-events: none;
  z-index: 120;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 10px 24px rgba(0,0,0,0.12);
  border-radius: 999px;
  padding: 10px 14px;
  display:flex;
  align-items:center;
  gap: 10px;
  font-weight: 900;
  color: rgba(38, 43, 51, 0.82);
  transition: opacity .22s ease, transform .22s ease;
}
.rate-toast i{ color: #10b981; }
.rate-toast.show{
  opacity: 1;
  transform: translate(-50%, 0);
}

.bottom-space{ height: 110px; }
</style>
