<!-- src/pages/commuters/RoutesPage.vue
     ROUTES-ONLY page (NO STOPS).
     Layout inspired by your screenshot:
     - Top route chips (Calapan–Naujan etc.)
     - Big route map/image display (you will replace with your own PNG/JPG per route)
     - Bottom search sheet (search routes)
     - Optional “View full” to open image in new tab
-->
<template>
  <div class="rt-page">
    <!-- Top header -->
    <div class="rt-top">
      <div class="rt-topbar">
        <div class="rt-title">
          <div class="rt-title-icon">
            <i class="fas fa-route"></i>
          </div>
          <div>
            <div class="rt-title-main">Bus Routes</div>
            <div class="rt-title-sub">Select a route to preview the line map</div>
          </div>
        </div>

        <button class="rt-icon-btn" type="button" @click="toggleLegend" aria-label="Toggle legend">
          <i class="fas fa-circle-info"></i>
        </button>
      </div>

      <!-- chips -->
      <div class="rt-chip-row">
        <button
          v-for="r in filteredRoutes"
          :key="r.id"
          class="rt-chip"
          :class="{ active: activeRouteId === r.id }"
          type="button"
          @click="selectRoute(r.id)"
        >
          <span class="rt-chip-dot" :style="{ background: r.color }"></span>
          <span class="rt-chip-text">{{ r.name }}</span>
        </button>
      </div>
    </div>

    <!-- Map / Image -->
    <div class="rt-map-wrap">
      <Transition name="fade">
        <div v-if="showLegend" class="rt-legend">
          <div class="rt-legend-title">
            <i class="fas fa-layer-group"></i> Quick Guide
          </div>
          <div class="rt-legend-grid">
            <div class="rt-legend-item">
              <span class="rt-legend-pill" :style="{ background: activeRoute.color }"></span>
              <span>Selected route</span>
            </div>
            <div class="rt-legend-item">
              <span class="rt-legend-pill ghost"></span>
              <span>Route line (in your image)</span>
            </div>
          </div>
          <div class="rt-legend-tip">
            Tip: Replace <b>mapImage</b> with your own route image (PNG/JPG) placed in
            <b>/public/assets/routes/</b>.
          </div>
        </div>
      </Transition>

      <div class="rt-map">
        <!-- Route image -->
        <img
          class="rt-map-img"
          :src="activeRoute.mapImage"
          :alt="`${activeRoute.name} route map`"
          draggable="false"
        />

        <!-- Overlay badge (route label) -->
        <div class="rt-route-badge" :style="{ borderColor: activeRoute.color }">
          <span class="rt-route-dot" :style="{ background: activeRoute.color }"></span>
          <span class="rt-route-name">{{ activeRoute.name }}</span>
          <span class="rt-route-code">{{ activeRoute.code }}</span>
        </div>

        <!-- Floating actions -->
        <div class="rt-float-actions">
          <button class="rt-float-btn" type="button" @click="openFull(activeRoute.mapImage)">
            <i class="fas fa-up-right-from-square"></i>
            View full
          </button>

          <button class="rt-float-btn primary" type="button" @click="collapseSheetHard">
            <i class="fas fa-chevron-down"></i>
            Hide list
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Sheet: Search + list of routes -->
    <div class="rt-sheet" ref="sheetEl" :class="{ dragging: isDragging }" :style="sheetStyle">
      <div class="rt-sheet-handle" ref="sheetHandleEl" @pointerdown="onSheetPointerDown">
        <div class="rt-sheet-pill"></div>

        <div class="rt-search">
          <i class="fas fa-magnifying-glass"></i>
          <input
            v-model="query"
            class="rt-search-input"
            type="text"
            placeholder='Search route (e.g. "Calapan", "Naujan")'
            @pointerdown.stop
          />
          <button
            v-if="query"
            class="rt-search-clear"
            type="button"
            aria-label="Clear"
            @click.stop="query = ''"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="rt-sheet-meta">
          <div class="rt-meta-left">
            <span class="rt-meta-pill">
              <span class="rt-live-dot"></span> Routes
            </span>
            <span class="rt-meta-sub">Tap a route to preview</span>
          </div>

          <span class="rt-count">
            {{ filteredRoutes.length }}
          </span>
        </div>
      </div>

      <div class="rt-sheet-content" ref="sheetContentEl">
        <div class="rt-list">
          <button
            v-for="r in filteredRoutes"
            :key="r.id"
            class="rt-row"
            :class="{ selected: activeRouteId === r.id }"
            type="button"
            @click="selectRoute(r.id, true)"
          >
            <div class="rt-row-left">
              <span class="rt-row-dot" :style="{ background: r.color }"></span>
            </div>

            <div class="rt-row-main">
              <div class="rt-row-top">
                <div class="rt-row-title">{{ r.name }}</div>
                <span class="rt-tag">{{ r.code }}</span>
              </div>
              <div class="rt-row-sub">
                <i class="fas fa-map"></i>
                Route map preview available
              </div>
            </div>

            <div class="rt-row-right">
              <i class="fas fa-chevron-right"></i>
            </div>
          </button>

          <div v-if="filteredRoutes.length === 0" class="rt-empty">
            <i class="fas fa-route"></i>
            <p>No routes match “{{ query }}”.</p>
            <button class="rt-btn" type="button" @click="query = ''">Clear search</button>
          </div>
        </div>

        <div class="rt-sheet-foot">
          <i class="fas fa-lightbulb"></i>
          You can add more routes by adding objects to <b>ROUTES</b> in the script.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue"

