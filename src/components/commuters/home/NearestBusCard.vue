  <template>
    <div class="section">
      <div class="section-head">
        <h3 class="section-title">Nearby Buses</h3>
        <small v-if="locationEnabled" class="section-subtitle">
          Updated just now
        </small>
      </div>

      <!-- Before location enabled -->
      <div v-if="!locationEnabled" class="bus-stop-card">
        <p class="bus-stop-info">Turn on location to see nearby buses</p>
        <button class="btn-location" @click="enableLocation">
          <i class="fas fa-location-dot"></i>
          Turn on Location Services
        </button>
      </div>

      <!-- After location enabled (demo list) -->
      <div v-else class="nearby-bus-list">
        <div v-for="bus in demoBuses" :key="bus.id" class="nearby-bus-item">
          <div class="bus-left">
            <div class="bus-badge">
              <i class="fas fa-bus"></i>
            </div>

            <div class="bus-meta">
              <p class="bus-route">
                {{ bus.route }}
                <span class="bus-distance">• {{ bus.km }} km away</span>
              </p>
              <p class="bus-desc">{{ bus.from }} → {{ bus.to }}</p>
            </div>
          </div>

          <div class="bus-right">
            <span class="pill" :class="pillClass(bus)">
              {{ pillText(bus) }}
            </span>
            <div class="seat-text">
              Seats: <b>{{ bus.seatsAvailable }}</b> / {{ bus.capacity }}
            </div>
          </div>
        </div>

        <button class="btn-location btn-refresh" @click="refreshDemo">
          <i class="fas fa-rotate"></i>
          Refresh
        </button>
      </div>
    </div>
  </template>

  <script setup>
  import { ref } from "vue"

  const locationEnabled = ref(false)

  const demoBuses = ref([
    {
      id: 1,
      route: "Bus 12",
      km: 0.4,
      seatsAvailable: 8,
      capacity: 30,
      from: "City Hall",
      to: "Terminal"
    },
    {
      id: 2,
      route: "Bus 5A",
      km: 1.2,
      seatsAvailable: 2,
      capacity: 28,
      from: "Mall",
      to: "University"
    },
    {
      id: 3,
      route: "Bus 3",
      km: 2.1,
      seatsAvailable: 0,
      capacity: 30,
      from: "Market",
      to: "Downtown"
    }
  ])

  const enableLocation = () => {
    // demo muna
    locationEnabled.value = true
  }

  // demo refresh (shuffle / randomize seats)
  const refreshDemo = () => {
    demoBuses.value = demoBuses.value.map((b) => {
      const seats = Math.max(0, Math.min(b.capacity, Math.floor(Math.random() * (b.capacity + 1))))
      return { ...b, seatsAvailable: seats }
    })
  }

  const pillClass = (bus) => {
    if (bus.seatsAvailable <= 0) return "pill-red"
    if (bus.seatsAvailable <= 3) return "pill-yellow"
    return "pill-green"
  }

  const pillText = (bus) => {
    if (bus.seatsAvailable <= 0) return "FULL"
    if (bus.seatsAvailable <= 3) return "LOW"
    return "AVAILABLE"
  }
  </script>
