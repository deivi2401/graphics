<template>
  <div class="w-64">
    <ClientOnly>
      <ApexCharts class="ml-20 max-w-sm rounded-lg shadow dark:bg-gray-800 dark:border-gray-700" type="line" :options="chartOptions" :series="chartSeries" />
    </ClientOnly>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import jsonData from './assets/agosto AV.json';
const chartOptions = ref({
  chart: {
    title: {
      text: 'Entradas por Día',
      align: 'center'
    }
  },
  xaxis: {
    categories: [],
    labels: {
      format: 'dd/MM/yyyy'
    }
  },
  stroke: {
    curve: 'smooth' // Para líneas suavizadas
  },
  dataLabels: {
    enabled: false // Desactivar etiquetas sobre los puntos
  }
});

const chartSeries = ref([{
  name: 'Entradas',
  data: []
}]);

const processData = () => {
  const groupedData = jsonData.datos.reduce((acc, item) => {
    const date = item.fecha;
    const entradas = parseInt(item.entradas, 10);
    acc[date] = (acc[date] || 0) + entradas;
    return acc;
  }, {});

  chartOptions.value.xaxis.categories = Object.keys(groupedData);
  chartSeries.value[0].data = Object.values(groupedData);
};

// Procesar los datos al montar el componente
processData();
</script>
