<template>
  <div>
    <div >
      <div class="m-6 rounded-lg shadow-lg max-w-64">
        <label for="plaza-select">Selecciona una plaza: </label>
        <select
          id="plaza-select"
          v-model="selectedPlazaId"
          @change="processData"
        >
          <option v-for="plaza in availablePlazas" :key="plaza" :value="plaza">
            Plaza {{ plaza }}
          </option>
        </select>
      </div>
      <div class="flex my-6 mx-48 justify-end ">
        <DateSelect />
      </div>
    </div>

    <div class="flex ml-36">
      <ClientOnly>
        <VueApexCharts
        id="GrafLinea"
          class="rounded-xl shadow-xl max-w-xl"
          width="576"
          type="line"
          :options="chartOptions"
          :series="chartSeries"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import jsonData from './assets/agosto AV.json';
import { useDateStore } from './stores/dateStore';
import dayjs from 'dayjs';
import { reactive } from 'vue';

// Obtener la store de fechas
const dateStore = useDateStore();

// Obtener las plazas disponibles
const availablePlazas = [...new Set(jsonData.datos.map((item) => item.plaza_id))];
const selectedPlazaId = ref(availablePlazas[0]);

// Función para procesar los datos y actualizar la gráfica
const processData = () => {
  const dateStart = dateStore.selectedDateRange.start;
  const dateEnd = dateStore.selectedDateRange.end;

  if (!dateStart || !dateEnd) return;

  const dateFormatStart = dayjs(dateStart).format('YYYY-MM-DD');
  const dateFormatEnd = dayjs(dateEnd).format('YYYY-MM-DD');

  const fecha1 = dayjs(dateFormatStart);
  const fecha2 = dayjs(dateFormatEnd);
  const diffInDays = fecha2.diff(fecha1, 'day');

  // Filtrar los datos según el rango de fechas
  const groupedData = jsonData.datos.reduce((acc, item) => {
    if (
      item.plaza_id == selectedPlazaId.value &&
      item.fecha >= dateFormatStart &&
      item.fecha <= dateFormatEnd
    ) {
      const dateString = item.fecha;
      const entradas = parseInt(item.entradas, 10);
      acc[dateString] = (acc[dateString] || 0) + entradas;
    }
    return acc;
  }, {});

  // Actualizar opciones de la gráfica
  chartOptions.value.xaxis.categories = Object.keys(groupedData);
  chartSeries.value[0].data = Object.values(groupedData);
  chartSeries.value[0].name = `Entradas Plaza ${selectedPlazaId.value}`;

  // Actualizar el rango de fechas
  chartOptions.value.xaxis.range = diffInDays;
};

// Configuración inicial de la gráfica
const chartOptions = ref({
  chart: {
    title: {
      text: 'Entradas por Día',
      align: 'center',
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        pan: true,
        reset: true,
      },
    },
  },
  xaxis: {
    categories: [],
    labels: {
      format: 'dd/MM/yyyy',
    },
  },
  stroke: {
    curve: 'smooth',
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 7,
    color: 'blue',
  },
});

// Serie de datos para la gráfica
const chartSeries = ref([
  {
    name: 'Entradas',
    data: [],
  },
]);

// Watch para actualizar la gráfica cuando cambie el rango de fechas
watch(
  () => dateStore.selectedDateRange,
  () => {
    processData(); // Llamamos a processData cada vez que cambia el rango de fechas
  },
  { deep: true }
);

// Montar la gráfica cuando se cargue el componente
onMounted(() => {
  processData(); // Llamada inicial a processData cuando el componente se monta
});
</script>

