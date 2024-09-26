import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDateStore = defineStore('dateStore', () => {
  // Estado reactivo que guarda la fecha seleccionada
  const selectedDateRange = ref({
    start: new Date(),
    end: new Date()
  })

  // Función para actualizar la fecha seleccionada
  function updateDateRange(newRange: { start: Date, end: Date }) {
    selectedDateRange.value = newRange
  }

  return { selectedDateRange, updateDateRange }
})
