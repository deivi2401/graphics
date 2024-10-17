<template>
  <div>
    <div>
      <div class="m-6 rounded-lg shadow-lg max-w-64">
        <div class="grid grid-flow-row grid-rows-3">
          <input 
      type="checkbox" 
      id="selectAll"
      class="row-span-1"
      v-model="selectAllPlazas" 
      @change="toggleSelectAll"
    > Seleccionar todas las plazas 

    <!-- Checkbox para seleccionar plazas individuales -->
    <div v-for="plaza in availablePlazas" :key="plaza">
      <input 
        type="checkbox" 
        :value="plaza" 
        class="row-span-1"
        v-model="selectedPlazaIds" 
        :disabled="selectAllPlazas"
      /> {{ `Plaza ${plaza}` }}
    </div>

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
          :month-change-on-scroll="false"
          :enable-time-picker="false"
          @update:model-value="adjustWeekRange"
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
        <GraficaLinea
        :labels="chartLabels"
      :data="chartData"
      title="Entradas por Plaza"
        />
        
    </div>
    <div class="grid grid-flow-col col-span-12">
      <div class="col-span-6">

      </div class="m-10 col-span-6 max-w-[576px]">
      <ClientOnly >
        <Piechart :dateRange="selectedDate" :plazaId="selectedPlazaIds" />
      </ClientOnly>
      

    </div>
    
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import dayjs from 'dayjs';
import jsonData from "~/assets/agosto AV.json"; // Tu JSON de datos
import VueDatePicker from "@vuepic/vue-datepicker"; // Importar el DatePicker
import "@vuepic/vue-datepicker/dist/main.css";
import AdvancedFormat from 'dayjs/plugin/advancedFormat'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useDateStore } from '~/stores/dateStore.js';
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(AdvancedFormat)
dayjs.extend(weekOfYear);
dayjs.locale('es')
dayjs.extend(isoWeek)

const dateStore = useDateStore()

// Función para calcular el rango de fechas por defecto
const calculateDefaultDateRange = () => {
  const allDates = jsonData.datos.map((item) => item.fecha);
  const minDate = dayjs(Math.min(...allDates.map((date) => new Date(date).getTime()))).format("YYYY-MM-DD");
  const maxDate = dayjs(Math.max(...allDates.map((date) => new Date(date).getTime()))).format("YYYY-MM-DD");
  return [minDate, maxDate];
};

// Función para ajustar el rango de fechas seleccionado al inicio y final de la semana
const adjustWeekRange = (range) => {
  if (range.length === 2) {
    const startDate = dayjs(range[0]).startOf('week').toDate();  // Ajusta al inicio de la semana
    const endDate = dayjs(range[1]).endOf('week').toDate();      // Ajusta al final de la semana

    // Actualizar el rango seleccionado en la interfaz de usuario y la store
    selectedDate.value = [startDate, endDate];
    dateStore.updateDateRange([startDate, endDate]);
  }
};

// Función para generar meses entre dos fechas
const generateAllMonthsInRange = (start, end) => {
  let currentDate = dayjs(start).startOf('month');
  const endDate = dayjs(end).endOf('month');
  const allMonths = [];

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'month')) {
    allMonths.push(currentDate.format('YYYY-MM')); // Guardar los meses
    currentDate = currentDate.add(1, 'month');
  }

  return allMonths;
};

// Función para generar años entre dos fechas
const generateAllYearsInRange = (start, end) => {
  let currentDate = dayjs(start).startOf('year');
  const endDate = dayjs(end).endOf('year');
  const allYears = [];

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'year')) {
    allYears.push(currentDate.format('YYYY')); // Guardar los años
    currentDate = currentDate.add(1, 'year');
  }

  return allYears;
};

const generateAllWeeksInRange = (start, end) => {
  let currentWeek = dayjs(start).startOf('week');
  const endWeek = dayjs(end).endOf('week');
  const allWeeks = [];

  while (currentWeek.isBefore(endWeek) || currentWeek.isSame(endWeek, 'week')) {
    allWeeks.push(currentWeek.format('YYYY-WW'));
    currentWeek = currentWeek.add(1, 'week');
  }

  return allWeeks;
};

// Estado de plazas seleccionadas
const availablePlazas = [...new Set(jsonData.datos.map(item => item.plaza_id))];
const selectedPlazaIds = ref([]);
const selectAllPlazas = ref(false);

// Función para seleccionar/deseleccionar todas las plazas
const toggleSelectAll = () => {
  if (selectAllPlazas.value) {
    selectedPlazaIds.value = [...availablePlazas];
  } else {
    selectedPlazaIds.value = [];
  }
};

watch(selectedPlazaIds, (newVal) => {
  if (newVal.length === availablePlazas.length) {
    selectAllPlazas.value = true;
  } else {
    selectAllPlazas.value = false;
  }
});

// Configuración de datepicker
const pickerMode = ref("day");
const selectedDate = ref(dateStore.selectedDateRange)

const setPickerMode = (mode) => pickerMode.value = mode;

// Datos procesados que se pasarán al hijo
const chartLabels = ref([]);
const chartData = ref([]);

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

