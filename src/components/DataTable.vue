<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  tableData:   { type: Array,  default: () => [] },
  currentPage: { type: Number, default: 1 },
  totalPages:  { type: Number, default: 1 },
  total:       { type: Number, default: 0 },
  limit:       { type: Number, default: 10 },
  isLoading:   { type: Boolean, default: false }
})

const emit = defineEmits(['page-change'])

const tempClass = (t) => t >= 35 ? 'text-red-500' : t >= 30 ? 'text-orange-500' : 'text-brand-light'
const humClass  = (h) => h >= 80 ? 'text-blue-500' : h >= 50 ? 'text-brand-light' : 'text-orange-400'

const pageNumbers = () => {
  const pages = []
  const range = 2
  for (let i = 1; i <= props.totalPages; i++) {
    if (i === 1 || i === props.totalPages ||
        (i >= props.currentPage - range && i <= props.currentPage + range)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }
  return pages
}
</script>

<template>
  <div class="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 md:mb-5">
      <div>
        <h3 class="text-gray-900 font-semibold text-base md:text-lg">Log Trafik Sensor</h3>
        <p class="text-[10px] md:text-xs text-gray-400 mt-0.5">
          Menampilkan {{ tableData.length }} dari {{ total }} total data
        </p>
      </div>
      <span class="bg-gray-100 text-gray-500 text-[10px] md:text-xs font-medium px-2.5 py-1 md:px-3 md:py-1.5 rounded-full">
        {{ total }} entri
      </span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto overflow-y-auto max-h-[350px] -mx-4 md:mx-0 px-4 md:px-0">
      <table class="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr class="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th class="pb-3 pr-3 font-medium">#</th>
            <th class="pb-3 pr-3 font-medium">Perangkat</th>
            <th class="pb-3 pr-3 font-medium">Suhu</th>
            <th class="pb-3 pr-3 font-medium">Kelembaban</th>
            <th class="pb-3 pr-3 font-medium hidden sm:table-cell">Tren</th>
            <th class="pb-3 font-medium text-right">Waktu</th>
          </tr>
        </thead>
        <tbody class="text-sm divide-y divide-gray-50">

          <!-- Loading skeleton -->
          <tr v-if="isLoading" v-for="n in limit" :key="'skel-'+n">
            <td class="py-3 pr-3" colspan="6">
              <div class="h-4 bg-gray-100 rounded-full animate-pulse w-full"></div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="tableData.length === 0">
            <td colspan="6" class="py-12 md:py-16 text-center">
              <svg class="w-8 h-8 md:w-10 md:h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-gray-400 font-medium text-sm">Belum ada data diterima</p>
              <p class="text-gray-300 text-xs mt-1">Menunggu perangkat DHT11 mengirim data</p>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-else
            v-for="(item, index) in tableData"
            :key="item.id"
            class="hover:bg-gray-50/70 transition-colors"
          >
            <td class="py-3 pr-3 text-xs text-gray-300 font-mono">
              {{ (currentPage - 1) * limit + index + 1 }}
            </td>
            <td class="py-3 pr-3">
              <div class="flex items-center space-x-2">
                <div class="relative">
                  <div class="w-2 h-2 bg-brand-light rounded-full"></div>
                  <div v-if="currentPage === 1 && index === 0" class="absolute inset-0 w-2 h-2 bg-brand-light rounded-full animate-ping opacity-60"></div>
                </div>
                <span class="font-semibold text-gray-900 text-xs md:text-sm">{{ item.node }}</span>
                <span v-if="currentPage === 1 && index === 0" class="text-[8px] md:text-[9px] font-bold bg-brand-light text-white px-1.5 py-0.5 rounded-full uppercase">Baru</span>
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

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
      <!-- Info -->
      <p class="text-xs text-gray-400 hidden sm:block">
        Halaman <span class="font-semibold text-gray-600">{{ currentPage }}</span> dari
        <span class="font-semibold text-gray-600">{{ totalPages }}</span>
      </p>

      <!-- Buttons -->
      <div class="flex items-center gap-1 mx-auto sm:mx-0">
        <!-- Prev -->
        <button
          @click="emit('page-change', currentPage - 1)"
          :disabled="currentPage === 1"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-brand-light hover:text-brand-light disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>

        <!-- Page numbers -->
        <template v-for="p in pageNumbers()" :key="p">
          <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-gray-300 text-xs">···</span>
          <button
            v-else
            @click="emit('page-change', p)"
            :class="[
              'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition',
              p === currentPage
                ? 'bg-brand text-white shadow-sm shadow-brand/30'
                : 'border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-brand-light hover:text-brand-light'
            ]"
          >{{ p }}</button>
        </template>

        <!-- Next -->
        <button
          @click="emit('page-change', currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-brand-light hover:text-brand-light disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
