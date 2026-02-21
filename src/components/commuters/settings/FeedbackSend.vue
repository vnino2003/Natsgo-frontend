<template>
  <div class="page active">
    <SettingsHeader
      title="Feedback"
      subtitle="Rate once • Send a quick note"
      back
    />

    <div class="page-content">
      <!-- HERO -->
      <div class="fb-hero">
        <div class="fb-badge"><i class="fas fa-comment-dots"></i></div>
        <div class="fb-hero-text">
          <p class="fb-hero-title">Help us improve NATSGO</p>
          <p class="fb-hero-desc">Your rating can only be submitted once.</p>
        </div>
      </div>

      <!-- =========================
           STEP 1: RATE (ONE TIME)
           ========================= -->
      <div class="settings-section">
        <p class="section-label">Rate Us</p>

        <!-- If already rated: show locked card -->
        <div v-if="ratedOnce" class="settings-item static locked">
          <div class="settings-text">
            <p class="item-title">Rating submitted</p>
            <p class="item-description">
              You rated <b>{{ savedRating }}</b> / 5 — thank you!
            </p>
          </div>
          <span class="pill-mini">
            <i class="fas fa-lock"></i> Locked
          </span>
        </div>

        <!-- If not yet rated: show stars -->
        <div v-else class="settings-item static rate-box">
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

        <!-- Save rating button (only if not rated) -->
        <div v-if="!ratedOnce" class="save-row">
          <button class="save-btn" type="button" @click="saveRating">
            <i class="fas fa-check"></i>
            Submit rating
          </button>
          <p class="mini-note">Once submitted, you can’t change it.</p>
        </div>
      </div>

      <!-- =========================
           STEP 2: SEND FEEDBACK
           (shows after rating saved)
           ========================= -->
      <div class="settings-section">
        <p class="section-label">Send Feedback</p>

        <!-- If feedback sent -->
        <div v-if="feedbackSent" class="settings-item static done">
          <div class="settings-text">
            <p class="item-title">Feedback received</p>
            <p class="item-description">Salamat! We’ll review your message.</p>
          </div>
          <i class="fas fa-circle-check done-icon"></i>
        </div>

        <!-- If not yet sent -->
        <div v-else class="feedback-card" :class="{ disabled: !ratedOnce }">
          <div class="feedback-top">
            <div class="feedback-icon">
              <i class="fas fa-pen-to-square"></i>
            </div>
            <div>
              <p class="feedback-title">What can we improve?</p>
              <p class="feedback-desc">
                {{ ratedOnce ? "Optional — short lang okay na." : "Please submit a rating first." }}
              </p>
            </div>
          </div>

          <textarea
            class="feedback-input"
            rows="4"
            placeholder="Type your feedback here..."
            v-model="message"
            :disabled="!ratedOnce"
          ></textarea>

          <button
            class="feedback-send"
            type="button"
            :disabled="!ratedOnce || message.trim().length < 3"
            @click="sendFeedback"
          >
            <i class="fas fa-paper-plane"></i>
            Send
          </button>

          <p class="mini-note" v-if="ratedOnce">
            Tip: 1–2 sentences is enough.
          </p>
        </div>
      </div>

      <div class="bottom-space"></div>
    </div>

    <!-- TOAST -->
    <div class="toast" :class="{ show: toast.show }">
      <i :class="toast.icon"></i>
      {{ toast.text }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import SettingsHeader from "./SettingsHeader.vue"

const rating = ref(4)
const hover = ref(0)

const ratedOnce = ref(false)
const savedRating = ref(0)

const message = ref("")
const feedbackSent = ref(false)

const toast = ref({ show: false, text: "", icon: "fas fa-circle-check" })

onMounted(() => {
  // one-time rating
  ratedOnce.value = localStorage.getItem("rated_once") === "1"
  const sr = Number(localStorage.getItem("app_rating") || 0)
  savedRating.value = isNaN(sr) ? 0 : sr

  // feedback state
  feedbackSent.value = localStorage.getItem("feedback_sent") === "1"
})

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

function showToast(text, icon = "fas fa-circle-check") {
  toast.value = { show: true, text, icon }
  setTimeout(() => (toast.value.show = false), 1800)
}

function saveRating() {
  // save rating ONCE
  localStorage.setItem("app_rating", String(rating.value))
  localStorage.setItem("rated_once", "1")
  ratedOnce.value = true
  savedRating.value = rating.value
  showToast("Rating submitted. Thank you!")
}

function sendFeedback() {
  // demo: store locally (replace with API call later)
  const payload = {
    rating: savedRating.value || rating.value,
    message: message.value.trim(),
    time: new Date().toISOString(),
  }
  localStorage.setItem("feedback_payload", JSON.stringify(payload))
  localStorage.setItem("feedback_sent", "1")

  feedbackSent.value = true
  message.value = ""
  showToast("Feedback sent. Salamat!", "fas fa-paper-plane")
}
</script>

<style scoped>
/* ===== minimal hero (not too colorful) ===== */
.fb-hero{
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 8px 18px rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 14px;
  display:flex;
  gap: 12px;
  align-items:center;
  margin-bottom: 16px;
}
.fb-badge{
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(0,188,212,0.10);
  color: rgba(0, 145, 165, 1);
  flex-shrink:0;
}
.fb-hero-title{
  margin:0;
  font-size: 14px;
  font-weight: 900;
  color: var(--text-dark);
}
.fb-hero-desc{
  margin: 4px 0 0 0;
  font-size: 12px;
  font-weight: 700;
  color: rgba(38, 43, 51, 0.65);
}

/* ===== rate box ===== */
.settings-item.static{
  cursor: default;
}
.settings-item.static:hover{
  border-color: var(--border-light);
  background: var(--bg-white);
}
.settings-item.static:active{ transform:none; }

.rate-box{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
}

.stars{ display:flex; gap: 6px; }
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
.star-btn.on i{ color: #FFC107; }
.star-btn:active{ transform: scale(0.98); }

.rate-label{
  font-size: 12px;
  font-weight: 900;
  color: rgba(38, 43, 51, 0.70);
}

/* save rating */
.save-row{
  margin-top: 10px;
}
.save-btn{
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 900;
  cursor:pointer;
  color: #fff;
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
  background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
  box-shadow: 0 10px 20px rgba(14,165,233,0.14);
}
.save-btn:active{ transform: scale(.99); }

/* locked */
.locked{
  background: rgba(0, 0, 0, 0.02);
}
.pill-mini{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.10);
  background: #fff;
  font-size: 12px;
  font-weight: 900;
  color: rgba(38, 43, 51, 0.70);
}
.pill-mini i{ color: rgba(38, 43, 51, 0.45); }

/* feedback card */
.feedback-card{
  background: #fff;
  border: 2px solid var(--border-light);
  border-radius: 14px;
  padding: 14px;
}
.feedback-card.disabled{
  opacity: .55;
}

.feedback-top{
  display:flex;
  gap: 12px;
  align-items:center;
  margin-bottom: 10px;
}
.feedback-icon{
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(30,136,229,0.10);
  color: rgba(30,136,229,0.95);
}
.feedback-title{
  margin:0;
  font-size: 13px;
  font-weight: 900;
}
.feedback-desc{
  margin: 4px 0 0 0;
  font-size: 12px;
  font-weight: 700;
  color: rgba(38, 43, 51, 0.65);
}

.feedback-input{
  width: 100%;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  padding: 12px;
  outline: none;
  font-size: 13px;
  color: var(--text-dark);
  background: #fff;
  resize: none;
}
.feedback-input:focus{
  border-color: rgba(0,188,212,0.55);
  box-shadow: 0 0 0 3px rgba(0,188,212,0.10);
}

.feedback-send{
  margin-top: 10px;
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 900;
  cursor:pointer;
  color: #fff;
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
  background: linear-gradient(135deg, #10b981 0%, #22c55e 100%);
  box-shadow: 0 10px 20px rgba(16,185,129,0.14);
}
.feedback-send:disabled{
  opacity: .45;
  cursor:not-allowed;
  box-shadow:none;
}

/* done state */
.done{
  background: rgba(16,185,129,0.06);
  border-color: rgba(16,185,129,0.22);
}
.done-icon{
  color: #10b981;
  font-size: 18px;
}

/* mini note */
.mini-note{
  margin: 8px 2px 0;
  font-size: 11px;
  font-weight: 700;
  color: rgba(38, 43, 51, 0.60);
}

/* toast */
.toast{
  position: fixed;
  left: 50%;
  bottom: calc(var(--nav-height) + 14px);
  transform: translate(-50%, 16px);
  opacity: 0;
  pointer-events:none;
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
.toast i{ color: #10b981; }
.toast.show{ opacity: 1; transform: translate(-50%, 0); }

.bottom-space{ height: 30px; }
</style>
