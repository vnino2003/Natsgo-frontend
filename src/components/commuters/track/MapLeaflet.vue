<template>
  <div ref="mapEl" class="nearby-map"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref, defineExpose } from 'vue'
import L from 'leaflet'

// Fix marker icons for Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const props = defineProps({
  user: { type: Object, default: null },
  buses: { type: Array, default: () => [] },
  selectedId: { type: String, default: null },
})

const emit = defineEmits(['select-bus'])

const mapEl = ref(null)
let map = null
let userMarker = null
const busMarkers = new Map()

function initMap(center) {
  map = L.map(mapEl.value, {
    zoomControl: false,
  }).setView([center.lat, center.lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)
}

function setUserMarker(pos) {
  if (!map) return

  if (!userMarker) {
    userMarker = L.circleMarker([pos.lat, pos.lng], {
      radius: 10,
      weight: 3,
      fillOpacity: 0.4,
    }).addTo(map)
  } else {
    userMarker.setLatLng([pos.lat, pos.lng])
  }
}

function syncBusMarkers(list) {
  if (!map) return

  const ids = new Set(list.map(b => b.id))

  for (const [id, marker] of busMarkers.entries()) {
    if (!ids.has(id)) {
      marker.remove()
      busMarkers.delete(id)
    }
  }

  list.forEach(b => {
    const pos = [b.lat, b.lng]
    if (!busMarkers.has(b.id)) {
      const m = L.marker(pos).addTo(map)
      m.on('click', () => emit('select-bus', b))
      busMarkers.set(b.id, m)
    } else {
      busMarkers.get(b.id).setLatLng(pos)
    }
  })
}

function flyTo(lat, lng, zoom = 16) {
  if (map) map.flyTo([lat, lng], zoom)
}

defineExpose({ flyTo })

onMounted(() => {
  if (props.user) {
    initMap(props.user)
    setUserMarker(props.user)
    syncBusMarkers(props.buses)
  }
})

watch(() => props.user, u => {
  if (!u) return
  if (!map) initMap(u)
  setUserMarker(u)
}, { deep: true })

watch(() => props.buses, list => {
  syncBusMarkers(list)
}, { deep: true })

onBeforeUnmount(() => {
  if (map) map.remove()
})
</script>
