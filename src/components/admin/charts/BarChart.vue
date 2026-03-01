<template>
  <div class="chartWrap" :style="{ height: height + 'px' }">
    <Bar :data="data" :options="options" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  labels: { type: Array, required: true },
  datasets: { type: Array, required: true }, // [{ label, data, backgroundColor, borderRadius }]
  height: { type: Number, default: 260 },
});

const data = computed(() => ({
  labels: props.labels,
  datasets: props.datasets,
}));

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "bottom" },
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