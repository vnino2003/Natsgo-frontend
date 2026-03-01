<template>
  <div class="section nb">
    <!-- Header -->
   <div class="section-head nb__head">
  <h3 class="section-title nb__title">Nearby Buses</h3>

  <small v-if="locationEnabled" class="section-subtitle nb__updated">
    <i class="fas fa-clock"></i>
    Updated {{ lastUpdatedText }}
  </small>
</div>

    <!-- Before location enabled -->
    <div v-if="!locationEnabled" class="bus-stop-card nb__ctaCard">
      <div class="nb__ctaIcon">
        <i class="fas fa-location-crosshairs"></i>
      </div>
      <p class="bus-stop-info nb__ctaText">
        Turn on location to see nearby buses around you.
      </p>
      <button class="btn-location nb__ctaBtn" @click="enableLocation" type="button">
        <i class="fas fa-location-dot"></i>
        Turn on Location Services
      </button>
      <p class="nb__ctaHint">
        We use your location only to show buses within your selected radius.
      </p>
    </div>

    <!-- After location enabled -->
    <div v-else class="nearby-bus-list nb__list">
      <!-- Loading skeleton -->
      <div v-if="loading && nearestBuses.length === 0" class="nb__skeletonWrap">
        <div class="nb__skeleton" v-for="i in 3" :key="i">
          <div class="nb__skLeft">
            <div class="nb__skBadge"></div>
            <div class="nb__skText">
              <div class="nb__skLine nb__skLine--lg"></div>
              <div class="nb__skLine"></div>
            </div>
          </div>
          <div class="nb__skRight">
            <div class="nb__skPill"></div>
            <div class="nb__skLine nb__skLine--sm"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="nearestBuses.length === 0" class="bus-stop-card nb__empty">
        <div class="nb__emptyIcon">
          <i class="fas fa-bus"></i>
        </div>
        <p class="bus-stop-info nb__emptyTitle">No nearby buses yet.</p>
        <p class="nb__emptySub">
          Keep this screen open — we’ll automatically update when a bus enters your area.
        </p>

        <p v-if="error" class="nearby-error nb__errorInline">
          <i class="fas fa-triangle-exclamation"></i> {{ error }}
        </p>
      </div>

      <!-- List -->
      <div v-else class="nb__itemsWrap">
        <!-- Scroll container (only scrolls if > 4) -->
        <div class="nb__items" :class="{ 'nb__items--scroll': nearestBuses.length > MAX_VISIBLE }">
          <div v-for="bus in nearestBuses" :key="bus.id" class="nearby-bus-item nb__item">
            <div class="bus-left">
              <div class="bus-badge nb__badge">
                <i class="fas fa-bus"></i>
              </div>

              <div class="bus-meta">
                <p class="bus-route nb__route">
                  {{ bus.route }}
                  <span class="bus-distance nb__distance">• {{ bus.kmText }} away</span>
                </p>
                <p class="bus-desc nb__desc">
                  Track #{{ bus.trackNo }} • {{ bus.plate_no || "—" }}
                </p>
              </div>
            </div>

            <div class="bus-right nb__right">
              <span class="pill nb__pill" :class="pillClass(bus)">
                {{ pillText(bus) }}
              </span>
              <div class="seat-text nb__seats">
                Seats: <b>{{ bus.seats }}</b> / {{ bus.capacity }}
              </div>
            </div>
          </div>
        </div>

        <!-- error (if any) -->
        <p v-if="error" class="nearby-error nb__error">
          <i class="fas fa-triangle-exclamation"></i> {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useNearbyBusAlerts } from "@/composables/useNearbyBusAlerts";

const MAX_VISIBLE = 4;

const lastUpdatedAt = ref(Date.now());

const {
  hasLocation,
  enableLocation,
  nearestBuses,
  fetchOnce,
  loading,
  error,
} = useNearbyBusAlerts({
  intervalMs: 1500,
  maxNearest: 6, // you can keep 4 if you only want to fetch 4; scroll matters only if list > 4
  nearKm: 1.0,
});

const locationEnabled = computed(() => hasLocation.value);

const lastUpdatedText = computed(() => {
  const s = Math.floor((Date.now() - lastUpdatedAt.value) / 1000);
  if (s < 10) return "just now";
  const m = Math.floor(s / 60);
  if (m < 1) return `${s}s ago`;
  return `${m} min${m > 1 ? "s" : ""} ago`;
});

// auto update "last updated" whenever the nearest list changes (polling updates this)
watch(
  () => nearestBuses.value,
  () => {
    if (locationEnabled.value) lastUpdatedAt.value = Date.now();
  },
  { deep: true }
);

// optional manual refresh
async function refreshOnce() {
  await fetchOnce();
  lastUpdatedAt.value = Date.now();
}

function pillClass(bus) {
  const cap = Number(bus.capacity || 0);
  const used = Number(bus.seats || 0);
  const avail = Math.max(0, cap - used);

  if (cap <= 0) return "pill-gray";
  if (avail <= 0) return "pill-red";
  if (avail <= 3) return "pill-yellow";
  return "pill-green";
}
function pillText(bus) {
  const cap = Number(bus.capacity || 0);
  const used = Number(bus.seats || 0);
  const avail = Math.max(0, cap - used);

  if (cap <= 0) return "—";
  if (avail <= 0) return "FULL";
  if (avail <= 3) return "LOW";
  return "AVAILABLE";
}
</script>

