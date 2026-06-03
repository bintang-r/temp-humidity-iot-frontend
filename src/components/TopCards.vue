<script setup>
defineProps({
  temperature: { type: Number, default: 0 },
  humidity: { type: Number, default: 0 },
  devices: { type: Number, default: 0 }
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    <!-- Dark Card (Current Temperature) -->
    <div class="bg-brand rounded-3xl p-6 shadow-md text-white relative overflow-hidden flex flex-col justify-between">
      <div class="z-10 relative">
        <h3 class="text-brand-accent font-medium text-sm mb-2">Current Temperature</h3>
        <div class="flex items-end space-x-2">
          <span class="text-4xl font-semibold">{{ temperature.toFixed(2) }} °C</span>
        </div>
        <div class="mt-4 flex items-center space-x-2 text-brand-light text-sm font-medium bg-brand-light/20 w-fit px-2 py-1 rounded-full">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>Stable</span>
        </div>
      </div>
      
      <!-- Fake mini bar chart in background -->
      <div class="absolute bottom-6 right-6 flex items-end space-x-1.5 opacity-80">
        <div class="w-2.5 bg-brand-light rounded-t-sm h-6"></div>
        <div class="w-2.5 bg-brand-light rounded-t-sm h-8"></div>
        <div class="w-2.5 bg-brand-light rounded-t-sm h-5"></div>
        <div class="w-2.5 bg-brand-light rounded-t-sm h-10"></div>
        <div class="w-2.5 bg-brand-light rounded-t-sm h-7"></div>
      </div>
    </div>

    <!-- Light Card (Current Humidity) -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
      <div>
        <h3 class="text-gray-500 font-medium text-sm mb-2">Environmental Humidity</h3>
        <div class="flex items-end space-x-2">
          <span class="text-4xl font-semibold text-gray-900">{{ humidity.toFixed(2) }}<span class="text-2xl text-gray-500 font-medium">/100%</span></span>
        </div>
        <div class="mt-4 flex items-center space-x-2 text-red-500 text-sm font-medium">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
          <span>2.1% than last hour</span>
        </div>
      </div>

      <!-- Fake mini bar chart in background -->
      <div class="absolute bottom-6 right-6 flex items-end space-x-1.5">
        <div class="w-2.5 bg-red-400 rounded-t-sm h-5"></div>
        <div class="w-2.5 bg-gray-200 rounded-t-sm h-8"></div>
        <div class="w-2.5 bg-red-400 rounded-t-sm h-3"></div>
        <div class="w-2.5 bg-gray-200 rounded-t-sm h-6"></div>
      </div>
    </div>

    <!-- Light Card (Active Devices) -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
      <div>
        <h3 class="text-gray-500 font-medium text-sm mb-2">Active Sensor Nodes</h3>
        <div class="flex items-end space-x-2">
          <span class="text-4xl font-semibold text-gray-900">{{ devices }}</span>
        </div>
        <div class="mt-4 flex items-center space-x-2 text-brand-light text-sm font-medium">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>All nodes online</span>
        </div>
      </div>

      <!-- Fake mini bar chart in background -->
      <div class="absolute bottom-6 right-6 flex items-end space-x-1.5">
        <div class="w-2.5 bg-brand-light rounded-t-sm h-7"></div>
        <div class="w-2.5 bg-gray-200 rounded-t-sm h-5"></div>
        <div class="w-2.5 bg-brand-light rounded-t-sm h-9"></div>
        <div class="w-2.5 bg-gray-200 rounded-t-sm h-6"></div>
      </div>
    </div>

  </div>
</template>
