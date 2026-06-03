<script setup>
defineProps({
  temperature: { type: [Number, String], default: '--' },
  humidity: { type: [Number, String], default: '--' },
  devices: { type: Number, default: 0 }
})

const fmt = (val) => typeof val === 'number' ? val.toFixed(2) : val
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">

    <!-- Kartu Gelap — Suhu -->
    <div class="col-span-2 md:col-span-1 bg-brand rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-md text-white relative overflow-hidden flex flex-col justify-between min-h-[130px] md:min-h-[150px]">
      <div class="z-10 relative">
        <h3 class="text-brand-accent font-medium text-xs md:text-sm mb-1 md:mb-2">Suhu Saat Ini</h3>
        <div class="flex items-baseline space-x-1">
          <span class="text-3xl md:text-4xl font-bold tracking-tight">{{ fmt(temperature) }}</span>
          <span class="text-lg md:text-xl text-white/70">°C</span>
        </div>
        <div class="mt-2 md:mt-3 flex items-center space-x-2 bg-brand-light/20 text-brand-light text-[10px] md:text-xs font-semibold w-fit px-2.5 py-1 rounded-full">
          <span class="w-1.5 h-1.5 bg-brand-light rounded-full animate-pulse"></span>
          <span>{{ typeof temperature === 'number' ? 'Data Langsung' : 'Menunggu...' }}</span>
        </div>
      </div>
      <div class="absolute bottom-4 right-4 flex items-end space-x-1.5 opacity-40 pointer-events-none">
        <div class="w-2 bg-brand-light rounded-t-sm h-5"></div>
        <div class="w-2 bg-brand-light rounded-t-sm h-8"></div>
        <div class="w-2 bg-brand-light rounded-t-sm h-4"></div>
        <div class="w-2 bg-brand-light rounded-t-sm h-10"></div>
        <div class="w-2 bg-brand-light rounded-t-sm h-6"></div>
      </div>
    </div>

    <!-- Kartu Terang — Kelembaban -->
    <div class="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden min-h-[130px] md:min-h-[150px]">
      <div>
        <h3 class="text-gray-500 font-medium text-xs md:text-sm mb-1 md:mb-2">Kelembaban</h3>
        <div class="flex items-baseline space-x-1">
          <span class="text-3xl md:text-4xl font-bold text-gray-900">{{ fmt(humidity) }}</span>
          <span class="text-lg md:text-xl text-gray-400">%</span>
        </div>
        <div class="mt-2 md:mt-3 flex items-center space-x-2 text-blue-500 text-[10px] md:text-xs font-medium">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span>{{ typeof humidity === 'number' ? 'Data Langsung' : 'Menunggu data...' }}</span>
        </div>
      </div>
      <div class="absolute bottom-4 right-4 flex items-end space-x-1.5 opacity-30 pointer-events-none">
        <div class="w-2 bg-blue-400 rounded-t-sm h-5"></div>
        <div class="w-2 bg-gray-200 rounded-t-sm h-9"></div>
        <div class="w-2 bg-blue-400 rounded-t-sm h-3"></div>
        <div class="w-2 bg-gray-200 rounded-t-sm h-7"></div>
      </div>
    </div>

    <!-- Kartu Terang — Jumlah Perangkat -->
    <div class="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden min-h-[130px] md:min-h-[150px]">
      <div>
        <h3 class="text-gray-500 font-medium text-xs md:text-sm mb-1 md:mb-2">Perangkat Terdaftar</h3>
        <div class="flex items-baseline space-x-1">
          <span class="text-3xl md:text-4xl font-bold text-gray-900">{{ devices }}</span>
          <span class="text-lg md:text-xl text-gray-400">node</span>
        </div>
        <div class="mt-2 md:mt-3 flex items-center space-x-2 text-brand-light text-[10px] md:text-xs font-medium">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
          <span>{{ devices > 0 ? 'Semua node aktif' : 'Belum ada perangkat' }}</span>
        </div>
      </div>
      <div class="absolute bottom-4 right-4 flex items-end space-x-1.5 opacity-30 pointer-events-none">
        <div class="w-2 bg-brand-light rounded-t-sm h-7"></div>
        <div class="w-2 bg-gray-200 rounded-t-sm h-5"></div>
        <div class="w-2 bg-brand-light rounded-t-sm h-9"></div>
        <div class="w-2 bg-gray-200 rounded-t-sm h-4"></div>
      </div>
    </div>

  </div>
</template>
