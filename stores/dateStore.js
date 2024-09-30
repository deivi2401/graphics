import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDateStore = defineStore('dateStore', {
  // Definimos el estado con state
  state: () => ({
    selectedDateRange: {
      start: new Date(),
      end: new Date()
    }
  }),
  
  // Definimos las acciones
  actions: {
    updateDateRange(newRange) {
      this.selectedDateRange = newRange
    }
  },
  persist: {
    storage: persistedState.localStorage,
  }
})