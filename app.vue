<template>
  <div>
    <div class="m-6">
    <label for="plaza-select">Selecciona una plaza:</label>
    <select id="plaza-select" v-model="selectedPlazaId" @change="processData">
      <option v-for="plaza in availablePlazas" :key="plaza" :value="plaza">
        Plaza {{ plaza }}
      </option>
    </select>
  </div>
  <div class="flex justify-center">
    <ClientOnly>
      <ApexCharts class=" rounded-lg shadow max-w-xl" width="576" type="line" :options="chartOptions" :series="chartSeries" />
    </ClientOnly>
  </div>
    <div class="flex justify-center py-4">
      <label for="">Fecha de inicio: </label>
      <DateSelect/>
      <p>Fecha seleccionada: {{ format(dateStore.selectedDateRange.start, 'd MMM, yyyy') }} - {{ format(dateStore.selectedDateRange.end, 'd MMM, yyyy') }}</p>
  
    </div>
    
  
  </div>
  
</template>

<script setup>
import { ref } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import jsonData from './assets/agosto AV.json';
import { format } from 'date-fns';
import { useDateStore } from './stores/dateStore.js';
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '~/app.vue'


const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

const dateStore = useDateStore()

const parseDate = (dateString) => new Date(dateString);

const availablePlazas = [...new Set(jsonData.datos.map(item => item.plaza_id))]
const selectedPlazaId = ref(availablePlazas[0])

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
    },
    // range: 7
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
    const date = parseDate(item.fecha)

    if(item.plaza_id == selectedPlazaId.value && date >= dateStore.selectedDateRange.start && date <= dateStore.selectedDateRange.end){
    const dateString = item.fecha;
    const entradas = parseInt(item.entradas, 10);
    acc[dateString] = (acc[dateString] || 0) + entradas;

    }

    return acc;
  }, {});

  chartOptions.value.xaxis.categories = Object.keys(groupedData);
  chartSeries.value[0].data = Object.values(groupedData);
  chartSeries.value[0].name = `Entradas Plaza ${selectedPlazaId.value}`
};

// Procesar los datos al montar el componente
processData();
</script>
