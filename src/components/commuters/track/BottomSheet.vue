<template>
  <div class="tb-sheet" :class="{ open: open }" ref="sheetEl">
    <div
      class="tb-sheet-handle"
      ref="sheetHandleEl"
      @click="toggleSheet"
      @pointerdown.prevent="onSheetDown"
    >
      <div class="tb-sheet-pill"></div>
      <div class="tb-sheet-title-row">
        <h3 class="tb-sheet-title">Nearby Buses</h3>
        <span class="tb-sheet-count">{{ buses.length }}</span>
      </div>
    </div>

    <div class="tb-sheet-content" ref="sheetContentEl">
      <div class="tb-sheet-list">
        <div
          v-for="bus in buses"
          :key="bus.id"
          class="tb-bus-row"
          @click="selectBus(bus)"
        >
          <div class="tb-bus-badge">{{ bus.trackNo }}</div>

          <div class="tb-bus-row-main">
            <p class="tb-bus-row-title">{{ bus.route }}</p>
            <p class="tb-bus-row-sub">
              {{ formatKm(bus._km) }} away • ID {{ bus.id }}
            </p>
          </div>

          <div class="tb-bus-row-right"><i class="fas fa-chevron-right"></i></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDistance } from '../composables/useDistance'

const props = defineProps({
  open: Boolean,
  buses: Array,
})

const emit = defineEmits(['update:open', 'selectBus'])

// For distance formatting
const currentPos = ref({ lat: 14.5995, lng: 120.9842 })
const { formatKm } = useDistance(currentPos)

const sheetEl = ref(null)
const sheetHandleEl = ref(null)
const sheetContentEl = ref(null)
const dragging = ref(false)

let startY = 0
let startTranslate = 0

function collapsedTranslatePx() {
  const el = sheetEl.value
  if (!el) return 0
  const h = el.getBoundingClientRect().height
  return Math.max(0, h - 120)
}

function setSheetTranslatePx(px) {
  const el = sheetEl.value
  if (!el) return
  el.style.transition = 'none'
  el.style.transform = `translateY(${px}px)`
}

function snapSheet(shouldOpen) {
  const el = sheetEl.value
  if (!el) return
  el.style.transition = ''
  emit('update:open', shouldOpen)
  el.style.transform = ''
}

function toggleSheet() {
  emit('update:open', !props.open)
}

function selectBus(bus) {
  emit('selectBus', bus)
}

function onSheetDown(e) {
  dragging.value = true
  startY = e.clientY
  startTranslate = props.open ? 0 : collapsedTranslatePx()

  window.addEventListener('pointermove', onSheetMove, { passive: false })
  window.addEventListener('pointerup', onSheetUp, { passive: false })
}

function onSheetMove(e) {
  if (!dragging.value) return

  const dy = e.clientY - startY
  const collapsed = collapsedTranslatePx()
  let next = startTranslate + dy
  next = Math.max(0, Math.min(collapsed, next))
  setSheetTranslatePx(next)
}

function onSheetUp() {
  if (!dragging.value) return
  dragging.value = false

  const el = sheetEl.value
  const collapsed = collapsedTranslatePx()

  const m = (el?.style.transform || '').match(/translateY\(([-\d.]+)px\)/)
  const current = m ? parseFloat(m[1]) : props.open ? 0 : collapsed

  const shouldOpen = current < collapsed * 0.5
  snapSheet(shouldOpen)

  if (!shouldOpen && sheetContentEl.value) {
    sheetContentEl.value.scrollTop = 0
  }

  window.removeEventListener('pointermove', onSheetMove)
  window.removeEventListener('pointerup', onSheetUp)
}
</script>

<style scoped>
.tb-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 70%;
  transform: translateY(calc(70% - 120px));
  transition: transform 0.22s ease;
  z-index: 30;

  pointer-events: none;
  padding: 0 12px 12px;
}

.tb-sheet.open {
  transform: translateY(0);
}

.tb-sheet-handle {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light, #e5e7eb);
  border-radius: 18px;
  padding: 10px 14px 12px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.12);
  user-select: none;
  cursor: pointer;
}

.tb-sheet-pill {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: rgba(31, 41, 55, 0.18);
  margin: 0 auto 10px;
}

.tb-sheet-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tb-sheet-title {
  font-size: 15px;
  font-weight: 800;
  margin: 0;
  color: var(--text-dark, #1f2937);
}

.tb-sheet-count {
  font-size: 12px;
  font-weight: 800;
  color: white;
  background: linear-gradient(
    135deg,
    var(--accent-teal, #00bcd4) 0%,
    #00838f 100%
  );
  padding: 6px 10px;
  border-radius: 999px;
}

.tb-sheet-content {
  pointer-events: auto;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-light, #e5e7eb);
  border-radius: 18px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
  max-height: calc(70vh - 90px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.tb-sheet-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tb-bus-row {
  background: white;
  border: 2px solid var(--border-light, #e5e7eb);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: transform 0.15s;
}

.tb-bus-row:active {
  transform: scale(0.99);
}

.tb-bus-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    var(--primary-blue, #1e88e5) 0%,
    var(--accent-teal, #00bcd4) 100%
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  flex-shrink: 0;
}

.tb-bus-row-main {
  flex: 1;
  min-width: 0;
}

.tb-bus-row-title {
  font-weight: 800;
  margin: 0;
  font-size: 14px;
  color: var(--text-dark, #1f2937);
}

.tb-bus-row-sub {
  margin: 3px 0 0 0;
  font-size: 12px;
  color: var(--text-gray, #6b7280);
}

.tb-bus-row-right {
  color: var(--border-light, #e5e7eb);
  font-size: 18px;
  flex-shrink: 0;
}
</style>
