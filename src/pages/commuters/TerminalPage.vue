<!-- src/pages/commuters/TerminalPage.vue
     Simple + clean Terminal page (commuter-side)
     - Search terminal
     - Category chips (All / Main / Mini / Port etc.)
     - Terminal cards with: name, area, hours, notes
     - "Open in Maps" (Google Maps link)
     - Optional call button if you add phone
     Uses your existing CSS variables (primary-blue, accent-teal, border-light, text-dark, text-gray)
-->

<template>
  <div class="tm-page">
    <!-- Header -->
    <div class="tm-top">
      <div class="tm-header">
        <div class="tm-title">
          <div class="tm-icon">
            <i class="fas fa-building"></i>
          </div>
          <div class="tm-title-text">
            <div class="tm-title-main">Terminals</div>
            <div class="tm-title-sub">Find where to ride and where to wait</div>
          </div>
        </div>

        <button class="tm-icon-btn" type="button" @click="toggleTips" aria-label="Help">
          <i class="fas fa-circle-info"></i>
        </button>
      </div>

      <!-- Search -->
      <div class="tm-search">
        <i class="fas fa-magnifying-glass"></i>
        <input
          v-model="query"
          class="tm-search-input"
          type="text"
          placeholder='Search terminal (e.g., "Calapan", "Port")'
        />
        <button
          v-if="query"
          class="tm-clear"
          type="button"
          aria-label="Clear"
          @click="query = ''"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Filter chips -->
      <div class="tm-chips">
        <button
          v-for="c in categories"
          :key="c"
          class="tm-chip"
          :class="{ active: activeCategory === c }"
          type="button"
          @click="activeCategory = c"
        >
          {{ c }}
        </button>

        <span class="tm-count">{{ filtered.length }}</span>
      </div>

      <!-- Tips -->
      <Transition name="fade">
        <div v-if="showTips" class="tm-tips">
          <i class="fas fa-lightbulb"></i>
          Tap a terminal to open directions. You can edit terminals inside <b>TERMINALS</b> in the script.
        </div>
      </Transition>
    </div>

    <!-- List -->
    <div class="tm-list">
      <button
        v-for="t in filtered"
        :key="t.id"
        class="tm-card"
        type="button"
        @click="openMaps(t)"
      >
        <div class="tm-card-top">
          <div class="tm-card-main">
            <div class="tm-name">{{ t.name }}</div>
            <div class="tm-sub">
              <span class="tm-pill">
                <i class="fas fa-location-dot"></i>
                {{ t.area }}
              </span>

              <span class="tm-pill soft">
                <i class="fas fa-tag"></i>
                {{ t.type }}
              </span>
            </div>
          </div>

          <div class="tm-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <div class="tm-meta">
          <div class="tm-meta-item">
            <i class="fas fa-clock"></i>
            <span>{{ t.hours }}</span>
          </div>

          <div v-if="t.notes" class="tm-meta-item muted">
            <i class="fas fa-circle-info"></i>
            <span>{{ t.notes }}</span>
          </div>
        </div>

        <div class="tm-actions" @click.stop>
          <a class="tm-btn" :href="mapsUrl(t)" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-map"></i> Open in Maps
          </a>

          <a
            v-if="t.phone"
            class="tm-btn primary"
            :href="`tel:${t.phone}`"
            @click.stop
          >
            <i class="fas fa-phone"></i> Call
          </a>
        </div>
      </button>

      <div v-if="filtered.length === 0" class="tm-empty">
        <i class="fas fa-building"></i>
        <div class="tm-empty-title">No terminals found</div>
        <div class="tm-empty-sub">Try a different keyword or category.</div>
        <button class="tm-reset" type="button" @click="resetFilters">
          Reset
        </button>
      </div>

      <div style="height: 10px;"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"

/**
 * ✅ Replace these with YOUR real terminals (Mindoro / NATSCO etc.)
 * If you know the coordinates, add lat/lng to make maps open more accurate.
 */
