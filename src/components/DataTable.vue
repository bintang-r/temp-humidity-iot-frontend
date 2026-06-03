<script setup>
import { computed } from 'vue'

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  }
})

// Display newest first (data comes oldest-first from store)
const displayData = computed(() => [...props.tableData].reverse().slice(0, 50))

const tempClass = (temp) => {
  if (temp >= 35) return 'text-red-500'
  if (temp >= 30) return 'text-orange-500'
  return 'text-brand-light'
}

const humClass = (hum) => {
  if (hum >= 80) return 'text-blue-500'
  if (hum >= 50) return 'text-brand-light'
  return 'text-orange-400'
}
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-gray-900 font-semibold text-lg">Sensor Traffic Log</h3>
        <p class="text-xs text-gray-400 mt-0.5">{{ displayData.length }} most recent readings</p>
      </div>
      <span class="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full">
        Latest {{ Math.min(displayData.length, 50) }} entries
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th class="pb-3 pr-4 font-medium">Device</th>
            <th class="pb-3 pr-4 font-medium">Temp (°C)</th>
            <th class="pb-3 pr-4 font-medium">Hum (%)</th>
            <th class="pb-3 pr-4 font-medium">Trend</th>
            <th class="pb-3 font-medium text-right">Time</th>
          </tr>
        </thead>
        <tbody class="text-sm divide-y divide-gray-50">
          <!-- Empty state -->
          <tr v-if="displayData.length === 0">
            <td colspan="5" class="py-16 text-center">
              <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-gray-400 font-medium">No data received yet</p>
              <p class="text-gray-300 text-xs mt-1">Waiting for your DHT11 device to send data</p>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-for="(item, index) in displayData"
            :key="item.id"
            class="hover:bg-gray-50/70 transition-colors group"
            :class="{ 'opacity-60': index > 0 && index % 2 === 0 }"
          >
            <!-- Device name -->
            <td class="py-3.5 pr-4">
              <div class="flex items-center space-x-2.5">
                <div class="relative">
                  <div class="w-2 h-2 bg-brand-light rounded-full"></div>
                  <div v-if="index === 0" class="absolute inset-0 w-2 h-2 bg-brand-light rounded-full animate-ping opacity-60"></div>
                </div>
                <span class="font-semibold text-gray-900">{{ item.node }}</span>
                <span v-if="index === 0" class="text-[9px] font-bold bg-brand-light text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">New</span>
              </div>
            </td>

            <!-- Temperature -->
            <td class="py-3.5 pr-4">
              <span class="font-bold text-base" :class="tempClass(item.temp)">
                {{ Number(item.temp).toFixed(1) }}
              </span>
              <span class="text-gray-400 text-xs ml-0.5">°C</span>
            </td>

            <!-- Humidity -->
            <td class="py-3.5 pr-4">
              <span class="font-bold text-base" :class="humClass(item.hum)">
                {{ Number(item.hum).toFixed(1) }}
              </span>
              <span class="text-gray-400 text-xs ml-0.5">%</span>
            </td>

            <!-- Mini sparkline -->
            <td class="py-3.5 pr-4">
              <svg class="w-16 h-5" viewBox="0 0 100 24" preserveAspectRatio="none">
                <polyline
                  points="0,18 20,12 40,20 60,6 80,14 100,8"
                  fill="none"
                  stroke="#18A058"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </td>

            <!-- Time -->
            <td class="py-3.5 text-right">
              <span class="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {{ item.time }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