// Función para formatear la fecha según el modo seleccionado
const formatDateBasedOnPickerMode = (date) => {
  if (pickerMode.value === 'day') {
    return dayjs(date).format('DD-MM-YYYY'); // Formato para día
  } else if (pickerMode.value === 'month') {
    return dayjs(date).format('MM-YYYY'); // Formato para mes
  } else if (pickerMode.value === 'year') {
    return dayjs(date).format('YYYY'); // Formato para año
  } else if (pickerMode.value === 'week') {
    const weekNumber = dayjs(date).week();
    const year = dayjs(date).year();
    return `Semana ${weekNumber} del ${year}`; // Formato para semana
  }
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Función para procesar los datos
const processData = () => {
  const dateStart = dateStore.selectedDateRange[0];
  const dateEnd = dateStore.selectedDateRange[1];

  if (!dateStart || !dateEnd || selectedPlazaIds.value.length === 0) return;

  let allDates = [];
  let dateFormatStart, dateFormatEnd;

  // Dependiendo del pickerMode, genera las fechas
  if (pickerMode.value === 'day') {
    dateFormatStart = dayjs(dateStart).format("YYYY-MM-DD");
    dateFormatEnd = dayjs(dateEnd).format("YYYY-MM-DD");
    allDates = generateAllDatesInRange(dateFormatStart, dateFormatEnd);
  } else if (pickerMode.value === 'month') {
    dateFormatStart = dayjs(dateStart).startOf('month').format("YYYY-MM");
    dateFormatEnd = dayjs(dateEnd).endOf('month').format("YYYY-MM");
    allDates = generateAllMonthsInRange(dateFormatStart, dateFormatEnd);
  } else if (pickerMode.value === 'year') {
    dateFormatStart = dayjs(dateStart).startOf('year').format("YYYY");
    dateFormatEnd = dayjs(dateEnd).endOf('year').format("YYYY");
    allDates = generateAllYearsInRange(dateFormatStart, dateFormatEnd);
  } else if (pickerMode.value === 'week') {
    // Para la semana, obtenemos las semanas completas
    dateFormatStart = dayjs(dateStart).startOf('week').format("YYYY-WW");
    dateFormatEnd = dayjs(dateEnd).endOf('week').format("YYYY-WW");
    allDates = generateAllWeeksInRange(dateFormatStart, dateFormatEnd);
  }

  // Filtra los datos dentro del rango
  const filteredData = jsonData.datos.filter(item => {
    const itemDate = dayjs(item.fecha).format(
      pickerMode.value === 'day' ? 'YYYY-MM-DD' : 
      pickerMode.value === 'month' ? 'YYYY-MM' : 
      pickerMode.value === 'year' ? 'YYYY' : 
      'YYYY-WW'
    );
    return itemDate >= dateFormatStart && itemDate <= dateFormatEnd;
  });

  const plazaData = {};
  selectedPlazaIds.value.forEach(plazaId => {
    plazaData[plazaId] = {};
    allDates.forEach(date => {
      plazaData[plazaId][date] = 0;  // Inicializa con cero
    });
  });

  // Rellena los datos existentes
  filteredData.forEach(item => {
    const plaza = item.plaza_id;
    const date = dayjs(item.fecha).format(
      pickerMode.value === 'day' ? 'YYYY-MM-DD' : 
      pickerMode.value === 'month' ? 'YYYY-MM' : 
      pickerMode.value === 'year' ? 'YYYY' : 
      'YYYY-WW'
    );
    const entradas = parseInt(item.entradas, 10);
    if (selectedPlazaIds.value.includes(plaza)) {
      plazaData[plaza][date] += entradas;  // Sumar las entradas por fecha
    }
  });

  // Actualiza los labels de la gráfica
  chartLabels.value = allDates.map(date => formatDateBasedOnPickerMode(date));

  // Actualiza los datos de la gráfica
  chartData.value = selectedPlazaIds.value.map(plazaId => ({
    label: `Plaza ${plazaId}`,
    data: allDates.map(date => plazaData[plazaId][date]),
    borderColor: getRandomColor(),
    fill: false,
  }));
};



// Watch para procesar los datos al cambiar fechas, plazas o el modo de fecha
watch([selectedDate, selectedPlazaIds, pickerMode], processData, { immediate: true });
watch(selectedDate, (newRange) => {
  dateStore.updateDateRange(newRange); // Actualizar el rango de fechas en la store
}, { immediate: true });
watch(() => dateStore.selectedDateRange, processData, { immediate: true });

onMounted(() => {
  processData(); // Procesar datos al montar el componente
});

/* import { ref, watch, onMounted } from "vue";
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
const selectedPlazaIds = ref([0]); // Se pueden seleccionar múltiples plazas

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

// Función para formatear la fecha según el modo seleccionado
const formatDateBasedOnPickerMode = (date) => {
  if (pickerMode.value === 'day') {
    return dayjs(date).format('DD-MM-YYYY'); // Formato para día
  } else if (pickerMode.value === 'month') {
    return dayjs(date).format('MM-YYYY'); // Formato para mes
  } else if (pickerMode.value === 'week') {
    return `Semana ${dayjs(date).week()} del ${dayjs(date).year()}`; // Formato para semana
  }
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
      formatter: (val) => formatDateBasedOnPickerMode(val),
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

  // Actualiza las categorías y datos de la gráfica
  chartOptions.value.xaxis.categories = allDates.map(date => formatDateBasedOnPickerMode(date)); // *** Se utiliza el formateo al actualizar las categorías ***
  chartSeries.value = selectedPlazaIds.value.map(plazaId => ({
    name: `Plaza ${plazaId}`,
    data: allDates.map(date => plazaData[plazaId][date]),// Cambios: Mapear los datos por plaza y fecha
  }));

  // Manejar ceros en las gráficas para que empiecen en la misma fecha
  chartSeries.value.forEach(series => {
    const minVal = Math.min(...series.data);
    series.data = series.data.map(value => (value === 0 ? null : value)); // Cambios: Cambiar ceros por null
  });
};


// Configurar `watch` para actualizar la gráfica
watch([selectedDate, selectedPlazaIds, pickerMode], processData, { immediate: true });

onMounted(() => {
  chartOptions.value.markers.size = 0
  processData(); // Procesar datos en el montaje inicial
}); */
</script>