const TERMINALS = [
  {
    id: "calapan-grand",
    name: "Calapan Grand Terminal",
    area: "Calapan City",
    type: "Main",
    hours: "5:00 AM – 9:00 PM",
    notes: "Modern PUV bays • Ticket/queue area",
    lat: 13.4117,
    lng: 121.1818,
    phone: "",
  },
  {
    id: "naujan-terminal",
    name: "Naujan Terminal",
    area: "Naujan",
    type: "Mini",
    hours: "6:00 AM – 7:00 PM",
    notes: "Near public market",
    lat: 13.3232,
    lng: 121.3033,
    phone: "",
  },
  {
    id: "victoria-terminal",
    name: "Victoria Terminal",
    area: "Victoria",
    type: "Mini",
    hours: "6:00 AM – 6:30 PM",
    notes: "Last trips earlier on Sundays",
    lat: 13.1775,
    lng: 121.2752,
    phone: "",
  },
  {
    id: "calapan-port",
    name: "Calapan Port Transport Bay",
    area: "Calapan Port",
    type: "Port",
    hours: "Open 24 hours",
    notes: "Good for arrivals • Ask guard for bay number",
    lat: 13.4147,
    lng: 121.1917,
    phone: "",
  },
]

const terminals = ref([...TERMINALS])
const query = ref("")
const activeCategory = ref("All")
const showTips = ref(false)

const categories = computed(() => {
  const unique = new Set(terminals.value.map((t) => t.type))
  return ["All", ...Array.from(unique)]
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return terminals.value.filter((t) => {
    const catOk = activeCategory.value === "All" || t.type === activeCategory.value
    if (!catOk) return false
    if (!q) return true
    return (
      t.name.toLowerCase().includes(q) ||
      t.area.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    )
  })
})

function toggleTips() {
  showTips.value = !showTips.value
}

function resetFilters() {
  query.value = ""
  activeCategory.value = "All"
  showTips.value = false
}

function mapsUrl(t) {
  // If lat/lng exists, use it. Otherwise fallback to text query.
  if (typeof t.lat === "number" && typeof t.lng === "number") {
    return `https://www.google.com/maps?q=${t.lat},${t.lng}`
  }
  const text = encodeURIComponent(`${t.name}, ${t.area}`)
  return `https://www.google.com/maps/search/?api=1&query=${text}`
}

function openMaps(t) {
  window.open(mapsUrl(t), "_blank", "noopener,noreferrer")
}
</script>

<style scoped>
.tm-page {
  height: calc(100vh - var(--bottom-nav-h, 72px));
  background: var(--light-bg, #f5f7fa);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Top area */
.tm-top {
  padding: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(
    to bottom,
    rgba(245, 247, 250, 0.95),
    rgba(245, 247, 250, 0.75)
  );
  backdrop-filter: blur(10px);
}

/* header */
.tm-header {
  background: rgba(255, 255, 255, 0.92);
  border: 2px solid var(--border-light, rgba(209, 213, 219, 0.75));
  border-radius: 18px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.10);
}

.tm-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.tm-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    var(--primary-blue, #1e88e5) 0%,
    var(--accent-teal, #00bfa6) 100%
  );
  color: #fff;
  display: grid;
  place-items: center;
}

.tm-title-main {
  font-weight: 1000;
  font-size: 14px;
  color: var(--text-dark, #111827);
  line-height: 1.1;
}

.tm-title-sub {
  font-weight: 900;
  font-size: 12px;
  color: var(--text-gray, rgba(31, 41, 55, 0.60));
  margin-top: 2px;
}

.tm-icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 2px solid var(--border-light, rgba(209, 213, 219, 0.75));
  background: #fff;
  color: var(--text-dark, #111827);
  cursor: pointer;
}
.tm-icon-btn:active {
  transform: scale(0.96);
}

/* search */
.tm-search {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.92);
  border: 2px solid var(--border-light, rgba(209, 213, 219, 0.75));
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}
.tm-search i {
  color: var(--text-gray, rgba(31, 41, 55, 0.60));
}
.tm-search-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-weight: 1000;
  font-size: 13px;
  color: var(--text-dark, #111827);
}
.tm-clear {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--text-gray, rgba(31, 41, 55, 0.60));
  cursor: pointer;
}
.tm-clear:active {
  transform: scale(0.92);
}

