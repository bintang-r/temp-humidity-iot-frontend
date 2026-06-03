<script setup>
import { computed } from 'vue'

const props = defineProps({
  tableData: { type: Array, default: () => [] }
})

const displayData = computed(() => [...props.tableData].reverse().slice(0, 50))

const tempClass = (t) => t >= 35 ? 'text-red-500' : t >= 30 ? 'text-orange-500' : 'text-brand-light'
const humClass = (h) => h >= 80 ? 'text-blue-500' : h >= 50 ? 'text-brand-light' : 'text-orange-400'
</script>

<template>
  <div class="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-4 md:mb-5">
      <div>
        <h3 class="text-gray-900 font-semibold text-base md:text-lg">Log Trafik Sensor</h3>
        <p class="text-[10px] md:text-xs text-gray-400 mt-0.5">{{ displayData.length }} data terbaru</p>
      </div>
      <span class="bg-gray-100 text-gray-500 text-[10px] md:text-xs font-medium px-2.5 py-1 md:px-3 md:py-1.5 rounded-full">
        {{ Math.min(displayData.length, 50) }} entri
      </span>
    </div>

    <div class="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
      <table class="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr class="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th class="pb-3 pr-3 font-medium">Perangkat</th>
            <th class="pb-3 pr-3 font-medium">Suhu</th>
            <th class="pb-3 pr-3 font-medium">Kelembaban</th>
            <th class="pb-3 pr-3 font-medium hidden sm:table-cell">Tren</th>
            <th class="pb-3 font-medium text-right">Waktu</th>
          </tr>
        </thead>
        <tbody class="text-sm divide-y divide-gray-50">
          <tr v-if="displayData.length === 0">
            <td colspan="5" class="py-12 md:py-16 text-center">
              <svg class="w-8 h-8 md:w-10 md:h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-gray-400 font-medium text-sm">Belum ada data diterima</p>
              <p class="text-gray-300 text-xs mt-1">Menunggu perangkat DHT11 mengirim data</p>
            </td>
          </tr>

          <tr
            v-for="(item, index) in displayData"
            :key="item.id"
            class="hover:bg-gray-50/70 transition-colors"
          >
            <td class="py-3 pr-3">
              <div class="flex items-center space-x-2">
                <div class="relative">
                  <div class="w-2 h-2 bg-brand-light rounded-full"></div>
                  <div v-if="index === 0" class="absolute inset-0 w-2 h-2 bg-brand-light rounded-full animate-ping opacity-60"></div>
                </div>
                <span class="font-semibold text-gray-900 text-xs md:text-sm">{{ item.node }}</span>
                <span v-if="index === 0" class="text-[8px] md:text-[9px] font-bold bg-brand-light text-white px-1.5 py-0.5 rounded-full uppercase">Baru</span>
              </div>
            </td>
            <td class="py-3 pr-3">
              <span class="font-bold text-sm md:text-base" :class="tempClass(item.temp)">{{ Number(item.temp).toFixed(1) }}</span>
              <span class="text-gray-400 text-[10px] ml-0.5">°C</span>
            </td>
            <td class="py-3 pr-3">
              <span class="font-bold text-sm md:text-base" :class="humClass(item.hum)">{{ Number(item.hum).toFixed(1) }}</span>
              <span class="text-gray-400 text-[10px] ml-0.5">%</span>
            </td>
            <td class="py-3 pr-3 hidden sm:table-cell">
              <svg class="w-14 h-4" viewBox="0 0 100 24" preserveAspectRatio="none">
                <polyline points="0,18 20,12 40,20 60,6 80,14 100,8" fill="none" stroke="#18A058" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </td>
            <td class="py-3 text-right">
              <span class="text-[10px] md:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">{{ item.time }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