/**
 * ✅ Replace mapImage with your own images:
 * Put your images inside: /public/assets/routes/
 * Example:
 *   mapImage: "/assets/routes/calapan-naujan.png"
 */
const ROUTES = [
  {
    id: "calapan-naujan",
    name: "Calapan – Naujan",
    code: "R01",
    color: "#1E88E5",
    mapImage:
      "https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=1500&auto=format&fit=crop",
  },
  {
    id: "calapan-victoria",
    name: "Calapan – Victoria",
    code: "R02",
    color: "#00BFA6",
    mapImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1500&auto=format&fit=crop",
  },
  {
    id: "calapan-puerto",
    name: "Calapan – Puerto Galera",
    code: "R03",
    color: "#FFB300",
    mapImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1500&auto=format&fit=crop",
  },
  {
    id: "calapan-baco",
    name: "Calapan – Baco",
    code: "R04",
    color: "#8E24AA",
    mapImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1500&auto=format&fit=crop",
  },
]

const routes = ref([...ROUTES])
const activeRouteId = ref(routes.value[0].id)
const query = ref("")
const showLegend = ref(false)

const activeRoute = computed(() => routes.value.find((r) => r.id === activeRouteId.value) || routes.value[0])

const filteredRoutes = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return routes.value
  return routes.value.filter((r) => {
    return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
  })
})

function toggleLegend() {
  showLegend.value = !showLegend.value
}

async function selectRoute(id, fromList = false) {
  activeRouteId.value = id

  // UX: when selecting from list, auto-collapse so user sees the map (like your request)
  if (fromList) {
    await nextTick()
    collapseSheet()
  } else {
    openSheet()
  }
}

function openFull(src) {
  // opens in a new tab (works for your local /public images too)
  window.open(src, "_blank", "noopener,noreferrer")
}

/* =============================
   Bottom Sheet (snap + drag)
   ============================= */
const sheetEl = ref(null)
const sheetHandleEl = ref(null)
const sheetContentEl = ref(null)

const isDragging = ref(false)
const sheetY = ref(0)
const sheetAnimating = ref(true)

let startY = 0
let startSheetY = 0
let lastY = 0
let lastT = 0
let velocity = 0
let raf = 0

function sheetHeightPx() {
  const el = sheetEl.value
  if (!el) return 0
  return el.getBoundingClientRect().height
}

