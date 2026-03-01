<template>
  <div class="donutWrap">
    <Doughnut :data="data" :options="options" />
    <div class="donutMid">
      <div class="donutMid__t">{{ centerTitle }}</div>
      <div class="donutMid__v">{{ centerValue }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true },
  colors: { type: Array, default: () => ["#4f46e5", "#06b6d4", "#f59e0b", "#94a3b8"] },
  centerTitle: { type: String, default: "Total" },
  centerValue: { type: String, default: "—" },
  height: { type: Number, default: 240 },
});

const data = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.values,
      backgroundColor: props.colors,
      borderWidth: 0,
      hoverOffset: 6,
      cutout: "72%",
    },
  ],
}));

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
    tooltip: { enabled: true },
  },
}));
</script>

<style scoped>
.donutWrap{
  position:relative;
  width:100%;
  height: v-bind(height + 'px');
}
.donutMid{
  position:absolute;
  inset:0;
  display:grid;
  place-items:center;
  pointer-events:none;
}
.donutMid__t{
  font-size:12px;
  font-weight:900;
  color:#64748b;
  margin-top:10px;
}
.donutMid__v{
  font-size:22px;
  font-weight:1200;
  color:#0f172a;
  margin-top:-6px;
}
</style>