<style scoped>
/* keep your existing styles; add only NB upgrades */
.nb__head{
  display: flex;
  align-items: center;
  justify-content: space-between; /* makes them magkatapat */
  margin-bottom: 12px;
}

.nb__title{
  margin: 0;
}

.nb__updated{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  font-size: 12px;
  opacity: .9;
  white-space: nowrap;
}

.nb__updated i{
  color: var(--accent-teal);
}

/* CTA card */
.nb__ctaCard{
  position: relative;
  overflow: hidden;
}
.nb__ctaCard::before{
  content:"";
  position:absolute;
  inset:-40% -40%;
  background:
    radial-gradient(circle at 20% 20%, rgba(0,188,212,0.16) 0%, rgba(0,188,212,0) 55%),
    radial-gradient(circle at 80% 40%, rgba(30,136,229,0.12) 0%, rgba(30,136,229,0) 55%);
  pointer-events:none;
}
.nb__ctaIcon{
  width: 54px;
  height: 54px;
  margin: 0 auto 10px;
  border-radius: 16px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  background:
    radial-gradient(circle at 18% 12%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
  box-shadow: 0 14px 28px rgba(0,188,212,0.18);
  position: relative;
  z-index: 1;
}
.nb__ctaText{ position: relative; z-index: 1; }
.nb__ctaBtn{ position: relative; z-index: 1; }
.nb__ctaHint{
  margin-top: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-gray);
  opacity: .85;
  position: relative;
  z-index: 1;
}

/* ✅ Scroll wrapper so the page doesn't grow too tall */
.nb__itemsWrap{
  display:flex;
  flex-direction:column;
  gap: 10px;
}

/* default: no scroll */
.nb__items{
  display:flex;
  flex-direction:column;
  gap: 10px;
}

/* scroll only if more than MAX_VISIBLE */
.nb__items--scroll{
  max-height: 320px; /* ~4 cards height (adjust if your card height differs) */
  overflow: auto;
  padding-right: 6px; /* space for scrollbar */
  overscroll-behavior: contain;
  scroll-behavior: smooth;
}

/* nicer scrollbar (optional) */
.nb__items--scroll::-webkit-scrollbar{
  width: 10px;
}
.nb__items--scroll::-webkit-scrollbar-thumb{
  background: rgba(31,41,55,0.18);
  border-radius: 999px;
  border: 3px solid rgba(255,255,255,0.65);
}
.nb__items--scroll::-webkit-scrollbar-track{
  background: transparent;
}

/* items upgrades */
.nb__item{
  transition: transform .18s ease, box-shadow .25s ease, border-color .25s ease;
  box-shadow: 0 10px 22px rgba(31,41,55,0.06);
}
.nb__item:hover{
  border-color: rgba(0,188,212,0.35);
  box-shadow: 0 16px 34px rgba(0,188,212,0.12);
}
.nb__item:active{
  transform: scale(0.99);
}

.nb__badge{
  box-shadow: 0 10px 20px rgba(0,188,212,0.18);
}

.nb__pill{
  text-transform: uppercase;
}

/* empty state */
.nb__emptyIcon{
  width: 54px;
  height: 54px;
  border-radius: 16px;
  margin: 0 auto 10px;
  background: rgba(0,188,212,0.10);
  border: 2px solid rgba(0,188,212,0.18);
  display:flex;
  align-items:center;
  justify-content:center;
  color: var(--accent-teal);
}
.nb__emptyTitle{
  font-weight: 800;
  margin-bottom: 6px;
}
.nb__emptySub{
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-gray);
  opacity: .9;
}

/* skeleton */
.nb__skeleton{
  background: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 12px;
  padding: 14px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  overflow:hidden;
  position: relative;
}
.nb__skeleton::after{
  content:"";
  position:absolute;
  top:0; left:-60%;
  width:60%;
  height:100%;
  background: linear-gradient(90deg, transparent, rgba(31,41,55,0.06), transparent);
  animation: nbShimmer 1.15s infinite;
}
@keyframes nbShimmer{
  0%{ transform: translateX(0); }
  100%{ transform: translateX(220%); }
}
.nb__skLeft{ display:flex; gap:12px; align-items:flex-start; }
.nb__skBadge{
  width:44px; height:44px; border-radius: 12px;
  background: rgba(31,41,55,0.06);
}
.nb__skText{ display:flex; flex-direction:column; gap:8px; }
.nb__skRight{ display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
.nb__skLine{
  width: 140px;
  height: 10px;
  border-radius: 999px;
  background: rgba(31,41,55,0.06);
}
.nb__skLine--lg{ width: 190px; height: 12px; }
.nb__skLine--sm{ width: 90px; }
.nb__skPill{
  width: 82px; height: 24px; border-radius: 999px;
  background: rgba(31,41,55,0.06);
}

/* errors */
.nearby-error{
  margin-top: 10px;
  font-size: 12px;
  font-weight: 800;
  color: #b91c1c;
}
.nb__error i,
.nb__errorInline i{
  margin-right: 8px;
}
.nb__errorInline{
  margin-top: 12px;
}
.pill-gray{
  background: rgba(17,24,39,0.06);
  border: 1px solid var(--border-light);
  color: var(--text-gray);
}
</style>