function snapPoints() {
  const h = sheetHeightPx()
  const peek = 170
  const collapsed = Math.max(0, h - peek)
  const mid = Math.max(0, Math.round(h * 0.42))
  const expanded = 0
  return { expanded, mid, collapsed }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

const sheetStyle = computed(() => ({
  transform: `translate3d(0, ${sheetY.value}px, 0)`,
  transition: sheetAnimating.value ? "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
}))

function setSheetY(px) {
  const { expanded, collapsed } = snapPoints()
  sheetY.value = clamp(px, expanded, collapsed)
}

function nearestSnap(targetY) {
  const { expanded, mid, collapsed } = snapPoints()
  const points = [expanded, mid, collapsed]
  let best = points[0]
  let bestDist = Math.abs(targetY - best)
  for (const p of points) {
    const d = Math.abs(targetY - p)
    if (d < bestDist) {
      best = p
      bestDist = d
    }
  }
  return best
}

function snapTo(y) {
  sheetAnimating.value = true
  setSheetY(y)
  const { collapsed } = snapPoints()
  if (y >= collapsed - 2 && sheetContentEl.value) sheetContentEl.value.scrollTop = 0
}

function openSheet() {
  snapTo(snapPoints().expanded)
}

function collapseSheet() {
  // nicer “preview map” state
  snapTo(snapPoints().mid)
}

function collapseSheetHard() {
  snapTo(snapPoints().collapsed)
}

function onSheetPointerDown(e) {
  if (e.button != null && e.button !== 0) return

  isDragging.value = true
  sheetAnimating.value = false

  startY = e.clientY
  startSheetY = sheetY.value

  lastY = e.clientY
  lastT = performance.now()
  velocity = 0

  sheetEl.value?.setPointerCapture?.(e.pointerId)

  window.addEventListener("pointermove", onSheetPointerMove, { passive: false })
  window.addEventListener("pointerup", onSheetPointerUp, { passive: true })

  e.preventDefault()
}

function onSheetPointerMove(e) {
  if (!isDragging.value) return

  const now = performance.now()
  const dy = e.clientY - startY
  const next = startSheetY + dy

  const dt = now - lastT || 1
  const v = (e.clientY - lastY) / dt
  velocity = velocity * 0.7 + v * 0.3

  lastY = e.clientY
  lastT = now

  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => setSheetY(next))

  e.preventDefault()
}

function onSheetPointerUp() {
  if (!isDragging.value) return

  isDragging.value = false
  sheetAnimating.value = true

  const { expanded, collapsed } = snapPoints()
  const v = velocity
  const y = sheetY.value

  const flickDown = v > 0.6
  const flickUp = v < -0.6

  let target
  if (flickUp) target = expanded
  else if (flickDown) target = collapsed
  else target = nearestSnap(y)

  snapTo(target)

  window.removeEventListener("pointermove", onSheetPointerMove)
  window.removeEventListener("pointerup", onSheetPointerUp)
}

onMounted(async () => {
  await nextTick()
  collapseSheetHard()
  window.addEventListener("resize", collapseSheetHard, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener("resize", collapseSheetHard)
  window.removeEventListener("pointermove", onSheetPointerMove)
  window.removeEventListener("pointerup", onSheetPointerUp)
  cancelAnimationFrame(raf)
})
</script>

<style>
/* Route page — matches your commuter vibe via CSS variables. */
:root {
  --rt-bg: var(--light-bg, #f5f7fa);
  --rt-card: #fff;
  --rt-border: var(--border-light, rgba(209, 213, 219, 0.75));
  --rt-text: var(--text-dark, #111827);
  --rt-muted: var(--text-gray, rgba(31, 41, 55, 0.6));
  --rt-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  --rt-shadow-soft: 0 10px 26px rgba(0, 0, 0, 0.10);
}

.rt-page {
  position: relative;
  height: calc(100vh - var(--bottom-nav-h, 72px));
  background: var(--rt-bg);
  overflow: hidden;
}

/* top */
.rt-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  padding: 12px 12px 10px;
  z-index: 20;
  pointer-events: none;
}

.rt-topbar {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border: 2px solid var(--rt-border);
  border-radius: 18px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: var(--rt-shadow-soft);
  pointer-events: auto;
}

.rt-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.rt-title-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary-blue, #1e88e5) 0%, var(--accent-teal, #00bfa6) 100%);
  display: grid;
  place-items: center;
  color: #fff;
}

.rt-title-main {
  font-weight: 1000;
  color: var(--rt-text);
  font-size: 14px;
  line-height: 1.1;
}

.rt-title-sub {
  font-weight: 900;
  color: var(--rt-muted);
  font-size: 12px;
  margin-top: 2px;
}

.rt-icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 2px solid var(--rt-border);
  background: #fff;
  color: var(--rt-text);
  cursor: pointer;
}
.rt-icon-btn:active { transform: scale(0.96); }

