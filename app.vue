<template>
  <div>
    <div class="m-6 rounded-lg shadow-lg max-w-64">
    <label for="plaza-select">Selecciona una plaza: </label>
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
      <label for="">Fecha de inicio:  </label>
      <DateSelect/>
      
    </div>
    
  
  </div>
  
</template>

<script setup>
import { ref } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import jsonData from './assets/agosto AV.json';
import { useDateStore } from './stores/dateStore.js';
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '~/app.vue'
import dayjs from 'dayjs'


const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

const dateStore = useDateStore()


const availablePlazas = [...new Set(jsonData.datos.map(item => item.plaza_id))]
const selectedPlazaId = ref(availablePlazas[0])
const dateStart = dateStore.selectedDateRange.start
const dateEnd = dateStore.selectedDateRange.end
const dateFormatStart = dayjs(dateStart).format('YYYY-MM-DD')
const dateFormatEnd = dayjs(dateEnd).format('YYYY-MM-DD')
const fecha1 = dayjs(dateFormatStart)
const fecha2 = dayjs(dateFormatEnd)
const diffInDays = fecha2.diff(fecha1, 'day')
console.log(diffInDays)


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
    range: diffInDays
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

    if(item.plaza_id == selectedPlazaId.value && item.fecha >= dateFormatStart && item.fecha <= dateFormatEnd){
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

watch(
  () => [dateStore.selectedDateRange.start, dateStore.selectedDateRange.end],
  () => {
    processData(); // Actualizar la gráfica cuando cambie el store
  },
  { immediate: true } // Ejecuta al iniciar
)
// Procesar los datos al montar el componente
processData();
</script>
