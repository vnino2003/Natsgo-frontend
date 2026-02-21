<template>
  <div class="weather-widget">
    <div class="weather-temp">{{ temp }}</div>

    <div class="weather-details">
      <div class="temp-range">{{ min }}° / {{ max }}°</div>

      <div class="weather-condition">
        <i class="fas fa-cloud-rain"></i>
        <span>{{ condition }}</span>
      </div>

      <div class="weather-location">
        <i class="fas fa-map-pin"></i>
        {{ location }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  temp: { type: [String, Number], default: 12 },
  min: { type: [String, Number], default: 12 },
  max: { type: [String, Number], default: 13 },
  condition: { type: String, default: "Cloudy with occasional rain" },
  location: { type: String, default: "TPE" },
})
</script>
