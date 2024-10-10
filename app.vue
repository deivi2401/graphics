<template>
  <div>
    <div>
      <div class="m-6 rounded-lg shadow-lg max-w-64">
        <div class="grid grid-flow-row grid-rows-3">
                <!-- **[Nuevo] Botón para seleccionar todas las plazas** -->
      <button 
        :class="{ active: selectedPlazaIds.length === availablePlazas.length }"
        class="row-span-1"
        @click="togglePlazaSelection('all')"
      >
        Todas las Plazas
      </button>
      <button 
        v-for="plaza in availablePlazas" 
        :key="plaza" 
        :class="{ active: selectedPlazaIds.includes(plaza) }"
        class="row-span-1"
        @click="togglePlazaSelection(plaza)"
      >
        Plaza {{ plaza }}
      </button>


    </div>
      </div>
      <div class="inline-flex rounded-md shadow-sm" role="group">
        <button
          @click="setPickerMode('day')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          Dia
        </button>
        <button
          @click="setPickerMode('week')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          Semana
        </button>
        <button
          @click="setPickerMode('month')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          Mes
        </button>
        <button
          @click="setPickerMode('year')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        >
          Year
        </button>
      </div>
      <div class="flex my-6 mx-48 justify-end">
        <div v-if="pickerMode === 'day'">
          <VueDatePicker
          v-model="selectedDate"
          range
          multi-calendars
          :month-change-on-scroll="false"
          :enable-time-picker="false"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        </div>

        <div v-else-if="pickerMode === 'week'">
          <VueDatePicker
          v-model="selectedDate"
          range
          multi-calendars
          :week-picker="true"
          :month-change-on-scroll="false"
          :enable-time-picker="false"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>

        <div v-else-if="pickerMode === 'month'" >
          <VueDatePicker
          v-model="selectedDate"
          range
          :month-picker="true"
          :month-change-on-scroll="false"
          :enable-time-picker="false"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>
        
        <div v-else-if="pickerMode === 'year'">
          <VueDatePicker
          v-model="selectedDate"
          range
          :year-picker="true"
          :month-change-on-scroll="false"
          :enable-time-picker="false"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        </div>

      </div>
    </div>

    <div class="flex justify-center items-center">
      <ClientOnly class="">
        <VueApexCharts
          id="GrafLinea"
          class="rounded-xl shadow-xl max-w-5xl"
          width="1024"
          type="line"
          :options="chartOptions"
          :series="chartSeries"
        />
        
      </ClientOnly>
    </div>
    <div class="grid grid-flow-col col-span-12">
      <div class="col-span-6">

      </div class="m-10 col-span-6 max-w-[576px]">
      <ClientOnly >
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

// Modo del datepicker
const pickerMode = ref("day");

// Función para cambiar el modo del datepicker
const setPickerMode = (mode) => {
  pickerMode.value = mode;
};

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

// Obtener las plazas disponibles
const availablePlazas = [
  ...new Set(jsonData.datos.map((item) => item.plaza_id)),
];

// Múltiples plazas seleccionables
const selectedPlazaIds = ref([]); // Se pueden seleccionar múltiples plazas

// Función para generar todas las fechas entre dos fechas
const generateAllDatesInRange = (start, end) => {
  let currentDate = dayjs(start);
  const endDate = dayjs(end);
  const allDates = [];

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    allDates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'day');
  }

  return allDates;
};

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
    categories: [], // Fechas que serán generadas
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
const chartSeries = ref([]); // Series vacías inicialmente

// Función para procesar los datos y actualizar la gráfica
const processData = () => {
  const [dateStart, dateEnd] = selectedDate.value;

  if (!dateStart || !dateEnd || selectedPlazaIds.value.length === 0) return;

  const dateFormatStart = dayjs(dateStart).format("YYYY-MM-DD");
  const dateFormatEnd = dayjs(dateEnd).format("YYYY-MM-DD");

  // Generar todas las fechas dentro del rango seleccionado
  const allDates = generateAllDatesInRange(dateFormatStart, dateFormatEnd);

  // Filtrar los datos dentro del rango seleccionado
  const filteredData = jsonData.datos.filter(item => {
    return item.fecha >= dateFormatStart && item.fecha <= dateFormatEnd;
  });

  const plazaData = {};

  // Inicializar los datos con ceros para cada plaza
  selectedPlazaIds.value.forEach(plazaId => {
    plazaData[plazaId] = {};
    allDates.forEach(date => {
      plazaData[plazaId][date] = 0; // Cambios: Inicializa cada fecha con cero
    });
  });

  // Rellenar los datos existentes
  filteredData.forEach(item => {
    const plaza = item.plaza_id;
    const date = item.fecha;
    const entradas = parseInt(item.entradas, 10);

    if (selectedPlazaIds.value.includes(plaza)) {
      plazaData[plaza][date] += entradas; // Cambios: Sumar entradas por fecha
    }
  });

  // Actualizar los datos de las series
  chartOptions.value.xaxis.categories = allDates; // Fechas comunes
  chartSeries.value = selectedPlazaIds.value.map(plazaId => ({
    name: `Plaza ${plazaId}`,
    data: allDates.map(date => plazaData[plazaId][date]), // Cambios: Mapear los datos por plaza y fecha
  }));

  // Manejar ceros en las gráficas para que empiecen en la misma fecha
  chartSeries.value.forEach(series => {
    const minVal = Math.min(...series.data);
    series.data = series.data.map(value => (value === 0 ? null : value)); // Cambios: Cambiar ceros por null
  });
};

// Función para manejar la selección de plazas
const togglePlazaSelection = (plazaId) => {
  if (plazaId === "all") {
    // Seleccionar todas las plazas
    if (selectedPlazaIds.value.length === availablePlazas.length) {
      selectedPlazaIds.value = []; // Deseleccionar todas
    } else {
      selectedPlazaIds.value = [...availablePlazas]; // Seleccionar todas
    }
  } else {
    // Alternar la selección de una plaza individual
    if (selectedPlazaIds.value.includes(plazaId)) {
      selectedPlazaIds.value = selectedPlazaIds.value.filter(id => id !== plazaId);
    } else {
      selectedPlazaIds.value.push(plazaId);
    }
  }
};

// Configurar `watch` para actualizar la gráfica
watch([selectedDate, selectedPlazaIds], processData, { immediate: true });

onMounted(() => {
  chartOptions.value.markers.size = 0
  processData(); // Procesar datos en el montaje inicial
});
</script>
