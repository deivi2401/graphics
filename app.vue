<template>
  <div>
    <div>
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
      <div class="inline-flex rounded-md shadow-sm" role="group">
        <button
          @click="setSelectionMode('day')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          Dia
        </button>
        <button
          @click="setSelectionMode('week-picker')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          Semana
        </button>
        <button
          @click="setSelectionMode('month')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          Mes
        </button>
      </div>
      <div class="flex my-6 mx-48 justify-end">
        <VueDatePicker
          v-model="selectedDate"
          range
          week-picker
          multi-calendars
          :month-change-on-scroll="false"
          :enable-time-picker="false"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
        <Piechart :dateRange="selectedDate" :plazaId="selectedPlazaId" />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import VueDatePicker from "@vuepic/vue-datepicker"; // Importar el DatePicker
import "@vuepic/vue-datepicker/dist/main.css";
import jsonData from "./assets/agosto AV.json";
import dayjs from "dayjs";

// Función para calcular el rango de fechas por defecto
const calculateDefaultDateRange = () => {
  const allDates = jsonData.datos.map((item) => item.fecha);
  const minDate = dayjs(
    Math.min(...allDates.map((date) => new Date(date).getTime()))
  ).format("YYYY-MM-DD");
  const maxDate = dayjs(
    Math.max(...allDates.map((date) => new Date(date).getTime()))
  ).format("YYYY-MM-DD");
  return [minDate, maxDate];
};

// Variable reactiva para almacenar el rango de fechas seleccionado
const selectedDate = ref(calculateDefaultDateRange());

const selectionMode = ref('day')

// Función para actualizar el modo de selección
const setSelectionMode = (mode) => {
  selectionMode.value = mode;
};

// Obtener las plazas disponibles
const availablePlazas = [
  ...new Set(jsonData.datos.map((item) => item.plaza_id)),
];
const selectedPlazaId = ref(availablePlazas[0]);

// Opciones de la gráfica
const chartOptions = ref({
  chart: {
    title: {
      text: "Entradas por Día",
      align: "center",
    },
    toolbar: {
      show: true,
      tools: {
        download: false,
        pan: false,
        reset: true,
      },
    },
  },
  xaxis: {
    categories: [],
    labels: {
      formatter: (val) => dayjs(val).format("MM YYYY"),
    },
  },
  stroke: {
    curve: "smooth",
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 7,
    color: "blue",
  },
});

// Serie de datos para la gráfica
const chartSeries = ref([
  {
    name: "Entradas",
    data: [],
  },
]);

// Función para procesar los datos y actualizar la gráfica
const processData = () => {
  const [dateStart, dateEnd] = selectedDate.value;

  if (!dateStart || !dateEnd) return;

  const dateFormatStart = dayjs(dateStart).format("YYYY-MM-DD");
  const dateFormatEnd = dayjs(dateEnd).format("YYYY-MM-DD");

  const fecha1 = dayjs(dateFormatStart);
  const fecha2 = dayjs(dateFormatEnd);
  const diffInDays = fecha2.diff(fecha1, "day");

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

  // Actualizar categorías (eje X) y datos de la serie
  chartOptions.value.xaxis.categories = Object.keys(groupedData);
  chartSeries.value[0].data = Object.values(groupedData);
  chartSeries.value[0].name = `Entradas Plaza ${selectedPlazaId.value}`;

  // Actualizar el rango de fechas en la gráfica
  chartOptions.value.xaxis.range = diffInDays;
  chartOptions.value.markers.size = 7
};



// Cuando el componente se monta, se calcula el rango de fechas por defecto
onMounted(() => {
  // selectedDate.value = calculateDefaultDateRange();
  chartOptions.value.markers.size = 0;
});

// Configurar el `watch` para que llame a `processData` cuando cambie `selectedDate`
watch(selectedDate, processData);
</script>
