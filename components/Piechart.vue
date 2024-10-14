<template>
  <div>
    <!-- Componente de gráfica de pie -->
    <VueApexCharts
      type="pie" 
      :options="chartOptions" 
      :series="chartSeries"
      width="576"
    />
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';
import { useDateStore } from '~/stores/dateStore.js';
import VueApexCharts from 'vue3-apexcharts';
import jsonData from '~/assets/agosto AV.json' 
import dayjs from 'dayjs';

const dateStore = useDateStore()

// Definir las props
const props = defineProps({
  /* dateRange: {
    type: Array,
    default: () => [null, null],
  }, */
  plazaId: {
    type: Array,
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
  legend: {
    show: false, // Oculta los labels al lado de la gráfica
  }, 
});

// Datos para el gráfico de pie
const chartSeries = ref([]); // Datos (sumas de entradas) para el gráfico

// Función para procesar los datos
const processData = () => {
  const dateStart = dateStore.selectedDateRange[0]
  const dateEnd = dateStore.selectedDateRange[1]

  if (!dateStart || !dateEnd || props.plazaId.length === 0) return;

  const dateFormatStart = dayjs(dateStart).format("YYYY-MM-DD");
  const dateFormatEnd = dayjs(dateEnd).format("YYYY-MM-DD");

  const filteredData = jsonData.datos.filter(item => {
    return (
      item.fecha >= dateFormatStart &&
      item.fecha <= dateFormatEnd &&
      props.plazaId.includes(item.plaza_id)
    );
  });

  const plazaSums = props.plazaId.reduce((acc, plazaId) => {
    acc[plazaId] = 0;
    return acc;
  }, {});

  filteredData.forEach(item => {
    plazaSums[item.plaza_id] += parseInt(item.entradas, 10);
  });

  chartOptions.value.labels = Object.keys(plazaSums).map(plazaId => `Plaza ${plazaId}`);
  chartSeries.value = Object.values(plazaSums);
  /* const [dateStart, dateEnd] = props.dateRange

  if (!dateStart || !dateEnd) return;

  // Formato de fechas para filtrar
  const dateFormatStart = dayjs(dateStart).format('YYYY-MM-DD');
  const dateFormatEnd = dayjs(dateEnd).format('YYYY-MM-DD');

  // Filtrar los datos según el rango de fechas
  const filteredData = jsonData.datos.filter(item => {
    return item.fecha >= dateFormatStart && item.fecha <= dateFormatEnd && props.plazaId.includes(item.plaza_id);
  });


  // Agrupar los datos por plaza y sumar las entradas
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.plaza_id]) {
      acc[item.plaza_id] = 0;
    }
    acc[item.plaza_id] += parseInt(item.entradas, 10); // Sumar las entradas por plaza
  
    return acc;
  }, {});

  // Actualizar las etiquetas (nombres de plazas) y los datos (sumas de entradas)
  chartOptions.value.labels = Object.keys(groupedData); // Plazas
  chartSeries.value = Object.values(groupedData); // Sumas de entradas por plaza */
};

// Vigilar el cambio de fechas para actualizar la gráfica de pie
watch([() => props.selectedPlazas, () => dateStore.selectedDateRange], processData, { immediate: true });

onMounted(() => {
  processData();
});

</script>

