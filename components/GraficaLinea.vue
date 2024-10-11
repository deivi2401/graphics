<template>
  <canvas ref="lineChart"></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables); // Registrar todos los componentes de Chart.js

const props = defineProps({
  labels: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  }
});

const lineChart = ref(null);
let chartInstance = null;

// Función para crear la gráfica
const createChart = () => {
  // Destruir la instancia anterior si existe
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (!lineChart.value) return; // Asegurarse de que el elemento existe

  const ctx = lineChart.value.getContext('2d');
  
  // Crear una nueva instancia del gráfico
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: props.data
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fechas'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Entradas'
          },
          beginAtZero: true // Asegúrate de que el eje Y comience en cero
        }
      }
    }
  });
};

// Reaccionar a los cambios en las props para actualizar la gráfica
watch(() => [props.labels, props.data], createChart, { immediate: true });

onMounted(() => {
  createChart(); // Crear la gráfica cuando el componente se monta
});

// Limpieza al destruir el componente
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy(); // Destruir el gráfico al desmontar el componente
  }
});
</script>