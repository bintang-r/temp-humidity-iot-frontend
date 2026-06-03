<script setup>
import { ref } from 'vue'

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-gray-900 font-medium text-lg">Sensor Nodes Traffic</h3>
      <button class="bg-gray-900 text-white text-sm rounded-full px-4 py-1.5 hover:bg-gray-800 transition">
        View All
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th class="pb-3 font-medium">Node / Device</th>
            <th class="pb-3 font-medium">Location</th>
            <th class="pb-3 font-medium">Temp (°C)</th>
            <th class="pb-3 font-medium">Hum (%)</th>
            <th class="pb-3 font-medium">Dynamic</th>
            <th class="pb-3 font-medium text-right">Last Update</th>
          </tr>
        </thead>
        <tbody class="text-sm">
            <tr v-if="tableData.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">No traffic data yet.</td>
            </tr>
            <tr v-for="item in tableData" :key="item.id" class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
            <td class="py-4">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 rounded-full" :class="item.status === 'Active' ? 'bg-brand-light' : 'bg-orange-400'"></div>
                <span class="font-medium text-gray-900">{{ item.node }}</span>
              </div>
            </td>
            <td class="py-4 text-gray-600">{{ item.location }}</td>
            <td class="py-4 font-medium text-gray-900">{{ item.temp }}</td>
            <td class="py-4 text-gray-600">{{ item.hum }}</td>
            <td class="py-4">
              <!-- Mini sparkline mockup -->
              <svg class="w-16 h-4" viewBox="0 0 100 20" preserveAspectRatio="none">
                <polyline 
                  points="0,15 20,10 40,18 60,5 80,12 100,8" 
                  fill="none" 
                  :stroke="item.status === 'Active' ? '#18A058' : '#f97316'" 
                  stroke-width="2" 
                />
              </svg>
            </td>
            <td class="py-4 text-right text-gray-500 flex justify-end items-center space-x-2">
              <span>{{ item.time }}</span>
              <button class="text-gray-400 hover:text-gray-900">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
