<template>
  <div>
    <!-- Componente de gráfica de pie -->
    <VueApexCharts
      type="pie" 
      width="576"
      :options="chartOptions" 
      :series="filteredData"
    />
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import jsonData from './assets/agosto AV.json'; // Asegúrate de que esta ruta es correcta
import dayjs from 'dayjs';

// Definir las props
const props = defineProps({
  dateRange: {
    type: Array,
    default: () => [null, null],
  },
  plazaId: {
    type: Number,
    required: true,
  },
});

// Opciones de la gráfica de pie
const chartOptions = ref({
  chart: {
    type: 'pie',
    title: {
      text: 'Entradas por Plaza por Día',
      align: 'center',
    },
  },
  labels: [], // Se llenará con las fechas
});

// Datos para el gráfico de pie
const pieChartData = ref([]);

// Función para procesar los datos según el rango de fechas
const processPieChartData = () => {
  const [dateStart, dateEnd] = props.dateRange;

  if (!dateStart || !dateEnd) return;

  const dateFormatStart = dayjs(dateStart).format('YYYY-MM-DD');
  const dateFormatEnd = dayjs(dateEnd).format('YYYY-MM-DD');

  const dailyData = {};

  // Filtrar los datos según el rango de fechas
  jsonData.datos.forEach((item) => {
    const fecha = item.fecha; // Asegúrate de que este formato sea correcto
    const plaza = item.plaza_id;
    const entradas = parseInt(item.entradas, 10);

    // Verificar si el plazaId coincide
    if (plaza === props.plazaId && fecha >= dateFormatStart && fecha <= dateFormatEnd) {
      // Crear una clave que combine la fecha y el id de la plaza
      const key = fecha; // Usamos solo la fecha como clave
      dailyData[key] = (dailyData[key] || 0) + entradas; // Acumular entradas por fecha
    }
  });

  // Preparar datos para el gráfico de pie
  const seriesData = Object.values(dailyData); // Total de entradas
  const labelsData = Object.keys(dailyData); // Obtener solo las fechas

  pieChartData.value = seriesData;
  chartOptions.value.labels = labelsData; // Las etiquetas serán las fechas

  // Para depurar, muestra los datos en consola
  console.log('Series Data:', seriesData);
  console.log('Labels Data:', labelsData);
};

// Computar y observar el rango de fechas para procesar los datos
watch(() => props.dateRange, processPieChartData, { immediate: true });
</script>

