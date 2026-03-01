<template>
  <div class="chartWrap" :style="{ height: height + 'px' }">
    <Line :data="data" :options="options" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler);

const props = defineProps({
  labels: { type: Array, required: true },
  dataset: { type: Object, required: true }, // { label, data, borderColor, backgroundColor }
  height: { type: Number, default: 300 },
});

const data = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      ...props.dataset,
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 4,
      borderWidth: 2.5,
    },
  ],
}));

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  interaction: { mode: "index", intersect: false },
  scales: {
    x: { grid: { display: false }, ticks: { font: { weight: "700" } } },
    y: { grid: { color: "rgba(148,163,184,.25)" }, ticks: { font: { weight: "700" } }, beginAtZero: true },
  },
}));
</script>

<style scoped>
.chartWrap { width: 100%; }
</style>