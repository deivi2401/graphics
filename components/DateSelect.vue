<script setup lang="ts">
import { sub, format, isSameDay, type Duration } from 'date-fns'
import { watch, ref } from 'vue'
import { useDateStore } from '~/stores/dateStore.js'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '~/app.vue'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

const dateStore = useDateStore()

const ranges = [
  { label: 'Ultimos 7 dias', duration: { days: 7 } },
  { label: 'Ultimos 14 dias', duration: { days: 14 } },
  { label: 'Ultimos 30 dias', duration: { days: 30 } },
  { label: 'Ultimos 3 meses', duration: { months: 3 } },
  { label: 'Ultimos 6 meses', duration: { months: 6 } },
  { label: 'Ultimo año', duration: { years: 1 } }
]
const selected = ref({ start: dateStore.selectedDateRange.start, end: dateStore.selectedDateRange.end })

function isRangeSelected (duration: Duration) {
  return isSameDay(selected.value.start, sub(new Date(), duration)) && isSameDay(selected.value.end, new Date())
}

function selectRange (duration: Duration) {
  selected.value = { start: sub(new Date(), duration), end: new Date() }
}

watch(selected,(newValue) => {
  dateStore.updateDateRange(newValue)
})
</script>

<template>
  <UPopover :popper="{ placement: 'bottom-start' }">
    <UButton color="blue" icon="i-heroicons-calendar-days-20-solid">
      {{ format(selected.start, 'd MMM, yyy') }} - {{ format(selected.end, 'd MMM, yyy') }}
    </UButton>

    <template #panel="{ close }">
      <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
        <div class="hidden sm:flex flex-col py-4">
          <UButton
            v-for="(range, index) in ranges"
            :key="index"
            :label="range.label"
            color="blue"
            variant="ghost"
            class="rounded-none px-6"
            :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
            truncate
            @click="selectRange(range.duration)"
          />
        </div>

        <DatePicker v-model="selected" @close="close" />
      </div>
    </template>
  </UPopover>
</template>