/* chips */
.tm-chips {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  overflow-x: auto;
  padding-bottom: 2px;
}
.tm-chips::-webkit-scrollbar {
  display: none;
}

.tm-chip {
  flex: 0 0 auto;
  border: 2px solid var(--border-light, rgba(209, 213, 219, 0.75));
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 9px 12px;
  font-weight: 1000;
  font-size: 12px;
  color: var(--text-dark, #111827);
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
}
.tm-chip:active {
  transform: scale(0.98);
}
.tm-chip.active {
  border-color: rgba(0, 131, 143, 0.28);
  color: var(--accent-teal, #00bfa6);
  box-shadow: 0 14px 26px rgba(0, 131, 143, 0.12);
}

.tm-count {
  margin-left: auto;
  flex: 0 0 auto;
  font-weight: 1000;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-teal, #00bfa6) 0%, #00838f 100%);
  border-radius: 999px;
  padding: 6px 10px;
}

/* tips */
.tm-tips {
  margin-top: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 2px dashed rgba(0, 131, 143, 0.22);
  background: rgba(0, 131, 143, 0.06);
  color: rgba(38, 43, 51, 0.75);
  font-weight: 900;
  font-size: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.tm-tips i {
  margin-top: 2px;
  color: rgba(0, 131, 143, 0.95);
}

/* list */
.tm-list {
  padding: 0 12px 12px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* card button */
.tm-card {
  width: 100%;
  text-align: left;
  border: 2px solid var(--border-light, rgba(209, 213, 219, 0.75));
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.10);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
  margin-top: 10px;
}
.tm-card:active {
  transform: scale(0.99);
}
.tm-card:hover {
  border-color: rgba(30, 136, 229, 0.22);
}

/* top row */
.tm-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.tm-name {
  font-weight: 1000;
  font-size: 14px;
  color: rgba(38, 43, 51, 0.92);
}

.tm-sub {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tm-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  border: 2px solid var(--border-light, rgba(209, 213, 219, 0.75));
  background: rgba(17, 24, 39, 0.02);
  color: rgba(38, 43, 51, 0.78);
  font-weight: 1000;
  font-size: 12px;
}
.tm-pill.soft {
  border-color: rgba(0, 131, 143, 0.18);
  background: rgba(0, 131, 143, 0.06);
}

.tm-arrow {
  color: rgba(156, 163, 175, 0.95);
  font-size: 18px;
  padding-top: 4px;
}

/* meta */
.tm-meta {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}
.tm-meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 12px;
  color: rgba(38, 43, 51, 0.72);
}
.tm-meta-item i {
  color: rgba(0, 131, 143, 0.95);
}
.tm-meta-item.muted i {
  color: rgba(31, 41, 55, 0.55);
}
.tm-meta-item.muted {
  color: rgba(31, 41, 55, 0.60);
}

/* actions */
.tm-actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tm-btn {
  text-decoration: none;
  border: 2px solid var(--border-light, rgba(209, 213, 219, 0.75));
  background: #fff;
  color: rgba(38, 43, 51, 0.92);
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.tm-btn:active {
  transform: scale(0.98);
}
.tm-btn.primary {
  border-color: rgba(0, 131, 143, 0.22);
  color: var(--accent-teal, #00bfa6);
}

/* empty */
.tm-empty {
  margin-top: 12px;
  border: 2px dashed var(--border-light, rgba(209, 213, 219, 0.75));
  border-radius: 18px;
  padding: 22px 14px;
  text-align: center;
  color: rgba(31, 41, 55, 0.60);
  font-weight: 1000;
  background: rgba(255, 255, 255, 0.7);
}
.tm-empty i {
  font-size: 22px;
  margin-bottom: 10px;
  color: var(--accent-teal, #00bfa6);
}
.tm-empty-title {
  font-size: 14px;
  color: rgba(38, 43, 51, 0.92);
}
.tm-empty-sub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 900;
}
.tm-reset {
  margin-top: 12px;
  border: 2px solid rgba(0, 131, 143, 0.22);
  background: rgba(0, 131, 143, 0.08);
  color: rgba(0, 131, 143, 0.98);
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1000;
  cursor: pointer;
}
.tm-reset:active {
  transform: scale(0.98);
}

/* transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
