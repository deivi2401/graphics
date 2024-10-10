<template>
  <div>
    <!-- Gráfica de líneas con Chart.js -->
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { computed, ref, watch } from "vue";

// *** Registra los componentes de Chart.js ***
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

// *** Props que se reciben del componente padre ***
const props = defineProps({
  labels: {
    type: Array,
    default: () => [],
  },
  datasets: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "Entradas por Día",
  }
});

// *** Configuración de opciones de la gráfica ***
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
    title: {
      display: true,
      text: props.title,
    },
  },
  scales: {
    x: {
      type: 'category',
      title: {
        display: true,
        text: 'Fechas',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Entradas',
      },
      beginAtZero: true,
    },
  },
});

// *** Estructura de los datos de la gráfica ***
const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets,
}));
</script>

<style scoped>
/* Opcional: Estilos para el componente */
</style>