/* chips */
.rt-chip-row {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  overflow: auto;
  padding-bottom: 4px;
  pointer-events: auto;
}
.rt-chip-row::-webkit-scrollbar { display: none; }

.rt-chip {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 2px solid var(--rt-border);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  font-weight: 1000;
  font-size: 12px;
  color: var(--rt-text);
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(0,0,0,0.06);
  white-space: nowrap;
}
.rt-chip:active { transform: scale(0.98); }
.rt-chip.active {
  border-color: rgba(30,136,229,0.35);
  box-shadow: 0 12px 24px rgba(30,136,229,0.14);
}

.rt-chip-dot { width: 10px; height: 10px; border-radius: 999px; }
.rt-chip-text { overflow: hidden; text-overflow: ellipsis; }

/* map image */
.rt-map-wrap {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.rt-map {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e3f2fd 0%, #e0f2f1 100%);
}

.rt-map-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
  filter: saturate(1.05) contrast(1.02);
}

/* route badge overlay */
.rt-route-badge {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 116px;
  z-index: 10;
  background: rgba(255,255,255,0.92);
  border: 2px solid var(--rt-border);
  border-left-width: 6px;
  border-radius: 18px;
  padding: 10px 12px;
  backdrop-filter: blur(10px);
  box-shadow: var(--rt-shadow-soft);
  display: flex;
  align-items: center;
  gap: 10px;
}
.rt-route-dot { width: 10px; height: 10px; border-radius: 999px; }
.rt-route-name {
  font-weight: 1000;
  color: var(--rt-text);
  font-size: 13px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rt-route-code {
  font-weight: 1000;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-teal, #00bfa6) 0%, #00838f 100%);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
}

/* floating actions on map */
.rt-float-actions {
  position: absolute;
  right: 12px;
  bottom: calc(12px + 190px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rt-float-btn {
  border: 2px solid var(--rt-border);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  color: var(--rt-text);
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 12px 22px rgba(0,0,0,0.10);
}
.rt-float-btn:active { transform: scale(0.98); }
.rt-float-btn.primary {
  border-color: rgba(0,131,143,0.25);
  color: var(--accent-teal, #00bfa6);
}

/* legend */
.rt-legend {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 172px;
  z-index: 12;
  background: rgba(255,255,255,0.92);
  border: 2px solid var(--rt-border);
  border-radius: 18px;
  padding: 10px 12px;
  backdrop-filter: blur(10px);
  box-shadow: var(--rt-shadow-soft);
}
.rt-legend-title {
  font-weight: 1000;
  color: var(--rt-text);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rt-legend-title i { color: var(--accent-teal, #00bfa6); }
.rt-legend-grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.rt-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  color: var(--rt-muted);
  font-size: 12px;
}
.rt-legend-pill { width: 18px; height: 10px; border-radius: 999px; }
.rt-legend-pill.ghost { background: rgba(17,24,39,0.15); }
.rt-legend-tip {
  margin-top: 8px;
  font-weight: 900;
  font-size: 12px;
  color: rgba(38,43,51,0.72);
  line-height: 1.35;
}

/* sheet */
.rt-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 74%;
  z-index: 30;
  padding: 0 12px calc(12px + env(safe-area-inset-bottom));
  will-change: transform;
}
.rt-sheet.dragging { transition: none !important; }

.rt-sheet-handle {
  background: rgba(255,255,255,0.94);
  border: 2px solid var(--rt-border);
  border-radius: 18px;
  padding: 10px 12px 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 -10px 30px rgba(0,0,0,0.12);
  touch-action: none;
  user-select: none;
}

.rt-sheet-pill {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: rgba(31,41,55,0.18);
  margin: 0 auto 10px;
}

.rt-search {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid var(--rt-border);
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
}
.rt-search i { color: var(--rt-muted); }
.rt-search-input {
  border: none;
  outline: none;
  width: 100%;
  font-weight: 1000;
  font-size: 13px;
  color: var(--rt-text);
  background: transparent;
}
.rt-search-clear {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--rt-muted);
  cursor: pointer;
}
.rt-search-clear:active { transform: scale(0.92); }

.rt-sheet-meta {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.rt-meta-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.rt-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 1000;
  font-size: 12px;
  color: var(--accent-teal, #00bfa6);
  border: 2px solid rgba(0,131,143,0.18);
  background: rgba(0,131,143,0.08);
}
.rt-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--accent-teal, #00bfa6);
  box-shadow: 0 0 0 0 rgba(0,131,143,0.35);
  animation: rtPulse 1.3s infinite;
}
@keyframes rtPulse {
  0% { box-shadow: 0 0 0 0 rgba(0,131,143,0.35); }
  70% { box-shadow: 0 0 0 10px rgba(0,131,143,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,131,143,0); }
}
.rt-meta-sub {
  font-weight: 900;
  font-size: 12px;
  color: var(--rt-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rt-count {
  font-weight: 1000;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-teal, #00bfa6) 0%, #00838f 100%);
  padding: 6px 10px;
  border-radius: 999px;
}

/* sheet content */
.rt-sheet-content {
  margin-top: 10px;
  background: rgba(255,255,255,0.94);
  border: 2px solid var(--rt-border);
  border-radius: 18px;
  backdrop-filter: blur(10px);
  box-shadow: 0 -10px 30px rgba(0,0,0,0.10);
  max-height: calc(74vh - 180px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.rt-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rt-row {
  width: 100%;
  text-align: left;
  background: #fff;
  border: 2px solid var(--rt-border);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}
.rt-row:active { transform: scale(0.99); }
.rt-row.selected {
  border-color: rgba(30,136,229,0.35);
  box-shadow: 0 14px 26px rgba(30,136,229,0.12);
}

.rt-row-left { padding-top: 6px; }
.rt-row-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
}

.rt-row-main { flex: 1; min-width: 0; }
.rt-row-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.rt-row-title {
  font-weight: 1000;
  color: var(--rt-text);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rt-tag {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 1000;
  color: rgba(38,43,51,0.78);
  border: 2px solid var(--rt-border);
  background: rgba(17,24,39,0.02);
}
.rt-row-sub {
  margin-top: 6px;
  font-weight: 900;
  color: var(--rt-muted);
  font-size: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.rt-row-sub i { color: rgba(0,131,143,0.95); }

.rt-row-right {
  color: rgba(156, 163, 175, 0.95);
  font-size: 18px;
  padding-top: 6px;
}

/* empty */
.rt-empty {
  padding: 20px 12px;
  border: 2px dashed var(--rt-border);
  border-radius: 18px;
  text-align: center;
  color: var(--rt-muted);
  font-weight: 1000;
}
.rt-empty i { font-size: 22px; margin-bottom: 8px; color: var(--accent-teal, #00bfa6); }

/* footer tip */
.rt-sheet-foot {
  margin: 10px 10px 12px;
  padding: 12px;
  border-radius: 16px;
  border: 2px dashed rgba(0, 131, 143, 0.22);
  background: rgba(0, 131, 143, 0.06);
  color: rgba(38,43,51,0.72);
  font-weight: 900;
  font-size: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.rt-sheet-foot i { margin-top: 2px; color: rgba(0,131,143,0.95); }

/* transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* mobile */
@media (max-width: 420px) {
  .rt-legend-grid { grid-template-columns: 1fr; }
  .rt-float-actions { bottom: calc(12px + 210px); }
}
</style>
